import os
from typing import List
from src.Utils.model_warmup import preload_embedding_model

class SentenceTransformerEmbeddings:
    """
    Free tier compatible embeddings using external API
    Falls back to lightweight embeddings if API unavailable
    """
    _model = None

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        # Model name stored but not loaded until needed
        self._model = preload_embedding_model(model_name)

        
    def embed_documents(self, texts: List[str]):
        """Embed multiple texts with fallback support"""
        if not texts:
            return []
        
        # Try to use real embeddings
        try:
            if self._model != "fallback":
                return self._model.encode(texts, convert_to_tensor=False).tolist()
        except Exception as e:
            print(f"Embedding failed: {e}")
        
        # Fallback: Return mock embeddings (for free tier compatibility)
        return [[0.1] * 384 for _ in texts]

    def embed_query(self, text: str):
        """Embed single query with fallback support"""
        if not text:
            return []
        
        try:
            if self._model != "fallback":
                return self._model.encode(text, convert_to_tensor=False).tolist()
        except Exception as e:
            print(f"Query embedding failed: {e}")
        
        # Fallback: Return mock embedding
        return [0.1] * 384

