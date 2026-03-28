import React from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EditQuestionModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  editingQuestion,
  setEditingQuestion,
  handleEditSubmit,
  handleOptionChange
}) => {
  if (!isEditModalOpen || !editingQuestion) return null;

  return (
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
  );
};

export default EditQuestionModal;
