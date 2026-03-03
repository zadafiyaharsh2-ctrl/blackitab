import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaSchool, FaChartLine, FaSignOutAlt, FaSearch, FaShieldAlt, FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';

// ── Dummy / Fallback Data ──────────────────────────────────────────────────
const DUMMY_STATS = {
  totalUsers: 1247,
  totalInstitutes: 18,
  dailyActiveUsers: 342,
  totalAttempts: 28470,
  totalPosts: 1560,
  roleCounts: { student: 980, teacher: 156, hod: 42, institute_admin: 18 }
};

const DUMMY_USERS = [
  { _id: 'd1', name: 'Aarav Sharma', email: 'aarav@pict.edu', role: 'student', instituteId: { name: 'PICT', instituteCode: 'PICT2024' }, isBanned: false },
  { _id: 'd2', name: 'Priya Deshmukh', email: 'priya@pict.edu', role: 'teacher', instituteId: { name: 'PICT', instituteCode: 'PICT2024' }, isBanned: false },
  { _id: 'd3', name: 'Rohan Patil', email: 'rohan@coep.edu', role: 'hod', instituteId: { name: 'COEP', instituteCode: 'COEP2024' }, isBanned: false },
  { _id: 'd4', name: 'Sneha Kulkarni', email: 'sneha@vit.edu', role: 'institute_admin', instituteId: { name: 'VIT Pune', instituteCode: 'VIT2024' }, isBanned: false },
  { _id: 'd5', name: 'Vikram Joshi', email: 'vikram@mit.edu', role: 'student', instituteId: { name: 'MIT WPU', instituteCode: 'MITWPU' }, isBanned: true },
  { _id: 'd6', name: 'Ananya Iyer', email: 'ananya@pict.edu', role: 'student', instituteId: { name: 'PICT', instituteCode: 'PICT2024' }, isBanned: false },
  { _id: 'd7', name: 'Karan Mehta', email: 'karan@coep.edu', role: 'teacher', instituteId: { name: 'COEP', instituteCode: 'COEP2024' }, isBanned: false },
  { _id: 'd8', name: 'Diya Nair', email: 'diya@vit.edu', role: 'student', instituteId: { name: 'VIT Pune', instituteCode: 'VIT2024' }, isBanned: false },
  { _id: 'd9', name: 'Arjun Reddy', email: 'arjun@bits.edu', role: 'hod', instituteId: { name: 'BITS Pilani', instituteCode: 'BITS2024' }, isBanned: false },
  { _id: 'd10', name: 'Meera Gupta', email: 'meera@iit.edu', role: 'student', instituteId: null, isBanned: false },
];

