from sentence_transformers import SentenceTransformer

class SentenceTransformerEmbeddings:
    _model = None

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        if self._model is None:
            self._model = SentenceTransformer(model_name)
        
    def embed_documents(self, texts):
        return self._model.encode(texts).tolist()

    def embed_query(self, text):
        return self._model.encode(text).tolist()

