import React, { useState, useEffect, useMemo, useCallback } from "react";
// import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FaCalendarDay,
  FaSave,
  FaHistory,
  FaArrowLeft,
  FaSpinner,
  FaSearch,
  FaUsers,
  FaDownload,
  FaTable,
  FaPen,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaInfoCircle,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import API from "../../config";
import AttendanceGrid from "../../components/shared/AttendanceGrid";

const DUMMY_STUDENTS = [
  { _id: "s1", name: "Alice Walker", email: "alice@example.com" },
  { _id: "s2", name: "Bob Smith", email: "bob@example.com" },
  { _id: "s3", name: "Charlie Davis", email: "charlie@example.com" },
];

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);

  // View states
  const [viewMode, setViewMode] = useState("take"); // 'take' | 'history' | 'grid'
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

  // Date handling
  const getLocalDateString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };
  const [attendanceDate, setAttendanceDate] = useState(getLocalDateString());
  const [sessionType, setSessionType] = useState('Class');

  // Data states
  const [attendanceState, setAttendanceState] = useState({});
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false); // true if editing an existing date

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const toLocalDateInputValue = useCallback((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return getLocalDateString();
    parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
    return parsed.toISOString().split("T")[0];
  }, []);

  const normalizeStudent = useCallback((student) => {
    if (!student) return null;
    if (typeof student === "string") {
      return { _id: student, name: "Unknown Student", email: "" };
    }

    const id = student._id || student.id;
    if (!id) return null;

    return {
      _id: id,
      name: student.name || "Unknown Student",
      email: student.email || "",
    };
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const res = await axios.get(`${API}/api/teacher/batches`, { headers });
      const batchData = Array.isArray(res.data?.data) ? res.data.data : [];
      setBatches(batchData);
    } catch {
      toast.error("Failed to load classes.");
    } finally {
      setLoadingBatches(false);
    }
  }, [headers]);

  const fetchStudents = useCallback(
    async (batchId, date, currentSessionType) => {
      try {
        setLoadingStudents(true);
        setExistingRecord(false);
        const studentRes = await axios.get(
          `${API}/api/teacher/batch/${batchId}`,
          { headers },
        );
        const rawStudentData = Array.isArray(studentRes.data?.data?.studentIds)
          ? studentRes.data.data.studentIds
          : [];
        const studentData = rawStudentData
          .map(normalizeStudent)
          .filter(Boolean);
        setStudents(studentData);

        // Check if attendance already exists for this date and session type
        let savedRecords = [];
        try {
          const histRes = await axios.get(
            `${API}/api/teacher/attendance/${batchId}?date=${date}&sessionType=${currentSessionType}`,
            { headers },
          );
          if (histRes.data.data && histRes.data.data.length > 0) {
            savedRecords = histRes.data.data[0].records;
            setExistingRecord(true);
          }
        } catch (error) {
          // No history for this date yet, which is fine.
        }

        // Initialize state: use saved record if exists, otherwise default to Present
        const init = {};
        studentData.forEach((s) => {
          const existing = savedRecords.find((r) => {
            const recordStudentId =
              typeof r.studentId === "object" ? r.studentId?._id : r.studentId;
            return String(recordStudentId) === String(s._id);
          });
          init[s._id] = existing ? existing.status : "Present";
        });
        setAttendanceState(init);
      } catch (error) {
        toast.error("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    },
    [headers],
  );

  useEffect(() => {
    if (selectedBatch && (viewMode === "history" || viewMode === "grid"))
      fetchHistory(selectedBatch._id);
  }, [selectedBatch, viewMode]);

  const getStatusPillClass = (status) => {
    switch (status) {
      case "Present":
        return "border-emerald-500 bg-emerald-100 text-emerald-700";
      case "Absent":
        return "border-red-500 bg-red-100 text-red-700";
      case "Late":
        return "border-amber-500 bg-amber-100 text-amber-700";
      case "No Class":
        return "border-gray-500 bg-gray-100 text-gray-700";
      default:
        return "border-gray-300 bg-gray-50 text-gray-600";
    }
  };

  const fetchHistory = useCallback(
    async (batchId) => {
      try {
        setLoadingStudents(true);
        const res = await axios.get(
          `${API}/api/teacher/attendance/${batchId}`,
          { headers },
        );
        const history = Array.isArray(res.data?.data) ? res.data.data : [];
        setHistoryRecords(history);
      } catch (error) {
        toast.error("Failed to load session logs.");
      } finally {
        setLoadingStudents(false);
      }
    },
    [headers],
  );

  // Initial load
  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Fetch data based on mode and batch selection
  useEffect(() => {
    if (selectedBatch) {
      if (viewMode === "take") fetchStudents(selectedBatch._id, attendanceDate, sessionType);
      if (viewMode === "history") fetchHistory(selectedBatch._id);
    }
  }, [selectedBatch, viewMode, attendanceDate, sessionType, fetchStudents, fetchHistory]);

  const submitAttendance = async () => {
    if (!selectedBatch) return;
    const records = students.map((s) => ({
      studentId: s._id,
      status: attendanceState[s._id] || "Present",
    }));

    try {
      setSubmitting(true);
      await axios.post(
        `${API}/api/teacher/attendance`,
        { classId: selectedBatch._id, date: attendanceDate, sessionType, records },
        { headers },
      );
      toast.success(
        existingRecord ? "Attendance updated!" : "Attendance saved!",
      );
      setViewMode("history");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit attendance",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a specific history date
  const editHistoryRecord = (record) => {
    const dateStr = record.date?.split("T")[0] || getLocalDateString();
    setAttendanceDate(dateStr);
    setSessionType(record.sessionType || 'Class');
    setSelectedHistory(null);
    setViewMode("take"); // This will trigger fetchStudents via useEffect
  };

  const presentCount = Object.values(attendanceState).filter(
    (s) => s === "Present",
  ).length;
  const absentCount = Object.values(attendanceState).filter(
    (s) => s === "Absent",
  ).length;
  const lateCount = Object.values(attendanceState).filter(
    (s) => s === "Late",
  ).length;
  const noClassCount = Object.values(attendanceState).filter(
    (s) => s === "No Class",
  ).length;

  const setStudentStatus = (studentId, status) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newState = {};
    students.forEach((s) => {
      newState[s._id] = "Present";
    });
    setAttendanceState(newState);
  };

  const markAllAbsent = () => {
    const newState = {};
    students.forEach((s) => {
      newState[s._id] = "Absent";
    });
    setAttendanceState(newState);
  };

  const markAllNoClass = () => {
    const newState = {};
    students.forEach((s) => {
      newState[s._id] = "No Class";
    });
    setAttendanceState(newState);
  };

  // Quick date helpers
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
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  })();

  const statusConfig = {
    Present: {
      label: "Present",
      short: "P",
      icon: <FaCheckCircle />,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    },
    Absent: {
      label: "Absent",
      short: "A",
      icon: <FaTimesCircle />,
      cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    },
    Late: {
      label: "Late",
      short: "L",
      icon: <FaClock />,
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    },
    "No Class": {
      label: "No Class",
      short: "N",
      icon: <FaBan />,
      cls: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30",
    },
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] font-sans pb-24 transition-colors">


      {/* Editorial Header Array */}
      <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-6 sm:px-10 lg:px-14 max-w-[90rem] mx-auto border-b border-gray-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#0061FF]/3 to-transparent blur-[120px] pointer-events-none rounded-bl-full -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              {selectedBatch && (
                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setSelectedHistory(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#0061FF] dark:hover:text-[#a5c3ff] hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm"
                >
                  <FaArrowLeft className="text-sm" />
                </button>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full shadow-sm">
                <FaCalendarDay className="text-[#0061FF] dark:text-[#a5c3ff]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  Attendance Tracker
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              {selectedBatch ? selectedBatch.name : "Attendance Register"}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-4">
              {selectedBatch
                ? `${selectedBatch.year} · Section ${selectedBatch.section}`
                : "Select a class to start taking attendance."}
            </p>
          </div>

          {selectedBatch && (
            <div className="flex bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setViewMode("take")}
                className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${viewMode === "take" ? "bg-[#0061FF] text-white shadow-md" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Take
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${viewMode === "history" ? "bg-[#0061FF] text-white shadow-md" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                History
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${viewMode === "grid" ? "bg-[#0061FF] text-white shadow-md" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Grid View
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-14 py-10">
        {!selectedBatch ? (
          <div>
            {loadingBatches ? (
              <div className="flex justify-center py-24">
                <FaSpinner className="animate-spin text-3xl text-[#0061FF]/40" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem]">
                <FaUsers className="text-5xl text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-medium tracking-tight">No active classes found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <button
                    key={batch._id}
                    onClick={() => setSelectedBatch(batch)}
                    className="text-left p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#0061FF]/40 dark:hover:border-[#a5c3ff]/40 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">
                          {batch.name}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                          {batch.year} · Sec {batch.section}
                        </p>
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
            {/* ── Take / Edit Attendance Mode ── */}
            {viewMode === "take" ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Left Column (3/4): Main Roster */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Date Strip */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => shiftDate(-1)}
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <FaChevronLeft className="text-xs" />
                      </button>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="text-sm font-bold border-none bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer"
                      />
                      <button
                        onClick={() => shiftDate(1)}
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <FaChevronRight className="text-xs" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {existingRecord ? (
                        <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-500/20 flex items-center gap-1.5">
                          <FaPen className="text-[10px]" /> Editing Record
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#0061FF]/10 text-[#0061FF] dark:text-[#a5c3ff] text-[11px] font-bold uppercase tracking-widest border border-[#0061FF]/20 flex items-center gap-1.5">
                          New Record
                        </span>
                      )}
                      
                      <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />
                      
                      <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{friendlyDate}</span>
                    </div>
                  </div>

                  {/* Student List Container */}
                  <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
                    <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-[#f8f9fa]/50 dark:bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        Roster • {students.length} Students
                      </p>
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
                        <div className="py-24 text-center">
                          <FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" />
                        </div>
                      ) : students.length === 0 ? (
                        <div className="py-24 text-center text-sm font-medium text-gray-500">
                          No students enrolled.
                        </div>
                      ) : (
                        students.map((student, idx) => {
                          const status = attendanceState[student._id] || "Present";
                          return (
                            <div key={student._id} className="p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                              <div className="flex items-center gap-4 min-w-0 pr-4">
                                <span className="text-[11px] font-bold text-gray-400 w-4 text-right shrink-0">{idx + 1}</span>
                                <div className="min-w-0">
                                  <p className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight truncate">
                                    {student.name}
                                  </p>
                                  <p className="text-[11px] font-medium text-gray-500 truncate">
                                    {student.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 w-full sm:w-auto overflow-x-auto shadow-sm rounded-full">
                                <div className="flex items-center bg-[#f8f9fa] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1 min-w-0 w-full">
                                  {["Present", "Absent", "Late", "No Class"].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => setStudentStatus(student._id, opt)}
                                      className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${status === opt 
                                        ? (opt === 'Present' ? 'bg-[#0061FF] text-white shadow-sm' 
                                          : opt === 'Absent' ? 'bg-red-500 text-white shadow-sm' 
                                          : opt === 'Late' ? 'bg-amber-500 text-white shadow-sm' 
                                          : 'bg-gray-600 text-white shadow-sm')
                                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                                    >
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
                  {/* Summary Block */}
                  <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Snapshot</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Present</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{presentCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Absent</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{absentCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Late</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{lateCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Block */}
                  <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm text-center">
                    <p className="text-[12px] font-medium text-gray-500 mb-6 leading-relaxed">
                      {existingRecord ? "You are updating a previously saved attendance block." : "You are submitting a new block for the active date."}
                    </p>
                    <button
                      onClick={submitAttendance}
                      disabled={submitting}
                      className="w-full py-4 bg-[#0061FF] dark:bg-[#0061FF] text-white rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {submitting ? "Saving Data..." : existingRecord ? "Update Register" : "Save Register"}
                    </button>
                  </div>
                </div>

              </div>
            ) : viewMode === "history" ? (
              <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm min-h-[500px]">
                 {!selectedHistory ? (
                  <>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Past Records</h3>
                    {loadingStudents ? (
                      <div className="py-24 text-center">
                        <FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" />
                      </div>
                    ) : historyRecords.length === 0 ? (
                      <div className="py-24 text-center text-sm font-medium text-gray-500">
                        No past attendance data available.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historyRecords.map((record) => {
                          const d = new Date(record.date);
                          const presentN = record.records.filter((r) => r.status === "Present").length;
                          const totalN = record.records.length;
                          const pct = totalN > 0 ? Math.round((presentN / totalN) * 100) : 0;
                          
                          return (
                            <div key={record._id} className="p-6 rounded-[1.5rem] border border-gray-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-white/5 group hover:border-[#0061FF]/40 transition-all">
                              <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">
                                {d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                              </p>
                              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3">
                                <span>{presentN} / {totalN} Present</span>
                                <span className={pct >= 75 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500"}>{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-black rounded-full h-1.5 mb-6">
                                <div className={`h-full rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
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
                        {new Date(selectedHistory.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </h2>
                      
                      {/* Summary Bubbles */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {["Present", "Absent", "Late", "No Class"].map((stat) => {
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
                                {index + 1}. {record.studentId?.name || "Unknown"}
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
            ) : (
              <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm bg-white dark:bg-white/[0.02]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Attendance Grid</p>
                {loadingStudents ? (
                  <div className="py-24 text-center">
                    <FaSpinner className="animate-spin text-3xl text-[#0061FF]/40 mx-auto" />
                  </div>
                ) : (
                  <AttendanceGrid records={historyRecords} students={students} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
