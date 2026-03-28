import React from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const QuestionGroup = ({
  grouped,
  selected,
  expandedTeachers,
  setExpandedTeachers,
  toggleSelect,
  openEditModal,
  promptDelete
}) => {
  if (Object.keys(grouped).length === 0) {
    return (
      <div className="p-8 text-center glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
        <CheckBadgeIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500">No questions found in this institute.</p>
      </div>
    );
  }

  return (
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
  );
};

export default QuestionGroup;
