import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  FaCalendarDay,
  FaSave, FaHistory, FaArrowLeft, FaSpinner, FaSearch, FaUsers, FaDownload
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import API from '../../config';

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  
  // View states
  const [viewMode, setViewMode] = useState('take'); // 'take' | 'logs'
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Date handling
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const [attendanceDate, setAttendanceDate] = useState(getLocalDateString());
  
  // Data states
  const [attendanceState, setAttendanceState] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}` } : {}
  ), [token]);

  const toLocalDateInputValue = useCallback((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return getLocalDateString();
    parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
    return parsed.toISOString().split('T')[0];
  }, []);

  const normalizeStudent = useCallback((student) => {
    if (!student) return null;
    if (typeof student === 'string') {
      return { _id: student, name: 'Unknown Student', email: '' };
    }

    const id = student._id || student.id;
    if (!id) return null;

    return {
      _id: id,
      name: student.name || 'Unknown Student',
      email: student.email || ''
    };
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const res = await axios.get(`${API}/api/teacher/batches`, { headers });
      const batchData = Array.isArray(res.data?.data) ? res.data.data : [];
      setBatches(batchData);
    } catch {
      toast.error('Failed to load classes.');
    } finally {
      setLoadingBatches(false);
    }
  }, [headers]);

  const fetchStudents = useCallback(async (batchId, date) => {
    try {
      setLoadingStudents(true);
      const studentRes = await axios.get(`${API}/api/teacher/batch/${batchId}`, { headers });
      const rawStudentData = Array.isArray(studentRes.data?.data?.studentIds) ? studentRes.data.data.studentIds : [];
      const studentData = rawStudentData.map(normalizeStudent).filter(Boolean);
      setStudents(studentData);

      let savedRecords = [];
      try {
        const histRes = await axios.get(`${API}/api/teacher/attendance/${batchId}?date=${date}`, { headers });
        if (Array.isArray(histRes.data?.data) && histRes.data.data.length > 0) {
          savedRecords = Array.isArray(histRes.data.data[0].records) ? histRes.data.data[0].records : [];
        }
      } catch {
        // No history for this date yet, which is fine.
      }

      // Initialize state: use saved record if exists, otherwise default to Present
      const init = {};
      studentData.forEach((s) => {
        const existing = savedRecords.find((r) => {
          const recordStudentId = typeof r.studentId === 'object' ? r.studentId?._id : r.studentId;
          return String(recordStudentId) === String(s._id);
        });
        init[s._id] = existing ? existing.status : 'Present';
      });
      setAttendanceState(init);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoadingStudents(false);
    }
  }, [headers, normalizeStudent]);

  const fetchHistory = useCallback(async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/teacher/attendance/${batchId}`, { headers });
      const history = Array.isArray(res.data?.data) ? res.data.data : [];
      setHistoryRecords(history);
    } catch {
      toast.error('Failed to load session logs.');
    } finally {
      setLoadingStudents(false);
    }
  }, [headers]);

  // Initial load
  useEffect(() => { 
    fetchBatches(); 
  }, [fetchBatches]);

  // Fetch data based on mode and batch selection
  useEffect(() => {
    if (selectedBatch) {
      if (viewMode === 'take') fetchStudents(selectedBatch._id, attendanceDate);
      if (viewMode === 'logs') fetchHistory(selectedBatch._id);
    }
  }, [selectedBatch, viewMode, attendanceDate, fetchStudents, fetchHistory]);

  const submitAttendance = async () => {
    if (!selectedBatch) return;
    const records = students.map(s => ({ studentId: s._id, status: attendanceState[s._id] || 'Present' }));
    
    try {
      setSubmitting(true);
      await axios.post(`${API}/api/teacher/attendance`, { 
        classId: selectedBatch._id, 
        date: attendanceDate, 
        records 
      }, { headers });
      
      toast.success('Attendance saved successfully!');
      setViewMode('logs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // --- MACROS ---
  const markAll = (status) => {
    const newState = {};
    students.forEach(s => newState[s._id] = status);
    setAttendanceState(newState);
  };

  // --- FILTERING ---
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'Late').length;
  const selectedLogRecords = Array.isArray(selectedLog?.records) ? selectedLog.records : [];

  const getStatusPillClass = (status) => {
    if (status === 'Present') return 'border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400';
    if (status === 'Absent') return 'border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-400';
    return 'border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400';
  };

  const downloadAttendanceExcel = useCallback((record) => {
    const rows = Array.isArray(record?.records) ? record.records : [];

    if (rows.length === 0) {
      toast.error('No attendance rows available to export.');
      return;
    }

    const present = rows.filter((r) => r.status === 'Present').length;
    const absent = rows.filter((r) => r.status === 'Absent').length;
    const late = rows.filter((r) => r.status === 'Late').length;
    const dateLabel = new Date(record.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const localDate = toLocalDateInputValue(record.date);

    const safeBatchName = (selectedBatch?.name || 'Class')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, '_');

    const attendanceRows = rows.map((entry, index) => {
      const studentName = typeof entry.studentId === 'object'
        ? (entry.studentId?.name || 'Unknown Student')
        : 'Unknown Student';

      const email = typeof entry.studentId === 'object'
        ? (entry.studentId?.email || '')
        : '';

      return {
        'S.No': index + 1,
        'Student Name': studentName,
        Email: email,
        Status: entry.status || 'Unknown'
      };
    });

    const summaryRows = [{
      Class: selectedBatch?.name || 'Class',
      Year: selectedBatch?.year || '',
      Section: selectedBatch?.section || '',
      Date: dateLabel,
      'Total Students': rows.length,
      Present: present,
      Absent: absent,
      Late: late,
      'Attendance %': rows.length > 0 ? `${Math.round((present / rows.length) * 100)}%` : '0%'
    }];

    const workbook = XLSX.utils.book_new();
    const attendanceSheet = XLSX.utils.json_to_sheet(attendanceRows);
    attendanceSheet['!cols'] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 30 },
      { wch: 14 }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [
      { wch: 26 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 14 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
    XLSX.writeFile(workbook, `${safeBatchName}_attendance_${localDate}.xlsx`);

    toast.success('Attendance downloaded as Excel.');
  }, [selectedBatch, toLocalDateInputValue]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
      <Toaster position="bottom-right" />

      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {selectedBatch && (
                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setSelectedLog(null);
                  }}
                  className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <FaArrowLeft className="text-sm" />
                </button>
              )}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaCalendarDay className="text-gray-400" />
                {selectedBatch ? selectedBatch.name : 'Attendance'}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selectedBatch ? `${selectedBatch.year} · Section ${selectedBatch.section}` : 'Select a class to start taking attendance.'}
            </p>
          </div>

          {selectedBatch && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setViewMode('take');
                    setSelectedLog(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium ${viewMode === 'take' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Take
                </button>
                <button
                  onClick={() => {
                    setViewMode('logs');
                    setSelectedLog(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium ${viewMode === 'logs' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Logs
                </button>
              </div>
              {viewMode === 'take' && (
                <input
                  type="date"
                  value={attendanceDate}
                  max={getLocalDateString()}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-white/[0.02] text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedBatch ? (
        loadingBatches ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
        ) : batches.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
            <FaUsers className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No classes assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map(batch => (
              <button
                key={batch._id}
                onClick={() => setSelectedBatch(batch)}
                className="text-left border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{batch.name}</p>
                <p className="text-xs text-gray-500 mt-1">{batch.year} · Section {batch.section}</p>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {viewMode === 'take' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Present</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Absent</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center">
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{lateCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Late</p>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="relative w-full lg:max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/[0.02] text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => markAll('Present')}
                      className="flex-1 lg:flex-none px-3 py-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => markAll('Absent')}
                      className="flex-1 lg:flex-none px-3 py-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Mark All Absent
                    </button>
                  </div>

                  <button
                    onClick={submitAttendance}
                    disabled={submitting}
                    className="w-full lg:w-auto lg:ml-auto px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaSave className="text-xs" />}
                    Save Attendance
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Roster</p>
                </div>

                {loadingStudents ? (
                  <div className="py-16 text-center"><FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" /></div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">No students found in this roster.</div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-white/10 max-h-[560px] overflow-y-auto custom-scrollbar">
                    {filteredStudents.map((student, index) => {
                      const status = attendanceState[student._id] || 'Present';
                      return (
                        <div key={student._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {index + 1}. {student.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{student.email || 'No email'}</p>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => setAttendanceState(prev => ({ ...prev, [student._id]: 'Present' }))}
                              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs border rounded-md transition-colors ${status === 'Present' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => setAttendanceState(prev => ({ ...prev, [student._id]: 'Absent' }))}
                              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs border rounded-md transition-colors ${status === 'Absent' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => setAttendanceState(prev => ({ ...prev, [student._id]: 'Late' }))}
                              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs border rounded-md transition-colors ${status === 'Late' ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                              Late
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] min-h-[420px]">
              {!selectedLog ? (
                <>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FaHistory className="text-gray-400" /> Attendance Logs
                  </h2>

                  {loadingStudents ? (
                    <div className="py-14 text-center"><FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" /></div>
                  ) : historyRecords.length === 0 ? (
                    <div className="py-14 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                      <FaHistory className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No past attendance records found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-white/10">
                      {historyRecords.map(record => {
                        const recordRows = Array.isArray(record.records) ? record.records : [];
                        const present = recordRows.filter(r => r.status === 'Present').length;
                        const absent = recordRows.filter(r => r.status === 'Absent').length;
                        const late = recordRows.filter(r => r.status === 'Late').length;
                        const total = recordRows.length;
                        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

                        return (
                          <div
                            key={record._id}
                            className="px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <button
                                onClick={() => setSelectedLog(record)}
                                className="text-left flex-1 min-w-0"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Present {present} · Absent {absent} · Late {late}
                                    </p>
                                  </div>

                                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusPillClass(
                                    percentage >= 75 ? 'Present' : percentage >= 50 ? 'Late' : 'Absent'
                                  )}`}>
                                    {percentage}%
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={() => downloadAttendanceExcel(record)}
                                className="shrink-0 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-white/10 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5"
                              >
                                <FaDownload className="text-[10px]" /> Excel
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div>
                      <button
                        onClick={() => setSelectedLog(null)}
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1.5 mb-2"
                      >
                        <FaArrowLeft /> Back to Logs
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadAttendanceExcel(selectedLog)}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5"
                      >
                        <FaDownload className="text-xs" /> Download Excel
                      </button>

                      <button
                        onClick={() => {
                          setAttendanceDate(toLocalDateInputValue(selectedLog.date));
                          setViewMode('take');
                          setSelectedLog(null);
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        Edit This Session
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['Present', 'Absent', 'Late'].map(status => {
                      const count = selectedLogRecords.filter(r => r.status === status).length;
                      return (
                        <div key={status} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center bg-white dark:bg-white/[0.02]">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                          <p className="text-xs text-gray-500 mt-1">{status}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider font-semibold text-gray-500">
                      <p className="col-span-5">Student</p>
                      <p className="col-span-4">Email</p>
                      <p className="col-span-3 text-right">Status</p>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-white/10 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {selectedLogRecords.map((record, index) => {
                        return (
                          <div key={`${record.studentId?._id || 'row'}-${index}`} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                            <p className="col-span-5 font-medium text-gray-900 dark:text-white truncate">
                              {index + 1}. {record.studentId?.name || 'Unknown Student'}
                            </p>
                            <p className="col-span-4 text-gray-500 truncate">{record.studentId?.email || 'No email'}</p>
                            <div className="col-span-3 flex justify-end">
                              <span className={`px-2 py-0.5 text-xs rounded-md border font-medium ${getStatusPillClass(record.status)}`}>
                                {record.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}