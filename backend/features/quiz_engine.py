import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Setup fallback for Google API Key
if "GEMINI_API_KEY" in os.environ and "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

def generate_quiz(topic: str, difficulty: str) -> list:
    """
    Generates exactly 5 MCQs on the specified topic and difficulty.
    Difficulty levels: "easy", "medium", "hard".
    Returns a Python list of dicts:
    [
      {
        "question": "...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "answer": "A",
        "explanation": "..."
      }
    ]
    """
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")

    # Initialize Gemini model with JSON output configuration
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.7,
        model_kwargs={"response_mime_type": "application/json"}
    )
    
    prompt = f"""
You are an expert university professor. Generate exactly 5 multiple choice questions (MCQs) for the topic "{topic}" at an "{difficulty}" difficulty level.
Return your response as a valid JSON array of objects, containing exactly 5 questions.
Each object MUST have the following structure:
- "question": string, the text of the question
- "options": a list of exactly 4 strings, where each option begins with its key, e.g., ["A) ...", "B) ...", "C) ...", "D) ..."]
- "answer": string, which MUST be one of "A", "B", "C", "D"
- "explanation": string, a brief explanation of why the answer is correct

Do not include any introductory or concluding text, only the raw JSON array.
"""

    messages = [
        SystemMessage(content="You are a strict JSON generator. You output only raw valid JSON lists matching the requested schema."),
        HumanMessage(content=prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        
        # Load and parse JSON
        questions = json.loads(content)
        
        # Validate that we got a list and that elements have the necessary keys
        if not isinstance(questions, list):
            raise ValueError("LLM did not return a list")
            
        validated_questions = []
        for q in questions[:5]: # Ensure at most 5
            # Ensure correct keys
            question_text = q.get("question", "No question text generated.")
            options = q.get("options", ["A) Option A", "B) Option B", "C) Option C", "D) Option D"])
            # Ensure options has exactly 4 elements
            while len(options) < 4:
                prefix = ["A", "B", "C", "D"][len(options)]
                options.append(f"{prefix}) Placeholder")
            options = options[:4]
            
            answer = q.get("answer", "A")
            if answer not in ["A", "B", "C", "D"]:
                answer = "A"
                
            explanation = q.get("explanation", "No explanation provided.")
            
            validated_questions.append({
                "question": question_text,
                "options": options,
                "answer": answer,
                "explanation": explanation
            })
            
        return validated_questions
        
    except Exception as e:
        print(f"Error generating quiz: {e}")
        # Return fallback questions in case of error so frontend does not crash
        return [
            {
                "question": f"What is the core concept of {topic}?",
                "options": ["A) Option A description", "B) Option B description", "C) Option C description", "D) Option D description"],
                "answer": "A",
                "explanation": f"This is a fallback question for {topic} due to a generation error."
            }
            for _ in range(5)
        ]
