import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, UsersIcon, BookOpenIcon, ChevronDownIcon, ChevronUpIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const TeacherBatchesTab = ({
  batches,
  expandedBatch,
  toggleBatchExpand,
  batchStudents,
  loadingStudents
}) => {
  return (
    <div className="space-y-4">
      {batches.length > 0 ? (
        batches.map(batch => {
          const isExpanded = expandedBatch === batch._id;
          const students = batchStudents[batch._id] || [];
          const isLoadingThis = loadingStudents === batch._id;

          return (
            <div key={batch._id} className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] overflow-hidden transition-all">
              {/* Batch Header — clickable to expand */}
              <button
                onClick={() => toggleBatchExpand(batch._id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{batch.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {batch.year} {batch.section}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {batch.studentCount} students
                      </span>
                      {batch.subjectId?.name && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <BookOpenIcon className="w-3.5 h-3.5" />
                          {batch.subjectId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  : <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                }
              </button>

              {/* Expanded: Student Roster */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                  {isLoadingThis ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Loading students...</span>
                    </div>
                  ) : students.length > 0 ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled Students</p>
                        <span className="text-xs text-gray-400">{students.length} total</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {students.map(student => (
                          <Link
                            key={student._id}
                            to={`/institute/student/${student._id}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                              {student.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{student.email}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No students enrolled in this batch.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
          <AcademicCapIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">This teacher is not managing any batches yet.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherBatchesTab;
