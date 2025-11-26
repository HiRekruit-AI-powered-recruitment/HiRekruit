from pymongo import MongoClient, ASCENDING
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Global cached client
_mongo_client = None
_db = None


def get_client():
    """Return Mongo client (initialize only once)."""
    global _mongo_client, _db

    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(MONGO_URI)
            _mongo_client.admin.command('ping')
            print("MongoDB connected (worker init).")
        except Exception as e:
            print("MongoDB connection failed:", e)
            raise

        # Initialize DB
        _db = _mongo_client.get_default_database()

        # Ensure index ONCE
        try:
            _db.candidates.create_index([("email", ASCENDING)], unique=True)
            print("Unique index on 'email' ensured (once per worker).")
        except Exception as e:
            print("Failed to create index:", e)

    return _mongo_client


def get_db():
    """Return the default DB object."""
    if _db is None:
        get_client()
    return _db


db = get_db()
