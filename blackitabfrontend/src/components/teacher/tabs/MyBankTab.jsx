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
  const [deleteModal, setDeleteModal] = useState(null); // { ids: [...] }
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
    setDeleteModal({ ids: [id] });
  };

  // Open delete confirmation — bulk
  const promptBulkDelete = () => {
    if (selected.size === 0) return;
    const ids = [...selected];
    setDeleteModal({ ids });
  };

  // Execute delete
  const executeDelete = async () => {
    if (!deleteModal) return;
    const { ids } = deleteModal;
    try {
      const token = localStorage.getItem('token');
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

  const handlePublish = async (question) => {
    if (question.status === 'Published') {
      CustomToast.error('Question is already published');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/exams/questions/${question._id}/publish`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setQuestions(prev => prev.map(q => q._id === question._id ? { ...q, status: 'Published' } : q));
        CustomToast.success('Question published to Institute successfully');
      }
    } catch (error) {
      console.error(error);
      CustomToast.error(error.response?.data?.message || "Failed to publish question");
    }
  };

  const handleBulkPublish = async () => {
    const drafts = [...selected].map(id => questions.find(q => q._id === id)).filter(q => q?.status === 'Draft');
    if (drafts.length === 0) {
      CustomToast.error('No draft questions selected to publish.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const promises = drafts.map(q => 
        axios.put(`${API_URL}/api/exams/questions/${q._id}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(promises);
      CustomToast.success(`${drafts.length} question(s) published to Institute`);
      setQuestions(prev => prev.map(q => selected.has(q._id) && q.status === 'Draft' ? { ...q, status: 'Published' } : q));
      setSelected(new Set());
    } catch (error) {
      console.error(error);
      CustomToast.error('Failed to publish questions');
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
    <div className="space-y-8">
      {/* Stark Action Bar */}
      <div className={`p-4 rounded-3xl flex flex-wrap gap-4 items-center ${
        isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className="relative flex-1 min-w-[300px]">
          <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Query question text or terminology..." 
            className={`w-full pl-12 pr-6 py-4 rounded-full outline-none text-sm font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${
              isDark ? 'bg-[#05000a] text-white placeholder-gray-600 border border-white/5 focus:border-[#0061FF]/50' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-transparent focus:bg-white focus:border-[#0061FF]/30 hover:bg-gray-100'
            }`} />
        </div>
        <div className="flex flex-wrap gap-3">
            <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
              className={`px-5 py-4 rounded-full text-sm font-bold outline-none cursor-pointer transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}>
              <option value="">All Exams</option>
              {EXAMS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className={`px-5 py-4 rounded-full text-sm font-bold outline-none cursor-pointer transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
              className={`px-5 py-4 rounded-full text-sm font-bold outline-none cursor-pointer transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}>
              <option value="">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <button onClick={toggleSelectAll} className={`px-6 py-4 rounded-full text-sm font-bold transition-colors ${
              isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className={`flex flex-wrap items-center gap-4 p-5 rounded-3xl ${
          isDark ? 'bg-[#0061FF]/10 border border-[#0061FF]/20' : 'bg-blue-50 border border-blue-200'
        }`}>
          <span className={`text-sm font-black tracking-widest uppercase ${isDark ? 'text-[#a5c3ff]' : 'text-[#0061FF]'}`}>
            {selected.size} Selected
          </span>
          <div className="flex-1" />
          <button onClick={promptBulkDelete} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105">
            Purge Selected
          </button>
          <button onClick={handleBulkPublish} className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105">
            Publish Bulk
          </button>
          <button onClick={() => setSelected(new Set())} className={`px-4 py-2.5 rounded-full text-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Question List */}
      {loading ? (
        <div className="text-center py-32 text-gray-500">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-[#0061FF]" />
          <p className="font-medium tracking-wide">Retrieving Registry...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-12">
          {Object.keys(groupedQuestions).map(exam => (
            <div key={exam} className="space-y-6">
              <h2 className={`text-2xl font-black tracking-tight border-b pb-4 ${isDark ? 'text-white border-white/10' : 'text-gray-900 border-gray-100'}`}>
                 <span className="text-[#0061FF] mr-2">/</span> {exam}
              </h2>
              <div className="space-y-8">
                {Object.keys(groupedQuestions[exam]).map(subject => (
                  <div key={subject} className="space-y-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {subject}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {groupedQuestions[exam][subject].map((q, i) => (
                        <div key={q._id || i}
                          className={`group relative rounded-3xl p-6 sm:p-8 transition-all overflow-hidden border ${
                            isDark ? 'bg-[#0a0a0a] border-white/5 hover:border-[#0061FF]/50' : 'bg-white border-gray-200 hover:border-[#0061FF]/30 hover:shadow-xl hover:shadow-[#0061FF]/5'
                          }`}>
                            
                          <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                            {/* Left: Checkbox & Metadata Stream */}
                            <div className="flex items-center xl:flex-col xl:items-start gap-4 xl:w-32 shrink-0">
                                <label className="relative flex items-center justify-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selected.has(q._id)}
                                    onChange={() => toggleSelect(q._id)}
                                    className="peer sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-md border-2 transition-all ${isDark ? 'border-white/20 peer-checked:bg-[#0061FF] peer-checked:border-[#0061FF]' : 'border-gray-300 peer-checked:bg-[#0061FF] peer-checked:border-[#0061FF]'}`}></div>
                                  <FaCheckCircle className="absolute text-white opacity-0 peer-checked:opacity-100 w-3 h-3 transition-opacity" />
                                </label>
                                <div className="flex xl:flex-col gap-2 flex-wrap">
                                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                    {q.subject}
                                  </span>
                                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                    q.difficulty === 'Hard' ? 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20' :
                                    q.difficulty === 'Medium' ? 'text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20' :
                                    'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                                  }`}>
                                    {q.difficulty}
                                  </span>
                                  {q.isAiGenerated && (
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400 flex items-center gap-1">
                                      <FaRobot/> AI
                                    </span>
                                  )}
                                  {q.status === 'Published' && (
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-[#0061FF]/20 bg-[#0061FF]/5 text-[#0061FF] dark:text-[#a5c3ff]">
                                      Published
                                    </span>
                                  )}
                                  {q.status === 'Draft' && (
                                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                                      Draft
                                    </span>
                                  )}
                                  {q.isPYQ && (
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 flex items-center gap-1" title={q.sourceDate ? new Date(q.sourceDate).toLocaleDateString() : ''}>
                                      🌟 {q.sourceExamName || q.exam} {q.sourceYear ? `• ${q.sourceYear}` : ''} {q.sourceShift && !q.sourcePart ? `• Shift ${q.sourceShift}` : ''} {q.sourcePart ? `• ${q.sourcePart}` : ''}
                                    </span>
                                  )}
                                  {q.format === 'Digital' && (
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                                      Digital
                                    </span>
                                  )}
                                  {q.format === 'Paper' && (
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
                                      Paper
                                    </span>
                                  )}
                                </div>
                            </div>

                            {/* Center: The Scholarly Content */}
                            <div className="flex-1 w-full max-w-4xl">
                              <h3 className={`text-xl font-bold mb-6 leading-relaxed break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {q.question}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options?.map((opt, optIdx) => {
                                  const isCorrect = q.correctAnswer === optIdx;
                                  return (
                                    <div key={optIdx} className={`p-4 rounded-2xl border transition-colors break-words flex items-start gap-4 ${
                                      isCorrect
                                        ? isDark ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-emerald-500/40 bg-emerald-50 text-emerald-900'
                                        : isDark ? 'border-white/5 bg-transparent text-gray-400' : 'border-gray-100 bg-gray-50/50 text-gray-600'
                                    }`}>
                                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                         isCorrect 
                                          ? 'bg-emerald-500 text-white' 
                                          : isDark ? 'bg-white/10 text-gray-500' : 'bg-white border border-gray-200 text-gray-400'
                                      }`}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="font-medium mt-0.5">{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {q.explanation && (
                                <div className={`mt-5 p-5 rounded-2xl border flex gap-3 ${
                                  isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'
                                }`}>
                                  <div className={`w-1 bg-gray-300 dark:bg-gray-700 rounded-full shrink-0`} />
                                  <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Explanation</span>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{q.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right: Authoritarian Actions */}
                            <div className="flex flex-row xl:flex-col gap-3 shrink-0 w-full xl:w-auto mt-4 xl:mt-0 pt-4 xl:pt-0 border-t xl:border-t-0 xl:border-l border-gray-100 dark:border-white/5 xl:pl-6 pl-0">
                               <button
                                onClick={() => handlePublish(q)}
                                disabled={q.status === 'Published'}
                                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors border ${
                                  q.status === 'Published'
                                    ? 'bg-transparent text-gray-400 border-gray-200 dark:border-white/10 opacity-50 cursor-not-allowed'
                                    : 'bg-transparent text-[#0061FF] dark:text-[#a5c3ff] border-[#0061FF]/30 hover:bg-[#0061FF]/5'
                                }`}>
                                <FaCheckCircle className="text-sm" /> Publish
                              </button>
                              <button
                                onClick={() => openEditModal(q)}
                                disabled={q.isModerated}
                                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors border ${
                                  q.isModerated
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-gray-600'
                                    : isDark ? 'bg-transparent text-gray-300 border-white/20 hover:bg-white/5' : 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}>
                                <FaEdit className="text-sm" /> Edit
                              </button>
                              <button onClick={() => promptDelete(q._id)} className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-500 dark:bg-red-500/5 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors border border-red-100 dark:border-red-500/20 hover:text-white dark:hover:text-red-300">
                                <FaTrash className="text-sm" /> Purge
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
        <div className={`text-center py-32 rounded-3xl border border-dashed ${isDark ? 'border-white/10 bg-white/[0.01]' : 'border-gray-200 bg-gray-50/50'}`}>
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 mx-auto flex items-center justify-center mb-6">
             <FaFilter className={`text-2xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <p className={`font-black text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Void Registry</p>
          <p className="text-gray-500 font-medium">{questions.length > 0 ? 'No questions match your current filter parameters.' : 'Your query bank is entirely barren.'}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 sm:p-12 ${isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <FaTrash className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Purge</h3>
              <p className="text-base text-gray-500 font-medium">You are about to irreversibly delete {deleteModal.ids.length > 1 ? `${deleteModal.ids.length} questions` : 'a single question'} from the registry.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal(null)} className={`flex-1 px-6 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-colors border ${
                isDark ? 'bg-transparent hover:bg-white/5 text-gray-300 border-white/20' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                Abort
              </button>
              <button onClick={executeDelete} className="flex-1 px-6 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30">
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className={`flex items-center justify-between px-8 py-6 border-b shrink-0 ${isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-100 bg-white'}`}>
              <h3 className={`text-2xl font-black flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-2 h-8 bg-[#0061FF] rounded-full" /> Modify Configuration
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className={`p-8 overflow-y-auto ${isDark ? 'bg-[#05000a]' : 'bg-gray-50'}`}>
              <form id="teacherEditForm" onSubmit={handleEditSubmit} className="space-y-8 max-w-3xl mx-auto">
                <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Primary Inquiry</label>
                  <textarea
                    required rows={4}
                    value={editingQuestion.question}
                    onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    className={`w-full rounded-2xl px-6 py-4 outline-none resize-y text-lg font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#05000a] border border-white/5 text-white focus:border-[#0061FF]/50' : 'bg-gray-50 border border-transparent focus:bg-white text-gray-900 focus:border-[#0061FF]/30'}`}
                  />
                </div>

                <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                   <label className={`block text-xs font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Multiple Choice Options</label>
                  <div className="grid grid-cols-1 gap-4">
                    {editingQuestion.options.map((opt, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center gap-3 w-32 shrink-0 cursor-pointer pt-4 sm:pt-0">
                          <input type="radio" required name="correctEditAnswer" 
                             checked={editingQuestion.correctAnswer === i} 
                             onChange={() => setEditingQuestion({...editingQuestion, correctAnswer: i})}
                             className="w-5 h-5 accent-emerald-500" />
                          <span className={`text-sm font-bold ${editingQuestion.correctAnswer === i ? 'text-emerald-500' : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                            Select {String.fromCharCode(65 + i)}
                          </span>
                        </label>
                        <input
                          type="text" required
                          value={opt}
                          onChange={e => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className={`w-full flex-1 rounded-xl px-6 py-4 outline-none font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${
                            editingQuestion.correctAnswer === i 
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' 
                              : isDark ? 'border-white/5 bg-[#05000a] text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-6 ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subject</label>
                    <input
                      type="text" required
                      value={editingQuestion.subject}
                      onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                      className={`w-full rounded-2xl px-6 py-4 outline-none font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#05000a] border border-white/5 text-white' : 'bg-gray-50 border border-transparent text-gray-900 focus:bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Difficulty</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                      className={`w-full rounded-2xl px-6 py-4 outline-none cursor-pointer font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#05000a] border border-white/5 text-white' : 'bg-gray-50 border border-transparent text-gray-900 focus:bg-white'}`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Explanation Directive (Optional)</label>
                  <textarea
                    rows={3}
                    value={editingQuestion.explanation || ''}
                    onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                    placeholder="Provide didactic reasoning..."
                    className={`w-full rounded-2xl px-6 py-4 outline-none resize-y font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#05000a] border border-white/5 text-white' : 'bg-gray-50 border border-transparent text-gray-900 focus:bg-white'}`}
                  />
                </div>
              </form>
            </div>

            <div className={`p-6 px-8 border-t shrink-0 flex gap-4 ${isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-100 bg-white'} `}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className={`px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-colors border ${
                isDark ? 'bg-transparent hover:bg-white/5 text-gray-300 border-white/20' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}>Cancel Directive</button>
              <button type="submit" form="teacherEditForm" className="flex-1 px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm uppercase tracking-wider transition-colors shadow-lg">
                Override Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBankTab;
