"""LEGACY FC online services: accounts, cloud saves with history, and a career leaderboard.

The game itself runs entirely in the browser. This API stores accounts and saves, links players (friends, profiles) and sells
store items through Stripe Checkout (store.py): it never simulates matches and never touches card data.
"""
from __future__ import annotations

import json
import logging
import re
import secrets
import time
from datetime import timezone
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import savefile, social, store
from .config import settings
from .db import get_db, init_db, run_migrations
from .models import LeaderboardEntry, Save, SaveBackup, User
from .ratelimit import RateLimiter, client_ip
from . import security
from .security import create_token, current_user, hash_password, needs_rehash, verify_password

API_VERSION = "1.0.0"
log = logging.getLogger("legacyfc")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
auth_limiter = RateLimiter(settings.auth_rate_per_minute)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.is_production or settings.run_migrations:
        run_migrations()  # versioned schema changes (Alembic); create_all is for development and tests only
    else:
        init_db()
    log.info("LEGACY FC API %s started (env=%s)", API_VERSION, settings.app_env)
    yield


app = FastAPI(title="LEGACY FC API", version=API_VERSION, lifespan=lifespan,
              docs_url=None if settings.is_production else "/api/docs", redoc_url=None, openapi_url=None if settings.is_production else "/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


_CSP_COMMON = ("default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; "
               "img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; worker-src 'self'; manifest-src 'self'; "
               "base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'")
CSP_GAME = _CSP_COMMON + "; script-src 'self' 'unsafe-inline'"


def csp_shell() -> str:
    csp = _CSP_COMMON + "; script-src 'self'"
    if settings.google_enabled:  # only when Google sign-in is configured: Google's button script, its frame and its style (per Google's CSP guide)
        csp = (csp.replace("script-src 'self'", "script-src 'self' https://accounts.google.com/gsi/client")
               .replace("connect-src 'self'", "connect-src 'self' https://accounts.google.com/gsi/")
               .replace("frame-src 'self'", "frame-src 'self' https://accounts.google.com/gsi/")
               .replace("style-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style"))
    return csp


@app.middleware("http")
async def security_headers(request: Request, call_next):
    t0 = time.perf_counter()
    resp: Response = await call_next(request)
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    resp.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    resp.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if settings.is_production:
        resp.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    if not request.url.path.startswith("/api/"):
        # the game page is one self-contained file with inline script; the shell is plain bundled script. Card data never touches us
        # (Stripe's hosted page), so nothing third-party is allowed to run here; only Google Fonts for text.
        resp.headers.setdefault("Content-Security-Policy", CSP_GAME if request.url.path.startswith("/game") else csp_shell())
    if request.url.path.startswith("/api/"):
        resp.headers.setdefault("Cache-Control", "no-store")
        log.info("%s %s %s %.1fms", request.method, request.url.path, resp.status_code, (time.perf_counter() - t0) * 1000)
    return resp


# ---------------------------------------------------------------- schemas
USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=40)

    @field_validator("username")
    @classmethod
    def _username(cls, v: str) -> str:
        if not USERNAME_RE.match(v):
            raise ValueError("username may contain letters, digits, '_', '.', '-' (3-32 chars)")
        return v.lower()

    @field_validator("display_name")
    @classmethod
    def _display(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if not v or any(ord(c) < 32 for c in v):
            raise ValueError("invalid display name")
        return v


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=32)
    password: str = Field(min_length=1, max_length=128)


class GoogleIn(BaseModel):
    credential: str = Field(min_length=20, max_length=4096)


class TokenOut(BaseModel):
    token: str
    user: dict


class SaveIn(BaseModel):
    data: dict[str, Any]
    base_version: int | None = Field(default=None, ge=0, description="Version this save was based on; null = first upload")
    force: bool = False
    device: str = Field(default="", max_length=64)


class MePatch(BaseModel):
    display_name: str | None = Field(default=None, max_length=40)
    on_leaderboard: bool | None = None
    discoverable: bool | None = None


