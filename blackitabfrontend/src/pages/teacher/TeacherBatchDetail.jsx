import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaUserCheck, FaUserTimes, FaCalendarDay, FaSpinner, FaArrowLeft, FaCheck, FaTimes, FaSearch, FaTrash, FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../../config';

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

  useEffect(() => { fetchBatchData(); }, [batchId]);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [batchRes, studentsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/teacher/batch/${batchId}`, { headers }),
        axios.get(`${API_URL}/api/teacher/batch/${batchId}/students`, { headers }),
        axios.get(`${API_URL}/api/teacher/batch/${batchId}/requests`, { headers }),
      ]);
      setBatch(batchRes.data.data);
      setStudents(studentsRes.data.data);
      setRequests(requestsRes.data.data);
      const analyticsRes = await axios.get(`${API_URL}/api/teacher/attendance/${batchId}/analytics`, { headers }).catch(() => ({ data: { data: [] } }));
      const map = {};
      analyticsRes.data.data.forEach(m => { map[m._id] = m; });
      setAttendanceData(map);
    } catch { toast.error('Failed to load classroom details'); }
    finally { setLoading(false); }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      await axios.put(`${API_URL}/api/teacher/batch/${batchId}/requests/${reqId}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Student added to classroom');
      fetchBatchData();
    } catch { toast.error('Failed to approve request'); }
  };

  const handleRejectRequest = async (reqId) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await axios.put(`${API_URL}/api/teacher/batch/${batchId}/requests/${reqId}/reject`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Request rejected');
      setRequests(requests.filter(r => r._id !== reqId));
    } catch { toast.error('Failed to reject request'); }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await axios.delete(`${API_URL}/api/teacher/batch/${batchId}/students/${studentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Student removed');
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove student'); }
  };

  const handleAddManually = async (studentId) => {
    try {
      await axios.post(`${API_URL}/api/teacher/batch/${batchId}/students`, { studentIds: [studentId] }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Student added!');
      setSearchResults(searchResults.filter(s => s._id !== studentId));
      fetchBatchData();
    } catch { toast.error('Failed to add student'); }
  };

  const goToStudentProfile = (studentId) => {
    if (!studentId) return;
    navigate(`/profile/${studentId}`);
  };

  useEffect(() => {
    if (activeTab !== 'add' || searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`${API_URL}/api/teacher/students/search?q=${searchQuery}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const ids = new Set(students.map(s => s._id));
        setSearchResults(res.data.data.filter(s => !ids.has(s._id)));
      } catch { toast.error('Search failed'); }
      finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery, activeTab, students]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <FaSpinner className="animate-spin text-2xl text-gray-400" />
    </div>
  );

  if (!batch) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Classroom not found</h2>
      <button onClick={() => navigate('/teacher/batches')} className="text-blue-500 flex items-center gap-2 text-sm hover:underline">
        <FaArrowLeft /> Back to Classes
      </button>
    </div>
  );

  const tabs = [
    { key: 'students', label: `Enrolled (${students.length})` },
    { key: 'requests', label: `Join Requests ${requests.length > 0 ? `(${requests.length})` : ''}` },
    { key: 'add', label: 'Add Students' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

      {/* Header */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <button onClick={() => navigate('/teacher/batches')} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline mb-3">
          <FaArrowLeft /> Back to Classes
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
              {batch.classCode && (
                <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-md text-xs font-mono font-bold">
                  {batch.classCode}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <FaGraduationCap /> {batch.subjectId?.name || 'General'} · {batch.year}{batch.section ? ` · Sec ${batch.section}` : ''}
            </p>
            <button onClick={() => navigate('/teacher/attendance')} className="mt-3 flex items-center gap-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">
              <FaCalendarDay /> Manage Attendance
            </button>
          </div>
          <div className="flex gap-3">
            {[{ label: 'Enrolled', value: students.length }, { label: 'Requests', value: requests.length, alert: requests.length > 0 }].map((s, i) => (
              <div key={i} className="border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-center relative bg-white dark:bg-white/[0.02]">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-[10px] uppercase text-gray-400 font-medium">{s.label}</div>
                {s.alert && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        students.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {students.map(student => {
              const a = attendanceData[student._id];
              const pct = a ? Math.round(a.attendancePercentage) : null;
              return (
                <div
                  key={student._id}
                  onClick={() => goToStudentProfile(student._id)}
                  className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] flex items-center justify-between group cursor-pointer hover:border-blue-300 dark:hover:border-blue-400/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm shrink-0">
                        {student.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      {pct !== null && pct < 75 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[9px] font-bold">!</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.email}</p>
                      {a ? (
                        <p className="text-xs mt-0.5">
                          <span className={pct >= 75 ? 'text-emerald-500' : 'text-red-500'}>{pct}%</span>
                          <span className="text-gray-400 ml-1">· {a.presentCount}/{a.totalClasses} present</span>
                        </p>
                      ) : <p className="text-xs text-gray-400 mt-0.5">No attendance yet</p>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStudent(student._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-10 text-center text-gray-400">
            <FaUserTimes className="text-3xl mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No students yet</p>
            <p className="text-sm mt-1">Share class code <strong className="text-indigo-500">{batch.classCode}</strong> for students to join.</p>
          </div>
        )
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map(req => (
              <div
                key={req._id}
                onClick={() => goToStudentProfile(req.studentId?._id)}
                className="border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 bg-amber-50/60 dark:bg-amber-500/5 cursor-pointer hover:border-amber-300 dark:hover:border-amber-400/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {req.studentId?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.studentId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{req.studentId?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveRequest(req._id);
                    }}
                    className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <FaCheck /> Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectRequest(req._id);
                    }}
                    className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-10 text-center text-gray-400">
            <FaUserCheck className="text-3xl mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No pending requests</p>
          </div>
        )
      )}

      {/* Add Students Tab */}
      {activeTab === 'add' && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search Institute Students</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Or share class code: <strong className="text-indigo-500">{batch.classCode}</strong>
              </p>
            </div>

            {searching ? (
              <div className="flex justify-center py-6"><FaSpinner className="animate-spin text-gray-400" /></div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(s => (
                  <div
                    key={s._id}
                    onClick={() => goToStudentProfile(s._id)}
                    className="flex items-center justify-between border border-gray-100 dark:border-white/5 rounded-lg p-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-400/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddManually(s._id);
                      }}
                      className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <FaUserPlus className="text-[10px]" /> Add
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-sm text-gray-400 py-6">No students found matching "{searchQuery}"</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherBatchDetail;
