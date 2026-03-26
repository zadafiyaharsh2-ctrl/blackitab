import React from 'react';
import { Medal } from 'lucide-react';

const StudentTopTopics = ({ masterySubjects, selectedMasterySubject, setSelectedMasteryId }) => {
  if (!masterySubjects.length) return null;

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1.5">
        <Medal className="h-3.5 w-3.5" /> Top Performing Topics
      </h3>
      <p className="text-[11px] text-gray-400 mb-4">Click a topic to focus it on the mastery chart.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {masterySubjects.map((topic, index) => (
          <button
            type="button"
            key={`${topic.id}-${index}`}
            onClick={() => setSelectedMasteryId(topic.id)}
            className={`w-full text-left border rounded-lg p-3 transition-all duration-200 ${
              selectedMasterySubject?.id === topic.id
                ? 'border-blue-300 dark:border-cyan-400/50 bg-blue-50/70 dark:bg-cyan-500/10 shadow-sm'
                : 'border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-cyan-400/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{topic.name}</span>
              <span className="text-xs text-gray-400">{topic.mastery}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${topic.progress}%` }} />
              </div>
              <span className="text-xs text-gray-400">{topic.progress}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentTopTopics;
