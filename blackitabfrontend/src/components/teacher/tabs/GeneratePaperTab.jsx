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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── LEFT: Extractor Blueprint ── */}
      <div className="lg:col-span-1">
        <div className={`p-8 rounded-[2.5rem] sticky top-8 border space-y-8 ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="border-b pb-6 border-gray-100 dark:border-white/5">
             <h2 className={`text-xl font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Extraction Matrix</h2>
             <p className={`text-xs font-bold font-mono ${isDark ? 'text-[#0061FF]' : 'text-[#0061FF]'}`}>PDF Rendering Engine</p>
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
             <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Document Header</label>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Examinee Assessment Title"
                className={`w-full px-5 py-4 rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-gray-600 focus:border-[#0061FF]/50' : 'bg-white border-transparent text-gray-900 placeholder-gray-400 focus:border-[#0061FF]/30'}`}
             />
          </div>

          <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
             <div>
               <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Target Exam</label>
               <select value={exam} onChange={(e) => setExam(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option value="">All Exams</option>
                  {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
               </select>
             </div>
             <div>
               <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subject Vector</label>
               <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option value="">All Subjects</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
             <label className={`block text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Volatility Rating</label>
             <div className="flex flex-wrap gap-2">
                {['', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      difficulty === d
                        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white shadow-lg shadow-black/10'
                        : isDark ? 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-gray-300' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                    }`}>
                    {d || 'Any'}
                  </button>
                ))}
             </div>
          </div>
          
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
             <div className="flex items-center justify-between mb-4">
                 <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Batch Size</label>
                 <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0061FF]'}`}>{limit} Qs</span>
             </div>
             <input type="range" min="5" max="100" step="5" value={limit} onChange={(e) => setLimit(Number(e.target.value))}
               className="w-full accent-[#0061FF] cursor-pointer" />
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'} flex items-center justify-between cursor-pointer group`} onClick={() => setIncludeAnswers(!includeAnswers)}>
             <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Encode Answer Vault</span>
             <div className={`relative w-12 h-6 rounded-full transition-colors ${
               includeAnswers ? 'bg-[#0061FF]' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
             }`}>
               <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                 includeAnswers ? 'translate-x-6' : 'translate-x-0.5'
               }`} />
             </div>
          </div>

          <div className="space-y-4 pt-4">
            <button onClick={fetchPreview} disabled={loading}
              className={`w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider border transition-colors flex justify-center items-center gap-2 ${
                isDark ? 'bg-transparent border-[#0061FF]/30 text-[#0061FF] hover:bg-[#0061FF]/5' : 'bg-white border-gray-200 hover:bg-gray-50 text-[#0061FF]'
              } disabled:opacity-50`}>
              {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaEye className="text-lg" />} Live Audit
            </button>
            <button onClick={downloadPDF} disabled={downloading || questions.length === 0}
              className="w-full py-4 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105 shadow-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
              {downloading ? <FaSpinner className="animate-spin text-lg" /> : <FaDownload className="text-lg" />} Print Document
            </button>
          </div>
          
          {questions.length > 0 && (
            <div className={`text-center py-4 rounded-2xl border ${isDark ? 'bg-[#0061FF]/5 border-[#0061FF]/10 text-[#a5c3ff]' : 'bg-[#0061FF]/5 border-[#0061FF]/10 text-[#0061FF]'}`}>
                 <p className="text-[10px] font-black uppercase tracking-widest">{totalFound} Eligible Targets Located</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Execution Window ── */}
      <div className="lg:col-span-2">
        <div className={`p-8 sm:p-12 rounded-[2.5rem] min-h-full border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="border-b pb-8 mb-8 border-gray-100 dark:border-white/5 flex items-end justify-between">
            <div>
               <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Document Preview</h2>
               <p className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Verify output before executing print command.</p>
            </div>
            {questions.length > 0 && (
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{questions.length} Items</span>
            )}
          </div>

          {error && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 font-bold text-sm shadow-sm mb-8">
              {error}
            </div>
          )}

          {loading ? (
             <div className="flex flex-col items-center justify-center py-40">
                <FaSpinner className="animate-spin text-5xl mb-6 text-[#0061FF]" />
                <p className={`text-base font-bold tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Auditing Database...</p>
             </div>
          ) : questions.length === 0 ? (
             <div className={`flex flex-col items-center justify-center py-40 border-2 border-dashed rounded-3xl ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
                   <FaFilePdf className={`text-3xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-lg font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Data Validated</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Configure the extraction matrix on the left to render preview.</p>
             </div>
          ) : (
            <div className="space-y-6">
               <AnimatePresence>
                 {questions.map((q, index) => (
                   <div key={q._id || index}
                     className={`p-6 sm:p-8 rounded-3xl border transition-all ${isDark ? 'bg-[#05000a] border-white/5 hover:border-white/20' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}>
                     <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center sm:items-start gap-4 shrink-0 sm:w-32">
                             <span className="w-10 h-10 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center text-sm font-black shadow-lg">
                                 {index + 1}
                             </span>
                             <div className="flex flex-row sm:flex-col gap-2">
                                <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                                  {q.difficulty}
                                </span>
                                {q.exam && (
                                   <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-[#0061FF]/10 text-[#0061FF] border-[#0061FF]/20' : 'bg-white border-gray-200 text-[#0061FF]'}`}>
                                     {q.exam}
                                   </span>
                                )}
                             </div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className={`text-lg font-bold leading-relaxed break-words mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {q.question || q.content || 'Content Offline'}
                           </p>
                           {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 break-words ${
                                       q.correctAnswer === optIdx
                                         ? isDark ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-emerald-500/40 bg-emerald-50 text-emerald-900'
                                         : isDark ? 'border-white/5 bg-transparent text-gray-400' : 'border-gray-200 bg-white text-gray-600'
                                    }`}>
                                       <span className={`text-[10px] font-black shrink-0 ${q.correctAnswer === optIdx ? 'text-emerald-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                                          {String.fromCharCode(65 + optIdx)}
                                       </span>
                                       <span className="font-medium text-sm pt-0.5">{opt}</span>
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
  );
};

export default GeneratePaperTab;
