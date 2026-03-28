import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../../config';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import PageShimmer from '../../components/shared/PageShimmer';
import BatchDetailHeader from '../../components/teacher/pages/batchDetail/BatchDetailHeader';
import BatchDetailTabs from '../../components/teacher/pages/batchDetail/BatchDetailTabs';

const TeacherBatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [confirmState, setConfirmState] = useState({
    isOpen: false, action: null, id: null, title: '', message: ''
  });

  useEffect(() => { fetchBatchData(); }, [batchId]);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [batchRes, studentsRes, requestsRes, materialsRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/teacher/batch/${batchId}`, { headers }),
        axios.get(`${API_URL}/api/teacher/batch/${batchId}/students`, { headers }),
        axios.get(`${API_URL}/api/teacher/batch/${batchId}/requests`, { headers }),
        axios.get(`${API_URL}/api/teacher/batch/${batchId}/materials`, { headers }),
        axios.get(`${API_URL}/api/teacher/assignments?batchId=${batchId}`, { headers })
      ]);
      setBatch(batchRes.data.data);
      setStudents(studentsRes.data.data);
      setRequests(requestsRes.data.data);
      setMaterials(materialsRes.data.data);
      setAssignments(assignmentsRes.data.data);
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

  const executeRejectRequest = async (reqId) => {
    try {
      await axios.put(`${API_URL}/api/teacher/batch/${batchId}/requests/${reqId}/reject`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Request rejected');
      setRequests(requests.filter(r => r._id !== reqId));
    } catch { toast.error('Failed to reject request'); }
  };

  const handleRejectRequest = (reqId) => {
    setConfirmState({ isOpen: true, action: executeRejectRequest, id: reqId, title: 'Reject Request', message: 'Are you sure you want to reject this join request?' });
  };

  const executeRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`${API_URL}/api/teacher/batch/${batchId}/students/${studentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Student removed');
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove student'); }
  };

  const handleRemoveStudent = (studentId) => {
    setConfirmState({ isOpen: true, action: executeRemoveStudent, id: studentId, title: 'Remove Student', message: 'Are you sure you want to remove this student from the class?' });
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

  if (loading) return <PageShimmer variant="detail" />;

  if (!batch) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Classroom not found</h2>
      <button onClick={() => navigate(-1)} className="text-blue-500 flex items-center gap-2 text-sm hover:underline">
        <FaArrowLeft /> Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      <div className="max-w-[85rem] mx-auto space-y-10">
        
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Directory
        </button>

        <BatchDetailHeader batch={batch} students={students} requests={requests} />

        <div className="flex-shrink-0 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm flex overflow-x-auto custom-scrollbar max-w-fit">
          {[
            { id: 'students', label: 'Scholars' },
            { id: 'materials', label: 'Literature' },
            { id: 'assignments', label: 'Evaluations' },
            { id: 'requests', label: 'Clearance' },
            { id: 'add', label: 'Enrollment' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 md:px-8 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}>
              {tab.label}
              {tab.id === 'requests' && requests.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-black shadow-sm shadow-red-500/20">{requests.length}</span>
              )}
            </button>
          ))}
        </div>

        <BatchDetailTabs
          batchId={batchId} batch={batch} activeTab={activeTab}
          students={students} materials={materials} assignments={assignments} requests={requests}
          attendanceData={attendanceData} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          searchResults={searchResults} searching={searching}
          handleApproveRequest={handleApproveRequest} handleRejectRequest={handleRejectRequest}
          handleRemoveStudent={handleRemoveStudent} handleAddManually={handleAddManually}
          goToStudentProfile={goToStudentProfile}
        />
      </div>

      <SimpleConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, action: null, id: null, title: '', message: '' })}
        onConfirm={() => {
          if (confirmState.action && confirmState.id) confirmState.action(confirmState.id);
          setConfirmState({ isOpen: false, action: null, id: null, title: '', message: '' });
        }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        isDanger={true}
      />
    </div>
  );
};

export default TeacherBatchDetail;
