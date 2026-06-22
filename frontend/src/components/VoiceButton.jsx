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
        className="p-3 bg-white/5 text-gray-500 rounded-xl cursor-not-allowed border border-white/5"
      >
        🚫
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={`p-3 rounded-xl transition-all duration-300 relative border ${
        isListening
          ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse glow-red shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          : 'bg-white/5 border-glassBorder text-textSecondary hover:text-neonCyan hover:border-neonCyan'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="text-lg block leading-none select-none">🎤</span>
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
