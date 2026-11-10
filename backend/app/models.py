from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(40))
    password_hash: Mapped[str] = mapped_column(String(255))
    token_version: Mapped[int] = mapped_column(Integer, default=0)  # bump to log out every device
    on_leaderboard: Mapped[bool] = mapped_column(Boolean, default=True)
    discoverable: Mapped[bool] = mapped_column(Boolean, default=True)  # appears in user search (exact username always works)
    google_sub: Mapped[str | None] = mapped_column(String(64), unique=True, index=True, nullable=True)  # Google account id (never the e-mail)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Save(Base):
    """The current cloud save for one (user, slot). `version` increases on every write."""

    __tablename__ = "saves"
    __table_args__ = (UniqueConstraint("user_id", "slot", name="uq_save_user_slot"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    slot: Mapped[int] = mapped_column(Integer, default=1)
    version: Mapped[int] = mapped_column(Integer, default=1)
    data: Mapped[str] = mapped_column(Text)
    checksum: Mapped[str] = mapped_column(String(64))
    size_bytes: Mapped[int] = mapped_column(Integer)
    summary: Mapped[str] = mapped_column(Text, default="{}")  # JSON: level, club, goals... (for UI + leaderboard)
    device: Mapped[str] = mapped_column(String(64), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class SaveBackup(Base):
    """Previous versions of a save, so a bad sync can always be rolled back."""

    __tablename__ = "save_backups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    slot: Mapped[int] = mapped_column(Integer)
    version: Mapped[int] = mapped_column(Integer)
    data: Mapped[str] = mapped_column(Text)
    checksum: Mapped[str] = mapped_column(String(64))
    summary: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class LeaderboardEntry(Base):
    """One row per user, refreshed from the stats inside their latest slot-1 save."""

    __tablename__ = "leaderboard"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(40))
    score: Mapped[int] = mapped_column(Integer, index=True)
    level: Mapped[int] = mapped_column(Integer)
    overall: Mapped[int] = mapped_column(Integer)
    goals: Mapped[int] = mapped_column(Integer)
    trophies: Mapped[int] = mapped_column(Integer)
    fans: Mapped[int] = mapped_column(Integer)
    club: Mapped[str] = mapped_column(String(80), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class Order(Base):
    """One purchase attempt. Kept (user_id set NULL) even after the account is deleted: financial records outlive accounts."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    product_id: Mapped[str] = mapped_column(String(64), index=True)
    amount: Mapped[int] = mapped_column(Integer)  # minor units (agorot) as agreed server-side from the catalog
    currency: Mapped[str] = mapped_column(String(3), default="ils")
    provider: Mapped[str] = mapped_column(String(16), default="stripe")
    provider_ref: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)  # Checkout Session id
    payment_ref: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)  # PaymentIntent id (refunds)
    mode: Mapped[str] = mapped_column(String(8), default="test")  # test | live
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)  # pending|paid|refunded|expired|failed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Entitlement(Base):
    """What a user owns. Written only by payment fulfilment on the server (never from client claims)."""

    __tablename__ = "entitlements"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_entitlement_user_product"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(String(64))
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class StripeEvent(Base):
    """Every webhook event id we have seen: Stripe retries, so each one must be processed at most once."""

    __tablename__ = "stripe_events"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    type: Mapped[str] = mapped_column(String(80))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Friendship(Base):
    """A directed row: requester -> addressee. status: pending | accepted | blocked (blocked: requester blocked addressee)."""

    __tablename__ = "friendships"
    __table_args__ = (UniqueConstraint("requester_id", "addressee_id", name="uq_friend_pair"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    addressee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(10), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
