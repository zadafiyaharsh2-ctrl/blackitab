import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarDay, FaClipboardList, FaFileAlt, FaChartLine, FaChevronRight } from 'react-icons/fa';

const TeacherQuickActions = () => {
  return (
    <div className="lg:col-span-1 border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 dark:border-white/5 bg-[#f8f9fa]/50 dark:bg-[#0a0a0a]">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Rapid Actions</h3>
        <p className="text-[13px] font-medium text-gray-500 mt-1">Jump directly to your workflows.</p>
      </div>
      
      <div className="flex flex-col p-2">
        {[
          { label: 'Manage Batches', desc: 'Create and view student groups', icon: <FaUsers />, link: '/teacher/batches' },
          { label: 'Take Attendance', desc: 'Mark daily attendance', icon: <FaCalendarDay />, link: '/teacher/attendance' },
          { label: 'Question Bank', desc: 'Manage & generate questions', icon: <FaClipboardList />, link: '/question-management' },
          { label: 'Question Paper', desc: 'Export questions as PDF', icon: <FaFileAlt />, link: '/question-paper' },
          { label: 'School Analytics', desc: 'Monitor student performance', icon: <FaChartLine />, link: '/school-analytics' },
        ].map((action, i) => (
          <Link key={i} to={action.link} className="group p-4 rounded-[1.25rem] hover:bg-[#f8f9fa] dark:hover:bg-white/5 flex items-center gap-4 transition-all">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#0061FF]/30 dark:group-hover:border-white/30 transition-colors shadow-sm">
              <div className="text-[#0061FF] dark:text-[#a5c3ff] text-lg">{action.icon}</div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{action.label}</p>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">{action.desc}</p>
            </div>
            <FaChevronRight className="text-gray-300 dark:text-gray-600 text-xs translate-x-0 group-hover:translate-x-1 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeacherQuickActions;
