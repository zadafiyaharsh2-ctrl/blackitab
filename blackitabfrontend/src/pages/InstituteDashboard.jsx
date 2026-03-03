import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaSearch, FaChevronDown, FaChevronUp, FaListAlt, FaChartBar, FaShieldAlt, FaCopy } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

// ── Dummy Members ──────────────────────────────────────────────────────────
const DUMMY_MEMBERS = [
  { _id: 'dm1', name: 'Aarav Sharma', email: 'aarav@pict.edu', role: 'student', batchYear: '2025', division: 'A', points: 1250 },
  { _id: 'dm2', name: 'Priya Deshmukh', email: 'priya@pict.edu', role: 'teacher', batchYear: '', division: '', points: 0 },
  { _id: 'dm3', name: 'Rohan Patil', email: 'rohan@pict.edu', role: 'hod', batchYear: '', division: '', points: 0 },
  { _id: 'dm4', name: 'Sneha Kulkarni', email: 'sneha@pict.edu', role: 'student', batchYear: '2025', division: 'B', points: 980 },
  { _id: 'dm5', name: 'Vikram Joshi', email: 'vikram@pict.edu', role: 'student', batchYear: '2026', division: 'A', points: 2100 },
  { _id: 'dm6', name: 'Ananya Iyer', email: 'ananya@pict.edu', role: 'teacher', batchYear: '', division: '', points: 0 },
  { _id: 'dm7', name: 'Karan Mehta', email: 'karan@pict.edu', role: 'student', batchYear: '2025', division: 'A', points: 640 },
  { _id: 'dm8', name: 'Diya Nair', email: 'diya@pict.edu', role: 'student', batchYear: '2026', division: 'B', points: 1780 },
  { _id: 'dm9', name: 'Arjun Reddy', email: 'arjun@pict.edu', role: 'student', batchYear: '2025', division: 'C', points: 520 },
  { _id: 'dm10', name: 'Meera Gupta', email: 'meera@pict.edu', role: 'student', batchYear: '2026', division: 'A', points: 1500 },
  { _id: 'dm11', name: 'Rahul Verma', email: 'rahul@pict.edu', role: 'teacher', batchYear: '', division: '', points: 0 },
  { _id: 'dm12', name: 'Nisha Patel', email: 'nisha@pict.edu', role: 'student', batchYear: '2025', division: 'B', points: 890 },
];

const DUMMY_INSTITUTE = {
  name: 'PICT, Pune',
  instituteCode: 'PICT2024',
  subscriptionPlan: 'premium',
};

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
  const [institute, setInstitute] = useState(DUMMY_INSTITUTE);
  const [members, setMembers] = useState(DUMMY_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const instRes = await axios.get(`${API_URL}/api/institute/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (instRes.data.success) setInstitute(instRes.data.data);

        const membRes = await axios.get(`${API_URL}/api/institute/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (membRes.data.success) setMembers(membRes.data.data);
      } catch (err) {
        console.log('Using fallback data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (userId.startsWith('dm')) {
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, role: newRole } : m));
      CustomToast.success(`Role updated to ${newRole} (demo)`);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/institute/members/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, role: newRole } : m));
      CustomToast.success('Role updated');
    } catch (err) {
      CustomToast.error('Failed to update role');
    }
  };

  const filtered = members.filter(m => {
    if (search && !m.name?.toLowerCase().includes(search.toLowerCase()) && !m.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && m.role !== roleFilter) return false;
    return true;
  });

  const roleColors = {
    student: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    teacher: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hod: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    institute_admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };

  const roleCounts = members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {});

  const planColors = {
    free: 'text-gray-400',
    basic: 'text-blue-400',
    premium: 'text-yellow-400',
    enterprise: 'text-purple-400'
  };

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
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Institute </span>
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Admin Panel</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <span>{institute?.name || 'Loading...'}</span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
              <span className="font-mono text-orange-400 text-sm">{institute?.instituteCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(institute?.instituteCode || ''); CustomToast.success('Code copied!'); }}
                className="text-gray-500 hover:text-white transition-colors ml-1"><FaCopy className="text-xs" /></button>
            </span>
            <span className={`text-sm font-semibold capitalize ${planColors[institute?.subscriptionPlan] || ''}`}>
              {institute?.subscriptionPlan} plan
            </span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Members', value: members.length, icon: FaUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
            { label: 'Students', value: roleCounts.student || 0, icon: FaUserGraduate, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
            { label: 'Teachers', value: roleCounts.teacher || 0, icon: FaChalkboardTeacher, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
            { label: 'HODs', value: roleCounts.hod || 0, icon: FaShieldAlt, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' },
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

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-6">
          <Link to="/school-analytics" className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2">
            <FaChartBar /> Analytics
          </Link>
          <Link to="/my-questions" className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2">
            <FaListAlt /> Question Bank
          </Link>
          <Link to="/teacher-dashboard" className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
            <FaChalkboardTeacher /> Teacher Panel
          </Link>
        </motion.div>

        {/* Search & Filter */}
        <motion.div variants={itemVariants} className="glass-panel p-4 border border-white/10 rounded-2xl mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500/50" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none cursor-pointer">
            <option value="" className="bg-gray-900">All Roles</option>
            <option value="student" className="bg-gray-900">Students</option>
            <option value="teacher" className="bg-gray-900">Teachers</option>
            <option value="hod" className="bg-gray-900">HODs</option>
          </select>
        </motion.div>

        {/* Members Table */}
        <motion.div variants={itemVariants} className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-bold text-white">Members ({filtered.length})</h2>
          </div>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading members...</div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filtered.map(m => (
                <div key={m._id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{m.name}</p>
                        <p className="text-gray-500 text-xs">{m.email}{m.batchYear ? ` • ${m.batchYear}` : ''}{m.division ? ` • Div ${m.division}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${roleColors[m.role] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                        {m.role?.replace('_', ' ')}
                      </span>
                      <button onClick={() => setExpandedUser(expandedUser === m._id ? null : m._id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 transition-colors">
                        {expandedUser === m._id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                  {expandedUser === m._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 ml-13">
                      <div className="flex flex-wrap gap-2 ml-13">
                        {['student', 'teacher', 'hod'].filter(r => r !== m.role).map(r => (
                          <button key={r} onClick={() => handleRoleChange(m._id, r)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all capitalize">
                            Set as {r}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">No members found</div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InstituteDashboard;