class PasswordIn(BaseModel):
    old_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


def iso(dt) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:  # SQLite returns naive values; they are stored in UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def user_out(u: User) -> dict:
    return {"id": u.id, "username": u.username, "display_name": u.display_name, "on_leaderboard": u.on_leaderboard,
            "discoverable": u.discoverable, "created_at": iso(u.created_at)}


def save_meta(s: Save | SaveBackup) -> dict:
    return {
        "version": s.version,
        "checksum": s.checksum,
        "summary": json.loads(s.summary or "{}"),
        "updated_at": iso(getattr(s, "updated_at", None) or getattr(s, "created_at", None)),
    }


# ---------------------------------------------------------------- health & meta
@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict:
    db.execute(select(1))
    return {"ok": True, "version": API_VERSION, "env": settings.app_env}


@app.get("/api/config")
def public_config() -> dict:
    return {
        "registration": settings.allow_registration,
        "max_save_bytes": settings.max_save_bytes,
        # enabled only when Stripe keys are configured; mode is "test" for sk_test_ keys (no real money) and "live" otherwise
        "payments": store.payments_info(),
        "google": {"enabled": settings.google_enabled, "client_id": settings.google_client_id or None},
        "score_formula": "level*100 + goals*25 + trophies*500 + min(fans,200000)/10 + legacy_cards*40",
    }


# ---------------------------------------------------------------- auth
@app.post("/api/auth/register", response_model=TokenOut, status_code=201)
def register(body: RegisterIn, request: Request, db: Session = Depends(get_db)) -> TokenOut:
    auth_limiter.check("reg:" + client_ip(request))
    if not settings.allow_registration:
        raise HTTPException(403, "Registration is closed")
    user = User(username=body.username, display_name=body.display_name or body.username, password_hash=hash_password(body.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Username is already taken") from None
    db.refresh(user)
    return TokenOut(token=create_token(user), user=user_out(user))


@app.post("/api/auth/login", response_model=TokenOut)
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)) -> TokenOut:
    auth_limiter.check("login:" + client_ip(request))
    user = db.scalar(select(User).where(User.username == body.username.lower()))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Wrong username or password")
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
        db.commit()
    return TokenOut(token=create_token(user), user=user_out(user))


def _free_username(db: Session, seed: str) -> str:
    base = re.sub(r"[^a-z0-9_.-]", "", seed.lower())[:20] or "player"
    if len(base) < 3:
        base = (base + "player")[:20]
    for i in range(0, 50):
        cand = base if i == 0 else f"{base}{secrets.randbelow(9000) + 1000}"
        if db.scalar(select(User.id).where(User.username == cand)) is None:
            return cand
    return f"player{secrets.token_hex(4)}"


@app.post("/api/auth/google", response_model=TokenOut)
def google_login(body: GoogleIn, request: Request, db: Session = Depends(get_db)) -> TokenOut:
    """Sign in (or create the account on first use) with a Google ID token. The server verifies the token itself; the browser's word is not enough."""
    auth_limiter.check("google:" + client_ip(request))
    claims = security.verify_google_credential(body.credential)
    sub = str(claims["sub"])
    user = db.scalar(select(User).where(User.google_sub == sub))
    if user is None:
        if not settings.allow_registration:
            raise HTTPException(403, "Registration is closed")
        name = " ".join(str(claims.get("name") or "").split())[:40]
        local = str(claims.get("email") or "").split("@")[0]
        user = User(username=_free_username(db, local or name), display_name=name or local[:40] or "Player", google_sub=sub,
                    password_hash=hash_password(secrets.token_urlsafe(48)))  # nobody knows this password: the account signs in with Google only
        db.add(user)
        try:
            db.commit()
        except IntegrityError:  # two first sign-ins at once, or a username race: look again, then fail cleanly
            db.rollback()
            user = db.scalar(select(User).where(User.google_sub == sub))
            if user is None:
                raise HTTPException(409, "Please try again") from None
        db.refresh(user)
    return TokenOut(token=create_token(user), user=user_out(user))


