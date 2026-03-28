import React from 'react';
import { UsersIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const StudentTableGroup = ({
  groupedStudents,
  searchQuery,
  sortedKeys,
  user,
  navigate,
  openEditModal,
  handleRemove
}) => {
  if (Object.keys(groupedStudents).length === 0) {
    return (
      <div className="border border-gray-200 dark:border-white/10 rounded-xl text-center py-12 bg-white dark:bg-white/[0.02]">
        <UsersIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {searchQuery ? 'No students found matching your search.' : 'No students enrolled in the institute yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedKeys.map(key => (
        <div key={key} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key}</h3>
            <span className="text-xs text-gray-400">{groupedStudents[key].length} student{groupedStudents[key].length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 dark:border-white/5">
                <tr className="text-xs font-semibold text-gray-500">
                  <th className="px-5 py-2.5 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-2.5 uppercase tracking-wider">Batch</th>
                  <th className="px-5 py-2.5 uppercase tracking-wider">Departments</th>
                  <th className="px-5 py-2.5 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {groupedStudents[key].map(s => (
                  <tr
                    key={s._id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => navigate(`/institute/student/${s._id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {s.batchYear || <span className="italic text-gray-400">Not set</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.departments?.length > 0 ? (
                          s.departments.map(d => (
                            <span key={d} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-400">{d}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {(user?.role === 'institute' || user?.role === 'hod') && (
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          {user?.role === 'institute' && (
                            <button
                              onClick={() => handleRemove(s._id)}
                              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 transition-colors"
                              title="Remove"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentTableGroup;
