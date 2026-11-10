from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from jwt import PyJWKClient
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import User

_ph = PasswordHasher()  # argon2id with library defaults
_bearer = HTTPBearer(auto_error=False)
ALGO = "HS256"


def hash_password(raw: str) -> str:
    return _ph.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, raw)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed: str) -> bool:
    return _ph.check_needs_rehash(hashed)


def create_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "tv": user.token_version,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=settings.token_ttl_hours)).timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGO)


def _unauthorized(msg: str = "Not authenticated") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg, headers={"WWW-Authenticate": "Bearer"})


def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise _unauthorized()
    try:
        payload = jwt.decode(creds.credentials, settings.secret_key, algorithms=[ALGO])
        uid = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise _unauthorized("Invalid or expired token") from None
    user = db.get(User, uid)
    if user is None or payload.get("tv") != user.token_version:
        raise _unauthorized("Session is no longer valid")
    return user


# ---------------------------------------------------------------- Sign in with Google
GOOGLE_ISSUERS = ("https://accounts.google.com", "accounts.google.com")
_jwks: PyJWKClient | None = None


def _google_signing_key(credential: str):
    """The public key Google signed this ID token with (Google's published JWKS, cached by PyJWKClient). Tests replace this."""
    global _jwks
    if _jwks is None or _jwks.uri != settings.google_jwks_url:
        _jwks = PyJWKClient(settings.google_jwks_url, cache_keys=True, lifespan=3600, timeout=5)
    return _jwks.get_signing_key_from_jwt(credential).key


def verify_google_credential(credential: str) -> dict:
    """Verify a Google ID token (signature, issuer, audience = our client ID, expiry, verified e-mail). Returns its claims."""
    if not settings.google_enabled:
        raise HTTPException(status_code=404, detail="Google sign-in is not configured")
    try:
        claims = jwt.decode(credential, _google_signing_key(credential), algorithms=["RS256"], audience=settings.google_client_id,
                            options={"require": ["exp", "iat", "iss", "aud", "sub"]}, leeway=30)
    except (jwt.PyJWTError, OSError) as e:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified") from e
    if claims.get("iss") not in GOOGLE_ISSUERS or not claims.get("sub") or claims.get("email_verified") is not True:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified")
    return claims
