import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaSchool, FaChalkboardTeacher, FaUserGraduate, FaChartPie,
  FaBrain, FaUsers, FaChartLine, FaCheckCircle, FaTimesCircle,
  FaSearch, FaSpinner, FaFire, FaTrophy, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import axios from 'axios';

import API from '../config';
const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function SchoolAnalytics() {
  const [schoolData, setSchoolData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | students | trends

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [schoolRes, trendsRes] = await Promise.all([
        axios.get(`${API}/api/analytics/school`, { headers }),
        axios.get(`${API}/api/analytics/school/trends`, { headers })
      ]);
      setSchoolData(schoolRes.data.data);
      setTrends(trendsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={fetchAll} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Retry</button>
      </div>
    );
  }

  if (!schoolData) return null;

  const filteredStudents = schoolData.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const topPerformers = [...schoolData.students]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <div className="flex items-center gap-3 mb-1">
          <FaSchool className="text-indigo-400 text-2xl" />
          <h1 className="text-2xl font-bold text-white">{schoolData.institute.name} — Analytics</h1>
        </div>
        <p className="text-gray-500 text-sm">Deep analytics for your institution's performance</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-gray-900/80 rounded-xl p-1.5 w-fit border border-gray-700/50">
        {['overview', 'students', 'trends'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab === 'overview' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FaUserGraduate />, label: 'Students', value: schoolData.totalStudents, color: 'indigo' },
              { icon: <FaBrain />, label: 'Avg Accuracy', value: `${schoolData.aggregateStats.avgAccuracy}%`, color: 'emerald' },
              { icon: <FaChartLine />, label: 'Total Attempts', value: schoolData.aggregateStats.totalAttempts.toLocaleString(), color: 'amber' },
              { icon: <FaFire />, label: 'Active This Week', value: schoolData.aggregateStats.activeThisWeek, color: 'rose' },
            ].map((card, i) => (
              <motion.div key={i} variants={fadeIn}
                className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5 hover:border-gray-600/50 transition">
                <div className={`text-${card.color}-400 text-xl mb-3`}>{card.icon}</div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-gray-500 text-xs mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Staff Counts */}
          {schoolData.staffCounts && Object.keys(schoolData.staffCounts).length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FaChalkboardTeacher className="text-indigo-400" /> Staff Overview</h3>
              <div className="flex gap-4">
                {Object.entries(schoolData.staffCounts).map(([role, count]) => (
                  <div key={role} className="bg-gray-800/60 rounded-lg px-4 py-3 text-center">
                    <p className="text-xl font-bold text-white">{count}</p>
                    <p className="text-gray-500 text-xs capitalize">{role.replace('_', ' ')}s</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Division Breakdown */}
          {schoolData.divisionBreakdown.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FaChartPie className="text-indigo-400" /> Division Performance</h3>
              <div className="space-y-3">
                {schoolData.divisionBreakdown.map((d, i) => {
                  const maxAcc = Math.max(...schoolData.divisionBreakdown.map(x => x.avgAccuracy), 1);
                  const barWidth = (d.avgAccuracy / maxAcc) * 100;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-indigo-400 font-mono font-bold w-20 text-right">{d.division}</span>
                      <div className="flex-1 bg-gray-800/60 rounded-full h-8 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                          className={`h-full rounded-full ${
                            d.avgAccuracy >= 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
                            d.avgAccuracy >= 40 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                            'bg-gradient-to-r from-red-600 to-red-500'
                          }`}
                        />
                        <span className="absolute inset-0 flex items-center text-xs text-white font-medium pl-3">
                          {d.avgAccuracy}% accuracy • {d.studentCount} students • {d.totalAttempts} attempts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FaTrophy className="text-amber-400" /> Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {topPerformers.map((s, i) => (
                  <div key={s._id} className={`rounded-xl p-4 text-center border ${
                    i === 0 ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-500/30' :
                    i === 1 ? 'bg-gradient-to-br from-gray-700/30 to-gray-600/10 border-gray-400/30' :
                    i === 2 ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-500/30' :
                    'bg-gray-800/40 border-gray-700/30'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white mx-auto mb-2">
                      {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{s.name}</p>
                    <p className="text-emerald-400 font-bold text-lg">{s.accuracy}%</p>
                    <p className="text-gray-500 text-xs">{s.totalAttempts} attempts</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ═══════════ STUDENTS TAB ═══════════ */}
      {activeTab === 'students' && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search students by name or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/80 text-gray-400 text-xs uppercase">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-3 py-3 text-center">Division</th>
                    <th className="px-3 py-3 text-center">Batch</th>
                    <th className="px-3 py-3 text-center">Accuracy</th>
                    <th className="px-3 py-3 text-center">Attempts</th>
                    <th className="px-3 py-3 text-center">XP</th>
                    <th className="px-3 py-3 text-center">Streak</th>
                    <th className="px-3 py-3 text-center">Rank</th>
                    <th className="px-3 py-3 text-center">Topics</th>
                    <th className="px-3 py-3 text-center">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={s._id} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm">{s.name}</p>
                            <p className="text-gray-600 text-xs">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-indigo-400 font-mono text-xs">{s.division}</td>
                      <td className="px-3 py-3 text-center text-gray-400 text-xs">{s.batchYear}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`font-semibold ${s.accuracy >= 70 ? 'text-emerald-400' : s.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300">{s.totalAttempts}</td>
                      <td className="px-3 py-3 text-center text-amber-400">{s.points.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center">
                        {s.streak > 0 ? <span className="text-orange-400 flex items-center justify-center gap-1"><FaFire className="text-xs" />{s.streak}</span> : <span className="text-gray-600">0</span>}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300">#{s.globalRank || '—'}</td>
                      <td className="px-3 py-3 text-center text-cyan-400">{s.topicsCompleted}</td>
                      <td className="px-3 py-3 text-center text-gray-500 text-xs">
                        {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FaUsers className="mx-auto text-4xl mb-3 opacity-30" />
                  <p>No students found{search ? ' matching your search' : ''}.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════ TRENDS TAB ═══════════ */}
      {activeTab === 'trends' && trends && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          {/* Weekly Trends */}
          {trends.weeklyTrends.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-indigo-400" />
                Weekly Attempt Trends (Last 8 Weeks)
              </h3>
              <div className="flex gap-3 items-end h-40">
                {trends.weeklyTrends.map((w, i) => {
                  const maxVal = Math.max(...trends.weeklyTrends.map(x => x.totalAttempts), 1);
                  const height = (w.totalAttempts / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{w.totalAttempts}</span>
                      <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${Math.max(height, 4)}%` }}>
                        <div className="bg-indigo-600/80 hover:bg-indigo-500 transition" style={{ height: `${w.accuracy}%` }} />
                        <div className="bg-red-500/40" style={{ height: `${100 - w.accuracy}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{w.week}</span>
                      <span className="text-[10px] text-emerald-400">{w.accuracy}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-600/80" /> Correct</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40" /> Incorrect</span>
              </div>
            </motion.div>
          )}

          {/* Active Students */}
          {trends.weeklyTrends.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaUsers className="text-indigo-400" /> Active Students Per Week
              </h3>
              <div className="flex gap-3 items-end h-24">
                {trends.weeklyTrends.map((w, i) => {
                  const maxActive = Math.max(...trends.weeklyTrends.map(x => x.activeStudents), 1);
                  const height = (w.activeStudents / maxActive) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{w.activeStudents}</span>
                      <div className="w-full rounded-t bg-cyan-500/60 hover:bg-cyan-500 transition" style={{ height: `${Math.max(height, 4)}%` }} />
                      <span className="text-[10px] text-gray-500">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Top Active This Week */}
          {trends.topActiveThisWeek.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaTrophy className="text-amber-400" /> Top Active This Week
              </h3>
              <div className="space-y-2">
                {trends.topActiveThisWeek.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-800/40 rounded-lg p-3">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                      #{i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{s.name}</p>
                      <p className="text-gray-500 text-xs">{s.attempts} attempts this week</p>
                    </div>
                    <span className={`font-bold text-lg ${s.accuracy >= 70 ? 'text-emerald-400' : s.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* New Signups */}
          {trends.newStudentsPerWeek.length > 0 && (
            <motion.div variants={fadeIn} className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaUserGraduate className="text-indigo-400" /> New Student Signups
              </h3>
              <div className="flex gap-3 items-end h-20">
                {trends.newStudentsPerWeek.map((w, i) => {
                  const maxNew = Math.max(...trends.newStudentsPerWeek.map(x => x.count), 1);
                  const height = (w.count / maxNew) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-emerald-400">{w.count}</span>
                      <div className="w-full rounded-t bg-emerald-500/60 hover:bg-emerald-500 transition" style={{ height: `${Math.max(height, 8)}%` }} />
                      <span className="text-[10px] text-gray-500">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Empty state if no trends */}
          {trends.weeklyTrends.length === 0 && trends.topActiveThisWeek.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FaChartLine className="mx-auto text-4xl mb-3 opacity-30" />
              <p>No activity data yet. Trends will appear once students start solving questions.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
