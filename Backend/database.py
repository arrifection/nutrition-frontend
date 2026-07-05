import asyncio
import certifi
import dns.resolver
import logging
import motor.motor_asyncio
import os
import time
from dotenv import load_dotenv
from pymongo.server_api import ServerApi

from runtime_env import is_production

load_dotenv(override=True)

logger = logging.getLogger(__name__)

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL environment variable is not set. Cannot start without a database connection.")
DB_NAME = os.getenv("DATABASE_NAME", "nutripro_db")

# Tunables — longer timeouts in production (HF cold starts + Atlas DNS)
_prod = is_production()
_DEFAULT_SERVER_SELECTION_MS = "30000" if _prod else "5000"
_DEFAULT_CONNECT_MS = "20000" if _prod else "5000"
_DEFAULT_SOCKET_MS = "20000" if _prod else "8000"
_DEFAULT_HEALTH_PING_MS = "5000" if _prod else "2000"

SERVER_SELECTION_TIMEOUT_MS = int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", _DEFAULT_SERVER_SELECTION_MS))
CONNECT_TIMEOUT_MS = int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", _DEFAULT_CONNECT_MS))
SOCKET_TIMEOUT_MS = int(os.getenv("MONGODB_SOCKET_TIMEOUT_MS", _DEFAULT_SOCKET_MS))
TLS_INSECURE = os.getenv("MONGODB_TLS_INSECURE", "false").lower() in {"1", "true", "yes"}
DNS_SERVERS = [s.strip() for s in os.getenv("MONGODB_DNS_SERVERS", "8.8.8.8,1.1.1.1").split(",") if s.strip()]
HEALTH_PING_TIMEOUT_MS = int(os.getenv("MONGODB_HEALTH_PING_TIMEOUT_MS", _DEFAULT_HEALTH_PING_MS))

if MONGODB_URL.startswith("mongodb+srv://") and DNS_SERVERS:
    try:
        resolver = dns.resolver.Resolver(configure=False)
        resolver.nameservers = DNS_SERVERS
        resolver.lifetime = 5.0
        resolver.timeout = 2.0
        dns.resolver.default_resolver = resolver
        print(f"MongoDB SRV DNS resolver set to: {', '.join(DNS_SERVERS)}")
    except Exception as e:
        print(f"WARN: Could not set custom DNS resolver: {e}")


# Global client instance (lazy — no connect at import time)
client = None
db = None
_db_status_cache = {"ok": None, "checked_at": 0.0, "reason": None}


def get_client():
    global client, db
    if client is None:
        print(f"[DB] Initializing MongoDB client (Timeout: {SERVER_SELECTION_TIMEOUT_MS}ms)...")
        options = {
            "serverSelectionTimeoutMS": SERVER_SELECTION_TIMEOUT_MS,
            "connectTimeoutMS": CONNECT_TIMEOUT_MS,
            "socketTimeoutMS": SOCKET_TIMEOUT_MS,
            "tls": True,
            "retryWrites": True,
            "server_api": ServerApi("1"),
        }

        if TLS_INSECURE:
            options["tlsAllowInvalidCertificates"] = True
            print("[WARN] MongoDB: tlsAllowInvalidCertificates=True")
        else:
            options["tlsCAFile"] = certifi.where()

        try:
            client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL, **options)
            db = client[DB_NAME]
        except Exception as e:
            print(f"[CRITICAL] MongoDB Initialization Failed: {e}")
            raise RuntimeError(f"Could not initialize MongoDB client: {e}")
    return client


async def _ping_db(timeout_seconds: float) -> bool:
    try:
        c = get_client()
        await asyncio.wait_for(c.admin.command("ping"), timeout=timeout_seconds)
        _db_status_cache["reason"] = None
        return True
    except Exception as e:
        message = str(e).lower()
        reason = "auth_failed" if "authentication failed" in message or "bad auth" in message else "unreachable"
        _db_status_cache["reason"] = reason
        if reason == "auth_failed":
            logger.error(
                "[DB] MongoDB authentication failed. Reset Atlas DB user password "
                "and update MONGODB_URL in Hugging Face (URL-encode special chars in password)."
            )
        else:
            logger.warning("MongoDB ping failed (%ss): %s - %s", timeout_seconds, type(e).__name__, e)
        return False


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


def get_db_status_reason() -> str | None:
    return _db_status_cache.get("reason")


async def quick_db_ping(timeout_seconds: float | None = None) -> bool:
    """Short ping for /warmup and background startup."""
    timeout = timeout_seconds if timeout_seconds is not None else HEALTH_PING_TIMEOUT_MS / 1000
    ok = await _ping_db(timeout)
    _set_db_status(ok)
    if ok:
        print("MongoDB Atlas Connected Successfully!")
    return ok


async def check_db():
    """Full ping used by routes that need a live DB check."""
    ping_timeout = max(10.0, (SERVER_SELECTION_TIMEOUT_MS / 1000) + 5.0)
    ok = await _ping_db(ping_timeout)
    _set_db_status(ok)
    if ok:
        print("MongoDB Atlas Connected Successfully!")
    else:
        print("MongoDB Connection Failed: Timeout or unreachable")
    return ok


# Collections (proxies)
def _get_coll(name):
    if db is None:
        get_client()
    return db.get_collection(name) if db is not None else None


patients_collection = _get_coll("patients")
plans_collection = _get_coll("diet_plans")
logs_collection = _get_coll("reflection_logs")
# users collection schema (selected fields):
#   mfa_enabled: bool (default False)
#   mfa_secret: str (Fernet-encrypted TOTP secret, nullable)
users_collection = _get_coll("users")
history_collection = _get_coll("history")
refresh_sessions_collection = _get_coll("refresh_sessions")


def refresh_collections():
    """Ensure collections are bound to the active db instance."""
    global patients_collection, plans_collection, logs_collection, users_collection, history_collection, refresh_sessions_collection, db
    if db is None:
        get_client()
    if db is not None:
        patients_collection = db.get_collection("patients")
        plans_collection = db.get_collection("diet_plans")
        logs_collection = db.get_collection("reflection_logs")
        users_collection = db.get_collection("users")
        history_collection = db.get_collection("history")
        refresh_sessions_collection = db.get_collection("refresh_sessions")


# Helper to format MongoDB _id to string id
def patient_helper(patient) -> dict:
    if not patient:
        return {}
    return {
        "id": str(patient["_id"]),
        "name": patient["name"],
        "age": patient["age"],
        "gender": patient["gender"],
        "height": patient["height"],
        "weight": patient["weight"],
        "activity_level": patient["activity_level"],
        "allergies": patient.get("allergies"),
        "dietary_restrictions": patient.get("dietary_restrictions"),
        "goal": patient["goal"],
        "bmi": patient.get("bmi"),
        "bmr": patient.get("bmr"),
        "tdee": patient.get("tdee"),
        "assessment": patient.get("assessment"),
        "medical_notes": patient.get("medical_notes"),
        "owner_id": patient.get("owner_id"),
    }


def user_helper(user) -> dict:
    if not user:
        return {}
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "client"),
        "createdAt": user.get("createdAt"),
        "email_verified": user.get("email_verified", False),
        "verification_deadline": user.get("verification_deadline"),
        "mfa_enabled": user.get("mfa_enabled", False),
    }
