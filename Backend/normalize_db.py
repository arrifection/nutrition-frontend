import asyncio
import certifi
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://nexusnao:2xTLMDSy7600@cluster0.z4lzt6j.mongodb.net/?appName=Cluster0")
DB_NAME = os.getenv("DATABASE_NAME", "nutripro_db")

async def normalize_emails():
    try:
        ca = certifi.where()
        client = motor.motor_asyncio.AsyncIOMotorClient(
            MONGODB_URL,
            tls=True,
            tlsCAFile=ca
        )
        db = client[DB_NAME]
        users_collection = db.get_collection("users")
        
        users = await users_collection.find().to_list(length=100)
        for user in users:
            old_email = user.get('email')
            if old_email:
                new_email = old_email.lower()
                if old_email != new_email:
                    print(f"Updating {old_email} -> {new_email}")
                    await users_collection.update_one(
                        {"_id": user["_id"]},
                        {"$set": {"email": new_email}}
                    )
        print("Done normalizing emails.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(normalize_emails())
