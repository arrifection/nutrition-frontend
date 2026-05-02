import asyncio
import certifi
import dns.resolver
import motor.motor_asyncio
import os
from dotenv import load_dotenv
from pymongo.server_api import ServerApi

load_dotenv(override=True)

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL environment variable is not set. Cannot start without a database connection.")
DB_NAME = os.getenv("DATABASE_NAME", "nutripro_db")

# Tunables
SERVER_SELECTION_TIMEOUT_MS = int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "5000"))
CONNECT_TIMEOUT_MS = int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "5000"))
SOCKET_TIMEOUT_MS = int(os.getenv("MONGODB_SOCKET_TIMEOUT_MS", "8000"))
TLS_INSECURE = os.getenv("MONGODB_TLS_INSECURE", "false").lower() in {"1", "true", "yes"}
DNS_SERVERS = [s.strip() for s in os.getenv("MONGODB_DNS_SERVERS", "8.8.8.8,1.1.1.1").split(",") if s.strip()]

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


# Global client instance
client = None
db = None

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

# Call it once to initialize at module level (safely)
try:
    get_client()
except Exception as e:
    print(f"[ERROR] Module-level DB init failed (will retry in startup): {e}")

async def check_db():
    try:
        c = get_client()
        ping_timeout = max(10.0, (SERVER_SELECTION_TIMEOUT_MS / 1000) + 5.0)
        await asyncio.wait_for(c.admin.command("ping"), timeout=ping_timeout)
        print("MongoDB Atlas Connected Successfully!")
        return True
    except asyncio.TimeoutError:
        print("MongoDB Connection Failed: Timeout while waiting for Atlas")
        return False
    except Exception as e:
        print(f"MongoDB Connection Failed: {type(e).__name__} - {e}")
        if "SSL" in str(e) or "handshake" in str(e).lower():
            print("TIP: This SSL error often means your IP is not whitelisted or there's a firewall/DNS issue.")
        return False


# Collections (proxies)
def _get_coll(name):
    return client[DB_NAME].get_collection(name) if client else None

patients_collection = _get_coll("patients")
plans_collection = _get_coll("diet_plans")
logs_collection = _get_coll("reflection_logs")
users_collection = _get_coll("users")
history_collection = _get_coll("history")

def refresh_collections():
    """Ensure collections are bound to the active db instance"""
    global patients_collection, plans_collection, logs_collection, users_collection, history_collection, db
    if db is not None:
        patients_collection = db.get_collection("patients")
        plans_collection = db.get_collection("diet_plans")
        logs_collection = db.get_collection("reflection_logs")
        users_collection = db.get_collection("users")
        history_collection = db.get_collection("history")

# Helper to format MongoDB _id to string id
def patient_helper(patient) -> dict:
    if not patient: return {}
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
        "medical_notes": patient.get("medical_notes"),
        "owner_id": patient.get("owner_id")
    }

def user_helper(user) -> dict:
    if not user: return {}
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "client"),
        "createdAt": user.get("createdAt"),
        "email_verified": user.get("email_verified", False),
        "verification_deadline": user.get("verification_deadline")
    }
