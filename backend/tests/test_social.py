"""Players linked to players: search, friend requests, privacy of stats, blocking, friends leaderboard."""
import itertools

import pytest

from app import social
from conftest import career

_u = itertools.count(1)


@pytest.fixture()
def duo(client):
    social.social_limiter.reset()

    def mk(**kw):
        n = f"soc{next(_u)}"
        r = client.post("/api/auth/register", json={"username": n, "password": "correct horse", "display_name": kw.pop("name", n)})
        d = {"name": n, "h": {"Authorization": "Bearer " + r.json()["token"]}, "id": r.json()["user"]["id"]}
        if kw:
            client.patch("/api/me", json=kw, headers=d["h"])
        return d

    return mk


def befriend(client, a, b):
    assert client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"]).status_code == 201
    rid = client.get("/api/friends", headers=b["h"]).json()["incoming"][0]["request_id"]
    assert client.post(f"/api/friends/requests/{rid}/accept", headers=b["h"]).json()["status"] == "friends"


def test_request_accept_and_list(client, duo):
    a, b = duo(), duo()
    assert client.post("/api/friends/requests", json={"username": b["name"].upper()}, headers=a["h"]).json()["status"] == "request_sent"
    assert [x["username"] for x in client.get("/api/friends", headers=a["h"]).json()["outgoing"]] == [b["name"]]
    inc = client.get("/api/friends", headers=b["h"]).json()["incoming"]
    assert [x["username"] for x in inc] == [a["name"]] and inc[0]["relation"] == "request_received"
    client.post(f"/api/friends/requests/{inc[0]['request_id']}/accept", headers=b["h"])
    for x, y in ((a, b), (b, a)):
        assert [f["username"] for f in client.get("/api/friends", headers=x["h"]).json()["friends"]] == [y["name"]]
    assert client.delete(f"/api/friends/{b['id']}", headers=a["h"]).json() == {"removed": 1}
    assert client.get("/api/friends", headers=b["h"]).json()["friends"] == []


def test_only_the_addressee_can_answer_and_duplicates_are_refused(client, duo):
    a, b, c = duo(), duo(), duo()
    client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"])
    rid = client.get("/api/friends", headers=b["h"]).json()["incoming"][0]["request_id"]
    assert client.post(f"/api/friends/requests/{rid}/accept", headers=a["h"]).status_code == 404  # the sender cannot accept for them
    assert client.post(f"/api/friends/requests/{rid}/accept", headers=c["h"]).status_code == 404
    assert client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"]).status_code == 409
    assert client.post("/api/friends/requests", json={"username": a["name"]}, headers=a["h"]).status_code == 400
    assert client.post("/api/friends/requests", json={"username": "nobody_here"}, headers=a["h"]).status_code == 404
    assert client.post(f"/api/friends/requests/{rid}/decline", headers=b["h"]).json()["status"] == "none"
    assert client.get("/api/friends", headers=b["h"]).json()["incoming"] == []


def test_mutual_requests_become_friends(client, duo):
    a, b = duo(), duo()
    client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"])
    assert client.post("/api/friends/requests", json={"username": a["name"]}, headers=b["h"]).json()["status"] == "friends"


def test_search_rules(client, duo):
    a = duo()
    shown = duo(name="Zorbo Visible")
    hidden = duo(name="Zorbo Hidden", discoverable=False)
    r = client.get("/api/users/search", params={"q": "zorbo"}, headers=a["h"]).json()
    assert [x["name"] for x in r] == ["Zorbo Visible"] and r[0]["relation"] == "none"
    assert [x["name"] for x in client.get("/api/users/search", params={"q": hidden["name"]}, headers=a["h"]).json()] == ["Zorbo Hidden"]  # exact username works
    assert client.get("/api/users/search", params={"q": "z"}, headers=a["h"]).json() == []  # too short to scan the user list
    assert client.get("/api/users/search", params={"q": "%"}, headers=a["h"]).json() == []  # wildcards are not patterns
    assert client.get("/api/users/search", params={"q": "zorbo"}).status_code == 401
    assert all(x["id"] != a["id"] for x in client.get("/api/users/search", params={"q": a["name"]}, headers=a["h"]).json())
    assert shown["id"]


