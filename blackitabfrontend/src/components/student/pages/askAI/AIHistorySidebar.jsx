import React from 'react';
import { FaHistory, FaTrash, FaSpinner, FaComment, FaPlus, FaTimes } from 'react-icons/fa';

const AIHistorySidebar = ({ showHistory, setShowHistory, chatList, currentChatId, loadingHistory, loadChat, createNewChat, deleteChatSession, handleClearHistory }) => {
  if (!showHistory) return null;

  return (
    <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200 dark:bg-[#0a0a0a] dark:border-white/10 z-30 animate-in slide-in-from-right-4 duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Sessions</h3>
          <p className="text-[10px] font-medium text-gray-400 mt-1">{chatList.length} Active</p>
        </div>
        <div className="flex items-center gap-3">
          {chatList.length > 0 && (
            <button onClick={handleClearHistory} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Flush</button>
          )}
          <button onClick={() => setShowHistory(false)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500"><FaTimes className="text-xs" /></button>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={createNewChat}
          className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#0061FF]/40 hover:text-[#0061FF] transition-colors"
        >
          <FaPlus className="text-[10px]" /> Initialize New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {loadingHistory ? (
          <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#0061FF]/40" /></div>
        ) : chatList.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
              <FaComment className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">No session history retained.</p>
          </div>
        ) : (
          chatList.map((chat) => (
            <div
              key={chat._id}
              onClick={() => loadChat(chat._id)}
              className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
                currentChatId === chat._id
                  ? 'bg-[#f8f9fa] dark:bg-white/[0.04] border-gray-200 dark:border-white/10 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'
              }`}
            >
              <div className="pr-8">
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug break-words">{chat.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                  {new Date(chat.updatedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={(e) => deleteChatSession(chat._id, e)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
              >
                <FaTrash className="text-[10px]" />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default AIHistorySidebar;
