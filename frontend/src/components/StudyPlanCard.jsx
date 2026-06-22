import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function StudyPlanCard({ dayData }) {
  const { day, date, tasks } = dayData;
  const [checkedTasks, setCheckedTasks] = useState(
    new Array(tasks.length).fill(false)
  );

  // Parse dates to determine past, today, future
  const getDayStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planDate = new Date(date);
    planDate.setHours(0, 0, 0, 0);

    if (planDate.getTime() === today.getTime()) {
      return 'today';
    } else if (planDate < today) {
      return 'past';
    }
    return 'future';
  };

  const status = getDayStatus();
  const isPast = status === 'past';
  const isToday = status === 'today';

  const handleCheckboxChange = (index) => {
    const updated = [...checkedTasks];
    updated[index] = !updated[index];
    setCheckedTasks(updated);
  };

  // Format date display: "June 22, 2026"
  const formatDateString = (dtStr) => {
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dtStr).toLocaleDateString('en-US', options);
    } catch {
      return dtStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-2xl p-6 transition-all duration-300 ${
        isToday
          ? 'glass border-2 border-neonCyan glow-cyan bg-neonCyan/5'
          : isPast
          ? 'bg-white/2 border border-glassBorder/40 opacity-50 filter saturate-50'
          : 'glass border border-glassBorder hover:border-white/15'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-glassBorder/40 mb-4 gap-2">
        <div className="flex items-center space-x-3">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            isToday
              ? 'bg-neonCyan text-darkBg'
              : 'bg-neonPurple/20 text-neonPurple'
          }`}>
            D{day}
          </span>
          <h3 className="font-bold text-white text-base md:text-lg">
            Day {day} Planning
          </h3>
          {isToday && (
            <span className="px-2 py-0.5 bg-neonCyan text-darkBg text-[10px] font-extrabold rounded-md uppercase tracking-wider animate-pulse">
              Today
            </span>
          )}
        </div>
        <span className="text-xs md:text-sm text-textSecondary font-medium">
          📅 {formatDateString(date)}
        </span>
      </div>

      {/* Checklist Tasks */}
      <div className="flex flex-col space-y-3">
        {tasks.map((task, idx) => (
          <label
            key={idx}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              checkedTasks[idx]
                ? 'bg-neonPurple/5 border-neonPurple/30 text-textSecondary line-through decoration-neonPurple/50'
                : 'bg-white/2 border-transparent text-textPrimary hover:bg-white/5 hover:border-white/10'
            }`}
          >
            <input
              type="checkbox"
              checked={checkedTasks[idx]}
              onChange={() => handleCheckboxChange(idx)}
              className="mt-1 w-4.5 h-4.5 rounded border-glassBorder text-neonPurple bg-darkBg focus:ring-0 cursor-pointer transition-all duration-200 accent-neonPurple"
            />
            <span className="text-sm select-none leading-relaxed flex-1">{task}</span>
          </label>
        ))}
      </div>
    </motion.div>
  );
}
