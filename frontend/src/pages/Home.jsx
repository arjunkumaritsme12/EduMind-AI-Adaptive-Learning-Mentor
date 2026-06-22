import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    { title: "🎤 Voice Input", desc: "Speak naturally to your mentor. Built-in Web Speech recognition transcribes your questions instantly." },
    { title: "📚 RAG-Powered", desc: "Upload syllabus sheets or lecture notes. EduMind index documents and references them in responses." },
    { title: "🧠 Adaptive Quiz", desc: "Test your knowledge. Question difficulty changes dynamically based on your performance." },
    { title: "📊 Analytics", desc: "Visualize your academic growth. Tracks study metrics, exam readiness, and highlights weak concepts." }
  ];

  return (
    <div className="relative min-h-screen bg-darkBg overflow-hidden flex flex-col justify-center items-center px-4 py-16">
      {/* Background Particle Animation */}
      <div className="particle-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neonPurple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-neonCyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl flex flex-col items-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 py-1.5 rounded-full glass border border-neonPurple/30 text-xs font-bold text-neonCyan mb-6 glow-purple uppercase tracking-widest select-none"
        >
          🚀 Next-Gen Personalized Education
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-white leading-tight"
        >
          Your AI{' '}
          <span className="bg-gradient-to-r from-neonPurple via-purple-400 to-neonCyan bg-clip-text text-transparent">
            Learning Mentor
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-2xl text-textSecondary font-light tracking-wide max-w-2xl mb-8"
        >
          Adaptive. Intelligent. Personalized.
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <Link
            to="/chat"
            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-neonPurple via-[#827AFF] to-neonCyan text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(108,99,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 cursor-pointer"
          >
            Start Learning
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-16 text-left">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="glass glass-hover p-6 rounded-2xl border border-glassBorder"
            >
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-textSecondary leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="w-full grid grid-cols-3 divide-x divide-glassBorder/60 border-t border-b border-glassBorder/60 py-6 select-none bg-white/[0.01] rounded-2xl glass"
        >
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-neonPurple to-purple-400 bg-clip-text text-transparent">500+</div>
            <div className="text-[10px] sm:text-xs text-textSecondary uppercase tracking-widest mt-1">Topics</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-neonCyan to-blue-400 bg-clip-text text-transparent">Real-Time</div>
            <div className="text-[10px] sm:text-xs text-textSecondary uppercase tracking-widest mt-1">RAG Context</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-neonGreen to-emerald-400 bg-clip-text text-transparent">Gemini 1.5</div>
            <div className="text-[10px] sm:text-xs text-textSecondary uppercase tracking-widest mt-1">Powered</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
