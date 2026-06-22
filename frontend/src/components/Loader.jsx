import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ message = "Thinking..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl glass glow-purple max-w-sm mx-auto my-8">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-neonPurple border-t-transparent border-r-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-neonCyan border-b-transparent border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
      <p className="text-textSecondary text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}
