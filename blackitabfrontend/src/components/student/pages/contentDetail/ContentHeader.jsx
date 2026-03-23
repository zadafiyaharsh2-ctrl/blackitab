import React from 'react';
import { FaArrowLeft, FaEllipsisH, FaTrash } from 'react-icons/fa';

const ContentHeader = ({ title, isOwner, showMenu, setShowMenu, onBack, onDelete }) => {
  return (
    <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 md:px-8 py-4 flex items-center gap-6 shadow-sm">
      <button
        onClick={onBack}
        className="group flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-[#0061FF]/5 hover:border-[#0061FF]/30 transition-all focus:outline-none"
      >
        <FaArrowLeft className="text-gray-500 group-hover:text-[#0061FF] text-xs transition-colors" />
      </button>
      <div className="font-extrabold text-lg md:text-xl text-gray-900 dark:text-white truncate flex-1 tracking-tight">
        {title}
      </div>
      
      {isOwner && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="group w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all focus:outline-none"
          >
            <FaEllipsisH className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={onDelete}
                  className="w-full text-left px-5 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold transition-colors flex items-center gap-3"
                >
                  <FaTrash className="text-xs" /> Expunge Record
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentHeader;
