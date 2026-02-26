import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaSchool, FaChartLine, FaSignOutAlt, FaSearch, FaShieldAlt } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({});

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
    } catch { }
    setLoading(false);
  };

  const fetchUsers = async (token, page, search = '') => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=15&search=${search}`, {
        headers: { Authorization: `Bearer ${token || getToken()}` }
      });
      if (res.data.success) { setUsers(res.data.data); setUserPagination(res.data.pagination); }
    } catch { }
  };

  const fetchInstitutes = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/institutes`, { headers: { Authorization: `Bearer ${token || getToken()}` } });
      if (res.data.success) setInstitutes(res.data.data);
    } catch { }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role }, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success('Role updated');
    } catch { CustomToast.error('Failed'); }
  };

  const handleBan = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {}, { headers: headers() });
      fetchUsers(null, userPage, userSearch);
      CustomToast.success(res.data.message);
    } catch { CustomToast.error('Failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
    { label: 'Institutes', value: stats.totalInstitutes, color: 'text-emerald-400' },
    { label: 'Daily Active', value: stats.dailyActiveUsers, color: 'text-purple-400' },
    { label: 'Total Attempts', value: stats.totalAttempts, color: 'text-yellow-400' },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'institutes', label: 'Institutes' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Admin Top Bar */}
      <div className="bg-black/50 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-red-500 text-xl" />
          <span className="font-bold text-lg">Blackitab Admin</span>
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">SYSTEM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{admin?.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s, i) => (
                <div key={i} className="glass-panel p-6 border border-white/5 rounded-2xl">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value?.toLocaleString()}</p>
                </div>
              ))}
            </div>
            {stats?.roleCounts && (
              <div className="glass-panel p-6 border border-white/10 rounded-2xl">
                <h3 className="font-bold text-white mb-4">Role Distribution</h3>
                <div className="flex flex-wrap gap-6">
                  {Object.entries(stats.roleCounts).map(([role, count]) => (
                    <div key={role} className="text-center">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-gray-500 capitalize">{role.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={userSearch} onChange={e => { setUserSearch(e.target.value); fetchUsers(null, 1, e.target.value); }}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
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
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 outline-none capitalize">
                          {['student', 'teacher', 'hod', 'institute_admin'].map(r => (
                            <option key={r} value={r} className="bg-gray-900 capitalize">{r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.instituteId?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleBan(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
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

        {/* Institutes */}
        {activeTab === 'institutes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutes.map(inst => (
                <div key={inst._id} className="glass-panel p-6 border border-white/10 rounded-2xl">
                  <h3 className="text-white font-bold mb-1">{inst.name}</h3>
                  <p className="text-orange-400 text-xs font-mono mb-3">{inst.instituteCode}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400"><FaUsers className="inline mr-1" /> {inst.memberCount} members</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inst.subscriptionPlan === 'premium' ? 'bg-yellow-500/10 text-yellow-400' :
                      inst.subscriptionPlan === 'enterprise' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>{inst.subscriptionPlan}</span>
                  </div>
                </div>
              ))}
              {institutes.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500">No institutes registered</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
