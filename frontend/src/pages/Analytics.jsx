import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { getAnalytics, resetAnalytics } from '../api/client';
import Loader from '../components/Loader';

export default function Analytics() {
  const [data, setData] = useState({
    quiz_history: [],
    weak_areas: [],
    total_sessions: 0,
    avg_score: 0.0,
    estimated_hours: 0.0,
    strongest_topic: 'N/A',
    progress: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const result = await getAnalytics();
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetAnalytics();
      setData({
        quiz_history: [],
        weak_areas: [],
        total_sessions: 0,
        avg_score: 0.0,
        estimated_hours: 0.0,
        strongest_topic: 'N/A',
        progress: [],
      });
      setShowResetModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset analytics logs.');
    } finally {
      setIsResetting(false);
    }
  };

  const getScoreBadgeClass = (score, total) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return 'border-neonGreen/45 bg-neonGreen/10 text-neonGreen shadow-[0_0_10px_rgba(0,255,136,0.1)]';
    if (pct >= 50) return 'border-neonAmber/45 bg-neonAmber/10 text-neonAmber shadow-[0_0_10px_rgba(255,184,0,0.1)]';
    return 'border-red-500/45 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
  };

  const getScoreBadgeText = (score, total) => {
    const pct = (score / total) * 100;
    return `${score}/${total} (${pct.toFixed(0)}%)`;
  };

  // Weak area colors: red to amber gradient helper
  const getWeakColor = (index, total) => {
    // Red: rgb(239, 68, 68), Amber: rgb(255, 184, 0)
    // Interpolate color index
    const ratio = total > 1 ? index / (total - 1) : 0.5;
    const r = Math.round(239 + (255 - 239) * ratio);
    const g = Math.round(68 + (184 - 68) * ratio);
    const b = Math.round(68 + (0 - 68) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (isLoading) {
    return (
      <div className="ml-[240px] min-h-screen bg-darkBg flex justify-center items-center">
        <Loader message="Compiling DB metrics and rendering graphics..." />
      </div>
    );
  }

  const statItems = [
    { title: 'Quiz Sessions', value: data.total_sessions, icon: '🎯', desc: 'Total assessments taken' },
    { title: 'Average Score', value: `${data.avg_score}%`, icon: '📈', desc: 'Overall correctness rate' },
    { title: 'Study Hours', value: `${data.estimated_hours}h`, icon: '⏳', desc: 'Syllabus training estimate' },
    { title: 'Strongest Topic', value: data.strongest_topic, icon: '💪', desc: 'Highest avg quiz tier' },
  ];

  return (
    <div className="ml-[240px] min-h-screen bg-darkBg text-textPrimary px-6 py-8 relative">
      {/* Background glow backdrops */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-neonPurple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Page Title */}
      <div className="w-full max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            📊 Progress Analytics
          </h2>
          <p className="text-textSecondary text-sm">Visualize study completions, assessment logs, and curriculum gaps.</p>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {statItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass p-5 rounded-2xl border border-glassBorder flex flex-col relative overflow-hidden group"
            >
              <div className="absolute -right-4 -bottom-4 text-4xl opacity-10 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-textSecondary uppercase font-bold tracking-wider">{item.title}</span>
                <span className="text-sm select-none">{item.icon}</span>
              </div>
              <h3 className="text-lg md:text-2xl font-black text-white my-1 tracking-tight truncate max-w-full">
                {item.value}
              </h3>
              <p className="text-[10px] text-textSecondary">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        {data.total_sessions > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart (Line) */}
            <div className="glass p-6 rounded-2xl border border-glassBorder">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                📈 Score Percentage Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.progress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      stroke="#A0A0B0"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#A0A0B0"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                      itemStyle={{ color: '#00D4FF' }}
                      formatter={(val) => [`${val}%`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6C63FF"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#6C63FF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weak Areas Chart (Horizontal Bar) */}
            <div className="glass p-6 rounded-2xl border border-glassBorder">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                ⚠️ Conceptual Weaknesses
              </h3>
              {data.weak_areas.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.weak_areas.slice(0, 5)} // Show top 5 weak concepts
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#A0A0B0" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="topic"
                        stroke="#A0A0B0"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                        tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                      />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                        itemStyle={{ color: '#FFB800' }}
                        formatter={(val) => [val, 'Wrong Questions']}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                        {data.weak_areas.slice(0, 5).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getWeakColor(index, Math.min(data.weak_areas.length, 5))}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col justify-center items-center text-center text-xs text-textSecondary italic">
                  <span>🎉 Excellent! No weak concepts recorded.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full glass p-12 rounded-2xl border border-glassBorder flex flex-col items-center justify-center text-center text-textSecondary">
            <span className="text-5xl mb-4 select-none">📈</span>
            <h4 className="text-lg font-bold text-white mb-1">No Assessment Data Yet</h4>
            <p className="text-sm max-w-md leading-relaxed">
              Complete a topic check-in on the Quiz page and save your results to see your performance charts mapped here!
            </p>
          </div>
        )}

        {/* Recent Sessions Table */}
        {data.quiz_history.length > 0 && (
          <div className="glass rounded-2xl border border-glassBorder overflow-hidden">
            <div className="px-6 py-4 border-b border-glassBorder bg-white/[0.01] select-none">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📝 Recent Session Log
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-glassBorder text-xs text-textSecondary uppercase select-none bg-white/[0.02]">
                    <th className="px-6 py-3 font-semibold">Assessment Topic</th>
                    <th className="px-6 py-3 font-semibold">Correctness Badge</th>
                    <th className="px-6 py-3 font-semibold">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.quiz_history.map((session, index) => (
                    <tr
                      key={session.id || index}
                      className={`border-b border-glassBorder/40 transition-colors ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                      } hover:bg-white/5`}
                    >
                      <td className="px-6 py-4 font-medium text-white max-w-[200px] sm:max-w-xs truncate" title={session.topic}>
                        {session.topic}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeClass(session.score, session.total)}`}>
                          {getScoreBadgeText(session.score, session.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-textSecondary">
                        {session.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reset Database Button Area */}
        {data.quiz_history.length > 0 && (
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-5 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Clear Logs
            </button>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal Dialog */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm glass border border-red-500/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center z-10"
            >
              <span className="text-4xl mb-3">🚨</span>
              <h3 className="text-lg font-bold text-white mb-2">Delete Database Logs?</h3>
              <p className="text-xs text-textSecondary leading-relaxed mb-6">
                Are you sure you want to delete all stored quiz sessions? This action is permanent and cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  disabled={isResetting}
                  onClick={handleResetData}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                >
                  {isResetting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  disabled={isResetting}
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 border border-glassBorder hover:bg-white/5 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
