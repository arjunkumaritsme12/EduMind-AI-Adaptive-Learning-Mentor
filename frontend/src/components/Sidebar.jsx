import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/quiz', label: 'Quiz', icon: '🎯' },
    { path: '/study-plan', label: 'Study Plan', icon: '📅' },
    { path: '/upload', label: 'Upload Notes', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-[240px] glass border-r border-glassBorder flex flex-col justify-between p-6 z-10">
      <div className="flex flex-col space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2 pb-4 border-b border-glassBorder">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold bg-gradient-to-r from-neonPurple to-neonCyan bg-clip-text text-transparent tracking-wide">
            EduMind AI
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-neonPurple/15 text-white font-medium border-l-4 border-neonPurple shadow-purpleGlow'
                    : 'text-textSecondary hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Powered indicator */}
      <div className="text-center text-xs text-textSecondary border-t border-glassBorder pt-4">
        <span>Powered by </span>
        <span className="font-semibold bg-gradient-to-r from-neonPurple to-neonCyan bg-clip-text text-transparent">
          Gemini ✨
        </span>
      </div>
    </div>
  );
}
