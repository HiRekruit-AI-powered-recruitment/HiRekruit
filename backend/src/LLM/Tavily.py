"""
Tavily Search Client Wrapper

This module provides a minimal wrapper around the Tavily Search API.
It is responsible only for:
- Loading the API key from environment variables
- Returning an authenticated Tavily client instance

All business logic and retrieval decisions are handled by the calling agent.
"""

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
        """
        Return an authenticated Tavily client instance.
        """
        return TavilyClient(
            api_key=self.api_key
        )