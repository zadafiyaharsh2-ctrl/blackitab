/**
 * ============================================================================
 * QUESTION PAPER PAGE (QuestionPaper.jsx)
 * ============================================================================
 * 
 * Teacher/HOD/Admin page for generating downloadable question papers as PDFs.
 * Features: filter by exam, subject, difficulty, question count, answer key toggle.
 * Previews questions before downloading.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFilePdf, FaFilter, FaDownload, FaEye, FaCheck,
  FaChevronDown, FaTimes, FaSpinner, FaListUl
} from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const QuestionPaper = () => {
  usePageTitle('Question Paper Generator');

  // ── Filter State ──
  const [exam, setExam] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [limit, setLimit] = useState(20);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [title, setTitle] = useState('');

  // ── Data State ──
  const [questions, setQuestions] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [totalFound, setTotalFound] = useState(0);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch Preview ──
  const fetchPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (exam) params.append('exam', exam);
      if (subject) params.append('subject', subject);
      if (difficulty) params.append('difficulty', difficulty);
      params.append('limit', limit);

      const res = await axios.get(`${API_URL}/api/exams/questions/preview?${params}`, { headers });
      if (res.data.success) {
        setQuestions(res.data.data.questions || []);
        setTotalFound(res.data.data.total || 0);
        setAvailableExams(res.data.data.availableExams || []);
        setAvailableSubjects(res.data.data.availableSubjects || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load preview on mount
  useEffect(() => { fetchPreview(); }, []);

  // ── Download PDF ──
  const downloadPDF = async () => {
    setDownloading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (exam) params.append('exam', exam);
      if (subject) params.append('subject', subject);
      if (difficulty) params.append('difficulty', difficulty);
      params.append('limit', limit);
      params.append('includeAnswers', includeAnswers);
      if (title) params.append('title', title);

      const res = await axios.get(`${API_URL}/api/exams/questions/export-pdf?${params}`, {
        headers,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'Question_Paper'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF. Make sure questions exist with your filters.');
    } finally {
      setDownloading(false);
    }
  };

  const diffColors = {
    Easy: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    Medium: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    Hard: 'bg-red-500/15 text-red-500 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FaFilePdf className="text-red-500" />
          Question Paper Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Select filters, preview questions, and download as a formatted PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Filter Panel ── */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <FaFilter className="text-blue-500" /> Filters
            </h2>

            {/* Paper Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Paper Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GATE 2026 - DBMS Mock Test"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Exam Select */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Exam</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
              >
                <option value="">All Exams</option>
                {availableExams.map(e => (
                  <option key={e} value={e}>{e.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {['', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === d
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-300'
                    }`}
                  >
                    {d || 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Number of Questions: <span className="text-blue-500">{limit}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>5</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>

            {/* Include Answers Toggle */}
            <div className="mb-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition">Include Answer Key</span>
                <div
                  onClick={() => setIncludeAnswers(!includeAnswers)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    includeAnswers ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    includeAnswers ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchPreview}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-semibold text-sm border border-gray-200 dark:border-white/10 transition disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaEye />}
                Preview Questions
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadPDF}
                disabled={downloading || questions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </motion.button>
            </div>

            {/* Stats */}
            {questions.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Found {totalFound} questions matching your filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <FaListUl className="text-purple-500" /> Question Preview
              {questions.length > 0 && (
                <span className="ml-auto text-sm font-normal text-gray-500">{questions.length} questions</span>
              )}
            </h2>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FaSpinner className="animate-spin text-3xl mb-3" />
                <p className="text-sm">Loading questions...</p>
              </div>
            )}

            {/* Empty */}
            {!loading && questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FaFilePdf className="text-4xl mb-3 opacity-30" />
                <p className="text-sm">No questions found. Try adjusting your filters.</p>
                <p className="text-xs mt-1 opacity-60">Use "Preview Questions" to load questions.</p>
              </div>
            )}

            {/* Question List */}
            {!loading && questions.length > 0 && (
              <div className="space-y-4">
                <AnimatePresence>
                  {questions.map((q, index) => (
                    <motion.div
                      key={q._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/20 transition group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Question Number */}
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* Question Text */}
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                            {q.question || q.content || 'Question text unavailable'}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColors[q.difficulty] || diffColors.Medium}`}>
                              {q.difficulty}
                            </span>
                            {q.exam && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                                {q.exam.toUpperCase()}
                              </span>
                            )}
                            {q.subject && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                {q.subject}
                              </span>
                            )}
                          </div>

                          {/* Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                                    q.correctAnswer === optIdx
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                                      : 'bg-gray-100 dark:bg-white/[0.03] border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  <span className="font-bold mr-1.5">{['A', 'B', 'C', 'D'][optIdx]})</span>
                                  {opt}
                                  {q.correctAnswer === optIdx && <FaCheck className="inline ml-1.5 text-[9px]" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionPaper;
