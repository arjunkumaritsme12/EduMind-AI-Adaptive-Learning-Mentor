import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Setup fallback for Google API Key
if "GEMINI_API_KEY" in os.environ and "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

def generate_study_plan(subject: str, exam_date: str, weak_areas: list) -> list:
    """
    Generates a day-by-day study plan from today until the exam date.
    Returns a JSON-parsed list:
    [
      {
        "day": 1,
        "date": "2024-06-23",
        "tasks": ["Review notes on...", "Solve practice questions for..."]
      }
    ]
    """
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")

    # Calculate days until exam
    today = datetime.now().date()
    try:
        exam_dt = datetime.strptime(exam_date, "%Y-%m-%d").date()
        days_until = (exam_dt - today).days
    except Exception as e:
        print(f"Error parsing exam date '{exam_date}': {e}. Defaulting to 7 days.")
        days_until = 7

    # Constrain days between 1 and 14 days to keep generation compact and highly detailed
    if days_until <= 0:
        days_count = 1
    elif days_until > 14:
        days_count = 14
    else:
        days_count = days_until

    # Initialize Gemini model with JSON output configuration
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.7,
        model_kwargs={"response_mime_type": "application/json"}
    )

    weak_areas_str = ", ".join(weak_areas) if weak_areas else "None specified"
    
    prompt = f"""
You are an expert academic advisor. Create a personalized, day-by-day study plan for the subject "{subject}".
The student has an exam on {exam_date} ({days_until} days from today). We need a study plan spanning the next {days_count} days.
The student's weak areas are: {weak_areas_str}. Ensure the plan dedicates extra attention to these weak areas.

Return your response as a valid JSON array of objects.
Each object MUST have the following structure:
- "day": integer representing the day number (starting from 1)
- "date": string in YYYY-MM-DD format (representing that day's date, starting from today: {today})
- "tasks": a list of strings representing specific actionable study tasks for that day

Do not include any introductory or concluding text, only the raw JSON array.
"""

    messages = [
        SystemMessage(content="You are a strict academic planner. You output only raw valid JSON lists matching the requested schema."),
        HumanMessage(content=prompt)
    ]

    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        
        plan = json.loads(content)
        
        if not isinstance(plan, list):
            raise ValueError("LLM did not return a list")
            
        validated_plan = []
        for i, item in enumerate(plan):
            day_num = item.get("day", i + 1)
            # Calculate calendar date based on offset from today if date is missing or invalid
            day_date = item.get("date", (today + timedelta(days=i)).strftime("%Y-%m-%d"))
            tasks = item.get("tasks", ["Read syllabus chapter", "Review lecture notes"])
            if not isinstance(tasks, list):
                tasks = [str(tasks)]
                
            validated_plan.append({
                "day": day_num,
                "date": day_date,
                "tasks": tasks
            })
            
        return validated_plan

    except Exception as e:
        print(f"Error generating study plan: {e}")
        # Return a fallback plan in case of error
        fallback_plan = []
        for i in range(days_count):
            day_date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            fallback_plan.append({
                "day": i + 1,
                "date": day_date,
                "tasks": [
                    f"Review core lectures for {subject}",
                    f"Deep dive into weak areas: {weak_areas_str}",
                    f"Complete practice questions for day {i + 1}"
                ]
            })
        return fallback_plan
