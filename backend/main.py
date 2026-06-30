import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import backend modules
from agent.mentor_agent import run_mentor_agent
from features.emotion_detector import detect_emotion
from features.quiz_engine import generate_quiz
from features.study_planner import generate_study_plan
from rag.ingest import ingest_pdf_file, SYLLABUS_DIR
from analytics.db import save_quiz_session, get_all_sessions, get_weak_areas, get_progress, reset_data

load_dotenv()

app = FastAPI(title="EduMind AI API", version="1.0.0")

# Configure CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC REQUEST MODELS -----------------

class ChatRequest(BaseModel):
    message: str = Field(..., description="Message from the student")
    emotion: str = Field("", description="Detected emotion from frontend (optional)")
    history: list = Field([], description="Conversation history list of dicts: [{'sender': 'user'|'ai', 'text': str}]")

class QuizGenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic of the quiz")
    difficulty: str = Field(..., description="Difficulty: easy, medium, or hard")

class QuizSubmitRequest(BaseModel):
    topic: str = Field(..., description="Topic of the quiz")
    score: int = Field(..., description="Score obtained")
    total: int = Field(..., description="Total questions")
    wrong_topics: list = Field(..., description="List of wrong topics/concepts")

class StudyPlanRequest(BaseModel):
    subject: str = Field(..., description="Subject or course name")
    exam_date: str = Field(..., description="Target exam date in YYYY-MM-DD format")
    weak_areas: list = Field(..., description="List of weak areas or tags")

# ----------------- API ENDPOINTS -----------------

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Accepts message, emotion, history. If emotion is empty, performs sentiment detection.
    Runs the LangChain agent with custom tone, and returns response and emotion_tone.
    """
    try:
        message = request.message
        emotion = request.emotion
        history = request.history

        # If emotion is not provided, perform TextBlob analysis
        if not emotion or emotion.strip() == "":
            emotion = detect_emotion(message)

        # Execute agent
        response = run_mentor_agent(message, emotion, history)
        
        return {
            "response": response,
            "emotion_tone": emotion
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )

@app.post("/api/quiz/generate")
async def quiz_generate_endpoint(request: QuizGenerateRequest):
    """
    Generates a 5 MCQ adaptive quiz based on the requested topic and difficulty.
    """
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty.")
        if request.difficulty not in ["easy", "medium", "hard"]:
            raise HTTPException(status_code=400, detail="Invalid difficulty level. Must be easy, medium, or hard.")
            
        questions = generate_quiz(request.topic, request.difficulty)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation error: {str(e)}"
        )

@app.post("/api/quiz/submit")
async def quiz_submit_endpoint(request: QuizSubmitRequest):
    """
    Logs the completed quiz session results to SQLite.
    """
    try:
        save_quiz_session(
            topic=request.topic,
            score=request.score,
            total=request.total,
            wrong_topics=request.wrong_topics
        )
        return {"message": "Quiz session logged successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz submission error: {str(e)}"
        )

@app.post("/api/study-plan")
async def study_plan_endpoint(request: StudyPlanRequest):
    """
    Generates a daily personalized study schedule.
    """
    try:
        plan = generate_study_plan(
            subject=request.subject,
            exam_date=request.exam_date,
            weak_areas=request.weak_areas
        )
        return {"plan": plan}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Study plan generation error: {str(e)}"
        )

@app.post("/api/upload")
async def upload_endpoint(file: UploadFile = File(...)):
    """
    Saves an uploaded PDF to data/syllabus/ and ingests it into ChromaDB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF."
        )
        
    try:
        # Create syllabus dir if missing
        os.makedirs(SYLLABUS_DIR, exist_ok=True)
        
        file_path = os.path.join(SYLLABUS_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ingest PDF into ChromaDB
        chunks_count = ingest_pdf_file(file_path)
        
        return {
            "message": f"Successfully ingested '{file.filename}' into knowledge base.",
            "chunks": chunks_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload ingestion error: {str(e)}"
        )

@app.get("/api/analytics")
async def analytics_endpoint():
    """
    Fetches stats and session data from SQLite to feed the dashboard.
    """
    try:
        sessions = get_all_sessions()
        weak_areas = get_weak_areas()
        progress = get_progress()
        
        total_sessions = len(sessions)
        
        # Calculate average score %
        total_score_pct = 0.0
        for s in sessions:
            if s["total"] > 0:
                total_score_pct += (s["score"] / s["total"]) * 100
        avg_score = (total_score_pct / total_sessions) if total_sessions > 0 else 0.0
        
        # Estimate study hours (dummy calculation: 1.5 hours per quiz session logged)
        estimated_study_hours = round(total_sessions * 1.5, 1)
        
        # Identify strongest topic (the topic with highest average score and at least one session)
        topic_scores = {}
        for s in sessions:
            t = s["topic"]
            pct = (s["score"] / s["total"] * 100) if s["total"] > 0 else 0
            if t not in topic_scores:
                topic_scores[t] = []
            topic_scores[t].append(pct)
            
        strongest_topic = "N/A"
        highest_avg = -1.0
        for t, scores in topic_scores.items():
            avg = sum(scores) / len(scores)
            if avg > highest_avg:
                highest_avg = avg
                strongest_topic = t
                
        return {
            "quiz_history": sessions,
            "weak_areas": weak_areas,
            "total_sessions": total_sessions,
            "avg_score": round(avg_score, 1),
            "estimated_hours": estimated_study_hours,
            "strongest_topic": strongest_topic,
            "progress": progress
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics fetching error: {str(e)}"
        )

@app.delete("/api/analytics/reset")
async def analytics_reset_endpoint():
    """
    Wipes all logged quiz session data from the SQLite analytics table.
    """
    try:
        reset_data()
        return {"message": "All analytics logs have been successfully reset."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics reset error: {str(e)}"
        )
