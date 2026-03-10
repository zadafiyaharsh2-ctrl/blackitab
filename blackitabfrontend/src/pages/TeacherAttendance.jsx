import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarDay,
  FaSearch, FaSave, FaHistory, FaArrowLeft, FaSpinner,
  FaChevronDown, FaUsers, FaUserGraduate
} from 'react-icons/fa';
import API from '../config';

// ── Animation Variants ──────────────────────────────────────────────────────
const fadeIn = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const popIn = { hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 } };

// ── Dummy Data Fallback ─────────────────────────────────────────────────────
const DUMMY_STUDENTS = [
  { _id: 's1', name: 'Alice Walker', email: 'alice@example.com' },
  { _id: 's2', name: 'Bob Smith', email: 'bob@example.com' },
  { _id: 's3', name: 'Charlie Davis', email: 'charlie@example.com' },
  { _id: 's4', name: 'Diana Prince', email: 'diana@example.com' },
  { _id: 's5', name: 'Evan Wright', email: 'evan@example.com' },
  { _id: 's6', name: 'Fiona Gallagher', email: 'fiona@example.com' },
  { _id: 's7', name: 'George Miller', email: 'george@example.com' },
  { _id: 's8', name: 'Hannah Abbott', email: 'hannah@example.com' },
];

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  
  // 'take' or 'history'
  const [viewMode, setViewMode] = useState('take'); 
  
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for recording attendance: { studentId: 'present' | 'absent' | 'late' | 'excused' }
  const [attendanceState, setAttendanceState] = useState({});
  const [remarksState, setRemarksState] = useState({});
  
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Fetch Teacher's Batches
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const res = await axios.get(`${API}/api/teacher/batches`, { headers });
      setBatches(res.data.data);
    } catch (err) {
      console.warn("API Error, using dummy batches");
      // Fallback
      setBatches([
        { _id: 'b1', name: 'CS101 - Morning', year: '1st Year', section: 'A' },
        { _id: 'b2', name: 'CS202 - Evening', year: '2nd Year', section: 'B' }
      ]);
      toast.error('Failed to load classes. Using offline mode.');
    } finally {
      setLoadingBatches(false);
    }
  };

  // 2. Load Students when a batch is selected (for Taking Attendance)
  useEffect(() => {
    if (selectedBatch && viewMode === 'take') {
      fetchStudents(selectedBatch._id);
    }
  }, [selectedBatch, viewMode]);

  const fetchStudents = async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/teacher/batch/${batchId}`, { headers });
      const studentData = res.data.data.studentIds || [];
      setStudents(studentData);
      
      // Initialize everyone as 'present' by default
      const initialState = {};
      const initialRemarks = {};
      studentData.forEach(s => {
        initialState[s._id] = 'present';
        initialRemarks[s._id] = '';
      });
      setAttendanceState(initialState);
      setRemarksState(initialRemarks);
      
    } catch (err) {
      console.warn("API Error, using dummy students");
      setStudents(DUMMY_STUDENTS);
      const initialState = {};
      DUMMY_STUDENTS.forEach(s => initialState[s._id] = 'present');
      setAttendanceState(initialState);
      toast.error('Failed to load students. Using offline demo.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3. Load History when viewing history mode
  useEffect(() => {
    if (selectedBatch && viewMode === 'history') {
      fetchHistory(selectedBatch._id);
    }
  }, [selectedBatch, viewMode]);

  const fetchHistory = async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/teacher/attendance/${batchId}`, { headers });
      setHistoryRecords(res.data.data);
    } catch (err) {
      toast.error('Failed to load attendance history.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarksState(prev => ({ ...prev, [studentId]: remark }));
  };

  // Submit Attendance to Backend
  const submitAttendance = async () => {
    if (!selectedBatch) return;
    
    const records = students.map(s => ({
      studentId: s._id,
      status: attendanceState[s._id] || 'present',
      remarks: remarksState[s._id] || ''
    }));

    try {
      setSubmitting(true);
      await axios.post(`${API}/api/teacher/attendance`, {
        batchId: selectedBatch._id,
        date: attendanceDate,
        records
      }, { headers });
      
      toast.success('Attendance saved successfully!');
      setViewMode('history'); // auto switch to history to view it
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already submitted')) {
        toast.error('Attendance already taken for this date! Check History to update.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit attendance');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render Helpers ──────────────────────────────────────────────────────────

  const StatusButton = ({ studentId, type, icon, label, colorClass, activeColorClass }) => {
    const isActive = attendanceState[studentId] === type;
    return (
      <button
        onClick={() => handleStatusChange(studentId, type)}
        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 
          ${isActive 
            ? `${activeColorClass} shadow-lg scale-105` 
            : `border-gray-200 dark:border-white/10 ${colorClass} hover:bg-gray-50 dark:hover:bg-white/5`
          }`}
      >
        <div className={`text-xl mb-1 ${isActive ? 'text-white' : ''}`}>{icon}</div>
        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{label}</span>
      </button>
    );
  };

  // Calculate quick stats
  const presentCount = Object.values(attendanceState).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'absent').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:text-white flex items-center gap-3">
            <FaCalendarDay className="text-blue-500" />
            Class Attendance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Beautifully simple daily tracking for your classrooms.
          </p>
        </div>
        
        {/* Step 1: Mode Switcher (Take vs History) */}
        {selectedBatch && (
          <div className="flex bg-gray-100 dark:bg-[#1a1c23] p-1 rounded-xl w-max border border-gray-200 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('take')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'take' 
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
               Take Attendance
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'history' 
                  ? 'bg-white dark:bg-gray-800 text-indigo-500 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FaHistory /> History
            </button>
          </div>
        )}
      </motion.div>

      {/* Step 2: Batch Selection */}
      {!selectedBatch ? (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingBatches ? (
            <div className="col-span-full flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>
          ) : batches.length === 0 ? (
            <div className="col-span-full glass-panel rounded-2xl p-10 text-center border border-gray-200 dark:border-white/10">
              <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No active classes found</h3>
              <p className="text-gray-500 mt-2">Create a classroom in "Manage Batches" first before taking attendance.</p>
            </div>
          ) : (
            batches.map((batch) => (
              <motion.div
                key={batch._id}
                variants={popIn}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedBatch(batch)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer p-1"
              >
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative h-full bg-white dark:bg-[#151821] rounded-xl p-6 shadow-xl flex flex-col justify-between z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{batch.name}</h3>
                    <div className="flex gap-2 text-sm font-medium">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full">{batch.year}</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 rounded-full">Sec {batch.section}</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center text-blue-500 group-hover:text-indigo-400 font-bold transition-colors">
                    Take Attendance <FaArrowLeft className="ml-2 rotate-180" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
          
          {/* Active Batch Header */}
          <div className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 z-10">
              <button 
                onClick={() => { setSelectedBatch(null); setSelectedHistory(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBatch.name}</h2>
                <p className="text-sm font-medium text-gray-500">{selectedBatch.year} • Section {selectedBatch.section}</p>
              </div>
            </div>

            {viewMode === 'take' && (
              <div className="mt-4 sm:mt-0 z-10 flex items-center gap-4">
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-transparent border-2 border-gray-200 hover:border-blue-400 dark:border-white/10 dark:hover:border-blue-500 focus:border-blue-500 rounded-xl px-4 py-2 font-bold text-gray-700 dark:text-gray-200 outline-none transition-all cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* ─── TAKE ATTENDANCE MODE ─── */}
          {viewMode === 'take' && (
            <>
              {loadingStudents ? (
                <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500">No students enrolled in this batch yet.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
                  
                  {/* Status Summary Bar */}
                  <div className="bg-gray-50 dark:bg-white/5 p-4 border-b border-gray-200 dark:border-white/10 flex justify-center gap-8">
                    <div className="text-center"><p className="text-sm text-gray-500">Total Students</p><p className="text-2xl font-black">{students.length}</p></div>
                    <div className="text-center"><p className="text-sm text-emerald-500">Present</p><p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p></div>
                    <div className="text-center"><p className="text-sm text-rose-500">Absent</p><p className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentCount}</p></div>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest font-bold">
                          <th className="pb-4 pl-4 w-1/4">Student</th>
                          <th className="pb-4 text-center w-2/4">Attendance Status</th>
                          <th className="pb-4 pr-4 w-1/4">Optional Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={student._id} 
                            className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"
                          >
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4">
                              <div className="grid grid-cols-4 gap-2 px-4">
                                <StatusButton 
                                  studentId={student._id} type="present" icon={<FaCheckCircle />} label="Present" 
                                  colorClass="text-emerald-500 border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30" 
                                  activeColorClass="bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-500" 
                                />
                                <StatusButton 
                                  studentId={student._id} type="absent" icon={<FaTimesCircle />} label="Absent" 
                                  colorClass="text-rose-500 border-transparent hover:border-rose-200 dark:hover:border-rose-500/30" 
                                  activeColorClass="bg-gradient-to-b from-rose-500 to-red-600 border-rose-600" 
                                />
                                <StatusButton 
                                  studentId={student._id} type="late" icon={<FaClock />} label="Late" 
                                  colorClass="text-amber-500 border-transparent hover:border-amber-200 dark:hover:border-amber-500/30" 
                                  activeColorClass="bg-gradient-to-b from-amber-400 to-amber-600 border-amber-500" 
                                />
                                <StatusButton 
                                  studentId={student._id} type="excused" icon={<FaUserGraduate />} label="Excused" 
                                  colorClass="text-gray-500 border-transparent hover:border-gray-300 dark:hover:border-gray-500/30" 
                                  activeColorClass="bg-gradient-to-b from-gray-500 to-gray-700 border-gray-600" 
                                />
                              </div>
                            </td>

                            <td className="py-4 pr-4">
                               <input 
                                  type="text" 
                                  placeholder="Add note..."
                                  value={remarksState[student._id] || ''}
                                  onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                  className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                               />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Submission Footer */}
                  <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/10 flex justify-end">
                     <button
                        onClick={submitAttendance}
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                        {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {submitting ? 'Saving...' : 'Submit Attendance'}
                     </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── HISTORY MODE ─── */}
          {viewMode === 'history' && (
             <div className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden p-6 pb-20 min-h-[500px]">
                {!selectedHistory ? (
                   <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Past Attendance Records</h3>
                    {loadingStudents ? (
                       <div className="flex justify-center"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>
                    ) : historyRecords.length === 0 ? (
                       <div className="text-center py-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                         <p className="text-gray-500">No attendance history found for this class.</p>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {historyRecords.map(record => {
                           const d = new Date(record.date);
                           return (
                             <motion.div 
                               variants={popIn}
                               whileHover={{ scale: 1.02 }}
                               onClick={() => setSelectedHistory(record)}
                               key={record._id} 
                               className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md transition group"
                             >
                                <div className="flex justify-between items-center mb-4">
                                  <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm">
                                     {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
                                  </div>
                                  <FaChevronDown className="text-gray-400 group-hover:text-indigo-500 transition -rotate-90" />
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Recorded by: <span className="text-gray-900 dark:text-white font-medium">{record.teacherId?.name || 'Unknown'}</span></span>
                                  <span className="text-emerald-500 font-bold">{record.records.filter(r => r.status === 'present').length} Present</span>
                                </div>
                             </motion.div>
                           );
                         })}
                       </div>
                    )}
                   </>
                ) : (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-4 mb-6">
                        <button onClick={() => setSelectedHistory(null)} className="text-blue-500 hover:text-blue-600 font-bold flex items-center gap-2">
                           <FaArrowLeft /> Back to dates
                        </button>
                        <h3 className="text-xl font-bold flex-1 text-right text-gray-900 dark:text-white">
                           {new Date(selectedHistory.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                        </h3>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                       {['present', 'absent', 'late', 'excused'].map(stat => {
                          const count = selectedHistory.records.filter(r => r.status === stat).length;
                          const colors = {
                            present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30',
                            absent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30',
                            late: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30',
                            excused: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/30'
                          };
                          return (
                            <div key={stat} className={`p-4 rounded-xl flex items-center justify-between ${colors[stat]}`}>
                               <span className="font-bold uppercase tracking-wider text-xs">{stat}</span>
                               <span className="text-2xl font-black">{count}</span>
                            </div>
                          );
                       })}
                     </div>

                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 text-xs uppercase">
                              <th className="pb-3 pl-2">Student</th>
                              <th className="pb-3">Status</th>
                              <th className="pb-3 text-right pr-2">Remarks</th>
                           </tr>
                        </thead>
                        <tbody>
                           {selectedHistory.records.map((record, i) => (
                              <tr key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                                 <td className="py-3 pl-2 font-bold text-gray-900 dark:text-gray-100">{record.studentId?.name || 'Unknown'}</td>
                                 <td className="py-3">
                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                      ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                                        record.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' :
                                        record.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
                                   `}>
                                     {record.status}
                                   </span>
                                 </td>
                                 <td className="py-3 text-right pr-2 text-sm text-gray-500">{record.remarks || '—'}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   </motion.div>
                )}
             </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
