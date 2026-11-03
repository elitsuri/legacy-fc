"""Players linked to players: public profiles, user search, friend requests, blocking and a friends leaderboard.

Privacy rules: search finds users who left "discoverable" on (an exact username always works); stats of a player who is not on
the public leaderboard are shown only to their friends; a blocked user cannot find, request or view the person who blocked them.
There is no chat and no real-time play here, on purpose: those need moderation and a game server.
"""
from __future__ import annotations

from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import Friendship, LeaderboardEntry, User
from .ratelimit import RateLimiter
from .security import current_user

router = APIRouter(prefix="/api", tags=["social"])
social_limiter = RateLimiter(settings.social_rate_per_minute)
MAX_FRIENDS, MAX_PENDING_OUT = 200, 50


def _iso(dt):
    if dt is None:
        return None
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(timezone.utc).isoformat()


def _pair(db: Session, a: int, b: int) -> list[Friendship]:
    return list(db.scalars(select(Friendship).where(or_(and_(Friendship.requester_id == a, Friendship.addressee_id == b),
                                                        and_(Friendship.requester_id == b, Friendship.addressee_id == a)))))


def relation(db: Session, me: int, other: int) -> str:
    """none | friends | request_sent | request_received | blocked (I blocked them) | blocked_by (they blocked me)"""
    if me == other:
        return "self"
    rows = _pair(db, me, other)
    if any(f.status == "blocked" and f.requester_id == me for f in rows):
        return "blocked"
    if any(f.status == "blocked" for f in rows):
        return "blocked_by"
    if any(f.status == "accepted" for f in rows):
        return "friends"
    for f in rows:
        if f.status == "pending":
            return "request_sent" if f.requester_id == me else "request_received"
    return "none"


def _stats(lb: LeaderboardEntry | None) -> dict | None:
    if lb is None:
        return None
    return {"score": lb.score, "level": lb.level, "overall": lb.overall, "goals": lb.goals, "trophies": lb.trophies, "fans": lb.fans, "club": lb.club}


def card(u: User, lb: LeaderboardEntry | None, rel: str) -> dict:
    """What another player may see: name, relation and (if allowed) career stats."""
    show = rel in ("friends", "self") or u.on_leaderboard
    return {"id": u.id, "username": u.username, "name": u.display_name, "relation": rel, "since": _iso(u.created_at),
            "stats": _stats(lb) if show else None}


def _blocked_ids(db: Session, me: int) -> set[int]:
    """Users who blocked me (invisible to me) and users I blocked (hidden from my search)."""
    rows = db.execute(select(Friendship.requester_id, Friendship.addressee_id).where(
        Friendship.status == "blocked", or_(Friendship.requester_id == me, Friendship.addressee_id == me))).all()
    return {a if b == me else b for a, b in rows}


# ---------------------------------------------------------------- search and profiles
@router.get("/users/search")
def search(q: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict]:
    social_limiter.check(f"soc:{user.id}")
    q = q.strip().lower()
    if len(q) < 2 or len(q) > 32:
        return []
    like = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    hidden = _blocked_ids(db, user.id) | {user.id}
    stmt = (select(User).where(or_(User.username == q, and_(User.discoverable.is_(True),
                                                            or_(User.username.like(like, escape="\\"),
                                                                func.lower(User.display_name).like(like, escape="\\")))))
            .where(User.id.notin_(hidden)).order_by(User.username).limit(20))
    out = []
    for u in db.scalars(stmt):
        out.append(card(u, db.get(LeaderboardEntry, u.id), relation(db, user.id, u.id)))
    return out


