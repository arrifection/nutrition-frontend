"""In-memory sliding-window rate limiter keyed by client IP + route."""
import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request, status

_lock = Lock()
_buckets: dict[str, list[float]] = defaultdict(list)

# (max_requests, window_seconds)
ROUTE_LIMITS: dict[str, tuple[int, int]] = {
    "/auth/login": (10, 60),
    "/auth/register": (5, 300),
    "/auth/request-verification-email": (3, 300),
    "/auth/refresh": (20, 60),
}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _purge_old(timestamps: list[float], now: float, window: int) -> list[float]:
    cutoff = now - window
    return [t for t in timestamps if t >= cutoff]


def check_rate_limit(request: Request) -> None:
    path = request.url.path.rstrip("/") or "/"
    rule = ROUTE_LIMITS.get(path)
    if not rule:
        return

    limit, window = rule
    key = f"{path}:{_client_ip(request)}"
    now = time.time()

    with _lock:
        hits = _purge_old(_buckets[key], now, window)
        if len(hits) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait a moment and try again.",
                headers={"Retry-After": str(window)},
            )
        hits.append(now)
        _buckets[key] = hits
