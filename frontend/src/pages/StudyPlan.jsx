import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateStudyPlan } from '../api/client';
import StudyPlanCard from '../components/StudyPlanCard';
import Loader from '../components/Loader';

export default function StudyPlan() {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [weakAreas, setWeakAreas] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,$/, '');
      if (cleaned && !weakAreas.includes(cleaned)) {
        setWeakAreas([...weakAreas, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setWeakAreas(weakAreas.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !examDate || isLoading) return;

    setIsLoading(true);
    try {
      const data = await generateStudyPlan(subject.trim(), examDate, weakAreas);
      if (data && data.plan) {
        setPlan(data.plan);
      } else {
        alert("Failed to generate plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating study plan. Verify the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setSubject('');
    setExamDate('');
    setWeakAreas([]);
    setTagInput('');
  };

  return (
    <div className="ml-[240px] min-h-screen bg-darkBg text-textPrimary px-6 py-8 relative">
      {/* Background glow backdrops */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-neonPurple/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-neonCyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          📅 Adaptive Planner
        </h2>
        <p className="text-textSecondary text-sm">Calculate schedules backwards from your exam day, focusing on your self-reported weak concepts.</p>
      </div>

      {/* Setup Form */}
      {!plan && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto glass p-8 rounded-2xl glow-purple mt-8"
        >
          <h3 className="text-xl font-bold mb-6 text-white text-center">Schedule Syllabus Prep</h3>
          
          {isLoading ? (
            <Loader message="Synthesizing daily timeline tasks with Gemini..." />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-neonCyan uppercase tracking-widest mb-2">Subject / Exam Title</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inorganic Chemistry, Data Structures"
                  className="w-full p-4 rounded-xl glass border border-glassBorder text-white text-sm focus:outline-none focus:border-neonPurple/60 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neonCyan uppercase tracking-widest mb-2">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Cannot choose past date
                  className="w-full p-4 rounded-xl glass border border-glassBorder text-white text-sm focus:outline-none focus:border-neonPurple/60 transition-all duration-300 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neonCyan uppercase tracking-widest mb-2">
                  Weak Concepts / Subtopics (Tags)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type concept and press Enter"
                    className="w-full p-4 rounded-xl glass border border-glassBorder text-white text-sm focus:outline-none focus:border-neonPurple/60 transition-all duration-300"
                  />
                  
                  {/* Render Tags */}
                  <div className="flex flex-wrap gap-2">
                    {weakAreas.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg border border-neonPurple/40 bg-neonPurple/10 text-white text-xs font-medium flex items-center space-x-1.5 shadow-purpleGlow"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:text-red-400 font-bold ml-1.5 cursor-pointer text-xs focus:outline-none"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {weakAreas.length === 0 && (
                      <span className="text-xs text-textSecondary italic">No tags added yet. Type above and press Enter.</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!subject.trim() || !examDate || isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-neonPurple via-[#827AFF] to-neonCyan text-white font-bold tracking-wide hover:shadow-[0_0_25px_rgba(108,99,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                Assemble Study Schedule →
              </button>
            </form>
          )}
        </motion.div>
      )}

      {/* Generated Study Schedule */}
      {plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl mx-auto mt-6"
        >
          {/* Header Action bar */}
          <div className="flex justify-between items-center mb-8 bg-white/[0.02] border border-glassBorder p-4 rounded-xl glass">
            <div>
              <span className="text-xs text-textSecondary uppercase tracking-widest font-bold">Generated Plan for</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{subject} Prep</h3>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-300 cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              Reset / Create New
            </button>
          </div>

          {/* Timeline View */}
          <div className="relative pl-6 md:pl-10 border-l border-dashed border-glassBorder/80 space-y-8 py-2">
            {plan.map((dayData, index) => (
              <div key={index} className="relative">
                {/* Timeline node icon */}
                <div className={`absolute -left-[31px] md:-left-[47px] top-4 w-4 h-4 rounded-full border-2 ${
                  new Date(dayData.date).toDateString() === new Date().toDateString()
                    ? 'bg-neonCyan border-neonCyan shadow-[0_0_10px_rgba(0,212,255,0.8)]'
                    : 'bg-darkBg border-glassBorder'
                }`} />

                {/* Day Card */}
                <StudyPlanCard dayData={dayData} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
