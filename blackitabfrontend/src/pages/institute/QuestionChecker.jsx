import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  CheckBadgeIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const QuestionChecker = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

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
    } catch (error) {
      CustomToast.error('Failed to load institute questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/institute/questions/${id}`, { approvalStatus: newStatus });
      if (res.data.success) {
        CustomToast.success(`Question marked as ${newStatus}`);
        fetchQuestions();
      }
    } catch (error) {
      CustomToast.error('Failed to update question status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/institute/questions/${id}`);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        fetchQuestions();
      }
    } catch (error) {
      CustomToast.error('Failed to delete question');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <CheckBadgeIcon className="w-6 h-6 text-orange-500" />
            Question Checker
          </h1>
          <p className="text-gray-500 text-sm">Review, edit, and approve questions submitted by institute teachers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questions.length === 0 ? (
          <div className="p-8 text-center glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
            <CheckBadgeIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No questions found in this institute.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q._id} className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-orange-500/50 transition-colors shadow-sm group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500">Q{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      q.approvalStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                      q.approvalStatus === 'rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                      'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                    }`}>
                      {q.approvalStatus || 'pending'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs border border-gray-200 dark:border-white/5">
                      {q.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border border-transparent ${
                        q.difficulty === 'hard' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10' : 
                        q.difficulty === 'medium' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/10' : 
                        'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-2">{q.question}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {q.options?.map((opt, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border transition-colors ${opt === q.correctAnswer ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'}`}>
                        <span className="font-mono text-xs opacity-50 mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5"><span className="font-semibold not-italic text-gray-700 dark:text-gray-300">Explanation:</span> {q.explanation}</p>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    By <span className="font-medium text-gray-700 dark:text-gray-300">{q.createdBy?.name || 'Unknown'}</span> ({q.createdBy?.role})
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    {q.approvalStatus !== 'approved' && (
                        <button onClick={() => handleStatusChange(q._id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircleIcon className="w-4 h-4" /> Approve
                        </button>
                    )}
                    {q.approvalStatus !== 'rejected' && (
                        <button onClick={() => handleStatusChange(q._id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl text-sm font-medium transition-colors border border-orange-200 dark:border-orange-500/20">
                            <XCircleIcon className="w-4 h-4" /> Reject
                        </button>
                    )}
                    <button onClick={() => openEditModal(q)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition-colors border border-blue-200 dark:border-blue-500/20">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(q._id)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-200 dark:border-red-500/20">
                        <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                        className={`w-full bg-gray-50 dark:bg-white/5 border ${opt === editingQuestion.correctAnswer && opt.trim() !== '' ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-200 dark:border-white/10'} rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
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
                            onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">Select correct option</option>
                            {editingQuestion.options.map((opt, i) => (
                                opt.trim() && <option key={i} value={opt}>Option {String.fromCharCode(65 + i)}</option>
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
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
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
