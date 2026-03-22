import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  CheckBadgeIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';

const QuestionChecker = () => {
  const userDataStr = localStorage.getItem('user');
  // eslint-disable-next-line no-unused-vars
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [expandedTeachers, setExpandedTeachers] = useState(new Set());

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState(null); // { ids: [...], hasProblems: bool }
  const [deleteFromProblems, setDeleteFromProblems] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institute/questions');
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch {
      CustomToast.error('Failed to load institute questions');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for approval/rejection have been removed as HODs now act only as moderators.

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
      // If user chose to also remove from Problems, set isProblem: false first
      if (deleteFromProblems) {
        const problemIds = ids.filter(id => questions.find(q => q._id === id)?.isProblem);
        if (problemIds.length > 0) {
          await Promise.all(problemIds.map(id => 
            api.put(`/institute/questions/${id}`, { isProblem: false })
          ));
        }
      }
      // Delete all
      await Promise.all(ids.map(id => api.delete(`/institute/questions/${id}`)));
      CustomToast.success(`${ids.length} question(s) deleted`);
      setQuestions(prev => prev.filter(q => !ids.includes(q._id)));
      setSelected(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    } catch {
      CustomToast.error('Failed to delete question(s)');
    } finally {
      setDeleteModal(null);
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
    if (selected.size === questions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(questions.map(q => q._id)));
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

      const res = await api.put(`/institute/questions/${editingQuestion._id}`, {
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        subject: editingQuestion.subject,
        difficulty: editingQuestion.difficulty
      });

      if (res.data.success) {
        CustomToast.success('Question updated successfully');
        setIsEditModalOpen(false);
        fetchQuestions();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to update question');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  // Group questions by teacher name
  const grouped = questions.reduce((acc, q) => {
    const teacherName = q.createdBy?.name || 'Unknown';
    const teacherRole = q.createdBy?.role || '';
    const key = `${teacherName} (${teacherRole})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  if (loading) return <PageShimmer variant="table" />;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <CheckBadgeIcon className="w-6 h-6 text-orange-500" />
            Question Checker
          </h1>
          <p className="text-gray-500 text-sm">Review, edit, and moderate questions submitted by institute teachers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSelectAll} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            {selected.size === questions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 shadow-lg shadow-blue-500/5">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{selected.size} selected</span>
          <div className="flex-1" />

          <button onClick={promptBulkDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <TrashIcon className="w-4 h-4" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
            <XMarkIcon className="w-4 h-4" /> Clear
          </button>
        </div>
      )}

      {/* Grouped Questions */}
      {questions.length === 0 ? (
        <div className="p-8 text-center glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
          <CheckBadgeIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No questions found in this institute.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped).map(teacherKey => (
            <div key={teacherKey} className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <button 
                onClick={() => setExpandedTeachers(prev => {
                  const next = new Set(prev);
                  if (next.has(teacherKey)) next.delete(teacherKey);
                  else next.add(teacherKey);
                  return next;
                })}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {teacherKey}
                  </h2>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {grouped[teacherKey].length} question{grouped[teacherKey].length > 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedTeachers.has(teacherKey) ? 'rotate-180' : ''}`} />
              </button>
              {expandedTeachers.has(teacherKey) && (
              <div className="space-y-4 p-4 md:p-5 pt-0 md:pt-0">
                {grouped[teacherKey].map((q, idx) => {
                  const isSelected = selected.has(q._id);
                  return (
                    <div key={q._id} className={`glass-panel rounded-2xl p-5 transition-all shadow-sm ${isSelected ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-500/5' : 'border-gray-200 dark:border-white/10 hover:border-orange-500/50'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        
                        <div className="flex-1">
                          {/* Checkbox + Badges */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelect(q._id)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-blue-500 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-mono text-gray-500">Q{idx + 1}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              q.approvalStatus === 'Approved' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                                : (q.approvalStatus === 'rejected' || q.approvalStatus === 'Rejected')
                                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' 
                                  : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                            }`}>
                              {q.approvalStatus === 'Approved' ? 'approved' : (q.approvalStatus === 'rejected' || q.approvalStatus === 'Rejected') ? 'rejected' : 'pending'}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs border border-gray-200 dark:border-white/5">
                              {q.subject}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border border-transparent ${
                                q.difficulty === 'Hard' || q.difficulty === 'hard' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10' : 
                                q.difficulty === 'Medium' || q.difficulty === 'medium' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/10' : 
                                'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
                            }`}>
                              {q.difficulty}
                            </span>
                            {q.isPYQ && (
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title={q.sourceDate ? new Date(q.sourceDate).toLocaleDateString() : ''}>
                                🌟 {q.sourceExamName || q.exam} {q.sourceYear ? `• ${q.sourceYear}` : ''} {q.sourceShift && !q.sourcePart ? `• Shift ${q.sourceShift}` : ''} {q.sourcePart ? `• ${q.sourcePart}` : ''}
                              </span>
                            )}
                            {q.isAiGenerated && (
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                AI
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-2">{q.question}</h3>

                          {/* Options Grid — correct answer highlighted by index */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {q.options?.map((opt, i) => {
                              const isCorrect = q.correctAnswer === i;
                              return (
                                <div key={i} className={`p-2.5 rounded-xl border transition-colors ${
                                  isCorrect 
                                    ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                                    : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'
                                }`}>
                                  <span className="font-mono text-xs opacity-50 mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                                  {opt}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                              <span className="font-semibold not-italic text-gray-700 dark:text-gray-300">Explanation:</span> {q.explanation}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                            <button onClick={() => openEditModal(q)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition-colors border border-blue-200 dark:border-blue-500/20">
                                <PencilIcon className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => promptDelete(q._id)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-200 dark:border-red-500/20">
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          ))}
        </div>
      )}

       {/* Delete Confirmation Modal */}
       {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete {deleteModal.ids.length > 1 ? `${deleteModal.ids.length} Questions` : 'Question'}?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            {deleteModal.hasProblems && (
              <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={deleteFromProblems}
                  onChange={e => setDeleteFromProblems(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Also remove from Problems page</span>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Some selected questions are currently listed on the Problems page for students.</p>
                </div>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium transition-colors border border-gray-200 dark:border-white/10">
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white items-center flex gap-2"><PencilIcon className="w-5 h-5 text-orange-500"/> Edit Question</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="editQuestionForm" onSubmit={handleEditSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
                  <textarea
                    required rows={3}
                    value={editingQuestion.question}
                    onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Option {String.fromCharCode(65 + i)}</label>
                      <input
                        type="text" required
                        value={opt}
                        onChange={e => handleOptionChange(i, e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-white/5 border ${editingQuestion.correctAnswer === i ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-200 dark:border-white/10'} rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer</label>
                        <select
                            required
                            value={editingQuestion.correctAnswer}
                            onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">Select correct option</option>
                            {editingQuestion.options.map((opt, i) => (
                                opt.trim() && <option key={i} value={i}>Option {String.fromCharCode(65 + i)}: {opt.substring(0, 40)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <input
                            type="text" required
                            value={editingQuestion.subject}
                            onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                        <select
                            value={editingQuestion.difficulty}
                            onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation || ''}
                    onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                  />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 shrink-0 flex gap-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md rounded-b-2xl">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white font-medium transition-colors border border-gray-300 dark:border-white/10 shadow-sm">Cancel</button>
              <button type="submit" form="editQuestionForm" className="flex-1 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionChecker;
