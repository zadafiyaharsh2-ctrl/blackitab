import React from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const JoinClassModal = ({ showJoinModal, setShowJoinModal, classCode, setClassCode, joining, handleJoin }) => {
  if (!showJoinModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowJoinModal(false)} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Access Secured Space</h3>
          <button onClick={() => setShowJoinModal(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 transition-colors focus:outline-none">
            <FaTimes className="text-xs" />
          </button>
        </div>
        
        <form onSubmit={handleJoin} className="p-8 space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">
              Authentication Code
            </label>
            <input
              type="text"
              placeholder="------"
              value={classCode}
              onChange={e => setClassCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
              className="w-full bg-gray-50 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4 text-2xl font-black text-gray-900 dark:text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm uppercase placeholder-gray-300 dark:placeholder-gray-700"
            />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-gray-500">A 6-digit alphanumeric code is required.</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approval pending instructor review.</p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              disabled={joining || classCode.length !== 6}
              className="w-full py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none"
            >
              {joining ? <FaSpinner className="animate-spin text-sm" /> : null} 
              {joining ? 'Authenticating...' : 'Request Access'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowJoinModal(false)}
              className="w-full py-3.5 bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none"
            >
              Cancel Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClassModal;
