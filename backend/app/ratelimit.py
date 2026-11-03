"""A small in-process sliding-window rate limiter.

It protects the auth endpoints from brute force on a single server process.
When you run several replicas behind a load balancer, put a shared limiter
(e.g. at the reverse proxy or in Redis) in front as well.
"""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > 60:
                q.popleft()
            if len(q) >= self.per_minute:
                retry = int(60 - (now - q[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts, try again shortly",
                    headers={"Retry-After": str(retry)},
                )
            q.append(now)

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


def client_ip(request: Request) -> str:
    # uvicorn --proxy-headers already resolves X-Forwarded-For from trusted proxies into
    # request.client, so the raw header (which clients can forge) is never read here.
    return request.client.host if request.client else "unknown"
