import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaPlusCircle, FaChartLine } from 'react-icons/fa';

const TeacherHeader = ({ user }) => {
  return (
    <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-6 sm:px-10 lg:px-14 max-w-[90rem] mx-auto border-b border-gray-200 dark:border-white/10">
      <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#0061FF]/3 to-transparent blur-[120px] pointer-events-none rounded-bl-full -z-10" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-6 shadow-sm">
            <FaChalkboardTeacher className="text-[#0061FF] dark:text-[#a5c3ff]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
              Administration Hub
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            Welcome back, <br className="hidden sm:block" />
            <span className="text-[#0061FF] dark:text-[#a5c3ff]">{user.name || 'Teacher'}</span>
          </h1>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link to="/question-management" className="px-6 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 flex items-center gap-2.5 transition-all shadow-sm">
            <FaPlusCircle className="text-[#0061FF] dark:text-[#a5c3ff]" />
            <span>Question Bank</span>
          </Link>
          <Link to="/school-analytics" className="px-6 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 flex items-center gap-2.5 transition-all shadow-sm">
            <FaChartLine className="text-[#0061FF] dark:text-[#a5c3ff]" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherHeader;