@router.get("/users/{user_id}/profile")
def profile(user_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    social_limiter.check(f"soc:{user.id}")
    u = db.get(User, user_id)
    rel = relation(db, user.id, user_id) if u else "none"
    if u is None or rel == "blocked_by":
        raise HTTPException(404, "Player not found")
    friends = db.scalar(select(func.count()).select_from(Friendship).where(
        Friendship.status == "accepted", or_(Friendship.requester_id == u.id, Friendship.addressee_id == u.id)))
    return {**card(u, db.get(LeaderboardEntry, u.id), rel), "friends": friends}


# ---------------------------------------------------------------- friends
def _friend_ids(db: Session, me: int) -> list[int]:
    rows = db.execute(select(Friendship.requester_id, Friendship.addressee_id).where(
        Friendship.status == "accepted", or_(Friendship.requester_id == me, Friendship.addressee_id == me))).all()
    return [a if b == me else b for a, b in rows]


@router.get("/friends")
def friends(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    ids = _friend_ids(db, user.id)
    inc = db.scalars(select(Friendship).where(Friendship.addressee_id == user.id, Friendship.status == "pending")).all()
    out = db.scalars(select(Friendship).where(Friendship.requester_id == user.id, Friendship.status == "pending")).all()
    blocked = db.scalars(select(Friendship).where(Friendship.requester_id == user.id, Friendship.status == "blocked")).all()

    def users(uids):
        rows = {u.id: u for u in db.scalars(select(User).where(User.id.in_(list(uids) or [0])))}
        return rows

    uid_all = set(ids) | {f.requester_id for f in inc} | {f.addressee_id for f in out} | {f.addressee_id for f in blocked}
    us = users(uid_all)
    lbs = {r.user_id: r for r in db.scalars(select(LeaderboardEntry).where(LeaderboardEntry.user_id.in_(list(uid_all) or [0])))}
    return {
        "friends": sorted((card(us[i], lbs.get(i), "friends") for i in ids if i in us), key=lambda c: c["name"].lower()),
        "incoming": [{"request_id": f.id, **card(us[f.requester_id], lbs.get(f.requester_id), "request_received"), "at": _iso(f.created_at)}
                     for f in inc if f.requester_id in us],
        "outgoing": [{"request_id": f.id, **card(us[f.addressee_id], lbs.get(f.addressee_id), "request_sent"), "at": _iso(f.created_at)}
                     for f in out if f.addressee_id in us],
        "blocked": [{"id": f.addressee_id, "name": us[f.addressee_id].display_name, "username": us[f.addressee_id].username}
                    for f in blocked if f.addressee_id in us],
    }


class RequestIn(BaseModel):
    username: str = Field(min_length=1, max_length=32)


@router.post("/friends/requests", status_code=201)
def send_request(body: RequestIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    social_limiter.check(f"soc:{user.id}")
    target = db.scalar(select(User).where(User.username == body.username.strip().lower()))
    if target is None:
        raise HTTPException(404, "Player not found")
    if target.id == user.id:
        raise HTTPException(400, "You cannot add yourself")
    rel = relation(db, user.id, target.id)
    if rel == "blocked_by":
        raise HTTPException(404, "Player not found")  # do not reveal that they blocked you
    if rel == "blocked":
        raise HTTPException(409, "You blocked this player; unblock them first")
    if rel == "friends":
        raise HTTPException(409, "Already friends")
    if rel == "request_sent":
        raise HTTPException(409, "Request already sent")
    if rel == "request_received":  # they already asked us: sending a request back is an acceptance
        f = db.scalar(select(Friendship).where(Friendship.requester_id == target.id, Friendship.addressee_id == user.id))
        f.status = "accepted"
        db.commit()
        return {"status": "friends"}
    if len(_friend_ids(db, user.id)) >= MAX_FRIENDS:
        raise HTTPException(409, f"Friend list is full ({MAX_FRIENDS})")
    pending = db.scalar(select(func.count()).select_from(Friendship).where(Friendship.requester_id == user.id, Friendship.status == "pending"))
    if pending >= MAX_PENDING_OUT:
        raise HTTPException(409, "Too many pending requests")
    db.add(Friendship(requester_id=user.id, addressee_id=target.id, status="pending"))
    db.commit()
    return {"status": "request_sent"}


def _incoming(db: Session, user: User, request_id: int) -> Friendship:
    f = db.get(Friendship, request_id)
    if f is None or f.addressee_id != user.id or f.status != "pending":
        raise HTTPException(404, "Request not found")
    return f


@router.post("/friends/requests/{request_id}/accept")
def accept(request_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    f = _incoming(db, user, request_id)
    if len(_friend_ids(db, user.id)) >= MAX_FRIENDS:
        raise HTTPException(409, f"Friend list is full ({MAX_FRIENDS})")
    f.status = "accepted"
    db.commit()
    return {"status": "friends"}


@router.post("/friends/requests/{request_id}/decline")
def decline(request_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    db.delete(_incoming(db, user, request_id))
    db.commit()
    return {"status": "none"}


@router.delete("/friends/{other_id}")
def remove(other_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    """Unfriend, or cancel a request I sent. Never removes a block."""
    n = 0
    for f in _pair(db, user.id, other_id):
        if f.status in ("accepted", "pending") and (f.status == "accepted" or f.requester_id == user.id):
            db.delete(f)
            n += 1
    db.commit()
    return {"removed": n}


@router.post("/friends/block/{other_id}")
def block(other_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    if other_id == user.id or db.get(User, other_id) is None:
        raise HTTPException(404, "Player not found")
    pair = _pair(db, user.id, other_id)
    for f in pair:
        if f.status != "blocked":  # a friendship or pending request, in either direction, ends here
            db.delete(f)
    db.flush()  # the delete must hit the database before the new row (same requester/addressee pair is unique)
    if not any(f.status == "blocked" and f.requester_id == user.id for f in pair):
        db.add(Friendship(requester_id=user.id, addressee_id=other_id, status="blocked"))
    db.commit()
    return {"status": "blocked"}


@router.delete("/friends/block/{other_id}")
def unblock(other_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    f = db.scalar(select(Friendship).where(Friendship.requester_id == user.id, Friendship.addressee_id == other_id, Friendship.status == "blocked"))
    if f:
        db.delete(f)
        db.commit()
    return {"status": "none"}


@router.get("/leaderboard/friends")
def friends_leaderboard(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    """Me and my friends ranked by career score (friends are shown even if they opted out of the public board)."""
    ids = set(_friend_ids(db, user.id)) | {user.id}
    rows = db.scalars(select(LeaderboardEntry).where(LeaderboardEntry.user_id.in_(ids)).order_by(LeaderboardEntry.score.desc())).all()
    return {"entries": [{"rank": i + 1, "user_id": r.user_id, "name": r.display_name, "me": r.user_id == user.id, "score": r.score,
                         "level": r.level, "overall": r.overall, "goals": r.goals, "trophies": r.trophies, "club": r.club}
                        for i, r in enumerate(rows)],
            "without_save": len(ids) - len(rows)}
