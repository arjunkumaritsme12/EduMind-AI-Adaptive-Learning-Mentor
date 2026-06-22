import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizCard({
  questionData,
  currentNumber,
  totalQuestions,
  onAnswerSelected,
  onNextQuestion,
}) {
  const { question, options, answer, explanation } = questionData;
  const [selectedOptionKey, setSelectedOptionKey] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset local state when the question changes
  useEffect(() => {
    setSelectedOptionKey(null);
    setHasSubmitted(false);
  }, [questionData]);

  const handleOptionClick = (optionString) => {
    if (hasSubmitted) return;
    
    // Extract choice letter (usually the first character before ')' or space, e.g. "A" from "A) Option")
    let key = "A";
    if (optionString.startsWith("A")) key = "A";
    else if (optionString.startsWith("B")) key = "B";
    else if (optionString.startsWith("C")) key = "C";
    else if (optionString.startsWith("D")) key = "D";
    
    setSelectedOptionKey(key);
    setHasSubmitted(true);

    const isCorrect = key === answer;
    if (onAnswerSelected) {
      onAnswerSelected(isCorrect, key);
    }
  };

  const getOptionKey = (optionStr) => {
    if (optionStr.startsWith("A")) return "A";
    if (optionStr.startsWith("B")) return "B";
    if (optionStr.startsWith("C")) return "C";
    if (optionStr.startsWith("D")) return "D";
    return "A";
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass p-6 md:p-8 rounded-2xl glow-purple relative overflow-hidden">
      {/* Background Neon Accent Glows */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-neonPurple/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-neonCyan/10 rounded-full blur-2xl pointer-events-none" />

      {/* Quiz Progress Header */}
      <div className="flex justify-between items-center mb-6 border-b border-glassBorder pb-4 select-none">
        <span className="text-xs font-bold tracking-wider text-neonCyan uppercase">
          🧠 Adaptive Assessment
        </span>
        <span className="text-sm font-semibold text-textSecondary">
          Question <span className="text-neonPurple">{currentNumber}</span> of {totalQuestions}
        </span>
      </div>

      {/* Question String */}
      <h3 className="text-lg md:text-xl font-medium mb-8 text-white leading-relaxed">
        {question}
      </h3>

      {/* MCQ Option Buttons */}
      <div className="flex flex-col space-y-4 mb-8">
        {options.map((option, index) => {
          const optKey = getOptionKey(option);
          const isSelected = selectedOptionKey === optKey;
          const isCorrectAnswer = optKey === answer;

          let btnStyle = 'border-glassBorder hover:border-neonPurple/60 hover:bg-white/5 text-white bg-white/3';
          if (hasSubmitted) {
            if (isCorrectAnswer) {
              btnStyle = 'border-neonGreen bg-neonGreen/10 text-neonGreen shadow-[0_0_15px_rgba(0,255,136,0.2)]';
            } else if (isSelected) {
              btnStyle = 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            } else {
              btnStyle = 'border-glassBorder text-textSecondary opacity-60';
            }
          }

          return (
            <motion.button
              key={index}
              disabled={hasSubmitted}
              whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center font-medium ${btnStyle} ${
                !hasSubmitted ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-bold text-sm ${
                hasSubmitted && isCorrectAnswer
                  ? 'bg-neonGreen text-darkBg'
                  : hasSubmitted && isSelected
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-textSecondary'
              }`}>
                {optKey}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Feedback and Explanation */}
      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl glass border border-neonCyan/30 mb-6 bg-neonCyan/5">
              <h4 className="text-sm font-bold text-neonCyan mb-1 flex items-center">
                📝 Explanation
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                {explanation}
              </p>
            </div>
            
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNextQuestion}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-neonPurple to-neonPurple/80 text-white font-bold hover:shadow-purpleGlow transition-all duration-300 cursor-pointer text-sm"
              >
                {currentNumber === totalQuestions ? 'Finish Quiz 🏁' : 'Next Question ➡️'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
