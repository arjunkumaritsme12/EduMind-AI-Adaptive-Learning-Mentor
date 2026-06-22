import React from 'react';
import { motion } from 'framer-motion';

export default function ChatBubble({ message }) {
  const isUser = message.sender === 'user';

  // Helper function to format basic markdown-like elements (bolds, bullet points, line breaks)
  const formatMessageText = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check for bullet lists
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      let content = isBullet ? line.trim().substring(2) : line;

      // Handle bold formatting (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        // Push preceding plain text
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        // Push bold text
        parts.push(
          <strong key={match.index} className={isUser ? "font-bold text-white" : "font-semibold text-neonCyan"}>
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <li key={index} className="ml-5 list-disc py-0.5 leading-relaxed text-sm md:text-base">
            {parts.length > 0 ? parts : content}
          </li>
        );
      }

      return (
        <p key={index} className={`min-h-[1.2rem] leading-relaxed text-sm md:text-base ${line.trim() === '' ? 'h-3' : 'py-0.5'}`}>
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-neonPurple to-neonPurple/80 text-white rounded-tr-none glow-purple'
            : 'glass border-l-4 border-l-neonCyan text-textPrimary rounded-tl-none glow-cyan'
        }`}
      >
        {/* Header Indicator */}
        <div className="flex justify-between items-center mb-1 text-[10px] text-textSecondary select-none">
          <span className="font-bold tracking-wide uppercase">
            {isUser ? 'You' : 'EduMind Mentor'}
          </span>
        </div>

        {/* Message Content */}
        <div className="space-y-1">
          {formatMessageText(message.text)}
        </div>
      </div>
    </motion.div>
  );
}
