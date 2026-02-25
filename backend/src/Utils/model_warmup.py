import os
from sentence_transformers import SentenceTransformer

_model = None

def preload_embedding_model(model_name="all-MiniLM-L6-v2"):
    global _model

    if _model is None:
        print("Preloading embedding model into memory...")

        cache_folder = os.getenv("SENTENCE_TRANSFORMERS_HOME", "/app/models")

        _model = SentenceTransformer(
            model_name,
            cache_folder=cache_folder,
            device="cpu"
        )

        # Warmup inference
        _model.encode(["warmup"])

        print("Embedding model successfully loaded and warmed up.")

    return _model
