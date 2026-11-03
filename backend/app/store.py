"""Store and payments (Stripe Checkout).

Trust model, in one paragraph: the browser never decides what was bought or paid. It sends a product id; the server looks up the
price in catalog.py, creates an Order and a Stripe Checkout Session for exactly that amount, and the customer pays on Stripe's
hosted page (card data never touches this server). Items are granted only when the server itself learns the payment succeeded:
either from a webhook whose signature verifies against STRIPE_WEBHOOK_SECRET, or from a server-side lookup of the session with
the secret key. Amount, currency and live/test mode must match the order. Every webhook event is processed once (event ids are
stored), fulfilment is idempotent, and refunds and disputes take the items back.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .catalog import CURRENCY, PRODUCTS, get_product
from .config import settings
from .db import get_db
from .models import Entitlement, Order, StripeEvent, User
from .ratelimit import RateLimiter
from .security import current_user

log = logging.getLogger("legacyfc.store")
router = APIRouter(prefix="/api", tags=["store"])
checkout_limiter = RateLimiter(settings.checkout_rate_per_minute)
if settings.stripe_api_base:  # end-to-end tests point the SDK at a local mock; refused in production by config.py
    stripe.api_base = settings.stripe_api_base


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(timezone.utc).isoformat()


def _plain(obj: Any) -> Any:
    """Stripe SDK objects are not dicts (no .get): everything crossing the boundary becomes plain dicts and lists."""
    return obj.to_dict() if hasattr(obj, "to_dict") else obj


class StripeGateway:
    """The only code that talks to Stripe over the network (tests replace it; webhook verification is never replaced)."""

    def create_checkout(self, **params: Any) -> Any:
        return _plain(stripe.checkout.Session.create(api_key=settings.stripe_secret_key, **params))

    def retrieve_session(self, session_id: str) -> Any:
        return _plain(stripe.checkout.Session.retrieve(session_id, api_key=settings.stripe_secret_key))


gateway = StripeGateway()


# ---------------------------------------------------------------- catalog and entitlements
def owned_ids(db: Session, user_id: int) -> set[str]:
    return set(db.scalars(select(Entitlement.product_id).where(Entitlement.user_id == user_id)).all())


def order_out(o: Order) -> dict:
    p = get_product(o.product_id)
    return {"id": o.id, "product_id": o.product_id, "name": p.name if p else o.product_id, "price": o.amount // 100, "currency": o.currency,
            "status": o.status, "mode": o.mode, "created_at": _iso(o.created_at), "paid_at": _iso(o.paid_at)}


@router.get("/store/catalog")
def catalog() -> dict:
    return {"currency": CURRENCY, "payments": payments_info(),
            "items": [{"id": p.id, "cat": p.cat, "price": p.price, "name": p.name, "contents": list(p.contents)} for p in PRODUCTS.values()]}


def payments_info() -> dict:
    return {"enabled": settings.payments_enabled, "provider": "stripe" if settings.payments_enabled else None,
            "mode": settings.payments_mode, "currency": CURRENCY}


@router.get("/store/entitlements")
def entitlements(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    orders = db.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.id.desc()).limit(100)).all()
    return {"ids": sorted(owned_ids(db, user.id)), "orders": [order_out(o) for o in orders], "payments": payments_info()}


# ---------------------------------------------------------------- checkout
class CheckoutIn(BaseModel):
    product_id: str = Field(min_length=1, max_length=64)
    lang: str = Field(default="en", max_length=5)


@router.post("/store/checkout")
def checkout(body: CheckoutIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    if not settings.payments_enabled:
        raise HTTPException(503, "Payments are not configured on this server")
    checkout_limiter.check(f"co:{user.id}")
    product = get_product(body.product_id)
    if product is None:
        raise HTTPException(404, "Unknown product")
    have = owned_ids(db, user.id)
    if all(g in have for g in product.grants):
        raise HTTPException(409, "You already own this")
    order = Order(user_id=user.id, product_id=product.id, amount=product.amount, currency=CURRENCY, mode=settings.payments_mode or "test")
    db.add(order)
    db.flush()
    meta = {"order_id": str(order.id), "user_id": str(user.id), "product_id": product.id}
    base = settings.public_base_url
    try:
        sess = gateway.create_checkout(
            mode="payment",
            line_items=[{"quantity": 1, "price_data": {"currency": CURRENCY, "unit_amount": product.amount,
                                                       "product_data": {"name": product.name, "metadata": {"product_id": product.id}}}}],
            client_reference_id=str(user.id),
            metadata=meta,
            payment_intent_data={"metadata": meta, "description": f"LEGACY FC - {product.name}"},
            success_url=f"{base}/?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base}/?checkout=cancel",
            locale="he" if body.lang.startswith("he") else "en",
            idempotency_key=f"order-{order.id}",
        )
    except Exception:  # noqa: BLE001 - any provider/network failure: no order, no charge
        log.exception("Stripe checkout creation failed for order %s", order.id)
        order.status = "failed"
        db.commit()
        raise HTTPException(502, "Could not start the payment. Nothing was charged.") from None
    order.provider_ref = sess["id"]
    db.commit()
    return {"order_id": order.id, "url": sess["url"], "mode": order.mode}


# ---------------------------------------------------------------- fulfilment
def grant(db: Session, order: Order) -> None:
    product = get_product(order.product_id)
    if product is None or order.user_id is None:
        return
    for pid in product.grants:
        try:
            with db.begin_nested():
                db.add(Entitlement(user_id=order.user_id, product_id=pid, order_id=order.id))
        except IntegrityError:  # already owned through an earlier purchase: keep that one
            pass


def fulfil(db: Session, order: Order, sess: Any) -> bool:
    """Grant the order if (and only if) the payment is real and matches what we asked for. Idempotent."""
    if order.status in ("paid", "refunded", "disputed"):
        return False
    problems = []
    if sess.get("payment_status") != "paid":
        problems.append("not paid")
    if sess.get("amount_total") != order.amount:
        problems.append(f"amount {sess.get('amount_total')} != {order.amount}")
    if str(sess.get("currency", "")).lower() != order.currency:
        problems.append("currency")
    if bool(sess.get("livemode")) != (order.mode == "live"):
        problems.append("mode")
    if problems:
        log.warning("Order %s NOT fulfilled: %s", order.id, ", ".join(problems))
        return False
    order.status = "paid"
    order.paid_at = datetime.now(timezone.utc)
    pi = sess.get("payment_intent")
    order.payment_ref = pi if isinstance(pi, str) else (pi or {}).get("id")
    grant(db, order)
    log.info("Order %s paid: %s granted to user %s", order.id, order.product_id, order.user_id)
    return True


def revoke(db: Session, order: Order, status: str) -> None:
    order.status = status
    db.execute(delete(Entitlement).where(Entitlement.order_id == order.id))


class ConfirmIn(BaseModel):
    session_id: str = Field(min_length=3, max_length=255)


@router.post("/store/confirm")
def confirm(body: ConfirmIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    """Called when the customer returns from Stripe: asks Stripe (not the browser) whether the session was paid."""
    order = db.scalar(select(Order).where(Order.provider_ref == body.session_id, Order.user_id == user.id))
    if order is None:
        raise HTTPException(404, "Unknown payment")
    if order.status == "pending" and settings.payments_enabled:
        try:
            sess = gateway.retrieve_session(body.session_id)
        except Exception:  # noqa: BLE001
            log.exception("Stripe lookup failed for order %s", order.id)
            raise HTTPException(502, "Could not reach the payment provider, try again in a moment") from None
        fulfil(db, order, sess)
        db.commit()
    return {"status": order.status, "ids": sorted(owned_ids(db, user.id)), "order": order_out(order)}


# ---------------------------------------------------------------- webhook
def _handle_event(db: Session, event: Any) -> None:
    etype, obj = event["type"], event["data"]["object"]
    if etype in ("checkout.session.completed", "checkout.session.async_payment_succeeded"):
        order = db.scalar(select(Order).where(Order.provider_ref == obj["id"]))
        if order is None:
            log.info("Webhook for a session that is not ours: %s", obj["id"])
        elif (obj.get("metadata") or {}).get("order_id") not in (None, str(order.id)):
            log.warning("Webhook order id mismatch for %s", order.id)
        else:
            fulfil(db, order, obj)
    elif etype in ("checkout.session.expired", "checkout.session.async_payment_failed"):
        order = db.scalar(select(Order).where(Order.provider_ref == obj["id"]))
        if order is not None and order.status == "pending":
            order.status = "expired" if etype.endswith("expired") else "failed"
    elif etype == "charge.refunded":
        if obj.get("refunded"):  # fully refunded; partial refunds keep the item
            order = db.scalar(select(Order).where(Order.payment_ref == obj.get("payment_intent")))
            if order is not None and order.status == "paid":
                revoke(db, order, "refunded")
                log.info("Order %s refunded: items revoked", order.id)
    elif etype == "charge.dispute.created":
        order = db.scalar(select(Order).where(Order.payment_ref == obj.get("payment_intent")))
        if order is not None and order.status == "paid":
            revoke(db, order, "disputed")
            log.warning("Order %s disputed: items revoked", order.id)


@router.post("/stripe/webhook", include_in_schema=False)
async def webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    if not settings.payments_enabled:
        raise HTTPException(503, "Payments are not configured")
    payload = await request.body()
    try:
        event = _plain(stripe.Webhook.construct_event(payload, request.headers.get("stripe-signature", ""), settings.stripe_webhook_secret))
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(400, "Bad signature") from None
    db.add(StripeEvent(id=event["id"], type=event["type"]))
    try:
        db.flush()
    except IntegrityError:  # Stripe retried an event we already handled
        db.rollback()
        return {"ok": True, "duplicate": True}
    try:
        _handle_event(db, event)
        db.commit()
    except Exception:  # noqa: BLE001 - leave the event unrecorded so Stripe retries it
        db.rollback()
        log.exception("Webhook %s (%s) failed", event["id"], event["type"])
        raise HTTPException(500, "Webhook handling failed") from None
    return {"ok": True}
