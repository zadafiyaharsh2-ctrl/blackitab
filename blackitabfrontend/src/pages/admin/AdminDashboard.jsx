import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaSchool, FaChartLine, FaSignOutAlt, FaShieldAlt,
  FaTrophy, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaQuestion, FaNewspaper,
  FaStar, FaUserGraduate, FaSpinner, FaComments, FaTimes, FaCheck, FaBan
} from 'react-icons/fa';
import { CustomToast } from '../../utils/CustomToast';
import axios from 'axios';
import API_URL from '../../config';
import DeleteConfirmationModal from '../../components/shared/DeleteConfirmationModal';

// ── Lazy-loaded Tab Components ──────────────────────────────────────────────
const OverviewTab   = lazy(() => import('../../components/admin/tabs/OverviewTab'));
const UsersTab      = lazy(() => import('../../components/admin/tabs/UsersTab'));
const InstitutesTab = lazy(() => import('../../components/admin/tabs/InstitutesTab'));
const QuestionsTab  = lazy(() => import('../../components/admin/tabs/QuestionsTab'));
const PostsTab      = lazy(() => import('../../components/admin/tabs/PostsTab'));
const ContestsTab   = lazy(() => import('../../components/admin/tabs/ContestsTab'));
const AnalyticsTab  = lazy(() => import('../../components/admin/tabs/AnalyticsTab'));


