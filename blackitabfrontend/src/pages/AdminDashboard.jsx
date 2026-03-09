import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaSchool, FaChartLine, FaSignOutAlt, FaSearch, FaShieldAlt,
  FaPlus, FaTrash, FaTimes, FaCheck, FaBan, FaQuestion, FaNewspaper,
  FaTrophy, FaEye, FaExclamationTriangle, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';

// ── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
};

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
  const [questionFilter, setQuestionFilter] = useState('pending');
  const [questionPage, setQuestionPage] = useState(1);
  const [questionPagination, setQuestionPagination] = useState({ pages: 1, total: 0 });
  const [postPage, setPostPage] = useState(1);
  const [postPagination, setPostPagination] = useState({ pages: 1, total: 0 });
  const [showCreateInstitute, setShowCreateInstitute] = useState(false);
  const [newInstitute, setNewInstitute] = useState({ name: '', instituteCode: '', subscriptionPlan: 'free' });
  const [rejectModal, setRejectModal] = useState({ open: false, questionId: null, note: '' });
  const [questionPreview, setQuestionPreview] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', instituteCode: '' });
  const [editUserModal, setEditUserModal] = useState(null);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [newContest, setNewContest] = useState({ title: '', description: '', startTime: '', endTime: '', difficultyLevel: 'Intermediate' });
  const [editContestModal, setEditContestModal] = useState(null);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ exam: 'jee', subject: '', question: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Medium', explanation: '' });

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
  }, []);

  const getToken = () => localStorage.getItem('adminToken');
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  // ── Fetch Functions ──
  const fetchStats = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setStats(res.data.data);
    } catch { /* fallback */ }
    setLoading(false);
  };

  const fetchUsers = async (token, page, search = '') => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=15&search=${search}`, {
        headers: { Authorization: `Bearer ${token || getToken()}` }
      });
      if (res.data.success) { setUsers(res.data.data); setUserPagination(res.data.pagination); }
    } catch { /* fallback */ }
  };

  const fetchInstitutes = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/institutes`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setInstitutes(res.data.data);
    } catch { /* fallback */ }
  };

  const fetchQuestions = async (status = 'pending', page = 1) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/questions?status=${status}&page=${page}&limit=15`, { headers: headers() });
      if (res.data.success) { setQuestions(res.data.data); setQuestionPagination(res.data.pagination); }
    } catch { setQuestions([]); }
  };

  const fetchGlobalAnalytics = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/analytics`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setGlobalAnalytics(res.data.data);
    } catch { /* fallback */ }
  };

  const fetchTeacherAnalytics = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/teachers`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setTeacherAnalytics(res.data.data);
    } catch { /* fallback */ }
  };

  const fetchPosts = async (page = 1) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/posts?page=${page}&limit=15`, { headers: headers() });
      if (res.data.success) { setPosts(res.data.data); setPostPagination(res.data.pagination); }
    } catch { setPosts([]); }
  };

  const fetchContests = async () => {
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
      const res = await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {}, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success(res.data.message);
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

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their data?')) return;
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

  const handleDeleteInstitute = async (id) => {
    if (!confirm('Delete this institute? All members will be unlinked.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/institutes/${id}`, { headers: headers() });
      fetchInstitutes();
      fetchStats(getToken());
      CustomToast.success('Institute deleted');
    } catch { CustomToast.error('Failed'); }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/questions/${id}/approve`, {}, { headers: headers() });
      fetchQuestions(questionFilter, questionPage);
      fetchStats(getToken());
      CustomToast.success('Question approved for global visibility');
    } catch { CustomToast.error('Failed to approve'); }
  };

  const handleReject = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/questions/${rejectModal.questionId}/reject`, { note: rejectModal.note }, { headers: headers() });
      fetchQuestions(questionFilter, questionPage);
      fetchStats(getToken());
      CustomToast.success('Question rejected');
    } catch { CustomToast.error('Failed to reject'); }
    setRejectModal({ open: false, questionId: null, note: '' });
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Permanently delete this question?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/questions/${id}`, { headers: headers() });
      fetchQuestions(questionFilter, questionPage);
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
      const res = await axios.put(`${API_URL}/api/admin/users/${editUserModal._id}`, editUserModal, { headers: headers() });
      CustomToast.success(res.data.message || 'User updated');
      fetchUsers(null, userPage, userSearch);
      fetchStats(getToken());
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setEditUserModal(null);
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.subject || !newQuestion.question || newQuestion.options.some(o => !o)) {
      CustomToast.error('All fields required'); return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/questions`, newQuestion, { headers: headers() });
      CustomToast.success('Question created and auto-approved');
      fetchQuestions(questionFilter, questionPage);
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
    if (activeTab === 'questions') fetchQuestions(questionFilter, 1);
    if (activeTab === 'posts') fetchPosts(1);
    if (activeTab === 'contests') fetchContests();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'questions') { setQuestionPage(1); fetchQuestions(questionFilter, 1); }
  }, [questionFilter]);

  // ── Layout Data ──
  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', icon: FaUsers },
    { label: 'Institutes', value: stats.totalInstitutes, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20', icon: FaSchool },
    { label: 'Daily Active', value: stats.dailyActiveUsers, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20', icon: FaChartLine },
    { label: 'Total Questions', value: stats.totalQuestions, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20', icon: FaQuestion },
    { label: 'Pending Approval', value: stats.pendingQuestions, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20', icon: FaExclamationTriangle },
    { label: 'Total Posts', value: stats.totalPosts, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20', icon: FaNewspaper },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'institutes', label: 'Institutes', icon: FaSchool },
    { id: 'questions', label: 'Questions', icon: FaQuestion, badge: stats?.pendingQuestions },
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Ambient BG Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <motion.div animate={{ x: [10, -10, 10], y: [15, -15, 15] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-5%] right-[5%] w-[450px] h-[450px] bg-orange-600/15 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Admin Top Bar */}
      <div className="bg-black/50 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-red-500 text-xl" />
          <span className="font-bold text-lg">Blackitab Admin</span>
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">SYSTEM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{admin?.username || 'admin'}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
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

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {statCards.map((s, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-6 border border-white/5 flex items-center justify-between rounded-2xl">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{loading ? '...' : s.value?.toLocaleString?.() ?? 0}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
                    <s.icon className={`text-xl ${s.color}`} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Role Distribution */}
            {stats?.roleCounts && (
              <motion.div variants={itemVariants} className="glass-panel p-6 border border-white/10 rounded-2xl mb-8">
                <h3 className="font-bold text-white mb-6 text-lg">Role Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(stats.roleCounts).map(([role, count]) => {
                    const colors = { student: 'from-blue-500 to-cyan-500', teacher: 'from-emerald-500 to-teal-500', hod: 'from-purple-500 to-pink-500', institute: 'from-orange-500 to-red-500' };
                    const total = Object.values(stats.roleCounts).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={role} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <p className="text-2xl font-bold text-white mb-1">{count}</p>
                        <p className="text-xs text-gray-500 capitalize mb-3">{role.replace('_', ' ')}</p>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${colors[role] || 'from-gray-500 to-gray-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Hierarchy Visualization */}
            <motion.div variants={itemVariants} className="glass-panel p-6 border border-white/10 rounded-2xl">
              <h3 className="font-bold text-white mb-6 text-lg">Platform Hierarchy</h3>
              <div className="flex flex-col items-center gap-3">
                {[
                  { role: 'System Admin', desc: 'Full platform control — users, institutes, question approval, posts, contests', color: 'from-red-500 to-orange-500', count: 1 },
                  { role: 'Institute Admin', desc: 'Manage institute members, assign roles', color: 'from-orange-500 to-yellow-500', count: stats?.roleCounts?.institute || 0 },
                  { role: 'HOD', desc: 'Department oversight, teacher management', color: 'from-purple-500 to-pink-500', count: stats?.roleCounts?.hod || 0 },
                  { role: 'Teacher', desc: 'Create questions (require approval for global), view analytics', color: 'from-emerald-500 to-teal-500', count: stats?.roleCounts?.teacher || 0 },
                  { role: 'Student', desc: 'Learn, practice, compete', color: 'from-blue-500 to-cyan-500', count: stats?.roleCounts?.student || 0 },
                ].map((level, i) => (
                  <React.Fragment key={level.role}>
                    {i > 0 && <div className="w-0.5 h-4 bg-white/10" />}
                    <div className={`w-full max-w-lg p-4 rounded-xl border border-white/10 flex items-center justify-between`}
                      style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))`, borderLeft: `3px solid` }}>
                      <div>
                        <p className="font-bold text-white text-sm">{level.role}</p>
                        <p className="text-xs text-gray-400">{level.desc}</p>
                      </div>
                      <span className={`text-lg font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>{level.count}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={userSearch} onChange={e => { setUserSearch(e.target.value); fetchUsers(null, 1, e.target.value); }}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50" />
              </div>
              <button onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors whitespace-nowrap">
                <FaPlus /> Create User
              </button>
            </div>

            {/* Create User Form */}
            {showCreateUser && (
              <div className="glass-panel p-6 border border-blue-500/20 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Create New User</h3>
                  <button onClick={() => setShowCreateUser(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Full Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Email" type="email" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Password (min 6 chars)" type="text" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    <option value="student" className="bg-gray-900">Student</option>
                    <option value="teacher" className="bg-gray-900">Teacher</option>
                    <option value="hod" className="bg-gray-900">HOD</option>
                    <option value="institute" className="bg-gray-900">Institute Admin</option>
                  </select>
                  <input value={newUser.instituteCode} onChange={e => setNewUser({ ...newUser, instituteCode: e.target.value.toUpperCase() })}
                    placeholder="Institute Code (optional)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none uppercase" />
                </div>
                <button onClick={handleCreateUser}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors">
                  Create User
                </button>
              </div>
            )}

            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Institute</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{u.name} {u.isBanned && <span className="text-red-400 text-[10px] ml-1">BANNED</span>}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 outline-none capitalize cursor-pointer">
                          {['student', 'teacher', 'hod', 'institute'].map(r => (
                            <option key={r} value={r} className="bg-gray-900 capitalize">{r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.instituteId?.name || '— Independent —'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleBan(u._id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          <button onClick={() => setEditUserModal({ _id: u._id, name: u.name, email: u.email, bio: u.bio || '', points: u.points || 0, xp: u.xp || 0, streak: u.streak || 0, instituteCode: u.instituteId?.instituteCode || '' })}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete user">
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
              <Pagination pagination={userPagination} current={userPage} onPageChange={p => { setUserPage(p); fetchUsers(null, p, userSearch); }} />
            </div>
          </motion.div>
        )}

        {/* ── INSTITUTES TAB ── */}
        {activeTab === 'institutes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Registered Institutes ({institutes.length})</h2>
              <button onClick={() => setShowCreateInstitute(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
                <FaPlus /> Add Institute
              </button>
            </div>

            {/* Create Institute Modal */}
            {showCreateInstitute && (
              <div className="glass-panel p-6 border border-white/10 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">New Institute</h3>
                  <button onClick={() => setShowCreateInstitute(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input value={newInstitute.name} onChange={e => setNewInstitute({ ...newInstitute, name: e.target.value })}
                    placeholder="Institute Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newInstitute.instituteCode} onChange={e => setNewInstitute({ ...newInstitute, instituteCode: e.target.value.toUpperCase() })}
                    placeholder="Code (e.g. PICT2024)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none uppercase" />
                  <select value={newInstitute.subscriptionPlan} onChange={e => setNewInstitute({ ...newInstitute, subscriptionPlan: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    <option value="free" className="bg-gray-900">Free</option>
                    <option value="basic" className="bg-gray-900">Basic</option>
                    <option value="premium" className="bg-gray-900">Premium</option>
                    <option value="enterprise" className="bg-gray-900">Enterprise</option>
                  </select>
                </div>
                <button onClick={handleCreateInstitute}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors">
                  Create Institute
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutes.map(inst => (
                <motion.div key={inst._id} whileHover={{ y: -3 }} className="glass-panel p-6 border border-white/10 rounded-2xl group relative">
                  <button onClick={() => handleDeleteInstitute(inst._id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                    <FaTrash className="text-xs" />
                  </button>
                  <h3 className="text-white font-bold mb-1 pr-8">{inst.name}</h3>
                  <p className="text-orange-400 text-xs font-mono mb-3">{inst.instituteCode}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400"><FaUsers className="inline mr-1" /> {inst.memberCount} members</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inst.subscriptionPlan === 'premium' ? 'bg-yellow-500/10 text-yellow-400' :
                      inst.subscriptionPlan === 'enterprise' ? 'bg-purple-500/10 text-purple-400' :
                      inst.subscriptionPlan === 'basic' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>{inst.subscriptionPlan}</span>
                  </div>
                </motion.div>
              ))}
              {institutes.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <FaSchool className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No institutes registered</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS TAB (NEW) ── */}
        {activeTab === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-white">Question Approval</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowCreateQuestion(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
                  <FaPlus /> Create Question
                </button>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {['pending', 'approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => setQuestionFilter(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      questionFilter === s ? `text-white ${s === 'pending' ? 'bg-yellow-500/20' : s === 'approved' ? 'bg-emerald-500/20' : 'bg-red-500/20'}` : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              </div>
            </div>

            {/* Create Question Form */}
            {showCreateQuestion && (
              <div className="glass-panel p-6 border border-emerald-500/20 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Create Question (Auto-Approved)</h3>
                  <button onClick={() => setShowCreateQuestion(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select value={newQuestion.exam} onChange={e => setNewQuestion({ ...newQuestion, exam: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    {['jee', 'neet', 'gate', 'cat', 'upsc', 'other'].map(e => <option key={e} value={e} className="bg-gray-900 uppercase">{e.toUpperCase()}</option>)}
                  </select>
                  <input value={newQuestion.subject} onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    placeholder="Subject (e.g. Physics)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <select value={newQuestion.difficulty} onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                  </select>
                </div>
                <textarea value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Question text..." rows={2} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none resize-none mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: i })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          newQuestion.correctAnswer === i ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-500'
                        }`}>{String.fromCharCode(65 + i)}</button>
                      <input value={opt} onChange={e => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion({ ...newQuestion, options: opts }); }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                    </div>
                  ))}
                </div>
                <input value={newQuestion.explanation} onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Explanation (optional)" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none mb-4" />
                <button onClick={handleCreateQuestion}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors">
                  Create Question
                </button>
              </div>
            )}

            {/* Info Box */}
            <div className="glass-panel p-4 border border-blue-500/20 rounded-xl mb-6 flex items-start gap-3">
              <FaExclamationTriangle className="text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-400">
                <strong className="text-blue-400">Approval System:</strong> Teachers create questions → they appear here as <strong>Pending</strong>.
                Questions within the <strong>same institute</strong> are visible immediately. For <strong>global visibility</strong> (all students worldwide), you must <strong>Approve</strong> them manually.
              </div>
            </div>

            <div className="space-y-3">
              {questions.map(q => (
                <motion.div key={q._id} layout className="glass-panel p-5 border border-white/10 rounded-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">{q.exam}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">{q.subject}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>{q.difficulty}</span>
                        {q.instituteId && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400">{q.instituteId.name}</span>}
                      </div>
                      <p className="text-white text-sm font-medium mb-1 line-clamp-2">{q.question}</p>
                      <p className="text-gray-500 text-xs">
                        By: {q.createdBy?.name || 'Unknown'} ({q.createdBy?.email || '—'}) · {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                      {q.approvalNote && q.approvalStatus === 'rejected' && (
                        <p className="text-red-400/80 text-xs mt-1 italic">Rejection note: {q.approvalNote}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setQuestionPreview(q)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Preview">
                        <FaEye />
                      </button>
                      {q.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(q._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                            <FaCheck /> Approve
                          </button>
                          <button onClick={() => setRejectModal({ open: true, questionId: q._id, note: '' })}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                            <FaBan /> Reject
                          </button>
                        </>
                      )}
                      {q.approvalStatus === 'rejected' && (
                        <button onClick={() => handleApprove(q._id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1">
                          <FaCheck /> Approve
                        </button>
                      )}
                      <button onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaQuestion className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No {questionFilter} questions</p>
                </div>
              )}
            </div>
            <Pagination pagination={questionPagination} current={questionPage} onPageChange={p => { setQuestionPage(p); fetchQuestions(questionFilter, p); }} />
          </motion.div>
        )}

        {/* ── POSTS TAB (NEW) ── */}
        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Content Moderation — Posts ({postPagination.total})</h2>
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p._id} className="glass-panel p-5 border border-white/10 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.userId?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{p.userId?.name || 'Unknown'}</p>
                        <p className="text-gray-500 text-xs">{p.userId?.email || '—'} · {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3">{p.content || p.text || p.title || 'No content'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>❤️ {p.likes?.length || 0}</span>
                      <span>💬 {p.comments?.length || 0}</span>
                      {p.type && <span className="px-2 py-0.5 bg-white/5 rounded-full">{p.type}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeletePost(p._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0" title="Delete post">
                    <FaTrash />
                  </button>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaNewspaper className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
            <Pagination pagination={postPagination} current={postPage} onPageChange={p => { setPostPage(p); fetchPosts(p); }} />
          </motion.div>
        )}

        {/* ── CONTESTS TAB (NEW) ── */}
        {activeTab === 'contests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Contest Management ({contests.length})</h2>
              <button onClick={() => setShowCreateContest(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-bold hover:bg-yellow-500/20 transition-colors">
                <FaPlus /> Create Contest
              </button>
            </div>

            {/* Create Contest Form */}
            {showCreateContest && (
              <div className="glass-panel p-6 border border-yellow-500/20 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">New Contest</h3>
                  <button onClick={() => setShowCreateContest(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <input value={newContest.title} onChange={e => setNewContest({ ...newContest, title: e.target.value })}
                    placeholder="Contest Title" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newContest.startTime} onChange={e => setNewContest({ ...newContest, startTime: e.target.value })}
                    type="datetime-local" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
                  <input value={newContest.endTime} onChange={e => setNewContest({ ...newContest, endTime: e.target.value })}
                    type="datetime-local" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
                  <select value={newContest.difficultyLevel} onChange={e => setNewContest({ ...newContest, difficultyLevel: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                  </select>
                  <input value={newContest.description} onChange={e => setNewContest({ ...newContest, description: e.target.value })}
                    placeholder="Description (optional)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none col-span-2" />
                </div>
                <button onClick={handleCreateContest}
                  className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold text-sm transition-colors">
                  Create Contest
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contests.map(c => (
                <motion.div key={c._id} whileHover={{ y: -3 }} className="glass-panel p-6 border border-white/10 rounded-2xl group relative">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditContestModal({ _id: c._id, title: c.title, description: c.description || '', startTime: c.startTime?.slice(0,16) || '', endTime: c.endTime?.slice(0,16) || '', difficultyLevel: c.difficultyLevel || 'Intermediate', isActive: c.isActive || false })}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                      <FaEye className="text-xs" />
                    </button>
                    <button onClick={() => handleDeleteContest(c._id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrophy className="text-yellow-400" />
                    <h3 className="text-white font-bold pr-8">{c.title || c.name || 'Contest'}</h3>
                  </div>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{c.startTime ? new Date(c.startTime).toLocaleDateString() : 'No date'}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      c.status === 'completed' ? 'bg-gray-500/10 text-gray-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{c.status || 'draft'}</span>
                  </div>
                </motion.div>
              ))}
              {contests.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <FaTrophy className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No contests</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ANALYTICS TAB (NEW - GLOBAL PARITY) ── */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Global Platform Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6 border border-white/10 rounded-2xl">
                <h3 className="font-bold text-white mb-4">Engagement Overview</h3>
                {globalAnalytics ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Total Question Attempts</p>
                      <p className="text-2xl font-bold text-blue-400">{globalAnalytics.overview.totalAttempts}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Total Social Posts</p>
                      <p className="text-2xl font-bold text-cyan-400">{globalAnalytics.overview.totalPosts}</p>
                    </div>
                  </div>
                ) : <p className="text-gray-500">Loading analytics...</p>}
              </div>

              <div className="glass-panel p-6 border border-white/10 rounded-2xl">
                <h3 className="font-bold text-white mb-4">Latest Signups</h3>
                {globalAnalytics?.recentSignups ? (
                  <div className="space-y-3">
                    {globalAnalytics.recentSignups.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                        <span className="text-white font-medium">{user.name}</span>
                        <span className="text-gray-400 text-xs uppercase">{user.role}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500">Loading signups...</p>}
              </div>
            </div>

            <h3 className="font-bold text-white mb-4 text-lg">Global Teacher Feedback</h3>
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Institute</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Reviews</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teacherAnalytics.map(t => (
                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${t.isFlagged ? 'bg-red-500/20 text-red-400' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                            {t.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{t.name}</p>
                            <p className="text-gray-500 text-xs">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{t.instituteName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${t.avgRating >= 4 ? 'text-emerald-400' : t.avgRating >= 2.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {t.avgRating.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-xs">/ 5.0</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{t.feedbackCount}</td>
                      <td className="px-4 py-3">
                        {t.isFlagged ? (
                          <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                            <FaExclamationTriangle /> Flagged
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                            <FaCheck /> Good Standing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {teacherAnalytics.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No teachers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── REJECT MODAL ── */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setRejectModal({ open: false, questionId: null, note: '' })}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 border border-white/10 rounded-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <FaBan className="text-red-400" /> Reject Question
              </h3>
              <textarea
                value={rejectModal.note}
                onChange={e => setRejectModal({ ...rejectModal, note: e.target.value })}
                placeholder="Reason for rejection (optional but helpful for the teacher)..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-red-500/50 resize-none mb-4"
              />
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setRejectModal({ open: false, questionId: null, note: '' })}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex items-center gap-2">
                  <FaBan /> Reject Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QUESTION PREVIEW MODAL ── */}
      <AnimatePresence>
        {questionPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setQuestionPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT USER MODAL ── */}
      <AnimatePresence>
        {editUserModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEditUserModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT CONTEST MODAL ── */}
      <AnimatePresence>
        {editContestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEditContestModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setEditContestModal(null)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleEditContest} className="px-5 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold transition-colors">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
