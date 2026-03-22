import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaCalendarDay, FaUsers, FaUserTie, FaCheck, FaTimes, FaClock, FaTable, FaChartBar } from 'react-icons/fa';
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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-indigo-500/20 selection:text-indigo-900">
      
      <div className="max-w-[85rem] mx-auto space-y-10">
        
        {/* Header Block */}
         <div className="flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-gray-200 dark:border-white/10 pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaCalendarDay className="text-indigo-600 dark:text-indigo-400 text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Attendance Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Department Attendance
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl leading-relaxed">
              Monitor attendance patterns and class participation records across all academic batches within your purview.
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start">
          
          {/* Left Column: Batch Directory */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[500px] overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FaUsers className="text-indigo-500 text-sm" /> Batch Directory
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select context to review</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {batches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                   <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                     <FaCalendarDay className="text-gray-300 dark:text-gray-600 text-xl" />
                   </div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">No Batches Registered</p>
                   <p className="text-xs font-medium text-gray-500 mt-1">This department has no active class allocations.</p>
                </div>
              ) : (
                batches.map(batch => {
                  const isSelected = selectedBatch === batch._id;
                  return (
                    <button 
                      key={batch._id} 
                      onClick={() => fetchAttendance(batch._id)}
                      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-200 shadow-sm dark:bg-indigo-500/10 dark:border-indigo-500/20'
                          : 'bg-white border-gray-200 hover:border-indigo-500/30 hover:shadow-md dark:bg-transparent dark:border-white/10 dark:hover:border-indigo-400/30'
                      } border`}
                    >
                      {/* Selection Indicator Line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-all duration-300 ${isSelected ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/30'}`} />

                      <div className="pl-3">
                        <div className="flex justify-between items-start gap-2 mb-2">
                           <h4 className={`text-sm font-extrabold tracking-tight truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>
                            {batch.name || batch.batchName || 'Unnamed Cohort'}
                          </h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ${isSelected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                            {batch.studentCount ?? batch.studentIds?.length ?? batch.students?.length ?? 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                          <FaUserTie className={`text-[10px] ${isSelected ? 'text-indigo-500/70 dark:text-indigo-300/70' : 'text-gray-400 dark:text-gray-500'}`} />
                          <span className={`truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {batch.teacherName || 'Unassigned Educator'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Attendance Data Engine */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            
            {!selectedBatch ? (
              
              /* Empty State: No Batch Selected */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-bottom-4">
                 <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-white/5 relative">
                   <FaTable className="text-4xl text-gray-300 dark:text-gray-600 z-10" />
                   {/* Decorative circle */}
                   <div className="absolute inset-0 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                 </div>
                 <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Awaiting Context</h2>
                 <p className="text-sm font-medium text-gray-500 max-w-sm">
                   Please select a batch from the directory on the left to populate the attendance intelligence engine.
                 </p>
              </div>

            ) : loadingAttendance ? (
              
              /* Loading State */
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <FaChartBar className="text-indigo-500 text-lg animate-pulse" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 animate-pulse">Synthesizing Records...</p>
              </div>

            ) : (
              
              /* Data Populated State */
              <div className="flex-1 flex flex-col h-[calc(100vh-16rem)] min-h-[500px] animate-in fade-in slide-in-from-bottom-2">
                
                {/* Right Header Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                   <div>
                     <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                       {batches.find(b => b._id === selectedBatch)?.name || 'Viewing Batch'}
                     </p>
                   </div>
                   
                   {/* View Toggle */}
                   <div className="flex bg-white dark:bg-black/50 p-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm self-start sm:self-auto">
                      <button 
                        onClick={() => setViewMode('summary')}
                        className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center gap-2 ${
                          viewMode === 'summary' 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <FaChartBar className={viewMode === 'summary' ? "text-indigo-400 dark:text-indigo-600" : ""} /> Summary
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center gap-2 ${
                          viewMode === 'grid' 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <FaTable className={viewMode === 'grid' ? "text-indigo-400 dark:text-indigo-600" : ""} /> Register
                      </button>
                   </div>
                </div>

                {/* View Content Area scrollable */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                   {viewMode === 'grid' ? (
                     
                     /* Grid Map View */
                     <div className="bg-white dark:bg-black/20 rounded-2xl border border-transparent">
                       <AttendanceGrid records={attendance} students={batchStudents} />
                     </div>

                   ) : (
                     
                     /* Summary Architecture View */
                     <div className="space-y-10 animate-in fade-in">
                       
                       {/* Section: Student Overview List */}
                       {studentAnalytics.length > 0 && (
                         <div className="space-y-4">
                           <div className="flex items-end justify-between px-1">
                             <div>
                               <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Student Cohort Mastery</h4>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Aggregate Participation Rates</p>
                             </div>
                             <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full font-bold text-gray-500">
                               Total: {batchStudents.length}
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {studentAnalytics.map((student, idx) => {
                               const percentage = Math.round(student.attendancePercentage || 0);
                               const statusColor = percentage >= 75 ? 'emerald' : percentage >= 50 ? 'amber' : 'rose';
                               
                               return (
                                 <div key={student.studentId || student._id || idx} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-md transition-all group">
                                   
                                   <div className="flex items-start justify-between gap-4 mb-4">
                                     <div className="min-w-0">
                                       <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                         {student.studentName || 'Student Identity Hidden'}
                                       </p>
                                       <p className="text-[10px] font-medium text-gray-500 font-mono mt-0.5 truncate">
                                         {student.studentEmail || 'No Email Registered'}
                                       </p>
                                     </div>
                                     <div className="text-right flex-shrink-0">
                                       <span className={`text-2xl font-black block leading-none ${
                                          statusColor === 'emerald' ? 'text-emerald-500' :
                                          statusColor === 'amber' ? 'text-amber-500' : 'text-rose-500'
                                       }`}>
                                         {percentage}<span className="text-sm">%</span>
                                       </span>
                                     </div>
                                   </div>

                                   <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest mb-3">
                                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 py-1 px-2.5 rounded-lg w-full justify-center">
                                        <FaCheck className="text-emerald-500 text-[8px]" /> {student.presentCount || 0}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 py-1 px-2.5 rounded-lg w-full justify-center">
                                        <FaTimes className="text-rose-500 text-[8px]" /> {student.absentCount || 0}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 py-1 px-2.5 rounded-lg w-full justify-center">
                                        <FaClock className="text-amber-500 text-[8px]" /> {student.lateCount || 0}
                                      </div>
                                   </div>

                                   {/* Progress Bar */}
                                   <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 shadow-inner overflow-hidden">
                                     <div
                                       className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                          statusColor === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                          statusColor === 'amber' ? 'bg-amber-400 shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50'
                                       }`}
                                       style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                     />
                                   </div>
                                   {(student.totalClasses || 0) === 0 && (
                                      <p className="text-[9px] text-gray-400 mt-2 text-center font-bold uppercase tracking-widest">Awaiting Initial Check-in</p>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}

                       {/* Section: Timeline Blocks */}
                       {attendance.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.01]">
                           <FaCalendarDay className="text-3xl text-gray-300 dark:text-gray-600 mb-4" />
                           <h4 className="text-lg font-bold text-gray-900 dark:text-white">Timeline Empty</h4>
                           <p className="text-sm font-medium text-gray-500 max-w-sm mt-1">No historical class sessions have been recorded for this batch yet.</p>
                         </div>
                       ) : (
                         <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/10">
                           <div className="px-1 mb-6">
                             <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Session Timeline</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Chronological Lecture Records</p>
                           </div>
                           
                           <div className="space-y-4 border-l-2 border-gray-100 dark:border-white/5 ml-4 pl-6 relative">
                             {attendance.map((record, i) => {
                               const present = record.records?.filter(r => r.status === 'Present').length || 0;
                               const absent = record.records?.filter(r => r.status === 'Absent').length || 0;
                               const late = record.records?.filter(r => r.status === 'Late').length || 0;
                               const total = present + absent + late || 1;
                               const presentPct = (present / total) * 100;
                               
                               return (
                                 <div key={record._id || i} className="relative group">
                                   {/* Timeline Node */}
                                   <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-white dark:bg-[#0a0a0a] border-[3px] border-indigo-200 dark:border-indigo-500/50 group-hover:border-indigo-500 transition-colors shadow-sm top-5 z-10" />
                                   
                                   <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-5 hover:shadow-md transition-shadow">
                                     <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                       
                                       <div className="flex items-center gap-3">
                                         <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                           <FaCalendarDay className="text-indigo-500 text-xs" />
                                         </div>
                                         <div>
                                           <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs block">
                                             {record.date ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown Timeline Event'}
                                           </h5>
                                         </div>
                                       </div>
                                       
                                       <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                                         <div className="flex flex-col items-center">
                                           <span className="text-emerald-500 font-black text-sm">{present}</span>
                                           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Present</span>
                                         </div>
                                         <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                                         <div className="flex flex-col items-center">
                                           <span className="text-rose-500 font-black text-sm">{absent}</span>
                                           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Absent</span>
                                         </div>
                                         <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                                         <div className="flex flex-col items-center">
                                            <span className="text-amber-500 font-black text-sm">{late}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Late</span>
                                         </div>
                                       </div>
                                       
                                     </div>
                                     
                                     {/* Macro Progress Bar */}
                                     {record.records && record.records.length > 0 && (
                                       <div className="w-full bg-rose-50 dark:bg-rose-500/10 rounded-full h-1.5 flex overflow-hidden border border-rose-100 dark:border-rose-500/20">
                                         <div 
                                           className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-in-out" 
                                           style={{ width: `${presentPct}%` }} 
                                           title={`${Math.round(presentPct)}% Present`}
                                         />
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}

                     </div>
                   )}
                </div>

              </div>

            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default HodAttendanceView;
