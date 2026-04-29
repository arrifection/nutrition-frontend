import asyncio
import os
import sys
sys.path.append(os.getcwd())

async def test():
    from database import db
    collection = db.get_collection("food_exchange")
    food = await collection.find_one({})
    print("SAMPLE DOCUMENT:")
    print(food)

if __name__ == "__main__":
    asyncio.run(test())
