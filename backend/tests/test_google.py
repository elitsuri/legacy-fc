"""Sign in with Google: the server verifies Google's signed ID token itself.

The tests sign tokens with a throw-away RSA key and swap only the key lookup (what would be fetched from Google's JWKS endpoint),
so signature, issuer, audience, expiry and e-mail checks run for real. A real Google account / client ID is NOT exercised here.
"""
import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa

from app import security
from app.config import settings

CLIENT = "1234567890-abc.apps.googleusercontent.com"
KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
OTHER = rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _set(**kw):
    for k, v in kw.items():
        object.__setattr__(settings, k, v)  # Settings is frozen; tests switch Google on and off


@pytest.fixture()
def g(monkeypatch):
    old = settings.google_client_id
    _set(google_client_id=CLIENT, allow_registration=True)
    monkeypatch.setattr(security, "_google_signing_key", lambda cred: KEY.public_key())
    yield
    _set(google_client_id=old, allow_registration=True)


def tok(sub="1100", key=KEY, **kw):
    now = int(time.time())
    c = {"iss": "https://accounts.google.com", "aud": CLIENT, "sub": sub, "email": "Eli.Cohen@example.com", "email_verified": True,
         "name": "Eli Cohen", "iat": now, "exp": now + 600}
    c.update(kw)
    return jwt.encode({k: v for k, v in c.items() if v is not None}, key, algorithm="RS256")


def login(client, credential):
    return client.post("/api/auth/google", json={"credential": credential})


def test_config_says_whether_google_is_on(client, g):
    cfg = client.get("/api/config").json()["google"]
    assert cfg == {"enabled": True, "client_id": CLIENT}
    _set(google_client_id="")
    assert client.get("/api/config").json()["google"] == {"enabled": False, "client_id": None}


def test_off_without_a_client_id(client, g):
    _set(google_client_id="")
    assert login(client, tok()).status_code == 404


def test_first_sign_in_creates_the_account_and_the_next_one_reuses_it(client, g):
    r = login(client, tok("sub-first"))
    assert r.status_code == 200, r.text
    u = r.json()["user"]
    assert u["display_name"] == "Eli Cohen" and u["username"].startswith("eli.cohen")
    assert "email" not in u and "google_sub" not in u  # the e-mail and the Google id are never sent back
    me = client.get("/api/me", headers={"Authorization": "Bearer " + r.json()["token"]})
    assert me.status_code == 200 and me.json()["id"] == u["id"]
    r2 = login(client, tok("sub-first"))
    assert r2.json()["user"]["id"] == u["id"]  # same Google account = same player
    assert login(client, tok("sub-second")).json()["user"]["id"] != u["id"]  # another Google account = another player


def test_username_collisions_get_a_free_name(client, g):
    a = login(client, tok("c1", email="same.name@example.com")).json()["user"]["username"]
    b = login(client, tok("c2", email="same.name@example.com")).json()["user"]["username"]
    assert a == "same.name" and b != a and b.startswith("same.name")


def test_google_account_has_no_usable_password_and_can_save(client, g):
    r = login(client, tok("nopw", email="nopw@example.com")).json()
    bad = client.post("/api/auth/login", json={"username": r["user"]["username"], "password": "anything at all"})
    assert bad.status_code == 401
    h = {"Authorization": "Bearer " + r["token"]}
    assert client.put("/api/saves/1", headers=h, json={"data": {"v": 6, "lvl": 2}, "base_version": None}).status_code in (200, 201)


@pytest.mark.parametrize("why,kw", [
    ("wrong audience", dict(aud="999-evil.apps.googleusercontent.com")),
    ("wrong issuer", dict(iss="https://evil.example")),
    ("expired", dict(exp=int(time.time()) - 3600, iat=int(time.time()) - 7200)),
    ("e-mail not verified", dict(email_verified=False)),
    ("no subject", dict(sub=None)),
])
def test_bad_tokens_are_refused_and_create_nothing(client, g, why, kw):
    args = kw if "sub" in kw else {"sub": "bad-" + why.replace(" ", ""), **kw}
    assert login(client, tok(**args)).status_code == 401, why


def test_token_signed_with_another_key_or_garbage_is_refused(client, g):
    assert login(client, tok("forged", key=OTHER)).status_code == 401
    assert login(client, "x" * 40).status_code == 401
    assert login(client, jwt.encode({"sub": "1"}, "secret", algorithm="HS256")).status_code == 401  # HS256 tokens are never accepted


def test_closed_registration_blocks_new_google_players_but_not_existing_ones(client, g):
    assert login(client, tok("closed-1")).status_code == 200
    _set(allow_registration=False)
    assert login(client, tok("closed-1")).status_code == 200
    assert login(client, tok("closed-2")).status_code == 403


def test_google_jwks_override_is_refused_in_production(monkeypatch):
    from app.config import load_settings
    for k, v in {"APP_ENV": "production", "SECRET_KEY": "x" * 40, "DATABASE_URL": "postgresql+psycopg://u:p@db.example/d"}.items():
        monkeypatch.setenv(k, v)
    monkeypatch.setenv("GOOGLE_JWKS_URL", "http://localhost:9999/jwks")
    with pytest.raises(RuntimeError, match="GOOGLE_JWKS_URL"):
        load_settings()
    monkeypatch.delenv("GOOGLE_JWKS_URL")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "this-is-the-secret-not-the-id")
    with pytest.raises(RuntimeError, match="GOOGLE_CLIENT_ID"):
        load_settings()
    monkeypatch.setenv("GOOGLE_CLIENT_ID", CLIENT)
    assert load_settings().google_enabled


def test_csp_allows_google_only_when_enabled(client, g):
    on = client.get("/").headers["content-security-policy"]
    assert "https://accounts.google.com/gsi/client" in on and "https://accounts.google.com/gsi/style" in on and "https://accounts.google.com/gsi/" in on
    assert "accounts.google.com" not in client.get("/game/index.html").headers["content-security-policy"]  # the game page never talks to Google
    _set(google_client_id="")
    assert "accounts.google.com" not in client.get("/").headers["content-security-policy"]