def test_stats_privacy(client, duo):
    a, p, f = duo(), duo(on_leaderboard=False), duo(on_leaderboard=False)
    client.put("/api/saves/1", json={"data": career(lvl=21, tro=3)}, headers=p["h"])
    client.put("/api/saves/1", json={"data": career(lvl=33)}, headers=f["h"])
    assert client.get(f"/api/users/{p['id']}/profile", headers=a["h"]).json()["stats"] is None  # opted out of the public board
    befriend(client, a, f)
    assert client.get(f"/api/users/{f['id']}/profile", headers=a["h"]).json()["stats"]["level"] == 33  # a friend still sees it
    assert client.get(f"/api/users/{a['id']}/profile", headers=a["h"]).json()["relation"] == "self"
    assert all(e["user_id"] not in (p["id"], f["id"]) for e in client.get("/api/leaderboard").json()["entries"])  # not on the public board
    assert client.get("/api/users/999999/profile", headers=a["h"]).status_code == 404


def test_block_hides_removes_and_stops_requests(client, duo):
    a, b = duo(), duo()
    befriend(client, a, b)
    assert client.post(f"/api/friends/block/{b['id']}", headers=a["h"]).json()["status"] == "blocked"
    assert client.get("/api/friends", headers=a["h"]).json()["friends"] == []  # blocking ends the friendship
    assert client.get("/api/friends", headers=b["h"]).json()["friends"] == []
    assert client.get(f"/api/users/{a['id']}/profile", headers=b["h"]).status_code == 404  # the blocked person cannot see the blocker
    assert all(x["id"] != a["id"] for x in client.get("/api/users/search", params={"q": a["name"]}, headers=b["h"]).json())
    assert client.post("/api/friends/requests", json={"username": a["name"]}, headers=b["h"]).status_code == 404  # and learns nothing
    assert client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"]).status_code == 409  # blocker must unblock first
    assert client.get("/api/friends", headers=a["h"]).json()["blocked"][0]["username"] == b["name"]
    client.delete(f"/api/friends/block/{b['id']}", headers=a["h"])
    assert client.post("/api/friends/requests", json={"username": a["name"]}, headers=b["h"]).status_code == 201


def test_removing_a_friend_never_removes_a_block(client, duo):
    a, b = duo(), duo()
    client.post(f"/api/friends/block/{a['id']}", headers=b["h"])
    client.delete(f"/api/friends/{b['id']}", headers=a["h"])
    assert client.post("/api/friends/requests", json={"username": b["name"]}, headers=a["h"]).status_code == 404  # still blocked by b


def test_friends_leaderboard(client, duo):
    a, b, c, stranger = duo(name="Me A"), duo(name="Friend B"), duo(name="Friend C"), duo(name="Stranger")
    for u, lvl in ((a, 10), (b, 30), (c, 20), (stranger, 99)):
        client.put("/api/saves/1", json={"data": career(lvl=lvl)}, headers=u["h"])
    befriend(client, a, b)
    befriend(client, c, a)
    r = client.get("/api/leaderboard/friends", headers=a["h"]).json()
    assert [e["name"] for e in r["entries"]] == ["Friend B", "Friend C", "Me A"] and [e["me"] for e in r["entries"]] == [False, False, True]
    assert [e["rank"] for e in r["entries"]] == [1, 2, 3]


def test_deleting_an_account_removes_its_friendships(client, duo):
    a, b = duo(), duo()
    befriend(client, a, b)
    assert client.request("DELETE", "/api/me", headers=b["h"]).status_code == 200
    assert client.get("/api/friends", headers=a["h"]).json()["friends"] == []


def test_social_calls_are_rate_limited(client, duo):
    a = duo()
    codes = [client.get("/api/users/search", params={"q": "ab"}, headers=a["h"]).status_code for _ in range(70)]
    assert 429 in codes
