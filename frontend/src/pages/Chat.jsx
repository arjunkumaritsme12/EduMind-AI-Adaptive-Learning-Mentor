import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage } from '../api/client';
import ChatBubble from '../components/ChatBubble';
import VoiceButton from '../components/VoiceButton';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm EduMind, your adaptive learning mentor. Feel free to ask me anything about your studies, request an explanation of complex topics, or ask questions about your syllabus PDFs! How are you feeling today?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');

  const messagesEndRef = useRef(null);

  const emotionEmojis = {
    frustrated: '😤 Frustrated',
    confused: '😕 Confused',
    confident: '😊 Confident',
    neutral: '😐 Neutral',
  };

  const emotionBadgeStyles = {
    frustrated: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    confused: 'bg-neonAmber/20 text-neonAmber border-neonAmber/30 shadow-[0_0_15px_rgba(255,184,0,0.15)]',
    confident: 'bg-neonGreen/20 text-neonGreen border-neonGreen/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]',
    neutral: 'bg-white/5 text-textSecondary border-glassBorder',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send the current input, the current emotion, and the conversation history
      const responseData = await sendMessage(
        userMessage.text,
        '', // Let backend detect the emotion automatically
        messages
      );

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: responseData.response },
      ]);
      
      if (responseData.emotion_tone) {
        setCurrentEmotion(responseData.emotion_tone);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I had some trouble connecting to the server. Please verify the backend is running and that your Gemini API key is configured correctly.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (text) => {
    setInputText((prev) => {
      const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
      return prev + space + text;
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
  };

  const suggestions = [
    "Explain standard deviation step-by-step",
    "How does Retrieval-Augmented Generation (RAG) work?",
    "Summarize my course syllabus guidelines",
    "I'm feeling overwhelmed with exam prep, help me"
  ];

  return (
    <div className="ml-[240px] min-h-screen bg-darkBg text-textPrimary flex flex-col justify-between relative">
      {/* Background Glows */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-neonPurple/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-neonCyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="glass border-b border-glassBorder px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            💬 Mentor Workspace
          </h2>
          <p className="text-xs text-textSecondary">Ask questions, read lecture slides, and clear doubts.</p>
        </div>

        {/* Dynamic Emotion Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Detected Mood:</span>
          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-500 uppercase tracking-wide ${emotionBadgeStyles[currentEmotion]}`}>
            {emotionEmojis[currentEmotion]}
          </div>
        </div>
      </header>

      {/* Messages Sandbox */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto w-full flex flex-col justify-between">
        <div className="w-full flex-1">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2 p-4 rounded-2xl glass border-l-4 border-l-neonCyan w-fit mb-4"
              >
                <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mr-1">EduMind is typing</div>
                <div className="flex space-x-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-neonCyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-neonPurple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-neonCyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (only show when there's very little conversation) */}
        {messages.length <= 2 && (
          <div className="mt-8 mb-4">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-3.5 py-2 text-xs rounded-xl glass border border-glassBorder hover:border-neonPurple/50 hover:bg-neonPurple/10 text-textSecondary hover:text-white cursor-pointer transition-all duration-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input Tray */}
      <footer className="px-6 py-4 glass border-t border-glassBorder sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto w-full flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Waiting for response..." : "Ask your learning mentor a question..."}
            className="flex-1 p-4 rounded-xl glass border border-glassBorder text-white text-sm md:text-base placeholder-textSecondary focus:outline-none focus:border-neonPurple/60 transition-all duration-300"
          />

          {/* Voice Input Button */}
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={isLoading} />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`px-5 py-4 rounded-xl font-bold bg-gradient-to-r from-neonPurple to-neonPurple/80 text-white transition-all duration-300 shadow-lg flex items-center justify-center ${
              isLoading || !inputText.trim()
                ? 'opacity-50 cursor-not-allowed border-transparent'
                : 'hover:shadow-purpleGlow transform hover:-translate-y-0.5 cursor-pointer hover:border-neonPurple/40'
            }`}
          >
            <span className="text-sm font-bold tracking-wider select-none uppercase">Send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
