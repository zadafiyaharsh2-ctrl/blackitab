import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarDay,
  FaSave, FaHistory, FaArrowLeft, FaSpinner, FaChevronRight,
  FaUsers, FaTable, FaPen, FaChevronLeft, FaCalendarAlt,
  FaInfoCircle, FaBan
} from 'react-icons/fa';
import API from '../../config';
import AttendanceGrid from '../../components/shared/AttendanceGrid';

const DUMMY_STUDENTS = [
  { _id: 's1', name: 'Alice Walker', email: 'alice@example.com' },
  { _id: 's2', name: 'Bob Smith', email: 'bob@example.com' },
  { _id: 's3', name: 'Charlie Davis', email: 'charlie@example.com' },
];

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [viewMode, setViewMode] = useState('take'); // 'take' | 'history' | 'grid'

  const getLocalDateString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [attendanceDate, setAttendanceDate] = useState(getLocalDateString());
  const [attendanceState, setAttendanceState] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false); // true if editing an existing date

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const res = await axios.get(`${API}/api/teacher/batches`, { headers });
      setBatches(res.data.data);
    } catch {
      setBatches([
        { _id: 'b1', name: 'CS101 - Morning', year: '1st Year', section: 'A' },
        { _id: 'b2', name: 'CS202 - Evening', year: '2nd Year', section: 'B' }
      ]);
      toast.error('Could not load classes. Using offline mode.');
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (selectedBatch && viewMode === 'take') fetchStudents(selectedBatch._id, attendanceDate);
  }, [selectedBatch, viewMode, attendanceDate]);

  const fetchStudents = async (batchId, date) => {
    try {
      setLoadingStudents(true);
      setExistingRecord(false);
      const studentRes = await axios.get(`${API}/api/teacher/batch/${batchId}`, { headers });
      const studentData = studentRes.data.data.studentIds || [];
      setStudents(studentData);

      // Check if attendance already exists for this date
      let savedRecords = [];
      try {
        const histRes = await axios.get(`${API}/api/teacher/attendance/${batchId}?date=${date}`, { headers });
        if (histRes.data.data && histRes.data.data.length > 0) {
          savedRecords = histRes.data.data[0].records;
          setExistingRecord(true);
        }
      } catch (err) {
        console.error("Could not fetch day history", err);
      }

      const init = {};
      studentData.forEach(s => {
        const existing = savedRecords.find(r => r.studentId?._id === s._id || r.studentId === s._id);
        init[s._id] = existing ? existing.status : 'Present';
      });
      setAttendanceState(init);
    } catch {
      setStudents(DUMMY_STUDENTS);
      const init = {};
      DUMMY_STUDENTS.forEach(s => { init[s._id] = 'Present'; });
      setAttendanceState(init);
      toast.error('Could not load students. Using demo data.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedBatch && (viewMode === 'history' || viewMode === 'grid')) fetchHistory(selectedBatch._id);
  }, [selectedBatch, viewMode]);

  const fetchHistory = async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/teacher/attendance/${batchId}`, { headers });
      setHistoryRecords(res.data.data);
    } catch {
      toast.error('Failed to load attendance history.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const submitAttendance = async () => {
    if (!selectedBatch) return;
    const records = students.map(s => ({ studentId: s._id, status: attendanceState[s._id] || 'Present' }));
    try {
      setSubmitting(true);
      await axios.post(`${API}/api/teacher/attendance`, { classId: selectedBatch._id, date: attendanceDate, records }, { headers });
      toast.success(existingRecord ? 'Attendance updated!' : 'Attendance saved!');
      setViewMode('history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a specific history date
  const editHistoryRecord = (record) => {
    const dateStr = record.date?.split('T')[0] || getLocalDateString();
    setAttendanceDate(dateStr);
    setSelectedHistory(null);
    setViewMode('take'); // This will trigger fetchStudents via useEffect
  };

  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'Late').length;
  const noClassCount = Object.values(attendanceState).filter(s => s === 'No Class').length;

  const setStudentStatus = (studentId, status) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newState = {};
    students.forEach(s => { newState[s._id] = 'Present'; });
    setAttendanceState(newState);
  };

  const markAllAbsent = () => {
    const newState = {};
    students.forEach(s => { newState[s._id] = 'Absent'; });
    setAttendanceState(newState);
  };

  const markAllNoClass = () => {
    const newState = {};
    students.forEach(s => { newState[s._id] = 'No Class'; });
    setAttendanceState(newState);
  };

  // Quick date helpers
  const shiftDate = (direction) => {
    const d = new Date(attendanceDate + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setAttendanceDate(d.toISOString().split('T')[0]);
  };

  const isToday = attendanceDate === getLocalDateString();
  const isPastDate = attendanceDate < getLocalDateString();
  const isFutureDate = attendanceDate > getLocalDateString();

  const friendlyDate = (() => {
    if (isToday) return 'Today';
    if (attendanceDate === getLocalDateString(-1)) return 'Yesterday';
    const d = new Date(attendanceDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  })();

  const statusConfig = {
    Present:    { label: 'Present',  short: 'P', icon: <FaCheckCircle />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' },
    Absent:     { label: 'Absent',   short: 'A', icon: <FaTimesCircle />, cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30' },
    Late:       { label: 'Late',     short: 'L', icon: <FaClock />,       cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' },
    'No Class': { label: 'No Class', short: 'N', icon: <FaBan />,         cls: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Toaster position="bottom-right" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedBatch && (
            <button
              onClick={() => { setSelectedBatch(null); setSelectedHistory(null); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <FaArrowLeft className="text-sm" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCalendarDay className="text-gray-400" />
              {selectedBatch ? selectedBatch.name : 'Attendance'}
            </h1>
            {selectedBatch && (
              <p className="text-sm text-gray-500 mt-0.5">{selectedBatch.year} · Section {selectedBatch.section}</p>
            )}
          </div>
        </div>

        {selectedBatch && (
          <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('take')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'take' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              <FaPen className="text-[10px]" /> Take / Edit
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'history' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              <FaHistory className="text-xs" /> History
            </button>
            <button
              onClick={() => { setViewMode('grid'); fetchHistory(selectedBatch._id); }}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              <FaTable className="text-xs" /> Register
            </button>
          </div>
        )}
      </div>

      {/* ── Batch Selection ── */}
      {!selectedBatch ? (
        <div>
          {loadingBatches ? (
            <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
          ) : batches.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
              <FaUsers className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No active classes found. Create one in <strong>Manage Batches</strong>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {batches.map((batch) => (
                <button
                  key={batch._id}
                  onClick={() => setSelectedBatch(batch)}
                  className="text-left p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 group transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{batch.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{batch.year} · Section {batch.section}</p>
                    </div>
                    <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 text-sm mt-0.5 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Take / Edit Attendance Mode ── */}
          {viewMode === 'take' && (
            <>
              {/* Date Navigator */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <button onClick={() => shiftDate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <div className="relative">
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <button onClick={() => shiftDate(1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <FaChevronRight className="text-xs" />
                  </button>
                  {!isToday && (
                    <button onClick={() => setAttendanceDate(getLocalDateString())}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                      Today
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{friendlyDate}</span>
                  {existingRecord && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                      <FaPen className="text-[8px]" /> Editing
                    </span>
                  )}
                  {isFutureDate && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                      <FaCalendarAlt className="text-[8px]" /> Scheduled
                    </span>
                  )}
                  {isPastDate && !existingRecord && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                      <FaInfoCircle className="text-[8px]" /> Backdated
                    </span>
                  )}
                </div>

                {/* Quick date buttons */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setAttendanceDate(getLocalDateString(-1))}
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${attendanceDate === getLocalDateString(-1) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    Yesterday
                  </button>
                  <button onClick={() => setAttendanceDate(getLocalDateString(-2))}
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${attendanceDate === getLocalDateString(-2) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    2 days ago
                  </button>
                  <button onClick={() => setAttendanceDate(getLocalDateString(-3))}
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${attendanceDate === getLocalDateString(-3) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    3 days ago
                  </button>
                </div>
              </div>

              {/* Summary Counters */}
              <div className="grid grid-cols-4 gap-3">
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Present</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-500 dark:text-red-400">{absentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Absent</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{lateCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Late</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">{noClassCount}</p>
                  <p className="text-xs text-gray-500 mt-1">No Class</p>
                </div>
              </div>

              {/* Student List */}
              {loadingStudents ? (
                <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                  <p className="text-gray-500 text-sm">No students enrolled in this batch yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">
                  {/* Action Bar */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.01]">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {students.length} Students
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllPresent}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors rounded-md text-xs font-semibold border border-emerald-200 dark:border-emerald-500/30"
                      >
                        <FaCheckCircle /> All Present
                      </button>
                      <button
                        onClick={markAllAbsent}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors rounded-md text-xs font-semibold border border-red-200 dark:border-red-500/30"
                      >
                        <FaTimesCircle /> All Absent
                      </button>
                      <button
                        onClick={markAllNoClass}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500/30 transition-colors rounded-md text-xs font-semibold border border-gray-300 dark:border-gray-500/30"
                      >
                        <FaBan /> No Class
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase w-12 text-center">S.No</th>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase">Student Name</th>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase text-center w-24">Present</th>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase text-center w-24">Absent</th>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase text-center w-24">Late</th>
                          <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase text-center w-24">No Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {students.map((student, idx) => {
                          const status = attendanceState[student._id] || 'Present';
                          return (
                            <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                              <td className="px-4 py-3 text-center text-xs font-medium text-gray-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-xs shrink-0 select-none">
                                    {student.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col min-w-[150px]">
                                    <span className="font-medium text-gray-900 dark:text-white truncate">{student.name}</span>
                                    <span className="text-[10px] text-gray-400 truncate">{student.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Present */}
                              <td className="px-4 py-3 text-center" onClick={() => setStudentStatus(student._id, 'Present')}>
                                <div className={`w-6 h-6 mx-auto rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                                  status === 'Present'
                                    ? 'bg-emerald-500 border-emerald-600 text-white scale-110'
                                    : 'bg-white border-gray-300 text-transparent hover:border-emerald-500 dark:bg-gray-800 dark:border-gray-600'
                                }`}>
                                  <FaCheckCircle className={status === 'Present' ? 'text-white' : 'opacity-0'} size={12} />
                                </div>
                              </td>

                              {/* Absent */}
                              <td className="px-4 py-3 text-center" onClick={() => setStudentStatus(student._id, 'Absent')}>
                                <div className={`w-6 h-6 mx-auto rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                                  status === 'Absent'
                                    ? 'bg-red-500 border-red-600 text-white scale-110'
                                    : 'bg-white border-gray-300 text-transparent hover:border-red-500 dark:bg-gray-800 dark:border-gray-600'
                                }`}>
                                  <FaTimesCircle className={status === 'Absent' ? 'text-white' : 'opacity-0'} size={12} />
                                </div>
                              </td>

                              {/* Late */}
                              <td className="px-4 py-3 text-center" onClick={() => setStudentStatus(student._id, 'Late')}>
                                <div className={`w-6 h-6 mx-auto rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                                  status === 'Late'
                                    ? 'bg-amber-500 border-amber-600 text-white scale-110'
                                    : 'bg-white border-gray-300 text-transparent hover:border-amber-500 dark:bg-gray-800 dark:border-gray-600'
                                }`}>
                                  <FaClock className={status === 'Late' ? 'text-white' : 'opacity-0'} size={12} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
                    <p className="text-xs text-gray-500">
                      {existingRecord ? (
                        <span className="flex items-center gap-1"><FaPen className="text-amber-500" /> Updating existing record for <strong>{friendlyDate}</strong></span>
                      ) : (
                        <span>Creating new record for <strong>{friendlyDate}</strong></span>
                      )}
                    </p>
                    <button
                      onClick={submitAttendance}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 shadow-lg shadow-gray-900/20 dark:bg-white dark:shadow-white/10 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {submitting ? 'Saving…' : existingRecord ? 'Update Attendance' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── History Mode ── */}
          {viewMode === 'history' && (
            <div className="space-y-4">
              {!selectedHistory ? (
                <>
                  <p className="text-sm text-gray-500">Past attendance records for this class. Click <strong>Edit</strong> to modify any record.</p>
                  {loadingStudents ? (
                    <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
                  ) : historyRecords.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                      <p className="text-gray-500 text-sm">No records yet. Take attendance first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {historyRecords.map(record => {
                        const d = new Date(record.date);
                        const presentN = record.records.filter(r => r.status === 'Present').length;
                        const totalN = record.records.length;
                        const pct = totalN > 0 ? Math.round(presentN / totalN * 100) : 0;
                        return (
                          <div
                            key={record._id}
                            className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20 group transition-all"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => editHistoryRecord(record)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                >
                                  <FaPen className="text-[8px]" /> Edit
                                </button>
                                <button
                                  onClick={() => setSelectedHistory(record)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3 text-gray-500">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{presentN} P</span>
                                <span className="text-red-500 font-semibold">{totalN - presentN} A</span>
                                <span>· {totalN} total</span>
                              </div>
                              <span className={`font-bold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>{pct}%</span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedHistory(null)}
                        className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                      >
                        <FaArrowLeft className="text-xs" /> Back
                      </button>
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedHistory.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h2>
                    </div>
                    <button
                      onClick={() => editHistoryRecord(selectedHistory)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      <FaPen className="text-[10px]" /> Edit Record
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['Present', 'Absent', 'Late'].map(stat => {
                      const count = selectedHistory.records.filter(r => r.status === stat).length;
                      const cfg = statusConfig[stat];
                      return (
                        <div key={stat} className={`border rounded-xl p-4 text-center ${cfg.cls}`}>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs mt-1 opacity-75">{stat}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {selectedHistory.records.map((record, i) => {
                        const cfg = statusConfig[record.status] || statusConfig['Present'];
                        return (
                          <div key={i} className="flex items-center justify-between px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{record.studentId?.name || 'Unknown'}</p>
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${cfg.cls}`}>
                              {cfg.icon} {record.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Grid / Register Mode ── */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Full attendance register for <strong>{selectedBatch.name}</strong>.</p>
              {loadingStudents ? (
                <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
              ) : (
                <AttendanceGrid records={historyRecords} students={students} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
