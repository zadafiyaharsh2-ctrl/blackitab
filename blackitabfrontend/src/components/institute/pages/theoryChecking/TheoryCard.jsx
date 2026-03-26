import React from 'react';
import { PencilIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

const TheoryCard = ({
  theory,
  user,
  canEdit,
  openModal,
  handleDelete
}) => {
  return (
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none rounded-2xl p-6 flex flex-col h-full hover:bg-white/90 dark:hover:bg-white/[0.06] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2" title={theory.title}>{theory.title}</h3>
        {['institute', 'hod', 'teacher'].includes(user?.role) && canEdit(theory.uploadedBy?._id || theory.uploadedBy) && (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openModal(theory)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(theory._id)} className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md text-xs font-medium">
          {theory.subject}
        </span>
        {theory.department && (
          <span className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-md text-xs font-medium">
            {theory.department}
          </span>
        )}
      </div>

      <div className="flex-1">
        {theory.content && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{theory.content}</p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          By {theory.uploadedBy?.name || 'Unknown'}
        </div>
        {theory.fileUrl && (
          <a 
            href={theory.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] font-bold text-[#063669] dark:text-[#a7c8ff] hover:text-[#274e82] transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            View File
          </a>
        )}
      </div>
    </div>
  );
};

export default TheoryCard;
