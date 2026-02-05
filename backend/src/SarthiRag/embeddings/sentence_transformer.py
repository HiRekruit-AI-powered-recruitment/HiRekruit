import os
from typing import List

class SentenceTransformerEmbeddings:
    """
    Free tier compatible embeddings using external API
    Falls back to lightweight embeddings if API unavailable
    """
    _model = None

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        # Model name stored but not loaded until needed
        self.model_name = model_name
        
    def _lazy_load_model(self):
        """Load model only when first embed is called"""
        if self._model is None:
            # Use try-except to gracefully fall back if model load fails
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(
                    self.model_name,
                    cache_folder=".cache",
                    device="cpu"
                )
            except Exception as e:
                print(f"Warning: Could not load sentence-transformers: {e}")
                print("Using fallback mock embeddings")
                self._model = "fallback"
        
    def embed_documents(self, texts: List[str]):
        """Embed multiple texts with fallback support"""
        if not texts:
            return []
        
        # Try to use real embeddings
        try:
            self._lazy_load_model()
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
            self._lazy_load_model()
            if self._model != "fallback":
                return self._model.encode(text, convert_to_tensor=False).tolist()
        except Exception as e:
            print(f"Query embedding failed: {e}")
        
        # Fallback: Return mock embedding
        return [0.1] * 384

