import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaCalendarDay, FaUsers, FaCheck, FaTimes, FaClock, FaTable, FaChartBar } from 'react-icons/fa';
import PageShimmer from '../../components/shared/PageShimmer';
import AttendanceGrid from '../../components/shared/AttendanceGrid';

const HodAttendanceView = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [studentAnalytics, setStudentAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'grid'

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/department/batches').catch(() => ({ data: { success: true, data: [] } }));
      if (res.data.success) {
        const mappedBatches = res.data.data.map(b => ({
          ...b,
          teacherName: b.teacherIds?.map(t => t.name).join(', ') || 'No Teacher',
        }));
        setBatches(mappedBatches);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAttendance = async (batchId) => {
    try {
      setLoadingAttendance(true);
      setSelectedBatch(batchId);
      setAttendance([]);
      setBatchStudents([]);
      setStudentAnalytics([]);

      const [historyRes, analyticsRes, batchRes] = await Promise.all([
        api.get(`/teacher/attendance/${batchId}`).catch(() => ({ data: { success: true, data: [] } })),
        api.get(`/teacher/attendance/${batchId}/analytics`).catch(() => ({ data: { success: true, data: [] } })),
        api.get(`/teacher/batch/${batchId}`).catch(() => ({ data: { success: true, data: { studentIds: [] } } }))
      ]);

      if (historyRes.data.success) setAttendance(historyRes.data.data || []);
      const students = batchRes.data?.success ? (batchRes.data?.data?.studentIds || []) : [];
      const analytics = analyticsRes.data?.success ? (analyticsRes.data?.data || []) : [];

      setBatchStudents(students);

      const keyOf = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val._id || val.toString?.() || '';
      };

      const analyticsMap = new Map(
        analytics.map((item) => [keyOf(item.studentId || item._id), item])
      );

      const merged = students.map((student, index) => {
        const sid = keyOf(student?._id || student);
        const stat = analyticsMap.get(sid);
        return {
          _id: sid || index,
          studentId: sid || index,
          studentName: student?.name || stat?.studentName || 'Unknown Student',
          studentEmail: student?.email || stat?.studentEmail || 'No email',
          presentCount: stat?.presentCount || 0,
          absentCount: stat?.absentCount || 0,
          lateCount: stat?.lateCount || 0,
          totalClasses: stat?.totalClasses || 0,
          attendancePercentage: typeof stat?.attendancePercentage === 'number' ? stat.attendancePercentage : 0
        };
      });

      if (merged.length > 0) {
        setStudentAnalytics(merged);
      } else {
        setStudentAnalytics(analytics);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingAttendance(false); }
  };

  if (loading) return <PageShimmer variant="table" />;

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[150px] mix-blend-screen" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-transparent dark:border-indigo-500/30">
              <FaCalendarDay className="text-3xl text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Department Attendance</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View attendance records across department batches</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Batch List */}
          <div className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:col-span-1 max-h-[70vh] overflow-y-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Batches / Classes</h3>
            {batches.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No batches found in department</p>
            ) : batches.map(batch => (
              <button key={batch._id} onClick={() => fetchAttendance(batch._id)}
                className={`w-full text-left p-4 rounded-xl mb-2 border transition-all ${selectedBatch === batch._id
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
              >
                <div className="font-bold text-sm">{batch.name || batch.batchName || 'Unnamed Batch'}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <FaUsers className="text-[10px]" /> {batch.studentCount ?? batch.studentIds?.length ?? batch.students?.length ?? 0} students
                </div>
                {batch.teacherName && <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Teacher: {batch.teacherName}</div>}
              </button>
            ))}
          </div>

          {/* Attendance Records */}
          <div className="md:col-span-2 glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            {!selectedBatch ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <FaCalendarDay className="text-5xl text-gray-300 dark:text-gray-600 mb-4" />
                <p className="font-medium">Select a batch to view attendance records</p>
              </div>
            ) : loadingAttendance ? (
              <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
            ) : (
              <div className="space-y-4">
                {/* View toggle */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Attendance Data</h3>
                  <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode('summary')}
                      className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${viewMode === 'summary' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                      <FaChartBar /> Summary
                    </button>
                    <button onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                      <FaTable /> Register
                    </button>
                  </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' ? (
                  <AttendanceGrid records={attendance} students={batchStudents} />
                ) : (
                  <>
                {studentAnalytics.length > 0 && (
                  <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                    <h4 className="text-sm font-bold mb-3">Student Attendance Overview</h4>
                    {batchStudents.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">Enrolled Students: {batchStudents.length}</p>
                    )}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {studentAnalytics.map((student, idx) => {
                        const percentage = Math.round(student.attendancePercentage || 0);
                        return (
                          <div key={student.studentId || student._id || idx} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">{student.studentName || 'Unknown Student'}</p>
                                <p className="text-xs text-gray-500">{student.studentEmail || 'No email'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</p>
                                <p className="text-xs text-gray-500">
                                  P {student.presentCount || 0} | A {student.absentCount || 0} | L {student.lateCount || 0}
                                </p>
                                {(student.totalClasses || 0) === 0 && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">No attendance yet</p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {attendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                    <FaCalendarDay className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="font-medium">No attendance records found for this batch</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold">Attendance Records</h3>
                    {attendance.map((record, i) => (
                      <div key={record._id || i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="font-bold text-sm">{record.date ? new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-emerald-500 font-bold"><FaCheck className="inline mr-1" />{record.records?.filter(r => r.status === 'Present').length || 0}</span>
                            <span className="text-red-500 font-bold"><FaTimes className="inline mr-1" />{record.records?.filter(r => r.status === 'Absent').length || 0}</span>
                            <span className="text-yellow-500 font-bold">{record.records?.filter(r => r.status === 'Late').length || 0} Late</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                          {record.records && record.records.length > 0 && (
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(record.records.filter(r => r.status === 'Present').length / record.records.length * 100)}%` }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodAttendanceView;
