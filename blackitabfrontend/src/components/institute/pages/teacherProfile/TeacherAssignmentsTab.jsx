import React from 'react';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const TeacherAssignmentsTab = ({ assignments }) => {
  return (
    <div className="space-y-3">
      {assignments?.length > 0 ? (
        assignments.map(assign => (
          <div key={assign._id} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{assign.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{assign.description || 'No description provided'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                      Batch: {assign.batchId?.name || 'Unknown'} ({assign.batchId?.year})
                    </span>
                    {assign.dueDate && (
                      <span className="text-[10px] text-gray-400">Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10">
                      Max Score: {assign.maxScore || 100}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
          <ClipboardDocumentCheckIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No assignments created by this teacher.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsTab;
