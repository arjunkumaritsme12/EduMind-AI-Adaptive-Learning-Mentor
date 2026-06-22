import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "edumind_analytics.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            wrong_topics TEXT NOT NULL, -- JSON serialized list of strings
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Initialize database tables
init_db()

def save_quiz_session(topic: str, score: int, total: int, wrong_topics: list) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    wrong_topics_json = json.dumps(wrong_topics)
    cursor.execute("""
        INSERT INTO quiz_sessions (topic, score, total, wrong_topics, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (topic, score, total, wrong_topics_json, timestamp))
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return session_id

def get_all_sessions() -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, topic, score, total, wrong_topics, timestamp FROM quiz_sessions ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    sessions = []
    for row in rows:
        sessions.append({
            "id": row["id"],
            "topic": row["topic"],
            "score": row["score"],
            "total": row["total"],
            "wrong_topics": json.loads(row["wrong_topics"]),
            "timestamp": row["timestamp"]
        })
    return sessions

def get_weak_areas() -> list:
    """
    Parses wrong_topics JSON from all sessions, aggregates counts,
    and returns a sorted list of dicts: [{"topic": topic, "count": count}]
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT wrong_topics FROM quiz_sessions")
    rows = cursor.fetchall()
    conn.close()
    
    counts = {}
    for row in rows:
        try:
            wrong_list = json.loads(row["wrong_topics"])
            for t in wrong_list:
                counts[t] = counts.get(t, 0) + 1
        except Exception:
            continue
            
    # Format for Recharts BarChart: {"topic": topic, "count": count}
    weak_areas = [{"topic": topic, "count": count} for topic, count in counts.items()]
    # Sort by count descending
    weak_areas.sort(key=lambda x: x["count"], reverse=True)
    return weak_areas

def get_progress() -> list:
    """
    Returns progress mapping list: [{"date": date, "score": score_percentage}]
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, score, total FROM quiz_sessions ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()
    
    progress = []
    for row in rows:
        try:
            # Parse timestamp to a simpler display format, e.g. "Jun 22" or "2024-06-22"
            dt = datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M:%S")
            date_str = dt.strftime("%b %d")
        except Exception:
            date_str = row["timestamp"]
            
        score_pct = (row["score"] / row["total"] * 100) if row["total"] > 0 else 0
        progress.append({
            "date": date_str,
            "score": round(score_pct, 1)
        })
    return progress

def reset_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM quiz_sessions")
    conn.commit()
    conn.close()
