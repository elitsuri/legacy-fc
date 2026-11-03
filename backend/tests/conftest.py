import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{_tmp}/test.db"
os.environ["APP_ENV"] = "test"
os.environ["AUTH_RATE_PER_MINUTE"] = "1000"
os.environ["SAVE_BACKUPS_KEPT"] = "3"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app, auth_limiter  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _fresh_db():
    from app.db import Base, engine, init_db
    init_db()
    Base.metadata.drop_all(bind=engine)
    init_db()
    yield


@pytest.fixture()
def client():
    with TestClient(app) as c:
        auth_limiter.reset()
        yield c


_n = [0]


@pytest.fixture()
def user(client):
    _n[0] += 1
    name = f"player{_n[0]}"
    r = client.post("/api/auth/register", json={"username": name, "password": "correct horse", "display_name": f"Eli {_n[0]}"})
    assert r.status_code == 201, r.text
    tok = r.json()["token"]
    return {"name": name, "h": {"Authorization": f"Bearer {tok}"}}


def career(**kw):
    s = {"v": 6, "lvl": 5, "money": 1200, "day": 12, "x": 53, "y": 10, "tro": 1, "fol": 5000, "arch": "Finisher",
         "hist": {"g": 14, "m": 20}, "att": {"shooting": 60, "pace": 50}, "col8": {"card0": 3, "card1": 4}, "season": 1}
    s.update(kw)
    return s
