import React, { useState, useEffect, useRef } from 'react';

export default function VoiceButton({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [supportVoice, setSupportVoice] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportVoice(false);
      return;
    }

    const recObj = new SpeechRecognition();
    recObj.continuous = false;
    recObj.interimResults = false;
    recObj.lang = 'en-US';

    recObj.onstart = () => {
      setIsListening(true);
    };

    recObj.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      if (onTranscript) {
        onTranscript(transcriptText);
      }
    };

    recObj.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recObj.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recObj;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!supportVoice) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition not supported in this browser"
        className="p-3 bg-white/5 text-gray-500 rounded-xl cursor-not-allowed border border-white/5 flex items-center justify-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 select-none"
        >
          <line x1="2" x2="22" y1="2" y2="22" />
          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
          <path d="M15 9.34V5a3 3 0 0 0-5.94-.6" />
          <path d="M5 10v1a7 7 0 0 0 6 6.91" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={`p-3 rounded-xl transition-all duration-300 relative border flex items-center justify-center ${
        isListening
          ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse glow-red shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          : 'bg-white/5 border-glassBorder text-textSecondary hover:text-neonCyan hover:border-neonCyan'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-5 h-5 select-none"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}

