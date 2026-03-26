import React from 'react';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import AttendanceGrid from '../../../shared/AttendanceGrid';

const AttendanceHistoryView = ({
  viewMode, historyRecords, loadingStudents, selectedHistory, setSelectedHistory,
  editHistoryRecord, students
}) => {
  if (viewMode === 'grid') {
    return (
      <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm bg-white dark:bg-white/[0.02]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Attendance Grid</p>
        {loadingStudents ? (
          <div className="py-24 text-center"><FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" /></div>
        ) : (
          <AttendanceGrid records={historyRecords} students={students} />
        )}
      </div>
    );
  }

  // History view
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm min-h-[500px]">
      {!selectedHistory ? (
        <>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Past Records</h3>
          {loadingStudents ? (
            <div className="py-24 text-center"><FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" /></div>
          ) : historyRecords.length === 0 ? (
            <div className="py-24 text-center text-sm font-medium text-gray-500">No past attendance data available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyRecords.map((record) => {
                const d = new Date(record.date);
                const presentN = record.records.filter((r) => r.status === 'Present').length;
                const totalN = record.records.length;
                const pct = totalN > 0 ? Math.round((presentN / totalN) * 100) : 0;
                return (
                  <div key={record._id} className="p-6 rounded-[1.5rem] border border-gray-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-white/5 group hover:border-[#0061FF]/40 transition-all">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">
                      {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3">
                      <span>{presentN} / {totalN} Present</span>
                      <span className={pct >= 75 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-black rounded-full h-1.5 mb-6">
                      <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editHistoryRecord(record)} className="flex-1 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black transition-all">Edit</button>
                      <button onClick={() => setSelectedHistory(record)} className="flex-1 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black transition-all">View</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedHistory(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0061FF] dark:hover:text-[#a5c3ff] transition-colors mb-6">
            <FaArrowLeft className="text-xs" /> Back to History
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            {new Date(selectedHistory.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Present', 'Absent', 'Late', 'No Class'].map((stat) => {
              const count = selectedHistory.records.filter((r) => r.status === stat).length;
              return (
                <div key={stat} className="border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-6 text-center bg-[#f8f9fa] dark:bg-white/5">
                  <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">{count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat}</p>
                </div>
              );
            })}
          </div>
          <div className="border border-gray-200 dark:border-white/10 rounded-[1.5rem] overflow-hidden bg-white dark:bg-white/[0.02]">
            <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
              {(selectedHistory.records || []).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  <div className="font-bold text-[13px] text-gray-900 dark:text-white tracking-tight">
                    {index + 1}. {record.studentId?.name || 'Unknown'}
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${record.status === 'Present' ? 'bg-[#0061FF]/10 text-[#0061FF] dark:text-[#a5c3ff]' : record.status === 'Absent' ? 'bg-red-500/10 text-red-500' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistoryView;
