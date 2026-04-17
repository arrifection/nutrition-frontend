import asyncio
import certifi
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://nexusnao:2xTLMDSy7600@cluster0.z4lzt6j.mongodb.net/?appName=Cluster0")
DB_NAME = os.getenv("DATABASE_NAME", "nutripro_db")

async def list_users():
    try:
        ca = certifi.where()
        client = motor.motor_asyncio.AsyncIOMotorClient(
            MONGODB_URL,
            tls=True,
            tlsCAFile=ca
        )
        db = client[DB_NAME]
        users_collection = db.get_collection("users")
        
        print(f"Connecting to DB: {DB_NAME}")
        users = await users_collection.find().to_list(length=100)
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"- Username: {user.get('username')}, Email: {user.get('email')}, Role: {user.get('role')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_users())
