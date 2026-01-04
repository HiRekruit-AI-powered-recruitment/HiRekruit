import os
from dotenv import load_dotenv
from tavily import TavilyClient # Assuming tavily-python is installed

# Load environment variables from .env
load_dotenv()

class Tavily():
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment variables")
        self.api_key = api_key

    def get_model(self):
        return TavilyClient(
            api_key=self.api_key
        )