import React from 'react';
import { FaSpinner, FaSave, FaCheckCircle, FaTimesCircle, FaClock, FaBan, FaChevronLeft, FaChevronRight, FaPen, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const AttendanceTakeView = ({
  students, attendanceState, setStudentStatus, attendanceDate, setAttendanceDate,
  sessionType, setSessionType, existingRecord, submitting, submitAttendance,
  loadingStudents, shiftDate, isToday, isPastDate, isFutureDate, friendlyDate,
  getLocalDateString, markAllPresent, markAllAbsent
}) => {
  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'Late').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Left Column (3/4): Main Roster */}
      <div className="lg:col-span-3 space-y-6">
        {/* Date Strip */}
        <div className="flex flex-col sm:flex-row xl:items-center justify-between gap-6 p-6 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => shiftDate(-1)} className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <FaChevronLeft className="text-xs" />
              </button>
              <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-sm font-bold border-none bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer" />
              <button onClick={() => shiftDate(1)} className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <FaChevronRight className="text-xs" />
              </button>
            </div>
            <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}
              className="text-sm font-bold border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#0061FF]/30 transition-colors cursor-pointer">
              <option value="Class">Class Session</option>
              <option value="Lab">Lab Session</option>
            </select>
            {!isToday && (
              <button onClick={() => setAttendanceDate(getLocalDateString())}
                className="text-xs font-bold px-4 py-2.5 rounded-full bg-blue-50 dark:bg-[#0061FF]/10 text-blue-600 dark:text-[#a5c3ff] border border-blue-200 dark:border-[#0061FF]/30 hover:bg-blue-100 transition-colors">
                Today
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {existingRecord ? (
              <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-500/20 flex items-center gap-1.5">
                <FaPen className="text-[10px]" /> Editing Record
              </span>
            ) : isFutureDate ? (
              <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 flex items-center gap-1.5">
                <FaCalendarAlt className="text-[10px]" /> Scheduled
              </span>
            ) : isPastDate ? (
              <span className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[11px] font-bold uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 flex items-center gap-1.5">
                <FaInfoCircle className="text-[10px]" /> Backdated
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-[#0061FF]/10 text-[#0061FF] dark:text-[#a5c3ff] text-[11px] font-bold uppercase tracking-widest border border-[#0061FF]/20 flex items-center gap-1.5">
                New Record
              </span>
            )}
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{friendlyDate}</span>
          </div>
        </div>

        {/* Student List Container */}
        <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-[#f8f9fa]/50 dark:bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Roster • {students.length} Students</p>
            <div className="flex items-center gap-2">
              <button onClick={markAllPresent} className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#0061FF]/30 hover:text-[#0061FF] transition-all rounded-full text-xs font-bold shadow-sm flex items-center justify-center gap-1">
                <FaCheckCircle className="text-[10px]" /> All Present
              </button>
              <button onClick={markAllAbsent} className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-red-500/30 hover:text-red-500 transition-all rounded-full text-xs font-bold shadow-sm flex items-center justify-center gap-1">
                <FaTimesCircle className="text-[10px]" /> All Absent
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {loadingStudents ? (
              <div className="py-24 text-center"><FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" /></div>
            ) : students.length === 0 ? (
              <div className="py-24 text-center text-sm font-medium text-gray-500">No students enrolled.</div>
            ) : (
              students.map((student, idx) => {
                const status = attendanceState[student._id] || 'Present';
                return (
                  <div key={student._id} className="p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <span className="text-[11px] font-bold text-gray-400 w-4 text-right shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight truncate">{student.name}</p>
                        <p className="text-[11px] font-medium text-gray-500 truncate">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 w-full sm:w-auto overflow-x-auto shadow-sm rounded-full">
                      <div className="flex items-center bg-[#f8f9fa] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1 min-w-0 w-full">
                        {['Present', 'Absent', 'Late', 'No Class'].map(opt => (
                          <button key={opt} onClick={() => setStudentStatus(student._id, opt)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${status === opt
                              ? (opt === 'Present' ? 'bg-[#0061FF] text-white shadow-sm'
                                : opt === 'Absent' ? 'bg-red-500 text-white shadow-sm'
                                : opt === 'Late' ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-gray-600 text-white shadow-sm')
                              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            {opt === 'Present' ? 'P' : opt === 'Absent' ? 'A' : opt === 'Late' ? 'L' : 'N'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column (1/4): Snapshot & Save */}
      <div className="lg:col-span-1 space-y-6">
        <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Snapshot</h3>
          <div className="space-y-4">
            {[{ label: 'Present', count: presentCount }, { label: 'Absent', count: absentCount }, { label: 'Late', count: lateCount }].map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm text-center">
          <p className="text-[12px] font-medium text-gray-500 mb-6 leading-relaxed">
            {existingRecord ? 'You are updating a previously saved attendance block.' : 'You are submitting a new block for the active date.'}
          </p>
          <button onClick={submitAttendance} disabled={submitting}
            className="w-full py-4 bg-[#0061FF] dark:bg-[#0061FF] text-white rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {submitting ? 'Saving Data...' : existingRecord ? 'Update Register' : 'Save Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTakeView;
