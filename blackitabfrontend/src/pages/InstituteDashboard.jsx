import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaUserGraduate, FaChalkboardTeacher, FaSearch, FaCopy, FaPlus, FaTimes,
  FaTrash, FaChartBar, FaListAlt, FaShieldAlt, FaQuestion, FaNewspaper, FaCog,
  FaTrophy, FaChartLine, FaBan, FaEye
} from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

const InstituteDashboard = () => {
  usePageTitle('Institute Admin');
  const [institute, setInstitute] = useState(null);
  const [members, setMembers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'student' });

  // Get current user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'institute_admin';
  const isHOD = user.role === 'hod';

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  const fetchInstitute = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/institute/my`, { headers: headers() });
      if (res.data.success) setInstitute(res.data.data);
    } catch { }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/institute/stats`, { headers: headers() });
      if (res.data.success) setStats(res.data.data);
    } catch { }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/institute/members`, { headers: headers() });
      if (res.data.success) setMembers(res.data.data);
    } catch { }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/institute/questions`, { headers: headers() });
      if (res.data.success) setQuestions(res.data.data);
    } catch { }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/institute/posts`, { headers: headers() });
      if (res.data.success) setPosts(res.data.data);
    } catch { }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [resAnalytic, resTeacher] = await Promise.all([
        axios.get(`${API_URL}/api/institute/analytics`, { headers: headers() }),
        axios.get(`${API_URL}/api/institute/teachers`, { headers: headers() })
      ]);
      if (resAnalytic.data.success) setAnalytics(resAnalytic.data.data);
      if (resTeacher.data.success) setTeachers(resTeacher.data.data);
    } catch { }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchInstitute();
      await fetchStats();
      await fetchMembers();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') fetchQuestions();
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  // ── Handlers ──
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/api/institute/members/${userId}/role`, { role: newRole }, { headers: headers() });
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, role: newRole } : m));
      CustomToast.success('Role updated');
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleBanMember = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/api/institute/members/${userId}/ban`, {}, { headers: headers() });
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, isBanned: res.data.data.isBanned } : m));
      CustomToast.success(res.data.message);
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from your institute? They will be unlinked but their account remains.')) return;
    try {
      await axios.delete(`${API_URL}/api/institute/members/${userId}`, { headers: headers() });
      setMembers(prev => prev.filter(m => m._id !== userId));
      fetchStats();
      CustomToast.success('Member removed');
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      CustomToast.error('All fields are required'); return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/institute/members`, newMember, { headers: headers() });
      CustomToast.success(res.data.message);
      fetchMembers();
      fetchStats();
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
    setShowAddMember(false);
    setNewMember({ name: '', email: '', password: '', role: 'student' });
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await axios.delete(`${API_URL}/api/institute/questions/${id}`, { headers: headers() });
      setQuestions(prev => prev.filter(q => q._id !== id));
      CustomToast.success('Question deleted');
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/api/institute/posts/${id}`, { headers: headers() });
      setPosts(prev => prev.filter(p => p._id !== id));
      CustomToast.success('Post deleted');
    } catch (err) { CustomToast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Filtered members ──
  const filtered = members.filter(m => {
    if (search && !m.name?.toLowerCase().includes(search.toLowerCase()) && !m.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && m.role !== roleFilter) return false;
    return true;
  });

  const roleCounts = members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {});

  const roleColors = {
    student: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    teacher: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hod: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    institute_admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };

  const planColors = {
    free: 'text-gray-400', basic: 'text-blue-400', premium: 'text-yellow-400', enterprise: 'text-purple-400'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'members', label: 'Members', icon: FaUsers },
    { id: 'questions', label: 'Questions', icon: FaQuestion },
    { id: 'posts', label: 'Posts', icon: FaNewspaper },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-15, 15, -15], y: [-10, 20, -10] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <motion.div animate={{ x: [10, -20, 10], y: [15, -10, 15] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <motion.div className="relative z-10 max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Institute </span>
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <span>{institute?.name || 'Loading...'}</span>
            {institute?.instituteCode && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                <span className="font-mono text-orange-400 text-sm">{institute.instituteCode}</span>
                <button onClick={() => { navigator.clipboard.writeText(institute.instituteCode); CustomToast.success('Code copied!'); }}
                  className="text-gray-500 hover:text-white transition-colors ml-1"><FaCopy className="text-xs" /></button>
              </span>
            )}
            <span className={`text-sm font-semibold capitalize ${planColors[institute?.subscriptionPlan] || ''}`}>
              {institute?.subscriptionPlan || 'free'} plan
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColors[user.role] || ''}`}>
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === t.id ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}>
              <t.icon className="text-xs" /> {t.label}
            </button>
          ))}
        </motion.div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Members', value: stats?.members || members.length, icon: FaUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
                { label: 'Students', value: stats?.roleCounts?.student || roleCounts.student || 0, icon: FaUserGraduate, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
                { label: 'Teachers', value: stats?.roleCounts?.teacher || roleCounts.teacher || 0, icon: FaChalkboardTeacher, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
                { label: 'HODs', value: stats?.roleCounts?.hod || roleCounts.hod || 0, icon: FaShieldAlt, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' },
              ].map((s, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : s.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
                    <s.icon className={`text-xl ${s.color}`} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Extra Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass-panel p-5 border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Questions</p>
                <p className="text-2xl font-bold text-white">{stats?.questions || 0}</p>
                {stats?.pendingQuestions > 0 && <p className="text-yellow-400 text-xs mt-1">{stats.pendingQuestions} pending approval</p>}
              </div>
              <div className="glass-panel p-5 border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Posts</p>
                <p className="text-2xl font-bold text-white">{stats?.posts || 0}</p>
              </div>
              <div className="glass-panel p-5 border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-white">{stats?.attempts || 0}</p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Link to="/school-analytics" className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2">
                <FaChartBar /> School Analytics
              </Link>
              <Link to="/my-questions" className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                <FaListAlt /> Question Bank
              </Link>
              <Link to="/teacher-dashboard" className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
                <FaChalkboardTeacher /> Teacher Panel
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ── MEMBERS TAB ── */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search + Add */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500/50" />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none cursor-pointer">
                <option value="" className="bg-gray-900">All Roles</option>
                <option value="student" className="bg-gray-900">Students</option>
                <option value="teacher" className="bg-gray-900">Teachers</option>
                <option value="hod" className="bg-gray-900">HODs</option>
              </select>
              {isAdmin && (
                <button onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition-colors whitespace-nowrap">
                  <FaPlus /> Add Member
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="glass-panel p-6 border border-orange-500/20 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Add Member</h3>
                  <button onClick={() => setShowAddMember(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Email" type="email" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <input value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                    placeholder="Password" type="text" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
                  <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                    <option value="student" className="bg-gray-900">Student</option>
                    <option value="teacher" className="bg-gray-900">Teacher</option>
                    <option value="hod" className="bg-gray-900">HOD</option>
                  </select>
                </div>
                <button onClick={handleAddMember}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-colors">
                  Add Member
                </button>
              </div>
            )}

            {/* Members Table */}
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-bold text-white">Members ({filtered.length})</h2>
              </div>
              {loading ? (
                <div className="text-center py-16 text-gray-500">Loading members...</div>
              ) : filtered.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-xs text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Member</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-left px-4 py-3">Stats</th>
                      {isAdmin && <th className="text-left px-4 py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map(m => (
                      <tr key={m._id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
                              {m.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                {m.name} {m.isBanned && <span className="text-red-400 text-[10px] ml-1">BANNED</span>}
                              </p>
                              <p className="text-gray-500 text-xs">{m.email}{m.batchYear ? ` · ${m.batchYear}` : ''}{m.division ? ` · Div ${m.division}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <select value={m.role} onChange={e => handleRoleChange(m._id, e.target.value)}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 outline-none capitalize cursor-pointer">
                              {['student', 'teacher', 'hod'].map(r => (
                                <option key={r} value={r} className="bg-gray-900 capitalize">{r}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${roleColors[m.role] || ''}`}>
                              {m.role?.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">
                            <span className="text-white font-bold">{m.points || 0}</span> pts · <span className="text-white font-bold">{m.streak || 0}</span> streak
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleBanMember(m._id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${m.isBanned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                {m.isBanned ? 'Unban' : 'Ban'}
                              </button>
                              <button onClick={() => handleRemoveMember(m._id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Remove from institute">
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16 text-gray-500">No members found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Institute Questions ({questions.length})</h2>
            <div className="space-y-3">
              {questions.map(q => (
                <div key={q._id} className="glass-panel p-5 border border-white/10 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">{q.exam}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">{q.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        q.approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        q.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{q.approvalStatus || 'pending'}</span>
                    </div>
                    <p className="text-white text-sm font-medium mb-1 line-clamp-2">{q.question}</p>
                    <p className="text-gray-500 text-xs">By: {q.createdBy?.name || 'Unknown'} · {new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteQuestion(q._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaQuestion className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No questions from your institute yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── POSTS TAB ── */}
        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Institute Posts ({posts.length})</h2>
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p._id} className="glass-panel p-5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center text-white text-xs font-bold">
                        {p.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-white text-sm font-medium">{p.user?.name || 'Unknown'}</span>
                      <span className="text-gray-500 text-xs">{p.user?.email || ''} · {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{p.caption || p.title || 'No content'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>❤️ {p.likes?.length || 0}</span>
                      <span>💬 {p.comments?.length || 0}</span>
                      {p.contentType && <span className="px-2 py-0.5 bg-white/5 rounded-full">{p.contentType}</span>}
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeletePost(p._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaNewspaper className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No posts from your institute yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Institute Analytics</h2>

            {!analytics ? (
              <div className="text-center py-16 text-gray-500">Loading analytics...</div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  <div className="glass-panel p-5 border border-white/5">
                    <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Attempts</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalAttempts}</p>
                  </div>
                  <div className="glass-panel p-5 border border-white/5">
                    <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Accuracy</p>
                    <p className="text-2xl font-bold text-emerald-400">{analytics.accuracy}%</p>
                  </div>
                  <div className="glass-panel p-5 border border-white/5">
                    <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Avg Time/Question</p>
                    <p className="text-2xl font-bold text-blue-400">{analytics.avgTimeSeconds}s</p>
                  </div>
                </div>

                {/* Subject-wise Accuracy */}
                {analytics.subjectStats?.length > 0 && (
                  <div className="glass-panel p-6 border border-white/10 rounded-2xl mb-8">
                    <h3 className="font-bold text-white mb-4">Subject-wise Performance</h3>
                    <div className="space-y-3">
                      {analytics.subjectStats.map(s => (
                        <div key={s.subject}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300 capitalize">{s.subject}</span>
                            <span className="text-xs text-gray-500">{s.correct}/{s.total} ({Math.round(s.accuracy)}%)</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.round(s.accuracy)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard & Teacher Ratings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Student Leaderboard */}
                  <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden self-start">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="font-bold text-white flex items-center gap-2"><FaTrophy className="text-yellow-400" /> Institute Leaderboard</h3>
                    </div>
                    {analytics.leaderboard?.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {analytics.leaderboard.map((student, i) => (
                          <div key={student._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              i === 1 ? 'bg-gray-400/20 text-gray-300' :
                              i === 2 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-white/5 text-gray-500'
                            }`}>#{i + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {student.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{student.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-white font-bold text-sm">{student.points || 0} <span className="text-[10px] text-gray-500 font-normal">pts</span></p>
                              <p className="text-gray-500 text-[10px]">{student.streak || 0} streak</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 text-sm">No student data yet</div>
                    )}
                  </div>

                  {/* Teacher Ratings */}
                  <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden self-start">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="font-bold text-white flex items-center gap-2"><FaChalkboardTeacher className="text-emerald-400" /> Teacher Ratings</h3>
                    </div>
                    {teachers.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {teachers.map(teacher => (
                          <div key={teacher._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              teacher.isFlagged ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 animate-pulse border border-red-500/50' : 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30'
                            }`}>
                              {teacher.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-medium truncate">{teacher.name}</p>
                                {teacher.isFlagged && <span className="px-1.5 py-[1px] bg-red-500/20 text-red-500 rounded text-[9px] font-bold uppercase border border-red-500/30">Action Needed</span>}
                              </div>
                              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{teacher.role}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-yellow-400 text-xs">★</span>
                                <span className={`font-bold text-sm ${teacher.avgRating < 2.5 && teacher.feedbackCount > 0 ? 'text-red-400' : 'text-white'}`}>
                                  {teacher.avgRating > 0 ? teacher.avgRating.toFixed(1) : '—'}
                                </span>
                              </div>
                              <p className="text-gray-500 text-[10px]">{teacher.feedbackCount} reviews</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 text-sm">No teachers found</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-6">Institute Settings</h2>
            <div className="glass-panel p-6 border border-white/10 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Institute Name</label>
                  <p className="text-white font-medium">{institute?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Institute Code</label>
                  <p className="text-orange-400 font-mono font-bold">{institute?.instituteCode || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Subscription Plan</label>
                  <p className={`font-bold capitalize ${planColors[institute?.subscriptionPlan] || 'text-gray-400'}`}>{institute?.subscriptionPlan || 'free'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Admin Emails</label>
                  <div className="flex flex-wrap gap-2">
                    {institute?.adminEmails?.length > 0 ? institute.adminEmails.map((e, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300">{e}</span>
                    )) : <span className="text-gray-500 text-xs">None configured</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Created</label>
                  <p className="text-gray-300 text-sm">{institute?.createdAt ? new Date(institute.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Total Members</label>
                  <p className="text-white font-bold text-lg">{members.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default InstituteDashboard;
