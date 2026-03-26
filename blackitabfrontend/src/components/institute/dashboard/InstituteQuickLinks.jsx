import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const InstituteQuickLinks = ({ institute, navigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl p-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <DocumentTextIcon className="w-4 h-4" /> About Institute
        </h3>
        <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap font-medium">
          {institute?.description || 'No description provided. Head to Profile to add details.'}
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col">
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Quick Links</h3>
        </div>
        <div className="flex flex-col gap-1 px-4 pb-4">
          {[
            { label: 'Manage Theory Files', path: '/institute/theory' },
            { label: 'Review Questions', path: '/institute/questions' },
            { label: 'Join Requests', path: '/institute/join-requests' },
          ].map((l, i) => (
            <button key={i} onClick={() => navigate(l.path)} className="w-full text-left px-4 py-3 text-[15px] font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
              {l.label} <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstituteQuickLinks;
