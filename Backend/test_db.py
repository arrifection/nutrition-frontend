import motor.motor_asyncio
import asyncio
import certifi
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

async def test():
    uri = os.getenv("MONGODB_URL")
    db_name = os.getenv("DATABASE_NAME", "nutripro_db")
    print("Testing MongoDB Atlas connection from Backend/.env")
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(
            uri,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "30000")),
            connectTimeoutMS=int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "15000")),
            socketTimeoutMS=int(os.getenv("MONGODB_SOCKET_TIMEOUT_MS", "15000")),
        )
        # The ismaster command is cheap and does not require auth.
        await asyncio.wait_for(client.admin.command('ping'), timeout=35)
        print("SUCCESS: Connected to MongoDB Atlas")
        
        db = client[db_name]
        count = await db.users.count_documents({})
        print(f"User count: {count}")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test())
