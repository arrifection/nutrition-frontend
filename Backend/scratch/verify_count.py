import asyncio
import os
import sys

# Add current directory to path so database and exchange_list can be imported
sys.path.append(os.getcwd())

async def check_count():
    try:
        from database import db
        collection = db.get_collection("food_exchange")
        count = await collection.count_documents({})
        print(f"Verified Database Count: {count} items")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_count())
