import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import StudyPlan from './pages/StudyPlan';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';

function AppContent() {
  const location = useLocation();
  
  // Hide sidebar on the landing / welcome page
  const showSidebar = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary relative">
      {showSidebar && <Sidebar />}
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