// ── Component ──────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contests, setContests] = useState([]);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [teacherAnalytics, setTeacherAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ pages: 1, total: 0 });
  const [questionPage, setQuestionPage] = useState(1);
  const [questionPagination, setQuestionPagination] = useState({ pages: 1, total: 0 });
  const [postPage, setPostPage] = useState(1);
  const [postPagination, setPostPagination] = useState({ pages: 1, total: 0 });
  const [showCreateInstitute, setShowCreateInstitute] = useState(false);
  const [newInstitute, setNewInstitute] = useState({ name: '', instituteCode: '', subscriptionPlan: 'free' });
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [instituteMembers, setInstituteMembers] = useState([]);
  const [instituteMembersLoading, setInstituteMembersLoading] = useState(false);
  

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedTeacherForFeedback, setSelectedTeacherForFeedback] = useState(null);
  const [questionPreview, setQuestionPreview] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', instituteCode: '' });
  const [editUserModal, setEditUserModal] = useState(null);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [newContest, setNewContest] = useState({ title: '', description: '', startTime: '', endTime: '', difficultyLevel: 'Intermediate' });
  const [editContestModal, setEditContestModal] = useState(null);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ exam: 'jee', subject: '', question: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Medium', explanation: '' });
  const [editUserTab, setEditUserTab] = useState('general');
  const [editInstituteModal, setEditInstituteModal] = useState(null);
  const [editInstituteTab, setEditInstituteTab] = useState('general');
  
  // Deletion Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    itemId: null,
    itemName: '',
    itemType: '',
    warningText: '',
    onConfirm: null
  });

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { navigate('/admin/login'); return; }
    if (adminData) setAdmin(JSON.parse(adminData));
    fetchStats(adminToken);
    fetchUsers(adminToken, 1);
    fetchInstitutes(adminToken);
    fetchGlobalAnalytics(adminToken);
    fetchTeacherAnalytics(adminToken);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getToken() { return localStorage.getItem('adminToken'); }
  function headers() { return { Authorization: `Bearer ${getToken()}` }; }

  // ── Fetch Functions ──
  async function fetchStats(token) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setStats(res.data.data);
    } catch { /* fallback */ }
    setLoading(false);
  };

  async function fetchUsers(token, page, search = '') {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=15&search=${search}`, {
        headers: { Authorization: `Bearer ${token || getToken()}` }
      });
      if (res.data.success) { setUsers(res.data.data); setUserPagination(res.data.pagination); }
    } catch { /* fallback */ }
  };

  async function fetchInstitutes(token) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/institutes`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setInstitutes(res.data.data);
    } catch { /* fallback */ }
  };

  async function fetchInstituteMembers(instituteId) {
    setInstituteMembersLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/institutes/${instituteId}/members`, { headers: headers() });
      if (res.data.success) setInstituteMembers(res.data.data);
    } catch { setInstituteMembers([]); }
    setInstituteMembersLoading(false);
  };

  async function fetchQuestions(page = 1) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/questions?page=${page}&limit=15`, { headers: headers() });
      if (res.data.success) { setQuestions(res.data.data); setQuestionPagination(res.data.pagination); }
    } catch { setQuestions([]); }
  };

  async function fetchGlobalAnalytics(token) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/analytics`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setGlobalAnalytics(res.data.data);
    } catch { /* fallback */ }
  };

  async function fetchTeacherAnalytics(token) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/teachers`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setTeacherAnalytics(res.data.data);
    } catch { /* fallback */ }
  };

  async function fetchPosts(page = 1) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/posts?page=${page}&limit=15`, { headers: headers() });
      if (res.data.success) { setPosts(res.data.data); setPostPagination(res.data.pagination); }
    } catch { setPosts([]); }
  };

  async function fetchContests() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/contests`, { headers: headers() });
      if (res.data.success) setContests(res.data.data);
    } catch { setContests([]); }
  };

  // ── Actions ──
  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role }, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success('Role updated');
    } catch { CustomToast.error('Failed to update role'); }
  };

  const handleBan = async (userId) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {}, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success('User banned and logged out');
    } catch { CustomToast.error('Failed'); }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      CustomToast.error('Name, email, and password are required');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/admin/users`, newUser, { headers: headers() });
      CustomToast.success(res.data.message || 'User created');
      fetchUsers(null, userPage, userSearch);
      fetchStats(getToken());
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Failed to create user');
    }
    setShowCreateUser(false);
    setNewUser({ name: '', email: '', password: '', role: 'student', instituteCode: '' });
  };

  const openDeleteModal = (id, name, type, warningText, deleteActionType) => {
    setDeleteModalState({
      isOpen: true,
      itemId: id,
      itemName: name,
      itemType: type,
      warningText,
      onConfirm: async () => {
        setDeleteModalState(prev => ({ ...prev, isOpen: false }));
        if (deleteActionType === 'user') await executeDeleteUser(id);
        if (deleteActionType === 'institute') await executeDeleteInstitute(id);
      }
    });
  };

  const executeDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      fetchStats(getToken());
      CustomToast.success('User deleted');
    } catch { CustomToast.error('Failed to delete user'); }
  };

  const handleCreateInstitute = async () => {
    if (!newInstitute.name || !newInstitute.instituteCode) {
      CustomToast.error('Name and code required');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/institutes`, newInstitute, { headers: headers() });
      fetchInstitutes();
      fetchStats(getToken());
      CustomToast.success('Institute created');
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Failed');
    }
    setShowCreateInstitute(false);
    setNewInstitute({ name: '', instituteCode: '', subscriptionPlan: 'free' });
  };

  const executeDeleteInstitute = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/institutes/${id}`, { headers: headers() });
      fetchInstitutes();
      fetchStats(getToken());
      CustomToast.success('Institute deleted');
      if (selectedInstitute && selectedInstitute._id === id) setSelectedInstitute(null);
    } catch { CustomToast.error('Failed'); }
  };

  const handleEditInstitute = async () => {
    if (!editInstituteModal) return;
    try {
      // Clean up string-based arrays for submission (split by comma if they are strings from input)
      const payload = { ...editInstituteModal };
      if (typeof payload.departments === 'string') {
        payload.departments = payload.departments.split(',').map(d => d.trim()).filter(d => d);
      }
      if (typeof payload.adminEmails === 'string') {
        payload.adminEmails = payload.adminEmails.split(',').map(e => e.trim()).filter(e => e);
      }

      await axios.put(`${API_URL}/api/admin/institutes/full/${editInstituteModal._id}`, payload, { headers: headers() });
      CustomToast.success('Super Admin: Institute fully updated');
      fetchInstitutes();
      if (selectedInstitute && selectedInstitute._id === editInstituteModal._id) {
         setSelectedInstitute(payload); // Optimistic update
      }
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setEditInstituteModal(null);
  };

  const handleCloneGlobal = async (id) => {
    try {
      await axios.post(`${API_URL}/api/admin/questions/${id}/clone-global`, {}, { headers: headers() });
      fetchQuestions(questionPage);
      fetchStats(getToken());
      CustomToast.success('Question successfully cloned to Global Bank');
    } catch { CustomToast.error('Failed to clone question'); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Permanently delete this question?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/questions/${id}`, { headers: headers() });
      fetchQuestions(questionPage);
      fetchStats(getToken());
      CustomToast.success('Question deleted');
    } catch { CustomToast.error('Failed'); }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/posts/${id}`, { headers: headers() });
      fetchPosts(postPage);
      fetchStats(getToken());
      CustomToast.success('Post deleted');
    } catch { CustomToast.error('Failed'); }
  };

  const handleEditUser = async () => {
    if (!editUserModal) return;
    try {
      await axios.put(`${API_URL}/api/admin/users/full/${editUserModal._id}`, editUserModal, { headers: headers() });
      CustomToast.success('Super Admin: User fully updated');
      fetchUsers(null, userPage, userSearch);
      fetchStats(getToken());
      if (selectedInstitute) fetchInstituteMembers(selectedInstitute._id);
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setEditUserModal(null);
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.subject || !newQuestion.question || newQuestion.options.some(o => !o)) {
      CustomToast.error('All fields required'); return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/questions`, newQuestion, { headers: headers() });
      CustomToast.success('Question created globally');
      fetchQuestions(questionPage);
      fetchStats(getToken());
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setShowCreateQuestion(false);
    setNewQuestion({ exam: 'jee', subject: '', question: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Medium', explanation: '' });
  };

  const handleCreateContest = async () => {
    if (!newContest.title || !newContest.startTime || !newContest.endTime) {
      CustomToast.error('Title, start time, and end time are required'); return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/contests`, newContest, { headers: headers() });
      CustomToast.success('Contest created');
      fetchContests();
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setShowCreateContest(false);
    setNewContest({ title: '', description: '', startTime: '', endTime: '', difficultyLevel: 'Intermediate' });
  };

  const handleEditContest = async () => {
    if (!editContestModal) return;
    try {
      await axios.put(`${API_URL}/api/admin/contests/${editContestModal._id}`, editContestModal, { headers: headers() });
      CustomToast.success('Contest updated');
      fetchContests();
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setEditContestModal(null);
  };

  const handleDeleteContest = async (id) => {
    if (!confirm('Delete this contest?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/contests/${id}`, { headers: headers() });
      fetchContests();
      CustomToast.success('Contest deleted');
    } catch { CustomToast.error('Failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  // ── Tab Switch Handlers ──
  useEffect(() => {
    if (activeTab === 'questions') fetchQuestions(1);
    if (activeTab === 'posts') fetchPosts(1);
    if (activeTab === 'contests') fetchContests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Layout Data ──
  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', icon: FaUsers },
    { label: 'Institutes', value: stats.totalInstitutes, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20', icon: FaSchool },
    { label: 'Daily Active', value: stats.dailyActiveUsers, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20', icon: FaChartLine },
    { label: 'Total Questions', value: stats.totalQuestions, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20', icon: FaQuestion },
    { label: 'Total Posts', value: stats.totalPosts, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20', icon: FaNewspaper },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'institutes', label: 'Institutes', icon: FaSchool },
    { id: 'questions', label: 'Questions', icon: FaQuestion },
    { id: 'posts', label: 'Posts', icon: FaNewspaper },
    { id: 'contests', label: 'Contests', icon: FaTrophy },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
  ];

  const filteredUsers = userSearch
    ? users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  // ── Pagination Component ──
  const Pagination = ({ pagination, current, onPageChange }) => {
    if (!pagination || pagination.pages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
        <button onClick={() => onPageChange(Math.max(1, current - 1))} disabled={current <= 1}
          className="p-2 rounded-lg text-gray-500 hover:text-white disabled:opacity-30"><FaChevronLeft /></button>
        <span className="text-xs text-gray-400">Page {current} of {pagination.pages} ({pagination.total} total)</span>
        <button onClick={() => onPageChange(Math.min(pagination.pages, current + 1))} disabled={current >= pagination.pages}
          className="p-2 rounded-lg text-gray-500 hover:text-white disabled:opacity-30"><FaChevronRight /></button>
      </div>
    );
  };

  return (
    <div className="admin-theme app-mobile-type min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
      {/* Ambient BG Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="hidden dark:block absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="hidden dark:block absolute bottom-[-5%] right-[5%] w-[450px] h-[450px] bg-orange-600/15 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Admin Top Bar */}
      <div className="bg-white/90 dark:bg-black/50 border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-red-500 text-xl" />
          <span className="font-bold text-lg">Blackitab Admin</span>
          <span className="text-xs bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">SYSTEM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 dark:text-gray-400 text-sm">{admin?.username || 'admin'}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-sm font-bold transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === t.id ? 'bg-slate-900 text-white dark:bg-white dark:text-gray-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'}`}>
              <t.icon className="text-xs" />
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT — lazy loaded ── */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="animate-spin text-3xl text-blue-500 opacity-60" />
          </div>
        }>
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} loading={loading} statCards={statCards} />
          )}

          {activeTab === 'users' && (
            <UsersTab
              userSearch={userSearch} setUserSearch={setUserSearch} fetchUsers={fetchUsers}
              showCreateUser={showCreateUser} setShowCreateUser={setShowCreateUser}
              newUser={newUser} setNewUser={setNewUser} handleCreateUser={handleCreateUser}
              editUserModal={editUserModal} setEditUserModal={setEditUserModal}
              editUserTab={editUserTab} setEditUserTab={setEditUserTab} handleEditUser={handleEditUser}
              filteredUsers={filteredUsers}
              handleRoleChange={handleRoleChange} handleBan={handleBan}
              setSelectedTeacherForFeedback={setSelectedTeacherForFeedback}
              setIsFeedbackModalOpen={setIsFeedbackModalOpen}
              openDeleteModal={openDeleteModal}
              Pagination={Pagination}
              userPagination={userPagination} userPage={userPage} setUserPage={setUserPage}
            />
          )}

          {activeTab === 'institutes' && (
            <InstitutesTab
              institutes={institutes}
              showCreateInstitute={showCreateInstitute} setShowCreateInstitute={setShowCreateInstitute}
              newInstitute={newInstitute} setNewInstitute={setNewInstitute}
              handleCreateInstitute={handleCreateInstitute}
              selectedInstitute={selectedInstitute} setSelectedInstitute={setSelectedInstitute}
              instituteMembers={instituteMembers} instituteMembersLoading={instituteMembersLoading}
              editInstituteModal={editInstituteModal} setEditInstituteModal={setEditInstituteModal}
              editInstituteTab={editInstituteTab} setEditInstituteTab={setEditInstituteTab}
              handleEditInstitute={handleEditInstitute}
              openDeleteModal={openDeleteModal} fetchInstituteMembers={fetchInstituteMembers}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionsTab
              questions={questions}
              showCreateQuestion={showCreateQuestion} setShowCreateQuestion={setShowCreateQuestion}
              newQuestion={newQuestion} setNewQuestion={setNewQuestion}
              handleCreateQuestion={handleCreateQuestion}
              questionPreview={questionPreview} setQuestionPreview={setQuestionPreview}
              handleCloneGlobal={handleCloneGlobal}
              handleDeleteQuestion={handleDeleteQuestion}
              Pagination={Pagination}
              questionPagination={questionPagination} questionPage={questionPage} setQuestionPage={setQuestionPage}
              fetchQuestions={fetchQuestions}
            />
          )}

          {activeTab === 'posts' && (
            <PostsTab
              posts={posts}
              handleDeletePost={handleDeletePost}
              Pagination={Pagination}
              postPagination={postPagination} postPage={postPage} setPostPage={setPostPage}
              fetchPosts={fetchPosts}
            />
          )}

          {activeTab === 'contests' && (
            <ContestsTab
              contests={contests}
              showCreateContest={showCreateContest} setShowCreateContest={setShowCreateContest}
              newContest={newContest} setNewContest={setNewContest}
              handleCreateContest={handleCreateContest}
              setEditContestModal={setEditContestModal}
              handleDeleteContest={handleDeleteContest}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              globalAnalytics={globalAnalytics}
              teacherAnalytics={teacherAnalytics}
            />
          )}
        </Suspense>



      </div>



      {/* ── QUESTION PREVIEW MODAL ── */}
      <AnimatePresence>
        {questionPreview && (
          <div  exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setQuestionPreview(null)}>
            <div  exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Question Preview</h3>
                <button onClick={() => setQuestionPreview(null)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 uppercase">{questionPreview.exam}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400">{questionPreview.subject}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  questionPreview.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                  questionPreview.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>{questionPreview.difficulty}</span>
              </div>
              <p className="text-white text-sm mb-4 leading-relaxed">{questionPreview.question}</p>
              <div className="space-y-2 mb-4">
                {questionPreview.options?.map((opt, i) => (
                  <div key={i} className={`px-4 py-2.5 rounded-xl text-sm border ${
                    i === questionPreview.correctAnswer
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/5 bg-white/[0.02] text-gray-300'
                  }`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                    {i === questionPreview.correctAnswer && <span className="ml-2 text-[10px] font-bold text-emerald-400">✓ CORRECT</span>}
                  </div>
                ))}
              </div>
              {questionPreview.explanation && (
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-400 font-bold mb-1">Explanation</p>
                  <p className="text-gray-300 text-sm">{questionPreview.explanation}</p>
                </div>
              )}
              <div className="mt-4 text-xs text-gray-500">
                <p>Created by: {questionPreview.createdBy?.name || 'Unknown'} ({questionPreview.createdBy?.role || '—'})</p>
                {questionPreview.instituteId && <p>Institute: {questionPreview.instituteId.name}</p>}
                <p>Created: {new Date(questionPreview.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT USER MODAL ── */}
      <AnimatePresence>
        {editUserModal && (
          <div  exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEditUserModal(null)}>
            <div  exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 border border-white/10 rounded-2xl w-full max-w-lg"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold text-lg mb-4">Edit User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <input value={editUserModal.name} onChange={e => setEditUserModal({ ...editUserModal, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input value={editUserModal.email} onChange={e => setEditUserModal({ ...editUserModal, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Points</label>
                  <input type="number" value={editUserModal.points} onChange={e => setEditUserModal({ ...editUserModal, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">XP</label>
                  <input type="number" value={editUserModal.xp} onChange={e => setEditUserModal({ ...editUserModal, xp: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Streak</label>
                  <input type="number" value={editUserModal.streak} onChange={e => setEditUserModal({ ...editUserModal, streak: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Institute Code</label>
                  <input value={editUserModal.instituteCode} onChange={e => setEditUserModal({ ...editUserModal, instituteCode: e.target.value.toUpperCase() })}
                    placeholder="Leave empty to unlink" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none uppercase" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Bio</label>
                <textarea value={editUserModal.bio} onChange={e => setEditUserModal({ ...editUserModal, bio: e.target.value })}
                  rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none resize-none" />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setEditUserModal(null)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleEditUser} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT CONTEST MODAL ── */}
      <AnimatePresence>
        {editContestModal && (
          <div  exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEditContestModal(null)}>
            <div  exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 border border-white/10 rounded-2xl w-full max-w-lg"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold text-lg mb-4">Edit Contest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Title</label>
                  <input value={editContestModal.title} onChange={e => setEditContestModal({ ...editContestModal, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                  <input type="datetime-local" value={editContestModal.startTime} onChange={e => setEditContestModal({ ...editContestModal, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                  <input type="datetime-local" value={editContestModal.endTime} onChange={e => setEditContestModal({ ...editContestModal, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
                  <select value={editContestModal.difficultyLevel} onChange={e => setEditContestModal({ ...editContestModal, difficultyLevel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-500">Active</label>
                  <button onClick={() => setEditContestModal({ ...editContestModal, isActive: !editContestModal.isActive })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${editContestModal.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {editContestModal.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <textarea value={editContestModal.description} onChange={e => setEditContestModal({ ...editContestModal, description: e.target.value })}
                    rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setEditContestModal(null)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleEditContest} className="px-5 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, itemId: null, itemName: '', itemType: '', warningText: '', onConfirm: null })}
        onConfirm={deleteModalState.onConfirm}
        itemName={deleteModalState.itemName}
        itemType={deleteModalState.itemType}
        warningText={deleteModalState.warningText}
      />

      {/* Admin Teacher Feedback View Modal */}
      <AdminTeacherFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => { setIsFeedbackModalOpen(false); setSelectedTeacherForFeedback(null); }}
        teacher={selectedTeacherForFeedback}
        adminToken={getToken()}
      />
    </div>
  );
};

// ── Admin Feedback Modal Component ──
const AdminTeacherFeedbackModal = ({ isOpen, onClose, teacher, adminToken }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && teacher) fetchFeedback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacher]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/feedback/admin/teacher/${teacher._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch {
      CustomToast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
    <div  exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div  exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
          <div>
             <h3 className="font-bold text-white text-lg">Feedback: {teacher?.name}</h3>
             <p className="text-xs text-gray-400">Viewing unfiltered feedback records</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"><FaTimes /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center items-center py-20"><FaSpinner className="animate-spin text-3xl text-purple-500" /></div>
          ) : feedbacks.length === 0 ? (
             <div className="text-center py-20 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                <FaComments className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No feedback entries found for this teacher.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {feedbacks.map(fb => (
                  <div key={fb._id} className="bg-white/[0.04] p-5 rounded-xl border border-white/10 relative group hover:border-purple-500/30 transition-colors">
                    {fb.isAnonymous && (
                       <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                         ANONYMOUS SUBMISSION
                       </div>
                    )}
                    <div className="flex gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {fb.studentId?.profileImage ? (
                             <img src={fb.studentId.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <FaUserGraduate className="text-gray-400" />
                          )}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">
                             {fb.studentId?.name || 'Unknown Student'}
                             {fb.isAnonymous && <span className="text-gray-500 font-normal ml-1">(Hidden from Teacher)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                             {fb.studentId?.email ? `${fb.studentId.email} • ` : ''}
                             {new Date(fb.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                       {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-700'}`} />)}
                    </div>
                    
                    {fb.batchId && (
                       <div className="mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                           Batch: {fb.batchId.name} {fb.batchId.classCode ? `(${fb.batchId.classCode})` : ''}
                         </span>
                       </div>
                    )}
                    
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                       <p className="text-sm text-gray-300 italic">
                         "{fb.comment || "No text feedback provided."}"
                       </p>
                    </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
};

export default AdminDashboard;
