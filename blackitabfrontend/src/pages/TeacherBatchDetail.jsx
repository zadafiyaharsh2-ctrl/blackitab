import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaUserCheck, FaUserTimes, FaSpinner, FaArrowLeft, FaCheck, FaTimes, FaSearch, FaTrash, FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherBatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchBatchData();
  }, [batchId]);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const batchRes = await axios.get(`${API_URL}/api/teacher/batch/${batchId}`, { headers });
      setBatch(batchRes.data.data);
      
      const studentsRes = await axios.get(`${API_URL}/api/teacher/batch/${batchId}/students`, { headers });
      setStudents(studentsRes.data.data);
      
      const requestsRes = await axios.get(`${API_URL}/api/teacher/batch/${batchId}/requests`, { headers });
      setRequests(requestsRes.data.data);

      const analyticsRes = await axios.get(`${API_URL}/api/teacher/attendance/${batchId}/analytics`, { headers }).catch(e => ({ data: { data: [] } }));
      const attendanceMap = {};
      analyticsRes.data.data.forEach(metric => {
         attendanceMap[metric._id] = metric;
      });
      setAttendanceData(attendanceMap);
      
    } catch (err) {
      toast.error('Failed to load classroom details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/teacher/batch/${batchId}/requests/${reqId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student added to classroom');
      fetchBatchData(); // Refresh to move from request to student list
    } catch (err) {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (reqId) => {
    if(!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/teacher/batch/${batchId}/requests/${reqId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Request rejected');
      setRequests(requests.filter(r => r._id !== reqId));
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if(!window.confirm('Remove this student from the classroom?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/batch/${batchId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student removed from classroom');
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove student');
    }
  };

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'add') return;
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/teacher/students/search?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter out already enrolled students locally
        const enrolledIds = new Set(students.map(s => s._id));
        const filtered = res.data.data.filter(s => !enrolledIds.has(s._id));
        setSearchResults(filtered);
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, students]);

  const handleAddManually = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/teacher/batch/${batchId}/students`, { studentIds: [studentId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student added successfully!');
      setSearchResults(searchResults.filter(s => s._id !== studentId));
      fetchBatchData(); // Refresh lists
    } catch (err) {
      toast.error('Failed to add student');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000000]">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
  );

  if (!batch) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-[#000000]">
       <h2 className="text-2xl font-bold dark:text-white mb-4">Classroom not found</h2>
       <button onClick={() => navigate('/teacher/batches')} className="text-blue-500 flex items-center gap-2 hover:underline">
         <FaArrowLeft /> Back to Classes
       </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] p-4 sm:p-6 text-slate-900 dark:text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Header section */}
        <div className="glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <button onClick={() => navigate('/teacher/batches')} className="text-sm font-bold text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1 hover:text-blue-600 transition-colors">
               <FaArrowLeft /> Back
             </button>
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white">{batch.name}</h1>
               {batch.classCode && (
                 <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-sm font-mono font-bold border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2" title="Class Code">
                   {batch.classCode}
                 </div>
               )}
             </div>
             <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 flex items-center gap-2">
               <FaGraduationCap /> {batch.subjectId?.name || 'General'} • {batch.year} {batch.section ? `• Sec ${batch.section}` : ''}
             </p>
             <div className="mt-4">
               <button onClick={() => navigate('/teacher/attendance')} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <FaCalendarDay /> Manage Attendance
               </button>
             </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="block text-2xl font-black">{students.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enrolled</span>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 relative">
              <span className="block text-2xl font-black">{requests.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Requests</span>
              {requests.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-max max-w-full hide-scrollbar">
          {['students', 'requests', 'add'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 rounded-lg font-bold text-sm capitalize transition-all whitespace-nowrap ${
                 activeTab === tab 
                 ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                 : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
               }`}
             >
               {tab === 'requests' ? `Join Requests (${requests.length})` : tab === 'add' ? 'Add Students' : 'Enrolled Students'}
             </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          
          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               {students.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   {students.map(student => {
                     const analytics = attendanceData[student._id];
                     const percentage = analytics ? Math.round(analytics.attendancePercentage) : null;
                     
                     return (
                     <div key={student._id} className="glass-panel p-4 py-5 flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-2xl group transition-all hover:border-blue-500/30">
                       <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shrink-0 text-lg shadow-md">
                               {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            {percentage !== null && percentage < 75 && (
                              <div title="Dropout Warning: Attendance below 75%" className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] animate-pulse">!</div>
                            )}
                         </div>
                         <div>
                           <h4 className="font-bold text-base text-slate-900 dark:text-gray-100">{student.name}</h4>
                           <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                           {analytics ? (
                             <div className="mt-2 flex items-center gap-3 text-xs">
                               <div className="flex items-center gap-1 font-bold">
                                 <span className={percentage >= 75 ? 'text-emerald-500' : 'text-red-500'}>{percentage}%</span>
                                 <span className="text-slate-400">Attendance</span>
                               </div>
                               <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                               <div className="text-slate-500">
                                 {analytics.presentCount} / {analytics.totalClasses} Present
                               </div>
                             </div>
                           ) : (
                             <p className="mt-2 text-xs text-slate-400 italic">No attendance records yet</p>
                           )}
                         </div>
                       </div>
                       <button 
                         onClick={() => handleRemoveStudent(student._id)}
                         className="p-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 rounded-xl shadow-sm"
                         title="Remove from classroom"
                       >
                         <FaTrash size={14} />
                       </button>
                     </div>
                   )})}
                 </div>
               ) : (
                 <div className="text-center py-16 glass-panel border border-dashed border-slate-300 dark:border-white/20 rounded-2xl">
                   <FaUserTimes className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                   <h3 className="text-lg font-bold mb-1">No Students Yet</h3>
                   <p className="text-slate-500 text-sm">Share the class code ({batch.classCode}) for students to join.</p>
                 </div>
               )}
            </motion.div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               {requests.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {requests.map(req => (
                     <div key={req._id} className="glass-panel p-4 flex flex-col gap-4 border border-yellow-500/30 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5 rounded-2xl">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                            {req.studentId?.name ? req.studentId.name.charAt(0).toUpperCase() : 'S'}
                         </div>
                         <div>
                           <h4 className="font-bold text-sm">{req.studentId?.name || 'Unknown Student'}</h4>
                           <p className="text-xs text-slate-500">{req.studentId?.email}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleApproveRequest(req._id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                           <FaCheck /> Accept
                         </button>
                         <button onClick={() => handleRejectRequest(req._id)} className="flex-1 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                           <FaTimes /> Reject
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 glass-panel border border-dashed border-slate-300 dark:border-white/20 rounded-2xl">
                   <FaUserCheck className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                   <h3 className="text-lg font-bold mb-1">All Caught Up</h3>
                   <p className="text-slate-500 text-sm">There are no pending join requests for this class.</p>
                 </div>
               )}
            </motion.div>
          )}

          {/* ADD STUDENTS TAB */}
          {activeTab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl">
               <div className="max-w-xl mx-auto space-y-6">
                 <div>
                   <h3 className="font-bold text-lg mb-2">Search Institute Students</h3>
                   <div className="relative">
                     <span className="absolute left-4 top-3.5 text-slate-400 bg-transparent"><FaSearch /></span>
                     <input 
                       type="text" 
                       placeholder="Search by name or email..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-shadow outline-none"
                     />
                   </div>
                   <p className="text-xs text-slate-500 mt-2 text-center">Or ask students to join using class code: <strong className="text-indigo-500">{batch.classCode}</strong></p>
                 </div>

                 {searching ? (
                    <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-2xl text-blue-500" /></div>
                 ) : searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map(s => (
                        <div key={s._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                               {s.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-sm leading-none">{s.name}</p>
                               <p className="text-xs text-slate-500 mt-1">{s.email}</p>
                            </div>
                          </div>
                          <button onClick={() => handleAddManually(s._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                            Add to Class
                          </button>
                        </div>
                      ))}
                    </div>
                 ) : searchQuery.length >= 2 ? (
                    <p className="text-center text-slate-500 py-8 text-sm">No new students found matching "{searchQuery}"</p>
                 ) : null}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherBatchDetail;
