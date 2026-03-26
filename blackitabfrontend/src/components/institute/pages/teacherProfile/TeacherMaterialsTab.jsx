import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TeacherMaterialsTab = ({ materials }) => {
  return (
    <div className="space-y-3">
      {materials?.length > 0 ? (
        materials.map(mat => (
          <div key={mat._id} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-200 dark:border-orange-500/20">
                  <DocumentTextIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{mat.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{mat.description || 'No description provided'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                      Batch: {mat.batchId?.name || 'Unknown'} ({mat.batchId?.year})
                    </span>
                    <span className="text-[10px] text-gray-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
          <DocumentTextIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No materials uploaded by this teacher.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherMaterialsTab;
