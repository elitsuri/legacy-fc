"""Store and payments: server-side prices, signed webhooks, idempotent fulfilment, refunds. Stripe's network calls are faked;
webhook signature verification is the real Stripe implementation fed with correctly (and incorrectly) signed payloads."""
import hashlib
import hmac
import itertools
import json
import time

import pytest

from app import store
from app.catalog import PRODUCTS
from app.config import settings
from conftest import career

SECRET = "whsec_testsecret"
_ev = itertools.count(1)
_sess = itertools.count(1)  # Stripe session ids are globally unique, so the fake's are too (the test DB outlives each test)


def _set(**kw):
    for k, v in kw.items():
        object.__setattr__(settings, k, v)  # Settings is frozen; tests switch payments on and off


@pytest.fixture()
def pay(monkeypatch):
    """Payments on in Stripe TEST mode, with a fake gateway that records what the server asks Stripe for."""
    _set(stripe_secret_key="sk_test_abc", stripe_webhook_secret=SECRET, public_base_url="https://game.example")
    store.checkout_limiter.reset()

    class Fake:
        def __init__(self):
            self.created, self.sessions = [], {}

        def create_checkout(self, **p):
            sid = f"cs_test_{next(_sess)}"
            self.created.append(p)
            self.last = sid
            return {"id": sid, "url": f"https://checkout.stripe.test/{sid}"}

        def retrieve_session(self, sid):
            return self.sessions[sid]

    fake = Fake()
    monkeypatch.setattr(store, "gateway", fake)
    yield fake
    _set(stripe_secret_key="", stripe_webhook_secret="", public_base_url="http://localhost:8000")


def signed(event: dict, secret=SECRET, ts=None):
    payload = json.dumps(event).encode()
    t = int(ts or time.time())
    sig = hmac.new(secret.encode(), f"{t}.".encode() + payload, hashlib.sha256).hexdigest()
    return {"content": payload, "headers": {"stripe-signature": f"t={t},v1={sig}", "content-type": "application/json"}}


def session_event(sid, order_id, amount, *, etype="checkout.session.completed", status="paid", live=False, currency="ils", pi="pi_1"):
    return {"id": f"evt_{next(_ev)}", "type": etype, "data": {"object": {
        "id": sid, "payment_status": status, "amount_total": amount, "currency": currency, "livemode": live, "payment_intent": pi,
        "metadata": {"order_id": str(order_id)}}}}


def start(client, user, pid="c2.ball.gold"):
    r = client.post("/api/store/checkout", json={"product_id": pid}, headers=user["h"])
    assert r.status_code == 200, r.text
    return r.json()


def owned(client, user):
    return client.get("/api/store/entitlements", headers=user["h"]).json()["ids"]


def test_checkout_is_off_without_stripe_keys(client, user):
    assert client.post("/api/store/checkout", json={"product_id": "c2.ball.gold"}, headers=user["h"]).status_code == 503
    assert client.post("/api/stripe/webhook", content=b"{}").status_code == 503


def test_checkout_needs_login_and_a_real_product(client, user, pay):
    assert client.post("/api/store/checkout", json={"product_id": "c2.ball.gold"}).status_code == 401
    assert client.post("/api/store/checkout", json={"product_id": "c2.nope"}, headers=user["h"]).status_code == 404
    assert client.post("/api/store/checkout", json={"product_id": "c2.free.shirt_champ"}, headers=user["h"]).status_code == 404  # free rewards are not for sale


def test_price_comes_from_the_server_never_the_client(client, user, pay):
    r = client.post("/api/store/checkout", json={"product_id": "c2.ball.gold", "amount": 1, "price": 0, "unit_amount": 1}, headers=user["h"])
    assert r.status_code == 200
    item = pay.created[-1]["line_items"][0]["price_data"]
    assert item["unit_amount"] == PRODUCTS["c2.ball.gold"].price * 100 and item["currency"] == "ils"
    assert pay.created[-1]["success_url"].startswith("https://game.example/") and pay.created[-1]["metadata"]["user_id"]
    assert r.json()["url"].startswith("https://checkout.stripe.test/")


def test_nothing_is_granted_before_payment(client, user, pay):
    start(client, user)
    assert owned(client, user) == []


def test_bad_or_missing_signature_is_rejected_and_grants_nothing(client, user, pay):
    o = start(client, user)
    ev = session_event(pay.last, o["order_id"], 900)
    good = signed(ev)
    assert client.post("/api/stripe/webhook", content=good["content"]).status_code == 400  # no header
    assert client.post("/api/stripe/webhook", **signed(ev, secret="whsec_wrong")).status_code == 400
    assert client.post("/api/stripe/webhook", **signed(ev, ts=time.time() - 3600)).status_code == 400  # replayed long after signing
    tampered = dict(good, content=good["content"].replace(b"900", b"1"))
    assert client.post("/api/stripe/webhook", **tampered).status_code == 400
    assert owned(client, user) == []