const DUMMY_INSTITUTES = [
  { _id: 'i1', name: 'PICT, Pune', instituteCode: 'PICT2024', subscriptionPlan: 'premium', memberCount: 356 },
  { _id: 'i2', name: 'COEP Technological University', instituteCode: 'COEP2024', subscriptionPlan: 'enterprise', memberCount: 520 },
  { _id: 'i3', name: 'VIT Pune', instituteCode: 'VIT2024', subscriptionPlan: 'basic', memberCount: 210 },
  { _id: 'i4', name: 'MIT WPU', instituteCode: 'MITWPU', subscriptionPlan: 'premium', memberCount: 180 },
  { _id: 'i5', name: 'BITS Pilani — Goa', instituteCode: 'BITS2024', subscriptionPlan: 'enterprise', memberCount: 430 },
  { _id: 'i6', name: 'Walchand College of Engineering', instituteCode: 'WCE2024', subscriptionPlan: 'free', memberCount: 95 },
];

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
  const [stats, setStats] = useState(DUMMY_STATS);
  const [users, setUsers] = useState(DUMMY_USERS);
  const [institutes, setInstitutes] = useState(DUMMY_INSTITUTES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ pages: 1 });
  const [showCreateInstitute, setShowCreateInstitute] = useState(false);
  const [newInstitute, setNewInstitute] = useState({ name: '', instituteCode: '', subscriptionPlan: 'free' });

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { navigate('/admin/login'); return; }
    if (adminData) setAdmin(JSON.parse(adminData));
    fetchStats(adminToken);
    fetchUsers(adminToken, 1);
    fetchInstitutes(adminToken);
  }, []);

  const getToken = () => localStorage.getItem('adminToken');
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  const fetchStats = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setStats(res.data.data);
    } catch { /* keep dummy */ }
    setLoading(false);
  };

  const fetchUsers = async (token, page, search = '') => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=15&search=${search}`, {
        headers: { Authorization: `Bearer ${token || getToken()}` }
      });
      if (res.data.success) { setUsers(res.data.data); setUserPagination(res.data.pagination); }
    } catch { /* keep dummy */ }
  };

  const fetchInstitutes = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/institutes`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setInstitutes(res.data.data);
    } catch { /* keep dummy */ }
  };

  const handleRoleChange = async (userId, role) => {
    if (userId.startsWith('d')) { // dummy user
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      CustomToast.success('Role updated (demo)');
      return;
    }
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role }, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success('Role updated');
    } catch { CustomToast.error('Failed'); }
  };

  const handleBan = async (userId) => {
    if (userId.startsWith('d')) {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u));
      CustomToast.success('Status toggled (demo)');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {}, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success(res.data.message);
    } catch { CustomToast.error('Failed'); }
  };

  const handleCreateInstitute = async () => {
    if (!newInstitute.name || !newInstitute.instituteCode) {
      CustomToast.error('Name and code required');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/institutes`, newInstitute, { headers: headers() });
      fetchInstitutes();
      CustomToast.success('Institute created');
    } catch {
      // Demo fallback
      setInstitutes(prev => [...prev, { _id: `i${Date.now()}`, ...newInstitute, memberCount: 0 }]);
      CustomToast.success('Institute created (demo)');
    }
    setShowCreateInstitute(false);
    setNewInstitute({ name: '', instituteCode: '', subscriptionPlan: 'free' });
  };

  const handleDeleteInstitute = async (id) => {
    if (id.startsWith('i')) {
      setInstitutes(prev => prev.filter(i => i._id !== id));
      CustomToast.success('Deleted (demo)');
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/admin/institutes/${id}`, { headers: headers() });
      fetchInstitutes();
      CustomToast.success('Institute deleted');
    } catch { CustomToast.error('Failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Institutes', value: stats.totalInstitutes, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
    { label: 'Daily Active', value: stats.dailyActiveUsers, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Total Attempts', value: stats.totalAttempts, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'institutes', label: 'Institutes' },
  ];

  const filteredUsers = userSearch
    ? users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

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
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-6 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{loading ? '...' : s.value?.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
                    <FaChartLine className={`text-xl ${s.color}`} />
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
                    const colors = { student: 'from-blue-500 to-cyan-500', teacher: 'from-emerald-500 to-teal-500', hod: 'from-purple-500 to-pink-500', institute_admin: 'from-orange-500 to-red-500' };
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
                  { role: 'System Admin', desc: 'Full platform control, manage institutes & users', color: 'from-red-500 to-orange-500', count: 1 },
                  { role: 'Institute Admin', desc: 'Manage institute members, assign roles', color: 'from-orange-500 to-yellow-500', count: stats.roleCounts?.institute_admin || 0 },
                  { role: 'HOD', desc: 'Department oversight, teacher management', color: 'from-purple-500 to-pink-500', count: stats.roleCounts?.hod || 0 },
                  { role: 'Teacher', desc: 'Create questions, view analytics', color: 'from-emerald-500 to-teal-500', count: stats.roleCounts?.teacher || 0 },
                  { role: 'Student', desc: 'Learn, practice, compete', color: 'from-blue-500 to-cyan-500', count: stats.roleCounts?.student || 0 },
                ].map((level, i) => (
                  <React.Fragment key={level.role}>
                    {i > 0 && <div className="w-0.5 h-4 bg-white/10" />}
                    <div className={`w-full max-w-lg p-4 rounded-xl bg-gradient-to-r ${level.color} bg-opacity-10 border border-white/10 flex items-center justify-between`}
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
            </div>
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
                            <p className="text-white text-sm font-medium">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 outline-none capitalize cursor-pointer">
                          {['student', 'teacher', 'hod', 'institute_admin'].map(r => (
                            <option key={r} value={r} className="bg-gray-900 capitalize">{r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.instituteId?.name || '— Independent —'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleBan(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userPagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
                  {Array.from({ length: userPagination.pages }, (_, i) => i + 1).slice(0, 10).map(p => (
                    <button key={p} onClick={() => { setUserPage(p); fetchUsers(null, p, userSearch); }}
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${p === userPage ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>{p}</button>
                  ))}
                </div>
              )}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
