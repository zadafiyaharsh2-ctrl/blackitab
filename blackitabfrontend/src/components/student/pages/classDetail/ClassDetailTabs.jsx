import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaBookOpen, FaFileAlt, FaClipboardList
} from 'react-icons/fa';

const ClassDetailTabs = ({ activeTab, setActiveTab, classId, attendance, materials, assignments, exams, AttendanceTimeline }) => {
  const navigate = useNavigate();

  const tabs = [
    { key: 'attendance', label: 'Attendance History', icon: FaCalendarAlt },
    { key: 'materials', label: `Course Materials (${materials?.length || 0})`, icon: FaBookOpen },
    { key: 'assignments', label: `Assignments (${assignments?.length || 0})`, icon: FaClipboardList },
    { key: 'exams', label: `Exams (${exams?.length || 0})`, icon: FaFileAlt },
  ];

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600 dark:bg-white/[0.05] dark:text-blue-400 dark:border-blue-400 shadow-[0_4px_0_0_transparent]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.02]'
              }`}
            >
              <Icon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-0">
        {/* Attendance */}
        {activeTab === 'attendance' && (
          attendance?.sessions?.length > 0 ? (
            <AttendanceTimeline sessions={attendance.sessions} />
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-2xl text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No Attendance Records</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Attendance hasn't been taken in this class yet.</p>
            </div>
          )
        )}

        {/* Materials */}
        {activeTab === 'materials' && (
          <div className="p-6">
            {materials?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {materials.map(material => (
                  <div 
                    key={material._id} 
                    onClick={() => navigate(`/classes/${classId}/material/${material._id}`)}
                    className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FaBookOpen />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{material.title}</h3>
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          {material.links?.length > 0 && <span>{material.links.length} Links</span>}
                          {material.files?.length > 0 && <span>{material.files.length} Files</span>}
                        </div>
                      </div>
                    </div>
                    {material.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-grow">{material.description}</p>}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">Open Material &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-16 text-center">
                <FaBookOpen className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">No class materials yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teachers haven't added any study materials for this class.</p>
              </div>
            )}
          </div>
        )}

        {/* Exams */}
        {activeTab === 'exams' && (
          <div className="p-6">
            {exams?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map(exam => (
                  <div 
                    key={exam._id} 
                    onClick={() => navigate(`/classes/${classId}/exam/${exam._id}`)}
                    className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FaFileAlt />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{exam.title}</h3>
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          <span>Points: {exam.totalMarks}</span>
                          <span>Time: {exam.duration}m</span>
                        </div>
                      </div>
                    </div>
                    {exam.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-grow">{exam.description}</p>}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Scheduled: {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString() : 'TBD'}</span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:underline">View Exam &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-16 text-center">
                <FaFileAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">No upcoming exams</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teachers haven't scheduled any exams for this class.</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments */}
        {activeTab === 'assignments' && (
          <div className="p-6">
            {assignments?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map(assignment => (
                  <div 
                    key={assignment._id} 
                    onClick={() => navigate(`/classes/${classId}/assignment/${assignment._id}`)}
                    className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FaClipboardList />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{assignment.title}</h3>
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          <span>Total Marks: {assignment.totalMarks}</span>
                          <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'None'}</span>
                        </div>
                      </div>
                    </div>
                    {assignment.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-grow">{assignment.description}</p>}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:underline">View Assignment &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-16 text-center">
                <FaClipboardList className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">No assignments yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teachers haven't added any assignments for this class.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetailTabs;
