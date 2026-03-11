import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaList, FaPlus, FaRobot, FaEdit, FaTrash, FaSearch, FaFilter, FaCheckCircle, FaBolt, FaSpinner, FaArrowLeft, FaTimes, FaTimesCircle, FaLightbulb, FaEye, FaFilePdf, FaDownload, FaListUl, FaCheck } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
import { useTheme } from '../context/useTheme';

const EXAMS = [
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'gate', label: 'GATE' },
  { id: 'cat', label: 'CAT' },
];

const SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science',
  'English', 'General Knowledge', 'Reasoning', 'Data Interpretation'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const QuestionManagement = () => {
  usePageTitle('Question Bank');
  const { isDark } = useTheme();

  // Tabs: 'my-bank', 'create', 'ai'
  const [activeTab, setActiveTab] = useState('my-bank');

  return (
    <div className={`min-h-screen relative p-4 md:p-8 lg:p-10 font-sans transition-colors ${
      isDark ? 'text-gray-100 bg-gray-900' : 'text-gray-900 bg-gray-50'
    } overflow-x-hidden pt-20`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Question Management
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your question bank, create new ones, or use AI generation.
            </p>
          </div>

          <div className={`flex p-1 rounded-xl glass-panel ${isDark ? 'border-white/10' : 'border-gray-200 shadow-sm'}`}>
            <button onClick={() => setActiveTab('my-bank')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'my-bank'
                  ? 'bg-blue-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaList /> My Bank
            </button>
            <button onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaPlus /> Create Manually
            </button>
            <button onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaRobot /> AI Generator
            </button>
            <button onClick={() => setActiveTab('paper')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'paper'
                  ? 'bg-rose-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaFilePdf /> Generate Paper
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-bank' && <MyBankTab key="my-bank" isDark={isDark} />}
          {activeTab === 'create' && <CreateTab key="create" isDark={isDark} setActiveTab={setActiveTab} />}
          {activeTab === 'ai' && <AIGeneratorTab key="ai" isDark={isDark} />}
          {activeTab === 'paper' && <GeneratePaperTab key="paper" isDark={isDark} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =========================================================================
// TAB 1: MY BANK
// =========================================================================
const MyBankTab = ({ isDark }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [deleteModal, setDeleteModal] = useState(null); // { ids: [...], hasProblems: bool }
  const [deleteFromProblems, setDeleteFromProblems] = useState(true);
  const [selected, setSelected] = useState(new Set());

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/exams/questions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setQuestions(res.data.data);
    } catch (error) {
      console.error('Fetch questions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation — single question
  const promptDelete = (id) => {
    const q = questions.find(q => q._id === id);
    setDeleteFromProblems(true);
    setDeleteModal({ ids: [id], hasProblems: q?.isProblem || false });
  };

  // Open delete confirmation — bulk
  const promptBulkDelete = () => {
    if (selected.size === 0) return;
    const ids = [...selected];
    const hasProblems = ids.some(id => questions.find(q => q._id === id)?.isProblem);
    setDeleteFromProblems(true);
    setDeleteModal({ ids, hasProblems });
  };

  // Execute delete
  const executeDelete = async () => {
    if (!deleteModal) return;
    const { ids } = deleteModal;
    try {
      const token = localStorage.getItem('token');
      // If user chose to also remove from Problems, set isProblem: false first
      if (deleteFromProblems) {
        const problemIds = ids.filter(id => questions.find(q => q._id === id)?.isProblem);
        if (problemIds.length > 0) {
          await Promise.all(problemIds.map(id => 
            axios.put(`${API_URL}/api/questions/${id}`, { isProblem: false }, { headers: { Authorization: `Bearer ${token}` } })
          ));
        }
      }
      // Delete all
      await Promise.all(ids.map(id => axios.delete(`${API_URL}/api/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      CustomToast.success(`${ids.length} question(s) deleted`);
      setQuestions(prev => prev.filter(q => !ids.includes(q._id)));
      setSelected(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      console.error(error);
      CustomToast.error('Failed to delete question(s)');
    } finally {
      setDeleteModal(null);
    }
  };

  const handleToggleProblem = async (question) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !question.isProblem;
      const res = await axios.put(`${API_URL}/api/questions/${question._id}`, 
        { isProblem: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setQuestions(prev => prev.map(q => q._id === question._id ? { ...q, isProblem: newStatus } : q));
        CustomToast.success(newStatus ? 'Added to Problems' : 'Removed from Problems');
      }
    } catch (error) {
      console.error(error);
      CustomToast.error("Failed to update problem status");
    }
  };

  const handleBulkSendToProblems = async () => {
    if (selected.size === 0) return;
    try {
      const token = localStorage.getItem('token');
      const promises = [...selected].map(id => 
        axios.put(`${API_URL}/api/questions/${id}`, { isProblem: true }, { headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(promises);
      CustomToast.success(`${selected.size} question(s) sent to Problems`);
      setQuestions(prev => prev.map(q => selected.has(q._id) ? { ...q, isProblem: true } : q));
      setSelected(new Set());
    } catch (error) {
      console.error(error);
      CustomToast.error('Failed to send questions to Problems');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(q => q._id)));
    }
  };

  const openEditModal = (q) => {
    setEditingQuestion({
      ...q,
      options: q.options || ['', '', '', '']
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion.options.some(opt => !opt.trim())) {
        return CustomToast.error('All 4 options must be filled');
      }
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/questions/${editingQuestion._id}`, {
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        subject: editingQuestion.subject,
        difficulty: editingQuestion.difficulty
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        CustomToast.success('Question updated successfully');
        setIsEditModalOpen(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
      CustomToast.error(error.response?.data?.message || 'Failed to update question');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const filtered = questions.filter(q => {
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
    if (filterSubject && q.subject !== filterSubject) return false;
    if (filterExam && q.exam !== filterExam) return false;
    return true;
  });

  const subjects = [...new Set(questions.map(q => q.subject))];

  // Grouping logic
  const groupedQuestions = filtered.reduce((acc, q) => {
    const examStr = q.exam ? q.exam.toUpperCase() : 'OTHER';
    const subjectStr = q.subject || 'Uncategorized';
    
    if (!acc[examStr]) acc[examStr] = {};
    if (!acc[examStr][subjectStr]) acc[examStr][subjectStr] = [];
    
    acc[examStr][subjectStr].push(q);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Filters */}
      <div className={`p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
            }`} />
        </div>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Exams</option>
          {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Difficulty</option>
          <option value="Easy" className={isDark ? 'bg-gray-900' : 'bg-white'}>Easy</option>
          <option value="Medium" className={isDark ? 'bg-gray-900' : 'bg-white'}>Medium</option>
          <option value="Hard" className={isDark ? 'bg-gray-900' : 'bg-white'}>Hard</option>
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Subjects</option>
          {subjects.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
        </select>
        <button onClick={toggleSelectAll} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
          isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
        }`}>
          {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className={`sticky top-0 z-30 flex flex-wrap items-center gap-3 p-4 rounded-2xl mb-6 shadow-lg ${
          isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
        }`}>
          <span className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={promptBulkDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <FaTrash className="w-3 h-3" /> Delete Selected
          </button>
          <button onClick={handleBulkSendToProblems} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <FaCheckCircle className="w-3 h-3" /> Send to Problems
          </button>
          <button onClick={() => setSelected(new Set())} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}>
            <FaTimes className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {/* Question List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <FaSpinner className="animate-spin text-3xl mx-auto mb-3" />
          <p>Loading questions...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(groupedQuestions).map(exam => (
            <div key={exam} className="space-y-6">
              <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" /> {exam}
              </h2>
              <div className="space-y-6 pl-2">
                {Object.keys(groupedQuestions[exam]).map(subject => (
                  <div key={subject} className="space-y-3">
                    <h3 className={`text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {subject}
                    </h3>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-white/5">
                      {groupedQuestions[exam][subject].map((q, i) => (
                        <div key={q._id || i}
                          className={`rounded-2xl p-5 transition-all ${
                            isDark ? 'glass-panel border border-white/10 hover:border-blue-500/50' : 'bg-white border border-gray-200 hover:border-blue-300 shadow-sm'
                          }`}>
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            {/* Left: Question Content */}
                            <div className="flex-1">
                              {/* Badges Row */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <input 
                                  type="checkbox" 
                                  checked={selected.has(q._id)}
                                  onChange={() => toggleSelect(q._id)}
                                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Q{i + 1}</span>

                                <span className={`px-2 py-0.5 rounded text-xs border ${isDark ? 'bg-white/5 text-gray-300 border-white/5' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                  {q.subject}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                  q.difficulty === 'Hard' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10' :
                                  q.difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/10' :
                                  'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
                                }`}>
                                  {q.difficulty}
                                </span>
                                {q.isAiGenerated && (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    <FaRobot className="text-[10px]" /> AI
                                  </span>
                                )}
                                {q.designatedFor?.includes('digital') && (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                    Digital
                                  </span>
                                )}
                                {q.designatedFor?.includes('paper') && (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                    Paper
                                  </span>
                                )}
                                {q.isProblem && (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    In Problems
                                  </span>
                                )}
                              </div>

                              {/* Question Text */}
                              <h3 className={`font-medium text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</h3>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                {q.options?.map((opt, optIdx) => {
                                  const isCorrect = q.correctAnswer === optIdx;
                                  return (
                                    <div key={optIdx} className={`p-2.5 rounded-xl border transition-colors ${
                                      isCorrect
                                        ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                        : isDark ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
                                    }`}>
                                      <span className="font-mono text-xs opacity-50 mr-2 font-semibold">{String.fromCharCode(65 + optIdx)}.</span>
                                      {opt}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {q.explanation && (
                                <p className={`text-xs italic mt-3 p-3 rounded-lg border ${
                                  isDark ? 'text-gray-400 bg-white/5 border-white/5' : 'text-gray-500 bg-gray-50 border-gray-100'
                                }`}>
                                  <span className={`font-semibold not-italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Explanation:</span> {q.explanation}
                                </p>
                              )}
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                              <button
                                onClick={() => handleToggleProblem(q)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                  q.isProblem
                                    ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                    : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                }`}>
                                {q.isProblem ? <><FaTimes className="w-3 h-3" /> Remove</> : <><FaCheckCircle className="w-3 h-3" /> Approve</>}
                              </button>
                              <button onClick={() => openEditModal(q)} className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                isDark ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                              }`}>
                                <FaEdit className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => promptDelete(q._id)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-200 dark:border-red-500/20">
                                <FaTrash className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-20 rounded-2xl ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 border-dashed'}`}>
          <FaFilter className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{questions.length > 0 ? 'No questions match your filters' : 'No questions yet in your bank'}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <FaTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete {deleteModal.ids.length > 1 ? `${deleteModal.ids.length} Questions` : 'Question'}?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            {deleteModal.hasProblems && (
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer ${
                isDark ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
              }`}>
                <input 
                  type="checkbox" 
                  checked={deleteFromProblems}
                  onChange={e => setDeleteFromProblems(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Also remove from Problems page</span>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Some selected questions are currently listed on the Problems page for students.</p>
                </div>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModal(null)} className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors border ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}>
                Cancel
              </button>
              <button onClick={executeDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className={`flex items-center justify-between p-6 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><FaEdit className="text-blue-500" /> Edit Question</h3>
              <button onClick={() => setIsEditModalOpen(false)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="teacherEditForm" onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Question Text</label>
                  <textarea
                    required rows={3}
                    value={editingQuestion.question}
                    onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    className={`w-full rounded-xl px-4 py-2.5 outline-none resize-y focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i}>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Option {String.fromCharCode(65 + i)}</label>
                      <input
                        type="text" required
                        value={opt}
                        onChange={e => handleOptionChange(i, e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          editingQuestion.correctAnswer === i 
                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' 
                            : isDark ? 'border-white/10' : 'border-gray-200'
                        } ${isDark ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-900'} border`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Correct Answer</label>
                    <select
                      required
                      value={editingQuestion.correctAnswer}
                      onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: parseInt(e.target.value)})}
                      className={`w-full rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    >
                      <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>Select correct option</option>
                      {editingQuestion.options.map((opt, i) => (
                        opt.trim() && <option key={i} value={i} className={isDark ? 'bg-gray-900' : 'bg-white'}>Option {String.fromCharCode(65 + i)}: {opt.substring(0, 40)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
                    <input
                      type="text" required
                      value={editingQuestion.subject}
                      onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                      className={`w-full rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Difficulty</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                      className={`w-full rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    >
                      <option value="Easy" className={isDark ? 'bg-gray-900' : 'bg-white'}>Easy</option>
                      <option value="Medium" className={isDark ? 'bg-gray-900' : 'bg-white'}>Medium</option>
                      <option value="Hard" className={isDark ? 'bg-gray-900' : 'bg-white'}>Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Explanation (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation || ''}
                    onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                    className={`w-full rounded-xl px-4 py-2.5 outline-none resize-y focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                  />
                </div>
              </form>
            </div>

            <div className={`p-6 border-t shrink-0 flex gap-3 rounded-b-2xl ${isDark ? 'border-white/10 bg-gray-900/80' : 'border-gray-200 bg-gray-50/80'} backdrop-blur-md`}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-medium transition-colors border ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'
              }`}>Cancel</button>
              <button type="submit" form="teacherEditForm" className="flex-1 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// =========================================================================
// TAB 2: CREATE MANUALLY
// =========================================================================
const CreateTab = ({ isDark, setActiveTab }) => {
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exam: 'jee',
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'Medium',
    explanation: '',
    tags: '',
    isPublic: true,
    designatedFor: ['digital']
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const validate = () => {
    if (!form.subject) { CustomToast.error('Please select a subject'); return false; }
    if (!form.question.trim()) { CustomToast.error('Question text is required'); return false; }
    if (form.options.some(o => !o.trim())) { CustomToast.error('All 4 options are required'); return false; }
    if (form.correctAnswer === '') { CustomToast.error('Please mark the correct answer by clicking its letter index'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        correctAnswer: parseInt(form.correctAnswer),
      };
      if (payload.designatedFor.length === 0) {
        payload.designatedFor = ['digital']; // fallback
      }
      const res = await axios.post(`${API_URL}/api/exams/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        CustomToast.success('Question created successfully!');
        setActiveTab('my-bank'); // Switch back to bank
      }
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {!preview ? (
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          {/* Exam & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Exam Type</label>
              <select value={form.exam} onChange={e => handleChange('exam', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Subject *</label>
              <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>Select subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Text *</label>
            <textarea value={form.question} onChange={e => handleChange('question', e.target.value)}
              rows={4} placeholder="Type your question here..."
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Options *</label>
            <div className="space-y-3">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button type="button" onClick={() => handleChange('correctAnswer', i)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      parseInt(form.correctAnswer) === i
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                        : isDark ? 'border-white/20 text-gray-500 hover:border-white/40' : 'border-gray-300 text-gray-400 hover:border-gray-400'
                    }`}>
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className={`flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Click the letter to mark the correct answer</p>
          </div>

          {/* Difficulty & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => handleChange('difficulty', d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                      form.difficulty === d
                        ? d === 'Easy' ? 'border-green-500 bg-green-500/10 text-green-500'
                          : d === 'Hard' ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => handleChange('tags', e.target.value)}
                placeholder="e.g. mechanics, kinematics"
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Explanation (optional)</label>
            <textarea value={form.explanation} onChange={e => handleChange('explanation', e.target.value)}
              rows={3} placeholder="Explain why the correct answer is correct..."
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
          </div>

          {/* Question Type & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={form.designatedFor.includes('digital')}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...form.designatedFor, 'digital'] 
                        : form.designatedFor.filter(t => t !== 'digital');
                      handleChange('designatedFor', newTypes);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={form.designatedFor.includes('paper')}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...form.designatedFor, 'paper'] 
                        : form.designatedFor.filter(t => t !== 'paper');
                      handleChange('designatedFor', newTypes);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paper</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleChange('isPublic', !form.isPublic)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.isPublic ? 'bg-emerald-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${form.isPublic ? 'left-6' : 'left-0.5'}`} />
              </button>
              <span className="text-sm font-medium text-gray-500">{form.isPublic ? 'Public (visible to all students)' : 'Institute only'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setPreview(true)}
              className={`flex-1 py-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${
                isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}>
              <FaEye /> Preview
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all hover:scale-[1.02]">
              <FaPlus /> {loading ? 'Creating...' : 'Create Question'}
            </button>
          </div>
        </div>
      ) : (
        /* PREVIEW MODE */
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview</h2>
            <button onClick={() => setPreview(false)} className="text-sm font-bold text-blue-500 hover:text-blue-400"><FaArrowLeft className="inline mr-1" /> Back to edit</button>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-4 text-xs">
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold uppercase">{form.exam}</span>
              <span className="text-gray-500 font-medium">{form.subject}</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${
                form.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                form.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                'bg-yellow-500/10 text-yellow-600'
              }`}>{form.difficulty}</span>
            </div>

            <p className={`text-lg font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{form.question || 'No question text'}</p>

            <div className="space-y-3">
              {form.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  parseInt(form.correctAnswer) === i
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-white'
                }`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    parseInt(form.correctAnswer) === i ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                  {parseInt(form.correctAnswer) === i && <span className="ml-auto text-emerald-500 text-xs font-bold">✓ Correct</span>}
                </div>
              ))}
            </div>

            {form.explanation && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Explanation</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{form.explanation}</p>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all hover:scale-[1.02]">
            <FaCheckCircle /> {loading ? 'Creating...' : 'Confirm & Create'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// =========================================================================
// TAB 3: AI GENERATOR
// =========================================================================
const AIGeneratorTab = ({ isDark }) => {
  const [exam, setExam] = useState('jee');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [designatedFor, setDesignatedFor] = useState(['digital']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || isGenerating) {
        if (!subject.trim() && !topic.trim()) {
            CustomToast.error('Please select a subject or define a topic');
        }
        return;
    }

    const aiTopic = topic.trim() ? `${subject ? subject + ': ' : ''}${topic.trim()}` : subject;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ai-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          topic: aiTopic, 
          difficulty, 
          count, 
          exam,
          designatedFor: designatedFor.length > 0 ? designatedFor : ['digital']
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      setGeneratedData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Input Form */}
      {!generatedData && !isGenerating && (
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Exam & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Target Exam</label>
                <select value={exam} onChange={e => setExam(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Subject *</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Specific Topic (Optional)</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Thermodynamics, Operating Systems..."
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
            </div>

            {/* Difficulty & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {DIFFICULTIES.map(d => <option key={d} value={d} className={isDark ? 'bg-gray-900' : 'bg-white'}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Count</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {[5, 10, 15, 20].map(n => <option key={n} value={n} className={isDark ? 'bg-gray-900' : 'bg-white'}>{n} Questions</option>)}
                </select>
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={designatedFor.includes('digital')}
                    onChange={(e) => {
                      setDesignatedFor(e.target.checked 
                        ? [...designatedFor, 'digital'] 
                        : designatedFor.filter(t => t !== 'digital'));
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={designatedFor.includes('paper')}
                    onChange={(e) => {
                      setDesignatedFor(e.target.checked 
                        ? [...designatedFor, 'paper'] 
                        : designatedFor.filter(t => t !== 'paper'));
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paper</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><FaTimesCircle /> {error}</div>
                <button type="button" onClick={() => setError(null)}><FaTimes /></button>
              </div>
            )}

            <button type="submit" disabled={!subject.trim() && !topic.trim()}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all hover:scale-[1.01]">
              <FaBolt /> Generate Using AI
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className={`p-12 text-center rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 border'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-6 shadow-lg shadow-purple-500/30">
            <FaRobot className="text-4xl text-white animate-pulse" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Generating Questions...</h3>
          <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Crafting {count} {difficulty.toLowerCase()} questions for {subject || 'Any subject'}{topic ? ` on "${topic}"` : ''} for {exam.toUpperCase()}
          </p>
          <FaSpinner className="animate-spin text-3xl mx-auto text-purple-500" />
        </div>
      )}

      {/* Results Display */}
      {generatedData && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border flex items-center justify-between ${
            isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-2xl text-green-500" />
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  {generatedData.questionCount} Questions Successfully Generated!
                </h2>
                <p className={`text-sm ${isDark ? 'text-green-500/70' : 'text-green-600'}`}>
                  Saved to your question bank • {generatedData.exam.toUpperCase()} • {generatedData.subject} • {generatedData.difficulty}
                </p>
              </div>
            </div>
            <button onClick={() => setGeneratedData(null)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}>
              Generate More
            </button>
          </div>

          <div className="space-y-4">
            {generatedData.questions.map((q, idx) => (
              <div key={idx} className={`p-6 rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>{idx + 1}</span>
                  <p className={`font-medium text-lg leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</p>
                </div>

                <div className="space-y-2 ml-11">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAnswer === oIdx;
                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${
                        isCorrect 
                          ? 'border-green-500/50 bg-green-500/10'
                          : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-gray-50'
                      }`}>
                         <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect ? 'bg-green-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-white border text-gray-500')
                          }`}>
                            {isCorrect ? <FaCheckCircle /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className={`text-sm ${isCorrect ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 ml-11 p-4 rounded-xl flex items-start gap-2 bg-blue-500/5 border border-blue-500/20">
                  <FaLightbulb className="flex-shrink-0 mt-0.5 text-blue-500" />
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-200/80' : 'text-blue-800'}`}>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Filter Panel ── */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-2xl sticky top-6 ${isDark ? 'glass-panel border-white/10' : 'bg-white border-y border-x border-gray-200 shadow-sm'}`}>
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
              <div className="flex gap-2">
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
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={fetchPreview} disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition disabled:opacity-50 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200'
                }`}>
                {loading ? <FaSpinner className="animate-spin" /> : <FaEye />} Preview Questions
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadPDF} disabled={downloading || questions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </motion.button>
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
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-y border-x border-gray-200 shadow-sm'}`}>
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                <p className="text-sm">No paper-designated questions found. Try adjusting your filters.</p>
              </div>
            )}

            {/* Question List */}
            {!loading && questions.length > 0 && (
              <div className="space-y-4">
                <AnimatePresence>
                  {questions.map((q, index) => (
                    <motion.div key={q._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-xl border transition group ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/20' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {q.question || q.content || 'Question text unavailable'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColors[q.difficulty] || diffColors.Medium}`}>
                              {q.difficulty}
                            </span>
                            {q.exam && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                {q.exam.toUpperCase()}
                              </span>
                            )}
                            {q.subject && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                {q.subject}
                              </span>
                            )}
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`px-3 py-1.5 rounded-lg text-xs border transition ${
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

export default QuestionManagement;
