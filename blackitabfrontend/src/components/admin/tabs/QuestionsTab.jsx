import React from 'react';
import { FaPlus, FaTimes, FaQuestion, FaExclamationTriangle, FaEye, FaCheck, FaBan, FaTrash } from 'react-icons/fa';

const QuestionsTab = ({
  questions, questionFilter, setQuestionFilter, showCreateQuestion, setShowCreateQuestion,
  newQuestion, setNewQuestion, handleCreateQuestion, setQuestionPreview,
  handleApprove, setRejectModal, handleDeleteQuestion,
  Pagination, questionPagination, questionPage, setQuestionPage, fetchQuestions
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Question Approval</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreateQuestion(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
            <FaPlus /> Create Question
          </button>
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setQuestionFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                questionFilter === s ? `text-white ${s === 'pending' ? 'bg-yellow-500/20' : s === 'approved' ? 'bg-emerald-500/20' : 'bg-red-500/20'}` : 'text-gray-500 hover:text-gray-300'
              }`}>
              {s}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Create Question Form */}
      {showCreateQuestion && (
        <div className="glass-panel p-6 border-emerald-500/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Create Question (Auto-Approved)</h3>
            <button onClick={() => setShowCreateQuestion(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select value={newQuestion.exam} onChange={e => setNewQuestion({ ...newQuestion, exam: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
              {['jee', 'neet', 'gate', 'cat', 'upsc', 'other'].map(e => <option key={e} value={e} className="bg-gray-900 uppercase">{e.toUpperCase()}</option>)}
            </select>
            <input value={newQuestion.subject} onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value })}
              placeholder="Subject (e.g. Physics)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <select value={newQuestion.difficulty} onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
              {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
            </select>
          </div>
          <textarea value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
            placeholder="Question text..." rows={2} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none resize-none mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {newQuestion.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: i })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        newQuestion.correctAnswer === i ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-500'
                    }`}>{String.fromCharCode(65 + i)}</button>
                  <input value={opt} onChange={e => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion({ ...newQuestion, options: opts }); }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
              </div>
            ))}
          </div>
          <input value={newQuestion.explanation} onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              placeholder="Explanation (optional)" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none mb-4" />
          <button onClick={handleCreateQuestion}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors">
              Create Question
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="glass-panel p-4 border-blue-500/20 rounded-xl mb-6 flex items-start gap-3">
        <FaExclamationTriangle className="text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-gray-400">
          <strong className="text-blue-400">Approval System:</strong> Teachers create questions → they appear here as <strong>Pending</strong>.
          Questions within the <strong>same institute</strong> are visible immediately. For <strong>global visibility</strong> (all students worldwide), you must <strong>Approve</strong> them manually.
        </div>
      </div>

      <div className="space-y-3">
        {questions.map(q => (
          <div key={q._id} layout className="glass-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">{q.exam}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">{q.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>{q.difficulty}</span>
                  {q.instituteId && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400">{q.instituteId.name}</span>}
                </div>
                <p className="text-white text-sm font-medium mb-1 line-clamp-2">{q.question}</p>
                <p className="text-gray-500 text-xs">
                  By: {q.createdBy?.name || 'Unknown'} ({q.createdBy?.email || '—'}) · {new Date(q.createdAt).toLocaleDateString()}
                </p>
                {q.approvalNote && q.approvalStatus === 'rejected' && (
                  <p className="text-red-400/80 text-xs mt-1 italic">Rejection note: {q.approvalNote}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setQuestionPreview(q)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Preview">
                  <FaEye />
                </button>
                {q.approvalStatus === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(q._id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                      <FaCheck /> Approve
                    </button>
                    <button onClick={() => setRejectModal({ open: true, questionId: q._id, note: '' })}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                      <FaBan /> Reject
                    </button>
                  </>
                )}
                {q.approvalStatus === 'rejected' && (
                  <button onClick={() => handleApprove(q._id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                    <FaCheck /> Approve
                  </button>
                )}
                <button onClick={() => handleDeleteQuestion(q._id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <FaQuestion className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No {questionFilter} questions</p>
          </div>
        )}
      </div>
      <Pagination pagination={questionPagination} current={questionPage} onPageChange={p => { setQuestionPage(p); fetchQuestions(questionFilter, p); }} />
    </div>
  );
};

export default QuestionsTab;
