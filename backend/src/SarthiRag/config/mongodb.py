from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

class MongoDBClient:
    _client = None

    def __init__(self):
        self._client = None

    def get_client(self):
        if self._client is None:
            mongo_uri = os.getenv("RAG_MONGO_URI")
            if not mongo_uri:
                raise Exception("MONGO_URI is not set in environment")
            self._client = MongoClient(
                mongo_uri,
                tls=True,
                tlsCAFile=certifi.where()
            )
        return self._client

if __name__ == "__main__":
    client = MongoDBClient().get_client()
    print(client)
    print("MongoDB client initialized")

