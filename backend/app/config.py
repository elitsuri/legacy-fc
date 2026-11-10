"""Runtime configuration, read from environment variables.

Every value has a safe development default except SECRET_KEY in production:
when APP_ENV=production the server refuses to start without a strong secret.
"""
from __future__ import annotations

import os
import secrets
from dataclasses import dataclass, field
from pathlib import Path


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_env: str = field(default_factory=lambda: os.getenv("APP_ENV", "development"))
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY", ""))
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./data/legacy_fc.db"))
    token_ttl_hours: int = field(default_factory=lambda: int(os.getenv("TOKEN_TTL_HOURS", "720")))
    cors_origins: tuple[str, ...] = field(
        default_factory=lambda: tuple(o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip())
    )
    static_dir: str = field(default_factory=lambda: os.getenv("STATIC_DIR", ""))
    max_save_bytes: int = field(default_factory=lambda: int(os.getenv("MAX_SAVE_BYTES", str(2 * 1024 * 1024))))
    save_backups_kept: int = field(default_factory=lambda: int(os.getenv("SAVE_BACKUPS_KEPT", "15")))
    auth_rate_per_minute: int = field(default_factory=lambda: int(os.getenv("AUTH_RATE_PER_MINUTE", "20")))
    allow_registration: bool = field(default_factory=lambda: _bool("ALLOW_REGISTRATION", True))
    # payments (Stripe Checkout). Entitlements are only ever granted from a verified webhook or a server-side Stripe lookup.
    stripe_secret_key: str = field(default_factory=lambda: os.getenv("STRIPE_SECRET_KEY", "").strip())
    stripe_webhook_secret: str = field(default_factory=lambda: os.getenv("STRIPE_WEBHOOK_SECRET", "").strip())
    # Render sets RENDER_EXTERNAL_URL (https://<name>.onrender.com) automatically, so PUBLIC_BASE_URL is optional there
    public_base_url: str = field(default_factory=lambda: (os.getenv("PUBLIC_BASE_URL") or os.getenv("RENDER_EXTERNAL_URL") or "http://localhost:8000").strip().rstrip("/"))
    stripe_api_base: str = field(default_factory=lambda: os.getenv("STRIPE_API_BASE", "").strip())  # tests only: a local mock of Stripe's API
    checkout_rate_per_minute: int = field(default_factory=lambda: int(os.getenv("CHECKOUT_RATE_PER_MINUTE", "8")))
    social_rate_per_minute: int = field(default_factory=lambda: int(os.getenv("SOCIAL_RATE_PER_MINUTE", "60")))
    allow_sqlite_in_production: bool = field(default_factory=lambda: _bool("ALLOW_SQLITE_IN_PRODUCTION", False))
    # "Sign in with Google": the OAuth client ID is public (it is shown to the browser); the server only verifies Google's signed ID token.
    google_client_id: str = field(default_factory=lambda: os.getenv("GOOGLE_CLIENT_ID", "").strip())
    google_jwks_url: str = field(default_factory=lambda: os.getenv("GOOGLE_JWKS_URL", "https://www.googleapis.com/oauth2/v3/certs").strip())
    run_migrations: bool = field(default_factory=lambda: _bool("RUN_MIGRATIONS", False))

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def google_enabled(self) -> bool:
        return bool(self.google_client_id)

    @property
    def payments_enabled(self) -> bool:
        return bool(self.stripe_secret_key and self.stripe_webhook_secret)

    @property
    def payments_mode(self) -> str | None:
        """'test' for sk_test_ keys (Stripe test mode, no real money), 'live' for sk_live_ keys."""
        if not self.payments_enabled:
            return None
        return "live" if self.stripe_secret_key.startswith(("sk_live_", "rk_live_")) else "test"


def _driver_url(url: str) -> str:
    """Hosted providers hand out postgres:// or postgresql:// URLs; this app uses the psycopg 3 driver."""
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


def load_settings() -> Settings:
    s = Settings()
    object.__setattr__(s, "database_url", _driver_url(s.database_url))
    if not s.secret_key:
        if s.is_production:
            raise RuntimeError("SECRET_KEY must be set when APP_ENV=production (use a random 32+ byte value).")
        # development only: a per-process random key (tokens are invalidated on restart)
        object.__setattr__(s, "secret_key", secrets.token_urlsafe(48))
    elif s.is_production and len(s.secret_key) < 32:
        raise RuntimeError("SECRET_KEY is too short for production (need at least 32 characters).")
    if s.stripe_api_base and s.is_production:
        raise RuntimeError("STRIPE_API_BASE is for tests only and must not be set in production.")
    if s.is_production and s.google_jwks_url != "https://www.googleapis.com/oauth2/v3/certs":
        raise RuntimeError("GOOGLE_JWKS_URL is for tests only and must not be changed in production.")
    if s.google_client_id and not s.google_client_id.endswith(".apps.googleusercontent.com"):
        raise RuntimeError("GOOGLE_CLIENT_ID should look like 123-abc.apps.googleusercontent.com (the OAuth client ID, not the secret).")
    if s.stripe_secret_key and not s.stripe_webhook_secret:
        raise RuntimeError("STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is not: purchases could never be fulfilled safely.")
    if s.is_production and s.database_url.startswith("sqlite") and not s.allow_sqlite_in_production:
        raise RuntimeError("Production needs a hosted PostgreSQL: set DATABASE_URL=postgresql+psycopg://user:pass@host/db "
                           "(a local SQLite file is for development only).")
    if s.is_production and s.payments_enabled and s.public_base_url.startswith("http://localhost"):
        raise RuntimeError("PUBLIC_BASE_URL must be the public address of the site when payments are on (customers are sent back to it).")
    if s.is_production and s.payments_mode == "live" and not s.public_base_url.startswith("https://"):
        raise RuntimeError("Live payments require PUBLIC_BASE_URL to be an https:// address.")
    if s.database_url.startswith("sqlite:///./"):
        Path(s.database_url.removeprefix("sqlite:///./")).parent.mkdir(parents=True, exist_ok=True)
    return s


settings = load_settings()