@app.post("/api/auth/logout-all")
def logout_all(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    user.token_version += 1
    db.commit()
    return {"ok": True}


@app.get("/api/me")
def me(user: User = Depends(current_user)) -> dict:
    return user_out(user)


@app.patch("/api/me")
def patch_me(body: MePatch, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    if body.display_name is not None:
        name = " ".join(body.display_name.split())
        if not name:
            raise HTTPException(422, "Display name cannot be empty")
        user.display_name = name
        lb = db.get(LeaderboardEntry, user.id)
        if lb:
            lb.display_name = name
    if body.on_leaderboard is not None:
        user.on_leaderboard = body.on_leaderboard  # the stats row stays: friends still see it, the public board filters on this flag
    if body.discoverable is not None:
        user.discoverable = body.discoverable
    db.commit()
    return user_out(user)


@app.post("/api/me/password")
def change_password(body: PasswordIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    if not verify_password(body.old_password, user.password_hash):
        raise HTTPException(401, "Current password is wrong")
    user.password_hash = hash_password(body.new_password)
    user.token_version += 1  # every other session is signed out
    db.commit()
    return {"ok": True, "token": create_token(user)}


@app.delete("/api/me")
def delete_account(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    for model in (LeaderboardEntry, SaveBackup, Save):
        db.execute(delete(model).where(model.user_id == user.id))
    db.delete(user)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- cloud saves
SLOTS = range(1, 4)


def _slot(slot: int) -> int:
    if slot not in SLOTS:
        raise HTTPException(404, "Unknown save slot")
    return slot


@app.get("/api/saves")
def list_saves(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(Save).where(Save.user_id == user.id).order_by(Save.slot)).all()
    return [{"slot": r.slot, **save_meta(r)} for r in rows]


@app.get("/api/saves/{slot}")
def get_save(slot: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    row = db.scalar(select(Save).where(Save.user_id == user.id, Save.slot == _slot(slot)))
    if row is None:
        raise HTTPException(404, "No cloud save in this slot yet")
    return {"slot": slot, **save_meta(row), "data": json.loads(row.data)}


@app.put("/api/saves/{slot}")
def put_save(slot: int, body: SaveIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    _slot(slot)
    try:
        text, summary = savefile.validate(body.data, settings.max_save_bytes)
    except savefile.SaveError as e:
        raise HTTPException(422, f"Invalid save: {e}") from None
    digest = savefile.checksum(text)
    row = db.scalar(select(Save).where(Save.user_id == user.id, Save.slot == slot).with_for_update())
    if row is None:
        row = Save(user_id=user.id, slot=slot, version=1, data=text, checksum=digest, size_bytes=len(text.encode()),
                   summary=json.dumps(summary), device=body.device)
        db.add(row)
    else:
        if row.checksum == digest:
            return {"slot": slot, **save_meta(row), "unchanged": True}
        if not body.force and body.base_version != row.version:
            # someone (another device) wrote a newer version since this client last synced
            raise HTTPException(409, detail={"message": "Cloud save changed on another device", "cloud": save_meta(row)})
        db.add(SaveBackup(user_id=user.id, slot=slot, version=row.version, data=row.data, checksum=row.checksum, summary=row.summary))
        row.version += 1
        row.data, row.checksum, row.size_bytes = text, digest, len(text.encode())
        row.summary, row.device = json.dumps(summary), body.device
    db.flush()
    # keep only the newest N backups for this slot
    old = db.scalars(select(SaveBackup.id).where(SaveBackup.user_id == user.id, SaveBackup.slot == slot)
                     .order_by(SaveBackup.version.desc()).offset(settings.save_backups_kept)).all()
    if old:
        db.execute(delete(SaveBackup).where(SaveBackup.id.in_(old)))
    if slot == 1:
        _update_leaderboard(db, user, summary)
    try:
        db.commit()
    except IntegrityError:  # two devices created the first save at the same moment
        db.rollback()
        raise HTTPException(409, detail={"message": "Cloud save changed on another device"}) from None
    db.refresh(row)
    return {"slot": slot, **save_meta(row)}


@app.get("/api/saves/{slot}/history")
def save_history(slot: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(SaveBackup).where(SaveBackup.user_id == user.id, SaveBackup.slot == _slot(slot))
                      .order_by(SaveBackup.version.desc())).all()
    return [{"id": r.id, **save_meta(r)} for r in rows]


@app.post("/api/saves/{slot}/restore/{backup_id}")
def restore_backup(slot: int, backup_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    bk = db.get(SaveBackup, backup_id)
    if bk is None or bk.user_id != user.id or bk.slot != _slot(slot):
        raise HTTPException(404, "Backup not found")
    row = db.scalar(select(Save).where(Save.user_id == user.id, Save.slot == slot))
    if row is None:
        raise HTTPException(404, "No cloud save in this slot")
    db.add(SaveBackup(user_id=user.id, slot=slot, version=row.version, data=row.data, checksum=row.checksum, summary=row.summary))
    row.version += 1
    row.data, row.checksum, row.summary, row.size_bytes = bk.data, bk.checksum, bk.summary, len(bk.data.encode())
    if slot == 1:
        _update_leaderboard(db, user, json.loads(bk.summary))
    db.commit()
    return {"slot": slot, **save_meta(row), "data": json.loads(row.data)}


@app.delete("/api/saves/{slot}")
def delete_save(slot: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    _slot(slot)
    db.execute(delete(Save).where(Save.user_id == user.id, Save.slot == slot))
    db.execute(delete(SaveBackup).where(SaveBackup.user_id == user.id, SaveBackup.slot == slot))
    if slot == 1:
        db.execute(delete(LeaderboardEntry).where(LeaderboardEntry.user_id == user.id))
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- leaderboard
def _update_leaderboard(db: Session, user: User, summary: dict) -> None:
    lb = db.get(LeaderboardEntry, user.id) or LeaderboardEntry(user_id=user.id)
    lb.display_name = user.display_name
    lb.score = savefile.score_of(summary)
    lb.level, lb.overall, lb.goals = summary["level"], summary["overall"], summary["goals"]
    lb.trophies, lb.fans, lb.club = summary["trophies"], summary["fans"], summary["club"]
    db.merge(lb)


@app.get("/api/leaderboard")
def leaderboard(limit: int = 50, db: Session = Depends(get_db)) -> dict:
    limit = max(1, min(limit, 200))
    rows = db.scalars(select(LeaderboardEntry).join(User, User.id == LeaderboardEntry.user_id).where(User.on_leaderboard.is_(True))
                      .order_by(LeaderboardEntry.score.desc(), LeaderboardEntry.updated_at).limit(limit)).all()
    return {
        "note": "Scores come from players' cloud saves. The game runs in the browser, so results are not anti-cheat verified.",
        "entries": [{"rank": i + 1, "user_id": r.user_id, "name": r.display_name, "score": r.score, "level": r.level, "overall": r.overall,
                     "goals": r.goals, "trophies": r.trophies, "fans": r.fans, "club": r.club,
                     "updated_at": iso(r.updated_at)} for i, r in enumerate(rows)],
    }


# ---------------------------------------------------------------- errors
app.include_router(store.router)
app.include_router(social.router)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):  # pragma: no cover - safety net
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ---------------------------------------------------------------- static frontend (single-container deploy)
if settings.static_dir and Path(settings.static_dir).is_dir():
    static_root = Path(settings.static_dir).resolve()
    app.mount("/assets", StaticFiles(directory=static_root / "assets", check_dir=False), name="assets")
    app.mount("/game", StaticFiles(directory=static_root / "game", html=True, check_dir=False), name="game")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        if path.startswith("api/"):
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        target = (static_root / path).resolve()
        if path and target.is_file() and static_root in target.parents:
            return FileResponse(target)
        return FileResponse(static_root / "index.html", headers={"Cache-Control": "no-cache"})
