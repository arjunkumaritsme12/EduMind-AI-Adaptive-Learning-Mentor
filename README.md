# EduMind AI — Adaptive Learning Mentor 🧠

EduMind AI is an industry-level, full-stack, personalized learning workspace designed to assist university students. Using Retrieval-Augmented Generation (RAG) over syllabus materials, dynamic emotion-based tone adaptation, voice input transcription, and adaptive quizzes, EduMind acts as a dedicated 24/7 academic advisor and tutor.

---

## 🛠️ Tech Stack

### Frontend
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16-purple?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10-22B5BF?logo=chart&logoColor=white)](https://recharts.org/)

### Backend
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-emerald?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.2-orange?logo=chain&logoColor=white)](https://langchain.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-red?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-lightgrey)](https://www.trychroma.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-blue?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## 📐 System Architecture

```text
               +----------------------------------------+
               |          React 18 Frontend             |
               | (Vite + Tailwind + Recharts + Motion)  |
               +-------------------+--------------------+
                                   |
                       HTTP / JSON | (Axios client)
                                   v
               +-------------------+--------------------+
               |           FastAPI Backend              |
               |             (Python 3)                 |
               +--+----------------+-----------------+--+
                  |                |                 |
                  |                |                 |
                  v                v                 v
          +-------+-------+  +-----+-----+  +--------+--------+
          | SQLite DB     |  | LangChain |  | ChromaDB        |
          | (Analytics)   |  | Agent     |  | (Vector Store)  |
          +---------------+  +-----+-----+  +--------+--------+
                                   |                 ^
                                   |                 | Ingest
                                   v                 |
                           +-------+-------+   +-----+-----+
                           | Gemini 1.5    |   | PyMuPDF   |
                           | Flash API     |   | Parser    |
                           +---------------+   +-----------+
```

---

## 🌟 Features

1. **💬 RAG-Powered Chat**: Ask questions directly referencing syllabus sheets or course documents. The model answers while citing its source.
2. **😤 Emotion-Based Tone Adaptation**: Uses TextBlob sentiment rules. The tutor dynamically shifts tone:
   * **Frustrated** $\rightarrow$ gentle, empathetic, encouraging.
   * **Confused** $\rightarrow$ step-by-step, simplified explanations.
   * **Confident** $\rightarrow$ advanced concepts and deeper insights.
   * **Neutral** $\rightarrow$ professional, clear.
3. **🎤 Web Speech Voice Input**: Directly transcribe questions from the browser's native API without using external libraries.
4. **🎯 Adaptive Assessments**: Take 5-MCQ topic quizzes. If your score is $<60\%$, the engine suggests starting at "easy" next time. If $>80\%$, it suggests upgrading to "hard".
5. **📅 Study Scheduler**: Provide an exam date and subject title to generate a timeline calendar focusing on your weak areas.
6. **📊 Visual Analytics**: Track quiz histories, check correctness trends with line graphs, and identify conceptual gaps with horizontal bar charts.

---

## 🚀 Setup Instructions

### Prerequisites
* Python 3.10+
* Node.js 18+
* Google Gemini API Key

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Copy `.env.example` to a new `.env` file:
   ```bash
   copy .env.example .env
   ```
5. Open `.env` and fill in your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend documentation will be live at http://localhost:8000/docs.*

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development workspace:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Document Ingestion Guide

1. Navigate to the **Upload Notes** section in the sidebar.
2. Drag and drop any PDF syllabus file or course notes (under 15MB) into the drop target.
3. Click **Ingest File** to trigger parsing. The PDF is converted to 500-character chunks, embedded using `models/embedding-001`, and indexed in ChromaDB.
4. Go back to the **Chat** screen, type a query, and watch the mentor fetch and cite from your document!

---

## 📸 Screenshots Placeholder

| Landing Page | Mentor Workspace | Adaptive Quizzes |
| :---: | :---: | :---: |
| ![Home Page](https://via.placeholder.com/600x400/0A0A0F/FFFFFF?text=Home+Screen+Glassmorphism) | ![Chat Workspace](https://via.placeholder.com/600x400/0A0A0F/FFFFFF?text=Adaptive+Mentor+Chat) | ![Quiz Board](https://via.placeholder.com/600x400/0A0A0F/FFFFFF?text=Adaptive+MCQ+Quiz) |
