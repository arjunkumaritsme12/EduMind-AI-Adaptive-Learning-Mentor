import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (message, emotion, history) => {
  const response = await client.post('/api/chat', {
    message,
    emotion,
    history,
  });
  return response.data;
};

export const generateQuiz = async (topic, difficulty) => {
  const response = await client.post('/api/quiz/generate', {
    topic,
    difficulty,
  });
  return response.data;
};

export const submitQuiz = async (topic, score, total, wrongTopics) => {
  const response = await client.post('/api/quiz/submit', {
    topic,
    score,
    total,
    wrong_topics: wrongTopics,
  });
  return response.data;
};

export const generateStudyPlan = async (subject, examDate, weakAreas) => {
  const response = await client.post('/api/study-plan', {
    subject,
    exam_date: examDate,
    weak_areas: weakAreas,
  });
  return response.data;
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await client.get('/api/analytics');
  return response.data;
};

export const resetAnalytics = async () => {
  const response = await client.delete('/api/analytics/reset');
  return response.data;
};
