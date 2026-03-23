import React from 'react';
import { FaGraduationCap, FaCalendarDay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BatchDetailHeader = ({ batch, students, requests }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-gray-200 dark:border-white/10 pb-8 relative">
      <div className="space-y-4 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">{batch.name}</h1>
          {batch.classCode && (
            <span className="px-4 py-1.5 bg-[#0061FF]/10 text-[#0061FF] dark:text-[#a5c3ff] border border-[#0061FF]/20 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
              {batch.classCode}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <span className="flex items-center gap-1.5"><FaGraduationCap className="text-gray-400" /> {batch.subjectId?.name || 'General Discipline'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Vintage {batch.year}</span>
          {batch.section && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>Section {batch.section}</span>
            </>
          )}
        </div>
        
        <button 
          onClick={() => navigate('/teacher/attendance')} 
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-[#0061FF] dark:text-[#a5c3ff] hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm hover:shadow"
        >
          <FaCalendarDay /> Attendance Register
        </button>
      </div>

      <div className="flex gap-4">
        <div className="px-6 py-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm min-w-[120px]">
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{students.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Enrolled</p>
        </div>
        
        <div className="relative px-6 py-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm min-w-[120px]">
          {requests.length > 0 && (
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          )}
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{requests.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Syncs</p>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailHeader;
