import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateQuiz, submitQuiz } from '../api/client';
import QuizCard from '../components/QuizCard';
import Loader from '../components/Loader';

export default function Quiz() {
  const [step, setStep] = useState(1); // Steps: 1 = Setup, 2 = Active Quiz, 3 = Results
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  
  // Tracking detailed answers
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const startQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const data = await generateQuiz(topic.trim(), difficulty);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setScore(0);
        setCurrentIdx(0);
        setWrongQuestions([]);
        setStep(2);
      } else {
        alert("Failed to generate questions. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting quiz. Please verify backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelected = (isCorrect, selectedOptionKey) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      // Log the concept or the question itself as a wrong topic
      const currentQuestion = questions[currentIdx];
      // Store a summarized version of what was wrong, e.g. the question text itself or the quiz topic
      setWrongQuestions((prev) => [...prev, currentQuestion.question]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setStep(3);
    }
  };

  const saveResults = async () => {
    if (isSaving || saveSuccess) return;
    setIsSaving(true);
    try {
      // Map wrong questions list into DB
      // We will save the root topic, score, total, and list of specific questions they failed
      await submitQuiz(topic, score, questions.length, wrongQuestions);
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz results.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetQuizState = () => {
    // Adapt difficulty based on results
    const scorePct = (score / questions.length) * 100;
    let nextDifficulty = difficulty;
    
    if (scorePct < 60) {
      nextDifficulty = 'easy';
    } else if (scorePct >= 80) {
      nextDifficulty = 'hard';
    } else {
      nextDifficulty = 'medium';
    }
    
    setDifficulty(nextDifficulty);
    setStep(1);
    setQuestions([]);
    setTopic('');
  };

  // Adaptive difficulty prompt helper
  const getAdaptiveRecommendation = () => {
    const scorePct = (score / questions.length) * 100;
    if (scorePct < 60) {
      return {
        level: 'Easy',
        desc: 'Based on your score, we recommend taking a step back to review the foundational definitions at the Easy difficulty level.'
      };
    } else if (scorePct >= 80) {
      return {
        level: 'Hard',
        desc: 'Excellent progress! You\'ve mastered these concepts. We recommend leveling up to Hard difficulty for advanced concepts.'
      };
    }
    return {
      level: 'Medium',
      desc: 'Solid performance. Continue working on the Medium difficulty level to polish your skills.'
    };
  };

  const recommendation = getAdaptiveRecommendation();

  // Score circular SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 5) * circumference;

  return (
    <div className="ml-[240px] min-h-screen bg-darkBg text-textPrimary px-6 py-8 relative flex flex-col items-center">
      {/* Background neon elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neonPurple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Page Title */}
      <div className="w-full max-w-4xl mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          🎯 Practice Sandbox
        </h2>
        <p className="text-textSecondary text-sm">Challenge yourself with quick 5-MCQ adaptive quizzes to lock in core concepts.</p>
      </div>

      {/* Step 1: Setup Quiz */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass p-8 rounded-2xl glow-purple mt-8"
        >
          <h3 className="text-xl font-bold mb-6 text-white text-center">Configure Quiz Session</h3>
          {isLoading ? (
            <Loader message="Generating customized questions with Gemini..." />
          ) : (
            <form onSubmit={startQuiz} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-neonCyan uppercase tracking-widest mb-2">Quiz Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Computing, React Hooks, Cellular Respiration"
                  className="w-full p-4 rounded-xl glass border border-glassBorder text-white text-sm focus:outline-none focus:border-neonPurple/60 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neonCyan uppercase tracking-widest mb-3">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        difficulty === level
                          ? 'border-neonPurple bg-neonPurple/15 text-white shadow-purpleGlow'
                          : 'border-glassBorder text-textSecondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-neonPurple via-[#827AFF] to-neonCyan text-white font-bold tracking-wide hover:shadow-[0_0_25px_rgba(108,99,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                Generate Adaptive Quiz →
              </button>
            </form>
          )}
        </motion.div>
      )}

      {/* Step 2: Quiz Sandbox */}
      {step === 2 && questions.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <QuizCard
            questionData={questions[currentIdx]}
            currentNumber={currentIdx + 1}
            totalQuestions={questions.length}
            onAnswerSelected={handleAnswerSelected}
            onNextQuestion={handleNextQuestion}
          />
        </div>
      )}

      {/* Step 3: Quiz Results Screen */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl glass p-8 rounded-2xl border border-glassBorder mt-6 flex flex-col items-center"
        >
          <span className="text-4xl mb-4">🏆</span>
          <h3 className="text-2xl font-extrabold text-white mb-6">Quiz Completed!</h3>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 w-full justify-center">
            {/* Circular Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-glassBorder"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-neonPurple"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{score}/5</span>
                <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Correct</span>
              </div>
            </div>

            {/* Performance Text */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-2">
                {score === 5 ? 'Perfect Score! 🌟' : score >= 3 ? 'Great Work! 👍' : 'Keep Practicing! 💪'}
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed max-w-sm">
                You scored a {score * 20}% on {topic} at a {difficulty} level. Save this to log hours and build your learning analytics.
              </p>
            </div>
          </div>

          {/* Adaptive Feedback Recommendation */}
          <div className="w-full p-4 rounded-xl glass border border-neonCyan/30 bg-neonCyan/5 mb-6">
            <h4 className="text-xs font-extrabold text-neonCyan uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              🔄 Adaptive Pathway Recommendation
            </h4>
            <div className="text-sm font-bold text-white mb-1">
              Next Suggested Tier: <span className="text-neonPurple">{recommendation.level}</span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">{recommendation.desc}</p>
          </div>

          {/* Missed Topics list */}
          {wrongQuestions.length > 0 && (
            <div className="w-full mb-8 text-left bg-red-500/5 border border-red-500/20 p-5 rounded-xl">
              <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                ⚠️ Areas for Review ({wrongQuestions.length})
              </h4>
              <ul className="space-y-2">
                {wrongQuestions.map((qText, index) => (
                  <li key={index} className="text-xs text-textSecondary flex items-start space-x-2 leading-relaxed">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{qText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Button Operations */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={saveResults}
              disabled={isSaving || saveSuccess}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 border ${
                saveSuccess
                  ? 'border-neonGreen/40 bg-neonGreen/10 text-neonGreen cursor-default'
                  : 'border-neonCyan/40 hover:border-neonCyan bg-neonCyan/10 text-neonCyan hover:bg-neonCyan/20 cursor-pointer'
              }`}
            >
              {isSaving ? 'Logging...' : saveSuccess ? '✅ Saved to Dashboard' : 'Save to Analytics'}
            </button>
            <button
              onClick={resetQuizState}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase border border-neonPurple/40 bg-neonPurple/10 text-neonPurple hover:bg-neonPurple/20 hover:border-neonPurple transition-all duration-300 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
