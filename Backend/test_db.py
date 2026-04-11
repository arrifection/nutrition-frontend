import motor.motor_asyncio
import asyncio
import certifi
import os

async def test():
    uri = "mongodb+srv://nexusnao:2xTLMDSy7600@cluster0.z4lzt6j.mongodb.net/?appName=Cluster0"
    print(f"Testing connection to: {uri}")
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(
            uri, 
            tlsCAFile=certifi.where()
        )
        # The ismaster command is cheap and does not require auth.
        await asyncio.wait_for(client.admin.command('ping'), timeout=10)
        print("SUCCESS: Connected to MongoDB Atlas")
        
        db = client.nutripro_db
        count = await db.users.count_documents({})
        print(f"User count: {count}")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test())
