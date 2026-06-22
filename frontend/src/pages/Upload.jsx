import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPDF } from '../api/client';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [ingestionInfo, setIngestionInfo] = useState({ chunks: 0, message: '' });
  const [errorMsg, setErrorMsg] = useState('');
  
  // Local list of uploaded files (stored in localStorage or static)
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_uploaded_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    setStatus('idle');
    setProgress(0);
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file format. Only PDF files are supported for RAG indexing.');
      setSelectedFile(null);
      return;
    }
    
    // Check file size (limit to 15MB for stability)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File is too large. Please upload a PDF under 15MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerUpload = async () => {
    if (!selectedFile || status === 'uploading') return;

    setStatus('uploading');
    setProgress(15);
    
    // Simulate loading bar steps
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 85) {
          clearInterval(timer);
          return 85;
        }
        return oldProgress + 10;
      });
    }, 150);

    try {
      const data = await uploadPDF(selectedFile);
      clearInterval(timer);
      setProgress(100);
      
      setIngestionInfo({
        chunks: data.chunks,
        message: data.message
      });
      setStatus('success');

      // Update local storage log of uploaded items
      const newFileObj = {
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        chunks: data.chunks,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };

      const updatedList = [newFileObj, ...uploadedFiles];
      setUploadedFiles(updatedList);
      localStorage.setItem('edumind_uploaded_files', JSON.stringify(updatedList));
      setSelectedFile(null);
    } catch (err) {
      clearInterval(timer);
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Failed to ingest file. Make sure backend is running and GEMINI_API_KEY is configured.');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
  };

  return (
    <div className="ml-[240px] min-h-screen bg-darkBg text-textPrimary px-6 py-8 relative">
      {/* Glow overlays */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-neonPurple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          📁 Ingestion Control
        </h2>
        <p className="text-textSecondary text-sm">Upload syllabus files, research papers, or study notes. EduMind splits, embeds, and indexes them into ChromaDB.</p>
      </div>

      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Upload Column (Col span 2) */}
        <div className="md:col-span-2 space-y-6">
          <form
            onDragEnter={handleDrag}
            onSubmit={(e) => e.preventDefault()}
            className="w-full"
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf"
            />

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`w-full p-8 md:p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-neonCyan bg-neonCyan/5 shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                  : 'border-glassBorder/60 hover:border-neonPurple/60 hover:shadow-purpleGlow hover:bg-white/3'
              }`}
            >
              <span className="text-4xl mb-4 select-none">📂</span>
              <p className="font-bold text-white text-sm md:text-base mb-1">Drag and drop syllabus PDF here</p>
              <p className="text-xs text-textSecondary mb-4">Or click to browse from explorer</p>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-glassBorder text-[10px] text-neonCyan font-extrabold uppercase tracking-wider select-none">
                PDF File Only (Max 15MB)
              </span>
            </div>
          </form>

          {/* Selected File Card */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full glass p-5 rounded-2xl border border-glassBorder flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <span className="text-3xl select-none">📄</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate max-w-[250px] sm:max-w-md">{selectedFile.name}</h4>
                    <p className="text-xs text-textSecondary">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={triggerUpload}
                    className="px-4 py-2 bg-gradient-to-r from-neonPurple to-neonPurple/85 text-white text-xs font-bold rounded-lg cursor-pointer hover:shadow-purpleGlow transition-all duration-300"
                  >
                    Ingest File
                  </button>
                  <button
                    onClick={clearSelection}
                    className="p-2 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 rounded-lg cursor-pointer transition-all duration-300 text-xs"
                    title="Remove selection"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress */}
          {status === 'uploading' && (
            <div className="w-full glass p-5 rounded-2xl border border-glassBorder space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-neonCyan">Ingesting Chunks...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-neonPurple to-neonCyan h-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-[10px] text-textSecondary italic animate-pulse">Running PyMuPDF parser and Google Generative AI Embeddings...</p>
            </div>
          )}

          {/* Success Status Alert */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl border border-neonGreen/30 bg-neonGreen/5 shadow-[0_0_15px_rgba(0,255,136,0.1)] flex items-start space-x-3 text-left"
            >
              <span className="text-xl">✅</span>
              <div>
                <h4 className="text-sm font-bold text-neonGreen">Ingestion Complete</h4>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">{ingestionInfo.message}</p>
                <div className="text-[10px] text-neonGreen font-semibold uppercase tracking-widest mt-2">
                  Total Loaded Chunks: {ingestionInfo.chunks}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Status Alert */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-start space-x-3 text-left animate-shake"
            >
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-bold text-red-400">Ingestion Failed</h4>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Error fallback alert */}
          {errorMsg && status === 'idle' && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Index File History (Col span 1) */}
        <div className="glass p-6 rounded-2xl border border-glassBorder flex flex-col">
          <h3 className="text-base font-bold text-white pb-3 border-b border-glassBorder/50 mb-4 select-none">
            Indexed Syllabus Files
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px]">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/2 rounded-xl border border-glassBorder/40 hover:border-glassBorder transition-all duration-300"
              >
                <h4 className="font-semibold text-xs text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-textSecondary mt-2">
                  <span>{file.size}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neonPurple/20 text-neonPurple font-bold">
                    {file.chunks} Chunks
                  </span>
                </div>
                <div className="text-[9px] text-textSecondary text-right mt-1.5 italic">
                  Indexed on {file.date}
                </div>
              </div>
            ))}

            {uploadedFiles.length === 0 && (
              <div className="h-48 flex flex-col justify-center items-center text-center text-xs text-textSecondary">
                <span className="text-2xl mb-2">🤷‍♂️</span>
                <p>No documents uploaded yet.</p>
                <p className="text-[10px] mt-1">Files you ingest will show here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
