import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  CheckBadgeIcon, 
  TrashIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';

import QuestionGroup from '../../components/institute/pages/questionChecker/QuestionGroup';
import EditQuestionModal from '../../components/institute/pages/questionChecker/EditQuestionModal';

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
      <QuestionGroup
        grouped={grouped}
        selected={selected}
        expandedTeachers={expandedTeachers}
        setExpandedTeachers={setExpandedTeachers}
        toggleSelect={toggleSelect}
        openEditModal={openEditModal}
        promptDelete={promptDelete}
      />

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
      <EditQuestionModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingQuestion={editingQuestion}
        setEditingQuestion={setEditingQuestion}
        handleEditSubmit={handleEditSubmit}
        handleOptionChange={handleOptionChange}
      />

    </div>
  );
};

export default QuestionChecker;
