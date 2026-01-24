from pathlib import Path
from langchain.schema import Document
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from src.SarthiRag.config.mongodb import MongoDBClient
from src.SarthiRag.embeddings.sentence_transformer import SentenceTransformerEmbeddings

STATIC_DOCS = {
    "identity_and_governance.md",
    "conduct_and_scope.md"
}

DOCS_DIR = Path(__file__).parent / "docs"

DB_NAME = "sarthi_rag"
VECTOR_COLLECTION = "dynamic_docs"
STATIC_COLLECTION = "static_docs"

def load_markdown(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def ingest():
    client = MongoDBClient().get_client()
    db = client[DB_NAME]
    vector_collection = db[VECTOR_COLLECTION]
    static_collection = db[STATIC_COLLECTION]
    embeddings = SentenceTransformerEmbeddings()

    dynamic_docs: list[Document] = []
    static_docs = []

    for md_file in DOCS_DIR.glob("*.md"):
        content = load_markdown(md_file)
        if md_file.name in STATIC_DOCS:
            static_docs.append({"source": md_file.name, "content": content, "type": "static"})
        else:
            dynamic_docs.append(Document(page_content=content, metadata={"source": md_file.name, "type": "dynamic"}))
    
    static_collection.delete_many({})
    static_collection.insert_many(static_docs)

    if vector_collection.count_documents({}) == 0:
        MongoDBAtlasVectorSearch.from_documents(
            documents=dynamic_docs,
            embedding=embeddings,
            collection=vector_collection,
        )
    
    print("Saarthi ingestion completed")

if __name__ == "__main__":
    ingest()

