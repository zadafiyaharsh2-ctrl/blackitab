import React, { useState, useEffect } from 'react';

import { FaSearch, FaFilter, FaCheckCircle, FaSpinner, FaTimes, FaEdit, FaTrash, FaRobot } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../config';
import { CustomToast } from '../../../utils/CustomToast';
import { EXAMS } from '../../../constants/exams';

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
    <div>
      {/* Filters */}
      <div className={`p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
            }`} />
        </div>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Exams</option>
          {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Difficulty</option>
          <option value="Easy" className={isDark ? 'bg-gray-900' : 'bg-white'}>Easy</option>
          <option value="Medium" className={isDark ? 'bg-gray-900' : 'bg-white'}>Medium</option>
          <option value="Hard" className={isDark ? 'bg-gray-900' : 'bg-white'}>Hard</option>
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Subjects</option>
          {subjects.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
        </select>
        <button onClick={toggleSelectAll} className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
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
          <button onClick={promptBulkDelete} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <FaTrash className="w-3 h-3" /> Delete Selected
          </button>
          <button onClick={handleBulkSendToProblems} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <FaCheckCircle className="w-3 h-3" /> Send to Problems
          </button>
          <button onClick={() => setSelected(new Set())} className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
              <div className="space-y-6">
                {Object.keys(groupedQuestions[exam]).map(subject => (
                  <div key={subject} className="space-y-3">
                    <h3 className={`text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {subject}
                    </h3>
                    <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-gray-100 dark:border-white/5">
                      {groupedQuestions[exam][subject].map((q, i) => (
                        <div key={q._id || i}
                          className={`rounded-2xl p-4 sm:p-5 transition-all overflow-hidden ${
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
                              <h3 className={`font-medium text-lg mb-3 break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</h3>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                {q.options?.map((opt, optIdx) => {
                                  const isCorrect = q.correctAnswer === optIdx;
                                  return (
                                    <div key={optIdx} className={`p-2.5 rounded-xl border transition-colors break-words ${
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
                                <p className={`text-xs italic mt-3 p-3 rounded-lg border break-words ${
                                  isDark ? 'text-gray-400 bg-white/5 border-white/5' : 'text-gray-500 bg-gray-50 border-gray-100'
                                }`}>
                                  <span className={`font-semibold not-italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Explanation:</span> {q.explanation}
                                </p>
                              )}
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
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
    </div>
  );
};

export default MyBankTab;
