import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaFilter, FaEye, FaDownload, FaSpinner, FaListUl, FaFilePdf, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../config';

const GeneratePaperTab = ({ isDark }) => {
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

  useEffect(() => { fetchPreview(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'Question_Paper'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
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
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ── LEFT: Filter Panel ── */}
        <div className="lg:col-span-1">
          <div className={`p-4 sm:p-6 rounded-2xl sticky top-4 sm:top-6 overflow-hidden ${isDark ? 'glass-panel border-white/10' : 'bg-white border-y border-x border-gray-200 shadow-sm'}`}>
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaFilter className="text-blue-500" /> Filters
            </h2>

            {/* Paper Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Paper Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GATE Mock Test"
                className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
              />
            </div>

            {/* Exam Select */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Exam</label>
              <select value={exam} onChange={(e) => setExam(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Exams</option>
                {availableExams.map(e => <option key={e} value={e} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Subject Select */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Subjects</option>
                {availableSubjects.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {['', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === d
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : isDark ? 'bg-white/5 text-gray-400 border-white/10 hover:border-blue-500/50' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {d || 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Number of Questions: <span className="text-blue-500">{limit}</span>
              </label>
              <input type="range" min="5" max="100" step="5" value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>5</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>

            {/* Include Answers Toggle */}
            <div className="mb-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className={`text-sm font-semibold transition ${isDark ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-500'}`}>Include Answer Key</span>
                <div onClick={() => setIncludeAnswers(!includeAnswers)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    includeAnswers ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                  }`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    includeAnswers ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button onClick={fetchPreview} disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition disabled:opacity-50 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200'
                }`}>
                {loading ? <FaSpinner className="animate-spin" /> : <FaEye />} Preview Questions
              </button>

              <button onClick={downloadPDF} disabled={downloading || questions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>

            {/* Stats */}
            {questions.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Found {totalFound} paper-designated questions matching your filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="lg:col-span-2">
          <div className={`p-4 sm:p-6 rounded-2xl overflow-hidden ${isDark ? 'glass-panel border-white/10' : 'bg-white border-y border-x border-gray-200 shadow-sm'}`}>
            <h2 className={`text-lg font-bold flex flex-wrap items-center gap-2 mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaListUl className="text-purple-500" /> Question Preview
              {questions.length > 0 && (
                <span className="w-full sm:w-auto sm:ml-auto text-sm font-normal text-gray-500">{questions.length} questions</span>
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
                <p className="text-sm">No paper-designated questions found. Try adjusting your filters.</p>
              </div>
            )}

            {/* Question List */}
            {!loading && questions.length > 0 && (
              <div className="space-y-4">
                <AnimatePresence>
                  {questions.map((q, index) => (
                    <div key={q._id || index}
                      className={`p-4 rounded-xl border transition group overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/20' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-relaxed break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {q.question || q.content || 'Question text unavailable'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColors[q.difficulty] || diffColors.Medium}`}>
                              {q.difficulty}
                            </span>
                            {q.exam && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold break-words ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                {q.exam.toUpperCase()}
                              </span>
                            )}
                            {q.subject && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold break-words bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                {q.subject}
                              </span>
                            )}
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`px-3 py-1.5 rounded-lg text-xs border transition break-words ${
                                  q.correctAnswer === optIdx
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : isDark ? 'bg-white/[0.03] border-white/5 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-700'
                                }`}>
                                  <span className="font-bold mr-1.5">{['A', 'B', 'C', 'D'][optIdx]})</span>
                                  {opt}
                                  {q.correctAnswer === optIdx && <FaCheck className="inline ml-1.5 text-[9px]" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePaperTab;
