import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaSchool, FaChalkboardTeacher, FaUserGraduate, FaChartPie,
  FaBrain, FaUsers, FaChartLine, FaCheckCircle, FaTimesCircle,
  FaSearch, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';
import { CustomToast } from '../utils/CustomToast';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const SchoolAnalytics = () => {
  usePageTitle('School Analytics');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please log in'); setLoading(false); return; }

      const res = await axios.get(`${API_URL}/api/analytics/school`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setData(res.data.data);
        // Fetch student names for performances
        if (res.data.data.performances?.length > 0) {
          const ids = res.data.data.performances.map(p => p._id);
          try {
            const namesRes = await axios.get(`${API_URL}/api/institute/members`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (namesRes.data.success) {
              const nameMap = {};
              namesRes.data.data.forEach(m => { nameMap[m._id] = m.name; });
              setStudentNames(nameMap);
            }
          } catch { }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    }
    setLoading(false);
  };

  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch { return 'student'; }
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <FaSpinner className="text-4xl text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="glass-panel border border-red-500/20 rounded-2xl p-10 text-center max-w-md">
          <FaSchool className="text-5xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const performances = data?.performances || [];
  const totalStudents = data?.totalStudents || 0;
  const totalAttempts = data?.totalInstitutionAttempts || 0;
  const avgAccuracy = performances.length > 0
    ? Math.round(performances.reduce((acc, p) => acc + (p.solved > 0 ? (p.correct / p.solved) * 100 : 0), 0) / performances.length)
    : 0;
  const topPerformers = [...performances].sort((a, b) => (b.correct / (b.solved || 1)) - (a.correct / (a.solved || 1))).slice(0, 3);
  const atRisk = performances.filter(p => p.solved > 0 && (p.correct / p.solved) < 0.4);

  const filteredPerformances = search
    ? performances.filter(p => (studentNames[p._id] || p._id).toLowerCase().includes(search.toLowerCase()))
    : performances;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans pt-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Hero */}
        <motion.div variants={itemVariants} className="glass-panel border-white/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <FaSchool className="text-6xl text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-glow mb-3">School Analytics</h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                {userRole === 'hod' ? 'Department-wide performance insights' : 'Monitor your students\' progress and identify areas for improvement'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: totalStudents, icon: FaUsers, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
            { label: 'Total Attempts', value: totalAttempts.toLocaleString(), icon: FaChartPie, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' },
            { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: FaCheckCircle, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
            { label: 'At Risk', value: atRisk.length, icon: FaTimesCircle, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
                <s.icon className={`text-xl ${s.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <motion.div variants={itemVariants} className="glass-panel border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FaBrain className="text-yellow-400" /> Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((p, i) => {
                const accuracy = p.solved > 0 ? Math.round((p.correct / p.solved) * 100) : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={p._id} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 flex items-center gap-4">
                    <span className="text-2xl">{medals[i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{studentNames[p._id] || `Student ${p._id.slice(-4)}`}</p>
                      <p className="text-gray-500 text-xs">{p.correct}/{p.solved} correct</p>
                    </div>
                    <span className={`text-lg font-bold ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Student Performance Table */}
        <motion.div variants={itemVariants} className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaUserGraduate className="text-blue-400" /> Student Performance</h3>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students..." className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50 w-48" />
            </div>
          </div>

          {filteredPerformances.length > 0 ? (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {filteredPerformances.map((p, i) => {
                const accuracy = p.solved > 0 ? Math.round((p.correct / p.solved) * 100) : 0;
                return (
                  <div key={p._id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-gray-600 text-xs font-mono w-6">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(studentNames[p._id] || 'S')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{studentNames[p._id] || `Student ${p._id.slice(-6)}`}</p>
                        <p className="text-gray-600 text-xs">{p.solved} attempts • {p.correct} correct</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Accuracy bar */}
                      <div className="hidden sm:block w-24">
                        <div className="w-full bg-white/5 rounded-full h-2 border border-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} transition={{ duration: 1, delay: i * 0.05 }}
                            className={`h-full rounded-full ${accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${accuracy >= 70 ? 'text-emerald-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {accuracy}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <FaUserGraduate className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="font-medium">No student data available</p>
              <p className="text-xs mt-1">Students will appear here once they start solving problems</p>
            </div>
          )}
        </motion.div>

        {/* Action: Schedule Revision */}
        {atRisk.length > 0 && (
          <motion.div variants={itemVariants} className="glass-panel border border-red-500/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">⚠️ {atRisk.length} Students Need Attention</h3>
                <p className="text-gray-400">These students have accuracy below 40%. Consider scheduling a revision session.</p>
              </div>
              <button onClick={() => CustomToast.success('📅 Revision scheduling coming soon! Your HOD has been notified.')}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] shrink-0">
                Schedule Revision Class
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SchoolAnalytics;
