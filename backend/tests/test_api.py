from conftest import career


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["ok"]


def test_payments_are_not_claimed(client):
    # a server without Stripe keys must report payments as off, with no provider and no mode
    pay = client.get("/api/config").json()["payments"]
    assert pay["enabled"] is False and pay["provider"] is None and pay["mode"] is None


def test_register_login_and_me(client, user):
    r = client.post("/api/auth/login", json={"username": user["name"].upper(), "password": "correct horse"})
    assert r.status_code == 200
    me = client.get("/api/me", headers={"Authorization": "Bearer " + r.json()["token"]}).json()
    assert me["username"] == user["name"]


def test_duplicate_username(client, user):
    r = client.post("/api/auth/register", json={"username": user["name"], "password": "another pass"})
    assert r.status_code == 409


def test_bad_password_and_validation(client, user):
    assert client.post("/api/auth/login", json={"username": user["name"], "password": "nope"}).status_code == 401
    assert client.post("/api/auth/register", json={"username": "a b", "password": "longenough"}).status_code == 422
    assert client.post("/api/auth/register", json={"username": "shorty", "password": "short"}).status_code == 422


def test_requires_auth(client):
    assert client.get("/api/saves/1").status_code == 401
    assert client.get("/api/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_password_hash_is_not_plaintext(client, user):
    from app.db import SessionLocal
    from app.models import User
    with SessionLocal() as db:
        u = db.query(User).filter_by(username=user["name"]).one()
        assert "correct horse" not in u.password_hash and u.password_hash.startswith("$argon2")


def test_save_roundtrip_versioning_and_conflict(client, user):
    h = user["h"]
    r = client.put("/api/saves/1", json={"data": career(), "base_version": None, "device": "laptop"}, headers=h)
    assert r.status_code == 200 and r.json()["version"] == 1
    got = client.get("/api/saves/1", headers=h).json()
    assert got["data"]["money"] == 1200 and got["summary"]["level"] == 5
    assert got["updated_at"].endswith("+00:00")  # timezone-aware for every client
    # unchanged upload is a no-op
    assert client.put("/api/saves/1", json={"data": career(), "base_version": 1}, headers=h).json().get("unchanged")
    # normal update
    r = client.put("/api/saves/1", json={"data": career(money=1500), "base_version": 1}, headers=h)
    assert r.json()["version"] == 2
    # stale device -> conflict, cloud untouched
    r = client.put("/api/saves/1", json={"data": career(money=9), "base_version": 1}, headers=h)
    assert r.status_code == 409
    assert client.get("/api/saves/1", headers=h).json()["data"]["money"] == 1500
    # explicit overwrite
    r = client.put("/api/saves/1", json={"data": career(money=9), "base_version": 1, "force": True}, headers=h)
    assert r.json()["version"] == 3


def test_history_restore_and_pruning(client, user):
    h = user["h"]
    v = None
    for m in range(6):
        v = client.put("/api/saves/2", json={"data": career(money=100 + m), "base_version": v}, headers=h).json()["version"]
    hist = client.get("/api/saves/2/history", headers=h).json()
    assert len(hist) == 3  # SAVE_BACKUPS_KEPT
    oldest = hist[-1]
    r = client.post(f"/api/saves/2/restore/{oldest['id']}", headers=h)
    assert r.status_code == 200 and r.json()["data"]["money"] == 100 + (oldest["version"] - 1)


def test_save_validation(client, user):
    h = user["h"]
    for bad in ([1, 2], {"v": 6}, {"v": 6, "lvl": "x", "money": 1}, {"v": 6, "lvl": 9999, "money": 1}):
        r = client.put("/api/saves/1", json={"data": bad}, headers=h)
        assert r.status_code == 422, bad
    deep = {"v": 6, "lvl": 1, "money": 1}
    cur = deep
    for _ in range(40):
        cur["n"] = {}
        cur = cur["n"]
    assert client.put("/api/saves/1", json={"data": deep}, headers=h).status_code == 422
    assert client.get("/api/saves/9", headers=h).status_code == 404


def test_saves_are_private(client, user):
    client.put("/api/saves/3", json={"data": career()}, headers=user["h"])
    other = client.post("/api/auth/register", json={"username": "intruder", "password": "intruder pass"}).json()["token"]
    r = client.get("/api/saves/3", headers={"Authorization": f"Bearer {other}"})
    assert r.status_code == 404


def test_leaderboard_and_opt_out(client, user):
    h = user["h"]
    client.put("/api/saves/1", json={"data": career(lvl=40, tro=7)}, headers=h)
    lb = client.get("/api/leaderboard").json()
    mine = [e for e in lb["entries"] if e["name"].startswith("Eli")]
    assert mine and mine[0]["level"] == 40 and mine[0]["score"] > 0
    assert "not anti-cheat verified" in lb["note"]
    client.patch("/api/me", json={"on_leaderboard": False}, headers=h)
    me_id = client.get("/api/me", headers=h).json()["id"]
    assert all(e["user_id"] != me_id for e in client.get("/api/leaderboard").json()["entries"])


def test_change_password_signs_out_other_sessions(client, user):
    h = user["h"]
    r = client.post("/api/me/password", json={"old_password": "correct horse", "new_password": "new secret 123"}, headers=h)
    assert r.status_code == 200
    assert client.get("/api/me", headers=h).status_code == 401
    assert client.get("/api/me", headers={"Authorization": "Bearer " + r.json()["token"]}).status_code == 200


def test_delete_account(client):
    tok = client.post("/api/auth/register", json={"username": "leaver", "password": "goodbye pass"}).json()["token"]
    h = {"Authorization": f"Bearer {tok}"}
    client.put("/api/saves/1", json={"data": career()}, headers=h)
    assert client.delete("/api/me", headers=h).json()["ok"]
    assert client.post("/api/auth/login", json={"username": "leaver", "password": "goodbye pass"}).status_code == 401


def test_rate_limit(client):
    from app.main import auth_limiter
    auth_limiter.per_minute = 3
    try:
        codes = [client.post("/api/auth/login", json={"username": "x", "password": "y"}).status_code for _ in range(5)]
        assert codes[:3] == [401, 401, 401] and codes[3] == 429
    finally:
        auth_limiter.per_minute = 1000
        auth_limiter.reset()


def test_security_headers(client):
    r = client.get("/api/health")
    assert r.headers["x-content-type-options"] == "nosniff" and r.headers["cache-control"] == "no-store"


def test_clickjacking_and_cache_headers(client):
    r = client.get("/api/health")
    assert r.headers["x-content-type-options"] == "nosniff" and r.headers["x-frame-options"] == "SAMEORIGIN"
    assert r.headers["cache-control"] == "no-store"
