import os
from dotenv import load_dotenv
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage, HumanMessage
from backend.rag.retriever import retrieve
from backend.features.emotion_detector import adapt_tone

load_dotenv()

# Setup fallback for Google API Key
if "GEMINI_API_KEY" in os.environ and "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

@tool
def retrieve_context(query: str) -> str:
    """
    Searches the uploaded course materials, notes, and syllabus in the database for relevant context matching the query.
    Always use this tool if the user is asking about specific course documents, syllabus details, or context from uploaded files.
    """
    results = retrieve(query, k=3)
    if not results:
        return "No relevant course material found in the database. Advise the student to upload documents."
    return "\n\n---\n\n".join(results)

@tool
def explain_topic(topic: str) -> str:
    """
    Provides a structured, high-quality academic explanation of a specific topic,
    including definitions, key concepts, and illustrative examples.
    Use this tool when the student asks for explanations of key academic terms or core curriculum concepts.
    """
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    # Quick LLM invocation to get a structured definition
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.3
    )
    prompt = f"""
Provide a structured academic explanation of "{topic}".
Follow this layout exactly:
1. Definition: A clear, concise 1-2 sentence definition.
2. Key Concepts: Bullet points explaining 2-3 core aspects of the topic.
3. Example: A practical, relatable example illustrating the topic.
Keep the explanation focused, clear, and easy to read.
"""
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        return res.content.strip()
    except Exception as e:
        return f"Failed to generate structured explanation for '{topic}': {e}"

def get_mentor_agent_executor(emotion: str) -> AgentExecutor:
    """
    Constructs and returns the LangChain AgentExecutor customized with a tone matching the student's emotion.
    """
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.7
    )
    
    # Define tool list
    tools = [retrieve_context, explain_topic]
    
    # Get tone instruction from emotion
    tone_instruction = adapt_tone(emotion)
    
    # Construct System Prompt Template
    system_prompt = f"""You are EduMind, an adaptive AI learning mentor for university students.
You adapt your tone based on the student's current emotion.
The student is currently feeling: {emotion}. Your tone instruction is: {tone_instruction}.

Guidelines:
1. If the student is frustrated, be gentle, encouraging, and supportive. Empathize with their struggle before answering.
2. If the student is confused, break down the explanation step-by-step. Use bullet points and simple analogies.
3. If the student is confident, provide advanced insights, deeper connections, or brief trivia to stretch their thinking.
4. If the student is neutral, be professional, clear, and structured.
5. Always cite or reference from course materials when utilizing the `retrieve_context` tool. Say something like "(sourced from syllabus/notes)".
6. Keep answers concise but comprehensive. Avoid long walls of text.

You have access to the following tools:
- retrieve_context: Search uploaded syllabus and course notes. Use this first if they ask about specific lectures, uploads, syllabus items, or files.
- explain_topic: Get a structured academic breakdown of any term. Use this if they need a thorough explanation of a concept.
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    # Create the agent
    agent = create_tool_calling_agent(llm, tools, prompt_template)
    
    # Create the executor
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

def run_mentor_agent(message: str, emotion: str, history: list) -> str:
    """
    Converts history list to LangChain message formats, invokes the agent, and returns the response.
    History format: [{"sender": "user"|"ai", "text": "message contents"}]
    """
    # Build LangChain history list
    chat_history = []
    # Only keep last 6 messages to avoid token blow-up and keep context relevant
    for msg in history[-6:]:
        if msg.get("sender") == "user":
            chat_history.append(HumanMessage(content=msg.get("text", "")))
        elif msg.get("sender") == "ai":
            chat_history.append(AIMessage(content=msg.get("text", "")))
            
    # Get agent executor
    executor = get_mentor_agent_executor(emotion)
    
    try:
        result = executor.invoke({
            "input": message,
            "chat_history": chat_history
        })
        return result.get("output", "I apologize, but I encountered an error while processing your request.")
    except Exception as e:
        print(f"Error running mentor agent: {e}")
        return f"I apologize, but I ran into a difficulty: {e}. Please try again or verify your Gemini API key."
