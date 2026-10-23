# Backend Health Check: Investigation of `"database": "stale"`

**Date:** 2026-10-23  
**Target:** `https://dietdesk.online/backend/health`  
**Observed Payload:**
```json
{
  "status": "healthy",
  "database": "stale",
  "environment": "production",
  "release": "2db79807",
  "sentry": "enabled"
}
```

---

## 1. Summary

In DietDesk's FastAPI backend (`Backend/app.py` and `Backend/database.py`), `"database": "stale"` is an **intentional design choice** designed to keep `/health` requests fast (< 5ms) and non-blocking during container cold-starts and high-frequency health probes.

It indicates that the database was previously pinged and recorded, but more than **60 seconds** have elapsed since the last active ping. The application treats this status as completely normal and healthy (`"status": "healthy"`).

---

## 2. Where the Value is Set

In `Backend/database.py` (lines 92–109):

```python
_db_status_cache = {"ok": None, "checked_at": 0.0, "reason": None}

def _set_db_status(ok: bool) -> None:
    _db_status_cache["ok"] = ok
    _db_status_cache["checked_at"] = time.time()

def get_cached_db_status(max_age_seconds: float = 60.0) -> str:
    """Fast status for /health — never blocks on a live ping."""
    ok = _db_status_cache["ok"]
    checked_at = _db_status_cache["checked_at"]
    reason = _db_status_cache.get("reason")
    if ok is None:
        return "unknown"
    if time.time() - checked_at > max_age_seconds:
        return "stale"
    if ok:
        return "connected"
    if reason == "auth_failed":
        return "auth_failed"
    return "unreachable"
```

---

## 3. What Condition Triggers `"stale"`

1. **Initial Startup or Warmup:**
   When the FastAPI application initializes or receives a call to `/warmup` (`quick_db_ping()`), it pings MongoDB with a short timeout and caches:
   - `ok`: `True` (or `False` if ping timed out / failed)
   - `checked_at`: `time.time()` timestamp of when the ping was executed

2. **TTL Expiration (60 Seconds):**
   Calls to `GET /health` (`Backend/app.py`, line 180) call `get_cached_db_status(max_age_seconds=60.0)`.
   Because `/health` is a high-frequency liveness probe, it deliberately **never blocks on a live MongoDB ping**.
   If more than `60.0` seconds have passed since the last background ping or `/warmup` invocation (`time.time() - checked_at > 60.0`), `get_cached_db_status()` returns `"stale"`.

3. **Status Interpretation:**
   In `Backend/app.py`:
   ```python
   @app.get("/health")
   async def health_check():
       db_status = get_cached_db_status()
       ready = db_status == "connected"
       return {
           "status": "healthy" if ready or db_status in {"unknown", "stale"} else "degraded",
           "database": db_status,
           "environment": resolve_environment(),
           "release": os.getenv("SENTRY_RELEASE", "unknown"),
           "sentry": "enabled" if is_sentry_enabled() else "disabled",
       }
   ```
   Both `"connected"`, `"stale"`, and `"unknown"` map to `"status": "healthy"`. The backend only reports `"degraded"` if an active failure (such as `"auth_failed"` or `"unreachable"`) was recorded during a live check.

To refresh the status cache to `"connected"`, an explicit probe can call `GET /warmup?ping_db=true`.
