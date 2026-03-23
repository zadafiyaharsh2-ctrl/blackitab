import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FaCalendarDay, FaArrowLeft, FaSpinner, FaUsers,
  FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaTimesCircle, FaClock, FaBan,
} from "react-icons/fa";
import API from "../../config";
import AttendanceTakeView from "../../components/teacher/pages/attendance/AttendanceTakeView";
import AttendanceHistoryView from "../../components/teacher/pages/attendance/AttendanceHistoryView";

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [viewMode, setViewMode] = useState("take");
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query),
    );
  }, [students, searchQuery]);

  const getLocalDateString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };
  const [attendanceDate, setAttendanceDate] = useState(getLocalDateString());
  const [sessionType, setSessionType] = useState('Class');
  const [attendanceState, setAttendanceState] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false);

  const token = localStorage.getItem("token");
  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const normalizeStudent = useCallback((student) => {
    if (!student) return null;
    if (typeof student === "string") return { _id: student, name: "Unknown Student", email: "" };
    const id = student._id || student.id;
    if (!id) return null;
    return { _id: id, name: student.name || "Unknown Student", email: student.email || "" };
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const res = await axios.get(`${API}/api/teacher/batches`, { headers });
      setBatches(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Failed to load classes."); }
    finally { setLoadingBatches(false); }
  }, [headers]);

  const fetchStudents = useCallback(async (batchId, date, currentSessionType) => {
    try {
      setLoadingStudents(true);
      setExistingRecord(false);
      const studentRes = await axios.get(`${API}/api/teacher/batch/${batchId}`, { headers });
      const rawStudentData = Array.isArray(studentRes.data?.data?.studentIds) ? studentRes.data.data.studentIds : [];
      const studentData = rawStudentData.map(normalizeStudent).filter(Boolean);
      setStudents(studentData);

      let savedRecords = [];
      try {
        const histRes = await axios.get(`${API}/api/teacher/attendance/${batchId}?date=${date}&sessionType=${currentSessionType}`, { headers });
        if (histRes.data.data && histRes.data.data.length > 0) {
          savedRecords = histRes.data.data[0].records;
          setExistingRecord(true);
        }
      } catch (error) { /* No history for this date yet */ }

      const init = {};
      studentData.forEach((s) => {
        const existing = savedRecords.find((r) => {
          const recordStudentId = typeof r.studentId === "object" ? r.studentId?._id : r.studentId;
          return String(recordStudentId) === String(s._id);
        });
        init[s._id] = existing ? existing.status : "Present";
      });
      setAttendanceState(init);
    } catch { toast.error("Failed to load students."); }
    finally { setLoadingStudents(false); }
  }, [headers]);

  const fetchHistory = useCallback(async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/teacher/attendance/${batchId}`, { headers });
      setHistoryRecords(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Failed to load session logs."); }
    finally { setLoadingStudents(false); }
  }, [headers]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  useEffect(() => {
    if (selectedBatch) {
      if (viewMode === "take") fetchStudents(selectedBatch._id, attendanceDate, sessionType);
      if (viewMode === "history" || viewMode === "grid") fetchHistory(selectedBatch._id);
    }
  }, [selectedBatch, viewMode, attendanceDate, sessionType, fetchStudents, fetchHistory]);

  const submitAttendance = async () => {
    if (!selectedBatch) return;
    const records = students.map((s) => ({ studentId: s._id, status: attendanceState[s._id] || "Present" }));
    try {
      setSubmitting(true);
      await axios.post(`${API}/api/teacher/attendance`, { classId: selectedBatch._id, date: attendanceDate, sessionType, records }, { headers });
      toast.success(existingRecord ? "Attendance updated!" : "Attendance saved!");
      setViewMode("history");
    } catch (error) { toast.error(error.response?.data?.message || "Failed to submit attendance"); }
    finally { setSubmitting(false); }
  };

  const editHistoryRecord = (record) => {
    const dateStr = record.date?.split("T")[0] || getLocalDateString();
    setAttendanceDate(dateStr);
    setSessionType(record.sessionType || 'Class');
    setSelectedHistory(null);
    setViewMode("take");
  };

  const setStudentStatus = (studentId, status) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newState = {};
    students.forEach((s) => { newState[s._id] = "Present"; });
    setAttendanceState(newState);
  };

  const markAllAbsent = () => {
    const newState = {};
    students.forEach((s) => { newState[s._id] = "Absent"; });
    setAttendanceState(newState);
  };

  const shiftDate = (direction) => {
    const d = new Date(attendanceDate + "T00:00:00");
    d.setDate(d.getDate() + direction);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setAttendanceDate(d.toISOString().split("T")[0]);
  };

  const isToday = attendanceDate === getLocalDateString();
  const isPastDate = attendanceDate < getLocalDateString();
  const isFutureDate = attendanceDate > getLocalDateString();

  const friendlyDate = (() => {
    if (isToday) return "Today";
    if (attendanceDate === getLocalDateString(-1)) return "Yesterday";
    const d = new Date(attendanceDate + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  })();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] font-sans pb-24 transition-colors">
      {/* Header */}
      <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-6 sm:px-10 lg:px-14 max-w-[90rem] mx-auto border-b border-gray-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#0061FF]/3 to-transparent blur-[120px] pointer-events-none rounded-bl-full -z-10" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              {selectedBatch && (
                <button onClick={() => { setSelectedBatch(null); setSelectedHistory(null); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#0061FF] dark:hover:text-[#a5c3ff] hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm">
                  <FaArrowLeft className="text-sm" />
                </button>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full shadow-sm">
                <FaCalendarDay className="text-[#0061FF] dark:text-[#a5c3ff]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Attendance Tracker</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              {selectedBatch ? selectedBatch.name : "Attendance Register"}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-4">
              {selectedBatch ? `${selectedBatch.year} · Section ${selectedBatch.section}` : "Select a class to start taking attendance."}
            </p>
          </div>

          {selectedBatch && (
            <div className="flex bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1.5 shadow-sm">
              {["take", "history", "grid"].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${viewMode === mode ? "bg-[#0061FF] text-white shadow-md" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                  {mode === "take" ? "Take" : mode === "history" ? "History" : "Grid View"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-14 py-10">
        {!selectedBatch ? (
          <div>
            {loadingBatches ? (
              <div className="flex justify-center py-24"><FaSpinner className="animate-spin text-3xl text-[#0061FF]/40" /></div>
            ) : batches.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem]">
                <FaUsers className="text-5xl text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-medium tracking-tight">No active classes found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <button key={batch._id} onClick={() => setSelectedBatch(batch)}
                    className="text-left p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#0061FF]/40 dark:hover:border-[#a5c3ff]/40 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{batch.name}</h3>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{batch.year} · Sec {batch.section}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:bg-[#0061FF]/5 dark:group-hover:bg-[#a5c3ff]/10 transition-colors">
                        <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] text-xs transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === "take" ? (
              <AttendanceTakeView
                students={filteredStudents} attendanceState={attendanceState}
                setStudentStatus={setStudentStatus} attendanceDate={attendanceDate}
                setAttendanceDate={setAttendanceDate} sessionType={sessionType}
                setSessionType={setSessionType} existingRecord={existingRecord}
                submitting={submitting} submitAttendance={submitAttendance}
                loadingStudents={loadingStudents} shiftDate={shiftDate}
                isToday={isToday} isPastDate={isPastDate} isFutureDate={isFutureDate}
                friendlyDate={friendlyDate} getLocalDateString={getLocalDateString}
                markAllPresent={markAllPresent} markAllAbsent={markAllAbsent}
              />
            ) : (
              <AttendanceHistoryView
                viewMode={viewMode} historyRecords={historyRecords}
                loadingStudents={loadingStudents} selectedHistory={selectedHistory}
                setSelectedHistory={setSelectedHistory} editHistoryRecord={editHistoryRecord}
                students={students}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
