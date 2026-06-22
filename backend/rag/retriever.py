import os
from dotenv import load_dotenv
from langchain_chroma import Chroma
from backend.rag.ingest import CHROMA_DB_DIR, get_embeddings

load_dotenv()

# Setup fallback for Google API Key
if "GEMINI_API_KEY" in os.environ and "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

def retrieve(query: str, k: int = 3) -> list:
    """
    Retrieves the top k most relevant text chunks matching the query from ChromaDB.
    If the database is not initialized, returns an empty list.
    """
    # Check if the database folder has files in it (Chroma databases usually contain sqlite3 and folder files)
    if not os.path.exists(CHROMA_DB_DIR) or not os.listdir(CHROMA_DB_DIR):
        return []
        
    try:
        embeddings = get_embeddings()
        vectorstore = Chroma(
            persist_directory=CHROMA_DB_DIR,
            embedding_function=embeddings
        )
        
        # Search the database
        results = vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in results]
    except Exception as e:
        print(f"Error during retrieval: {e}")
        return []