def test_signed_payment_grants_once_and_is_replay_safe(client, user, pay):
    o = start(client, user)
    ev = session_event(pay.last, o["order_id"], 900)
    assert client.post("/api/stripe/webhook", **signed(ev)).json() == {"ok": True}
    assert owned(client, user) == ["c2.ball.gold"]
    assert client.post("/api/stripe/webhook", **signed(ev)).json().get("duplicate") is True  # Stripe retry of the same event
    assert client.post("/api/stripe/webhook", **signed(dict(ev, id="evt_other"))).status_code == 200  # another event, same session
    assert owned(client, user) == ["c2.ball.gold"]
    orders = client.get("/api/store/entitlements", headers=user["h"]).json()["orders"]
    assert len(orders) == 1 and orders[0]["status"] == "paid" and orders[0]["price"] == 9 and orders[0]["mode"] == "test"


def test_wrong_amount_currency_or_mode_never_grants(client, user, pay):
    for kw in ({"amount": 100}, {"currency": "usd"}, {"live": True}):
        o = start(client, user, "c2.ball.match")
        args = {"amount": 700, **kw}
        ev = session_event(pay.last, o["order_id"], args.pop("amount"), **args)
        assert client.post("/api/stripe/webhook", **signed(ev)).status_code == 200
        assert owned(client, user) == []


def test_unpaid_session_waits_for_async_success(client, user, pay):
    o = start(client, user)
    sid = pay.last
    client.post("/api/stripe/webhook", **signed(session_event(sid, o["order_id"], 900, status="unpaid")))
    assert owned(client, user) == []
    client.post("/api/stripe/webhook", **signed(session_event(sid, o["order_id"], 900, etype="checkout.session.async_payment_succeeded")))
    assert owned(client, user) == ["c2.ball.gold"]


def test_bundle_grants_its_contents_and_cannot_be_bought_twice(client, user, pay):
    b = PRODUCTS["c2.bundle.emerald"]
    o = start(client, user, b.id)
    client.post("/api/stripe/webhook", **signed(session_event(pay.last, o["order_id"], b.amount)))
    assert set(owned(client, user)) == set(b.contents)
    assert client.post("/api/store/checkout", json={"product_id": b.id}, headers=user["h"]).status_code == 409
    assert client.post("/api/store/checkout", json={"product_id": b.contents[0]}, headers=user["h"]).status_code == 409


def test_refund_and_dispute_take_the_item_back(client, user, pay):
    for etype, status, pid in (("charge.refunded", "refunded", "c2.ball.classic"), ("charge.dispute.created", "disputed", "c2.ball.pro")):
        o = start(client, user, pid)
        pi = f"pi_{status}"
        client.post("/api/stripe/webhook", **signed(session_event(pay.last, o["order_id"], PRODUCTS[pid].amount, pi=pi)))
        assert pid in owned(client, user)
        obj = {"payment_intent": pi, "refunded": True}
        client.post("/api/stripe/webhook", **signed({"id": f"evt_{next(_ev)}", "type": etype, "data": {"object": obj}}))
        assert pid not in owned(client, user)
        orders = client.get("/api/store/entitlements", headers=user["h"]).json()["orders"]
        assert [x for x in orders if x["product_id"] == pid][0]["status"] == status


def test_partial_refund_keeps_the_item(client, user, pay):
    o = start(client, user, "c2.cap.navy")
    client.post("/api/stripe/webhook", **signed(session_event(pay.last, o["order_id"], 500, pi="pi_part")))
    client.post("/api/stripe/webhook", **signed({"id": "evt_part", "type": "charge.refunded", "data": {"object": {"payment_intent": "pi_part", "refunded": False}}}))
    assert "c2.cap.navy" in owned(client, user)


def test_confirm_asks_stripe_not_the_browser(client, user, pay):
    start(client, user)
    sid = pay.last
    pay.sessions[sid] = {"id": sid, "payment_status": "unpaid", "amount_total": 900, "currency": "ils", "livemode": False}
    assert client.post("/api/store/confirm", json={"session_id": sid}, headers=user["h"]).json()["status"] == "pending"
    assert owned(client, user) == []
    pay.sessions[sid] = {"id": sid, "payment_status": "paid", "amount_total": 900, "currency": "ils", "livemode": False, "payment_intent": "pi_c"}
    r = client.post("/api/store/confirm", json={"session_id": sid}, headers=user["h"]).json()
    assert r["status"] == "paid" and r["ids"] == ["c2.ball.gold"]
    assert client.post("/api/store/confirm", json={"session_id": sid}, headers=user["h"]).json()["status"] == "paid"  # idempotent


