import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaSearch, FaChevronDown, FaChevronUp, FaListAlt, FaChartBar } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const InstituteDashboard = () => {
  usePageTitle('Institute Admin');
  const [institute, setInstitute] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch institute details
        const instRes = await axios.get(`${API_URL}/api/institute/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (instRes.data.success) setInstitute(instRes.data.data);

        // Fetch members
        const membRes = await axios.get(`${API_URL}/api/institute/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (membRes.data.success) setMembers(membRes.data.data);
      } catch (err) {
        console.error('Institute dashboard error:', err);
        // Fallback data
        setInstitute({ name: 'Your Institute', instituteCode: 'INST001', subscriptionPlan: 'free' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
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
    student: 'bg-blue-500/10 text-blue-400',
    teacher: 'bg-emerald-500/10 text-emerald-400',
    hod: 'bg-purple-500/10 text-purple-400',
    institute_admin: 'bg-orange-500/10 text-orange-400'
  };

  const roleCounts = members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      <motion.div className="relative z-10 max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Institute </span>
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Admin Panel</span>
          </h1>
          <p className="text-gray-400">{institute?.name || 'Loading...'} • Code: <span className="font-mono text-orange-400">{institute?.instituteCode}</span></p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Members', value: members.length, icon: FaUsers, color: 'text-blue-400' },
            { label: 'Students', value: roleCounts.student || 0, icon: FaUserGraduate, color: 'text-cyan-400' },
            { label: 'Teachers', value: roleCounts.teacher || 0, icon: FaChalkboardTeacher, color: 'text-emerald-400' },
            { label: 'HODs', value: roleCounts.hod || 0, icon: FaChartBar, color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-5 border border-white/5">
              <s.icon className={`text-2xl ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{loading ? '...' : s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link to="/school-analytics" className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2">
            <FaChartBar /> Analytics
          </Link>
          <Link to="/my-questions" className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2">
            <FaListAlt /> Question Bank
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
            <option value="" className="bg-gray-900">All Roles</option>
            <option value="student" className="bg-gray-900">Students</option>
            <option value="teacher" className="bg-gray-900">Teachers</option>
            <option value="hod" className="bg-gray-900">HODs</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
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
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold text-sm flex-shrink-0">
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{m.name}</p>
                        <p className="text-gray-500 text-xs">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${roleColors[m.role] || 'bg-gray-700 text-gray-400'}`}>
                        {m.role}
                      </span>
                      <button onClick={() => setExpandedUser(expandedUser === m._id ? null : m._id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 transition-colors">
                        {expandedUser === m._id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                  {expandedUser === m._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pl-13">
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
        </div>
      </motion.div>
    </div>
  );
};

export default InstituteDashboard;
