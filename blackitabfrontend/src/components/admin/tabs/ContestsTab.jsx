import React from 'react';
import { FaPlus, FaTimes, FaTrophy, FaEye, FaTrash } from 'react-icons/fa';

const ContestsTab = ({ 
  contests, showCreateContest, setShowCreateContest, newContest, setNewContest, handleCreateContest,
  setEditContestModal, handleDeleteContest 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Contest Management ({contests.length})</h2>
        <button onClick={() => setShowCreateContest(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-bold hover:bg-yellow-500/20 transition-colors">
          <FaPlus /> Create Contest
        </button>
      </div>

      {/* Create Contest Form */}
      {showCreateContest && (
        <div className="glass-panel p-6 border border-yellow-500/20 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">New Contest</h3>
            <button onClick={() => setShowCreateContest(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input value={newContest.title} onChange={e => setNewContest({ ...newContest, title: e.target.value })}
              placeholder="Contest Title" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <input value={newContest.startTime} onChange={e => setNewContest({ ...newContest, startTime: e.target.value })}
              type="datetime-local" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
            <input value={newContest.endTime} onChange={e => setNewContest({ ...newContest, endTime: e.target.value })}
              type="datetime-local" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
            <select value={newContest.difficultyLevel} onChange={e => setNewContest({ ...newContest, difficultyLevel: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
              {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
            </select>
            <input value={newContest.description} onChange={e => setNewContest({ ...newContest, description: e.target.value })}
              placeholder="Description (optional)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none col-span-2" />
          </div>
          <button onClick={handleCreateContest}
            className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold text-sm transition-colors">
            Create Contest
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map(c => (
          <div key={c._id} className="glass-panel p-6 border border-white/10 rounded-2xl group relative">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditContestModal({ _id: c._id, title: c.title, description: c.description || '', startTime: c.startTime?.slice(0,16) || '', endTime: c.endTime?.slice(0,16) || '', difficultyLevel: c.difficultyLevel || 'Intermediate', isActive: c.isActive || false })}
                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                <FaEye className="text-xs" />
              </button>
              <button onClick={() => handleDeleteContest(c._id)}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                <FaTrash className="text-xs" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-yellow-400" />
              <h3 className="text-white font-bold pr-8">{c.title || c.name || 'Contest'}</h3>
            </div>
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{c.startTime ? new Date(c.startTime).toLocaleDateString() : 'No date'}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                c.status === 'completed' ? 'bg-gray-500/10 text-gray-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>{c.status || 'draft'}</span>
            </div>
          </div>
        ))}
        {contests.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">
            <FaTrophy className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No contests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsTab;
