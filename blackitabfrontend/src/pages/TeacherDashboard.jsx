import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserGraduate, FaChartLine, FaFire, FaTrophy,
  FaSearch, FaChevronDown, FaChevronUp, FaSpinner,
  FaArrowUp, FaArrowDown, FaFilter, FaSortAmountDown,
  FaClock, FaBrain, FaBookOpen, FaTimes
} from 'react-icons/fa';

import API from '../config';

// ─── Animation Variants ───
const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [sortBy, setSortBy] = useState('points');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/analytics/school`, { headers });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = async (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
      setStudentDetail(null);
      return;
    }
    try {
      setDetailLoading(true);
      setExpandedStudent(studentId);
      const res = await axios.get(`${API}/api/analytics/school/student/${studentId}`, { headers });
      setStudentDetail(res.data.data);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Filter + Sort logic ───
  const getFilteredStudents = () => {
    if (!data?.students) return [];
    let list = [...data.students];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (filterDivision !== 'All') list = list.filter(s => s.division === filterDivision);
    if (filterBatch !== 'All') list = list.filter(s => s.batchYear === filterBatch);

    list.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return list;
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const divisions = data ? [...new Set(data.students.map(s => s.division))].sort() : [];
  const batches = data ? [...new Set(data.students.map(s => s.batchYear))].sort() : [];

  // ─── Loading / Error States ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const students = getFilteredStudents();

  // ─── UI ───
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ─── Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{data.institute.name}</h1>
          <p className="text-gray-400 text-sm">Institute Code: <span className="font-mono text-indigo-400">{data.institute.code}</span></p>
        </div>
        <div className="flex gap-3">
          <Link to="/school-analytics"
            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition text-sm flex items-center gap-2">
            <FaChartLine /> Detailed Analytics
          </Link>
          <Link to="/question-paper"
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition text-sm flex items-center gap-2">
            <FaBookOpen /> Question Paper
          </Link>
        </div>
      </motion.div>

      {/* ─── Summary Cards ─── */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: data.totalStudents, icon: <FaUserGraduate />, color: 'indigo' },
          { label: 'Avg Accuracy', value: `${data.aggregateStats.avgAccuracy}%`, icon: <FaBrain />, color: 'emerald' },
          { label: 'Total Attempts', value: data.aggregateStats.totalAttempts.toLocaleString(), icon: <FaChartLine />, color: 'amber' },
          { label: 'Active This Week', value: data.aggregateStats.activeThisWeek, icon: <FaFire />, color: 'rose' },
        ].map((card, i) => (
          <motion.div key={i} variants={fadeIn}
            className={`bg-gray-900/80 border border-${card.color}-500/20 rounded-xl p-4 hover:border-${card.color}-500/40 transition`}>
            <div className={`text-${card.color}-400 text-xl mb-2`}>{card.icon}</div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-gray-500 text-xs mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Division Breakdown ─── */}
      {data.divisionBreakdown.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn}
          className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Division Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.divisionBreakdown.map((d, i) => (
              <div key={i} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30">
                <p className="text-indigo-400 font-mono font-bold text-lg">{d.division}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Students</span><span className="text-white">{d.studentCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Avg Accuracy</span><span className="text-emerald-400">{d.avgAccuracy}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Attempts</span><span className="text-amber-400">{d.totalAttempts}</span></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Filters + Search ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="flex flex-wrap items-center gap-3 bg-gray-900/80 border border-gray-700/50 rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text" placeholder="Search students..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <select value={filterDivision} onChange={e => setFilterDivision(e.target.value)}
            className="bg-gray-800/60 border border-gray-700/50 rounded-lg text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="All">All Divisions</option>
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
            className="bg-gray-800/60 border border-gray-700/50 rounded-lg text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="All">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <span className="text-gray-500 text-sm ml-auto">{students.length} students</span>
      </motion.div>

      {/* ─── Student Table ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/80 text-gray-400 text-xs uppercase">
                <th className="px-4 py-3 text-left">Student</th>
                {[
                  { key: 'division', label: 'Div' },
                  { key: 'accuracy', label: 'Accuracy' },
                  { key: 'totalAttempts', label: 'Attempts' },
                  { key: 'streak', label: 'Streak' },
                  { key: 'points', label: 'XP' },
                  { key: 'globalRank', label: 'Rank' },
                  { key: 'topicsCompleted', label: 'Topics' },
                ].map(col => (
                  <th key={col.key}
                    className="px-3 py-3 text-center cursor-pointer hover:text-indigo-400 transition select-none"
                    onClick={() => toggleSort(col.key)}>
                    <span className="flex items-center justify-center gap-1">
                      {col.label}
                      {sortBy === col.key && (sortDir === 'desc' ? <FaArrowDown className="text-[10px]" /> : <FaArrowUp className="text-[10px]" />)}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <React.Fragment key={student._id}>
                  <tr className={`border-t border-gray-800/50 hover:bg-gray-800/40 transition ${expandedStudent === student._id ? 'bg-gray-800/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {student.profileImage ? <img src={student.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : student.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{student.name}</p>
                          <p className="text-gray-500 text-xs">{student.batchYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center"><span className="text-indigo-400 font-mono text-xs">{student.division}</span></td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-semibold ${student.accuracy >= 70 ? 'text-emerald-400' : student.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {student.accuracy}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-300">{student.totalAttempts}</td>
                    <td className="px-3 py-3 text-center">
                      {student.streak > 0 ? <span className="text-orange-400 flex items-center justify-center gap-1"><FaFire className="text-xs" />{student.streak}</span> : <span className="text-gray-600">0</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-amber-400 font-semibold">{student.points.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-gray-300">#{student.globalRank || '—'}</td>
                    <td className="px-3 py-3 text-center text-cyan-400">{student.topicsCompleted}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => fetchStudentDetail(student._id)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition">
                        {expandedStudent === student._id ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                      </button>
                    </td>
                  </tr>

                  {/* ─── Expanded Student Detail ─── */}
                  <AnimatePresence>
                    {expandedStudent === student._id && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            {detailLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <FaSpinner className="animate-spin text-2xl text-indigo-500" />
                              </div>
                            ) : studentDetail ? (
                              <div className="bg-gray-800/40 border-t border-indigo-500/20 p-5 space-y-4">
                                {/* Quick stats row */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {[
                                    { label: 'Total Attempts', value: studentDetail.overallStats.totalAttempts },
                                    { label: 'Correct', value: studentDetail.overallStats.correctAttempts },
                                    { label: 'Accuracy', value: `${studentDetail.overallStats.accuracy}%` },
                                    { label: 'Avg Speed', value: `${studentDetail.overallStats.avgSpeed}s` },
                                    { label: 'Topics Done', value: studentDetail.overallStats.topicsCompleted },
                                  ].map((s, i) => (
                                    <div key={i} className="bg-gray-900/60 rounded-lg p-3 text-center">
                                      <p className="text-xl font-bold text-white">{s.value}</p>
                                      <p className="text-gray-500 text-xs">{s.label}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Subject breakdown */}
                                {studentDetail.subjectBreakdown.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Subject-Wise Performance</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                      {studentDetail.subjectBreakdown.map((s, i) => (
                                        <div key={i} className="bg-gray-900/40 rounded-lg p-3 flex items-center justify-between">
                                          <div>
                                            <p className="text-white text-sm font-medium">{s.subject}</p>
                                            <p className="text-gray-500 text-xs">{s.totalAttempts} attempts</p>
                                          </div>
                                          <span className={`text-lg font-bold ${s.accuracy >= 70 ? 'text-emerald-400' : s.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {s.accuracy}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Difficulty breakdown */}
                                {studentDetail.difficultyBreakdown.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Difficulty Breakdown</h4>
                                    <div className="flex gap-3">
                                      {studentDetail.difficultyBreakdown.map((d, i) => (
                                        <div key={i} className={`flex-1 rounded-lg p-3 text-center border ${
                                          d.difficulty === 'Easy' ? 'border-emerald-500/20 bg-emerald-900/10' :
                                          d.difficulty === 'Medium' ? 'border-amber-500/20 bg-amber-900/10' :
                                          'border-red-500/20 bg-red-900/10'
                                        }`}>
                                          <p className="text-xs text-gray-400">{d.difficulty}</p>
                                          <p className="text-lg font-bold text-white">{d.accuracy}%</p>
                                          <p className="text-xs text-gray-500">{d.totalAttempts} tries</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Weekly activity */}
                                {studentDetail.weeklyActivity.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Weekly Activity (Last 8 Weeks)</h4>
                                    <div className="flex gap-2 items-end h-20">
                                      {studentDetail.weeklyActivity.map((w, i) => {
                                        const maxAttempts = Math.max(...studentDetail.weeklyActivity.map(x => x.attempts), 1);
                                        const height = (w.attempts / maxAttempts) * 100;
                                        return (
                                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] text-gray-500">{w.attempts}</span>
                                            <div className="w-full rounded-t bg-indigo-500/60 hover:bg-indigo-500 transition"
                                              style={{ height: `${Math.max(height, 4)}%` }} title={`${w.week}: ${w.attempts} attempts, ${w.accuracy}% accuracy`} />
                                            <span className="text-[10px] text-gray-600">{w.week}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Recent attempts */}
                                {studentDetail.recentAttempts.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Activity</h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                                      {studentDetail.recentAttempts.slice(0, 10).map((a, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-900/40 rounded-lg px-3 py-2 text-xs">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-gray-300 truncate">{a.question}</span>
                                          </div>
                                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                            <span className="text-gray-500">{a.subject}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                              a.difficulty === 'Easy' ? 'bg-emerald-900/30 text-emerald-400' :
                                              a.difficulty === 'Medium' ? 'bg-amber-900/30 text-amber-400' :
                                              'bg-red-900/30 text-red-400'
                                            }`}>{a.difficulty}</span>
                                            {a.timeTaken && <span className="text-gray-500"><FaClock className="inline mr-1" />{a.timeTaken}s</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FaUserGraduate className="mx-auto text-4xl mb-3 opacity-30" />
              <p>No students found{search || filterDivision !== 'All' || filterBatch !== 'All' ? ' matching your filters' : ' in your institute'}.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