def test_confirm_of_someone_elses_payment_is_refused(client, user, pay):
    start(client, user)
    sid = pay.last
    pay.sessions[sid] = {"id": sid, "payment_status": "paid", "amount_total": 900, "currency": "ils", "livemode": False}
    other = client.post("/api/auth/register", json={"username": "thief_" + user["name"], "password": "correct horse"}).json()["token"]
    assert client.post("/api/store/confirm", json={"session_id": sid}, headers={"Authorization": "Bearer " + other}).status_code == 404


def test_failed_webhook_is_retried_not_lost(client, user, pay, monkeypatch):
    o = start(client, user)
    ev = session_event(pay.last, o["order_id"], 900)
    real = store._handle_event

    def boom(*a):
        raise RuntimeError("db hiccup")

    monkeypatch.setattr(store, "_handle_event", boom)
    assert client.post("/api/stripe/webhook", **signed(ev)).status_code == 500
    monkeypatch.setattr(store, "_handle_event", real)
    assert client.post("/api/stripe/webhook", **signed(ev)).json() == {"ok": True}  # same event id, processed on the retry
    assert owned(client, user) == ["c2.ball.gold"]


def test_stripe_outage_leaves_no_charge_and_no_grant(client, user, pay, monkeypatch):
    def down(**p):
        raise RuntimeError("stripe down")

    monkeypatch.setattr(pay, "create_checkout", down)
    r = client.post("/api/store/checkout", json={"product_id": "c2.ball.gold"}, headers=user["h"])
    assert r.status_code == 502 and "Nothing was charged" in r.json()["detail"]
    assert owned(client, user) == []


def test_entitlements_cannot_be_written_by_the_client(client, user, pay):
    h = user["h"]
    assert client.put("/api/store/entitlements", json={"ids": ["c2.ball.gold"]}, headers=h).status_code == 405
    assert client.post("/api/store/entitlements", json={"ids": ["c2.ball.gold"]}, headers=h).status_code == 405
    client.put("/api/saves/1", json={"data": career(ent={"c2.ball.gold": "FAKE"})}, headers=h)  # a doctored save changes nothing server-side
    assert owned(client, user) == []


def test_checkout_is_rate_limited(client, user, pay):
    codes = [client.post("/api/store/checkout", json={"product_id": "c2.cap.crimson"}, headers=user["h"]).status_code for _ in range(12)]
    assert 429 in codes


def test_catalog_is_consistent():
    assert len(PRODUCTS) > 50
    for p in PRODUCTS.values():
        assert isinstance(p.price, int) and 2 <= p.price <= 500 and p.amount == p.price * 100
        assert all(c in PRODUCTS and not PRODUCTS[c].contents for c in p.contents)


def test_public_catalog_endpoint(client):
    r = client.get("/api/store/catalog").json()
    assert r["currency"] == "ils" and len(r["items"]) == len(PRODUCTS) and r["payments"]["enabled"] is False


def test_production_refuses_unsafe_configuration(monkeypatch):
    from app.config import load_settings
    base = {"APP_ENV": "production", "SECRET_KEY": "x" * 40, "DATABASE_URL": "postgresql+psycopg://u:p@db.example/d"}
    for k, v in base.items():
        monkeypatch.setenv(k, v)
    assert load_settings().is_production
    monkeypatch.setenv("DATABASE_URL", "sqlite:////data/x.db")
    with pytest.raises(RuntimeError, match="hosted PostgreSQL"):
        load_settings()
    monkeypatch.setenv("DATABASE_URL", base["DATABASE_URL"])
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    with pytest.raises(RuntimeError, match="WEBHOOK_SECRET"):
        load_settings()
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_x")
    with pytest.raises(RuntimeError, match="PUBLIC_BASE_URL"):  # customers are sent back to this address after paying
        load_settings()
    monkeypatch.setenv("PUBLIC_BASE_URL", "http://staging.example")
    assert load_settings().payments_mode == "test"
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_live_x")  # a public but non-https address is fine for test keys, never for live ones
    with pytest.raises(RuntimeError, match="https"):
        load_settings()
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://game.example")
    assert load_settings().payments_mode == "live"


def test_hosted_postgres_urls_are_normalised(monkeypatch):
    from app.config import load_settings
    for raw in ("postgres://u:p@h.example/d?sslmode=require", "postgresql://u:p@h.example/d?sslmode=require"):
        monkeypatch.setenv("DATABASE_URL", raw)
        assert load_settings().database_url == "postgresql+psycopg://u:p@h.example/d?sslmode=require"
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://u:p@h.example/d")
    assert load_settings().database_url == "postgresql+psycopg://u:p@h.example/d"


def test_render_address_is_used_when_no_public_url_is_set(monkeypatch):
    from app.config import load_settings
    monkeypatch.delenv("PUBLIC_BASE_URL", raising=False)
    monkeypatch.setenv("RENDER_EXTERNAL_URL", "https://legacy-fc.onrender.com/")
    assert load_settings().public_base_url == "https://legacy-fc.onrender.com"
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://play.example")  # an explicit address (own domain) wins
    assert load_settings().public_base_url == "https://play.example"
