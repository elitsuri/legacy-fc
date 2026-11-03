"""Validation and stat extraction for LEGACY FC save files.

The game keeps its whole career in one JSON object (the `S` state in the client).
The server never trusts it blindly: it checks the shape, the size and the
numeric ranges, and only reads a few well-known fields for the leaderboard.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any

MAX_DEPTH = 24


class SaveError(ValueError):
    pass


def _depth(o: Any, d: int = 0) -> int:
    if d > MAX_DEPTH:
        return d
    if isinstance(o, dict):
        return max([d] + [_depth(v, d + 1) for v in o.values()])
    if isinstance(o, list):
        return max([d] + [_depth(v, d + 1) for v in o])
    return d


def _num(o: dict, key: str, lo: float, hi: float, default: float = 0) -> float:
    v = o.get(key, default)
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise SaveError(f"field '{key}' must be a number")
    if not (lo <= v <= hi):
        raise SaveError(f"field '{key}' out of range")
    return v


def canonical(data: dict) -> str:
    return json.dumps(data, separators=(",", ":"), ensure_ascii=False, sort_keys=True)


def checksum(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def validate(data: Any, max_bytes: int) -> tuple[str, dict]:
    """Return (canonical_json, summary) or raise SaveError."""
    if not isinstance(data, dict):
        raise SaveError("save must be a JSON object")
    text = canonical(data)
    if len(text.encode("utf-8")) > max_bytes:
        raise SaveError("save is too large")
    if _depth(data) > MAX_DEPTH:
        raise SaveError("save is nested too deeply")
    _num(data, "v", 1, 1000)
    lvl = _num(data, "lvl", 1, 500)
    _num(data, "money", -1e7, 1e12)
    _num(data, "day", 0, 1e7, 1)
    _num(data, "x", 0, 10_000, 0)
    _num(data, "y", 0, 10_000, 0)
    return text, summarize(data, int(lvl))


def _attr_overall(data: dict) -> int:
    att = data.get("att")
    if not isinstance(att, dict) or not att:
        return 30
    vals = [v for v in att.values() if isinstance(v, (int, float)) and not isinstance(v, bool)]
    return int(round(sum(vals) / len(vals))) if vals else 30


def summarize(data: dict, lvl: int | None = None) -> dict:
    hist = data.get("hist") if isinstance(data.get("hist"), dict) else {}

    def n(v: Any, cap: float) -> int:
        return int(min(cap, max(0, v))) if isinstance(v, (int, float)) and not isinstance(v, bool) else 0

    club = ""
    try:
        clubs = data["W"]["clubs"]
        c = clubs[int(data.get("club") or 0)]
        club = str(c["n"][0])[:80]
    except Exception:  # noqa: BLE001 - optional field
        club = ""
    return {
        "level": n(lvl if lvl is not None else data.get("lvl"), 500),
        "overall": min(99, _attr_overall(data)),
        "goals": n(hist.get("g"), 100_000),
        "matches": n(hist.get("m"), 100_000),
        "trophies": n(data.get("tro"), 10_000),
        "fans": n(data.get("fol"), 100_000_000),
        "season": n(data.get("season"), 10_000),
        "day": n(data.get("day"), 10_000_000),
        "money": n(data.get("money"), 1e12),
        "club": club,
        "archetype": str(data.get("arch") or "")[:20],
        "cards": len(data.get("col8") or {}) if isinstance(data.get("col8"), dict) else 0,
    }


def score_of(summary: dict) -> int:
    """Career score used for ranking. Transparent formula, shown to players in the UI."""
    return int(
        summary["level"] * 100
        + summary["goals"] * 25
        + summary["trophies"] * 500
        + min(summary["fans"], 200_000) // 10
        + summary["cards"] * 40
    )
