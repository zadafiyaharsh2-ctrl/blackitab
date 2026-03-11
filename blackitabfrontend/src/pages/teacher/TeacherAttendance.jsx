import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarDay,
  FaSave, FaHistory, FaArrowLeft, FaSpinner, FaChevronRight, FaUsers
} from 'react-icons/fa';
import API from '../../config';

const DUMMY_STUDENTS = [
  { _id: 's1', name: 'Alice Walker', email: 'alice@example.com' },
  { _id: 's2', name: 'Bob Smith', email: 'bob@example.com' },
  { _id: 's3', name: 'Charlie Davis', email: 'charlie@example.com' },
];

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [viewMode, setViewMode] = useState('take');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      // Fetch students for the batch
      const studentRes = await axios.get(`${API}/api/teacher/batch/${batchId}`, { headers });
      const studentData = studentRes.data.data.studentIds || [];
      setStudents(studentData);

      // Also check if attendance already exists for this exact date to pre-fill it
      let savedRecords = [];
      try {
        const histRes = await axios.get(`${API}/api/teacher/attendance/${batchId}?date=${date}`, { headers });
        if (histRes.data.data && histRes.data.data.length > 0) {
          savedRecords = histRes.data.data[0].records;
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
    if (selectedBatch && viewMode === 'history') fetchHistory(selectedBatch._id);
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
      toast.success('Attendance saved!');
      setViewMode('history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'Late').length;

  // ── Status pill cycling: Present → Absent → Late → Present
  const cycleStatus = (studentId) => {
    setAttendanceState(prev => {
      const cur = prev[studentId] || 'Present';
      const next = cur === 'Present' ? 'Absent' : cur === 'Absent' ? 'Late' : 'Present';
      return { ...prev, [studentId]: next };
    });
  };

  const statusConfig = {
    Present: { label: 'Present', icon: <FaCheckCircle />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' },
    Absent:  { label: 'Absent',  icon: <FaTimesCircle />, cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30' },
    Late:    { label: 'Late',    icon: <FaClock />,       cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' },
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
          <div className="flex items-center gap-3">
            {viewMode === 'take' && (
              <input
                type="date"
                value={attendanceDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            )}
            <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('take')}
                className={`px-4 py-2 text-sm font-medium ${viewMode === 'take' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                Take
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'history' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <FaHistory className="text-xs" /> History
              </button>
            </div>
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
                  className="text-left p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{batch.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{batch.year} · Section {batch.section}</p>
                    </div>
                    <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 text-sm mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Take Attendance Mode ── */}
          {viewMode === 'take' && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
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
              </div>

              {/* Student List */}
              {loadingStudents ? (
                <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-gray-400" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                  <p className="text-gray-500 text-sm">No students enrolled in this batch yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{students.length} Students · Tap status to toggle</p>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FaCheckCircle className="text-emerald-500" /> P</span>
                      <span className="flex items-center gap-1"><FaTimesCircle className="text-red-500" /> A</span>
                      <span className="flex items-center gap-1"><FaClock className="text-amber-500" /> L</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {students.map((student, idx) => {
                      const status = attendanceState[student._id] || 'Present';
                      const cfg = statusConfig[status];
                      return (
                        <div key={student._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-sm shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">{student.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => cycleStatus(student._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.cls}`}
                          >
                            {cfg.icon} {cfg.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <button
                      onClick={submitAttendance}
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {submitting ? 'Saving…' : 'Save Attendance'}
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
                  <p className="text-sm text-gray-500">Past attendance records for this class.</p>
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
                        return (
                          <button
                            key={record._id}
                            onClick={() => setSelectedHistory(record)}
                            className="text-left p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20 group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 text-xs" />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{presentN} Present</span>
                              <span>· {record.records.length} total</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
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
        </div>
      )}
    </div>
  );
}
