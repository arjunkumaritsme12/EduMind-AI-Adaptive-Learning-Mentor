import os
import glob
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

# Load environment variables
load_dotenv()

# Setup fallback for Google API Key
if "GEMINI_API_KEY" in os.environ and "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chroma_db")
SYLLABUS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "syllabus")

def get_embeddings():
    """Initializes and returns Google GenAI embeddings."""
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=api_key
    )

def ingest_pdf_file(file_path: str) -> int:
    """
    Ingests a single PDF file, splits it, generates embeddings,
    and stores it in ChromaDB. Returns the number of chunks ingested.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    # Load PDF
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    
    if not documents:
        return 0
        
    # Split text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    
    if not chunks:
        return 0
        
    # Embed and store in Chroma
    embeddings = get_embeddings()
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embeddings
    )
    vectorstore.add_documents(chunks)
    
    return len(chunks)

def ingest_all_pdfs() -> int:
    """
    Finds all PDFs in the syllabus directory and ingests them.
    """
    pdf_files = glob.glob(os.path.join(SYLLABUS_DIR, "*.pdf"))
    total_chunks = 0
    for pdf_path in pdf_files:
        try:
            chunks = ingest_pdf_file(pdf_path)
            total_chunks += chunks
        except Exception as e:
            print(f"Error ingesting {pdf_path}: {e}")
    return total_chunks
