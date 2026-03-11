import { useState, useEffect } from 'react';
import {
  FaSchool, FaChalkboardTeacher, FaUserGraduate, FaChartPie,
  FaBrain, FaUsers, FaChartLine, FaSearch, FaSpinner,
  FaFire, FaTrophy
} from 'react-icons/fa';
import axios from 'axios';
import API from '../config';

export default function SchoolAnalytics() {
  const [schoolData, setSchoolData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <FaSpinner className="animate-spin text-2xl text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={fetchAll} className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5">Retry</button>
    </div>
  );

  if (!schoolData) return null;

  const filteredStudents = schoolData.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const topPerformers = [...schoolData.students]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const tabs = ['overview', 'students', 'trends'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaSchool className="text-gray-400" />
            {schoolData.institute.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">School performance analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <FaUserGraduate />, label: 'Students', value: schoolData.totalStudents },
              { icon: <FaBrain />, label: 'Avg Accuracy', value: `${schoolData.aggregateStats.avgAccuracy}%` },
              { icon: <FaChartLine />, label: 'Total Attempts', value: schoolData.aggregateStats.totalAttempts.toLocaleString() },
              { icon: <FaFire />, label: 'Active This Week', value: schoolData.aggregateStats.activeThisWeek },
            ].map((card, i) => (
              <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <p className="text-gray-400 text-sm mb-2">{card.icon}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Staff overview */}
          {schoolData.staffCounts && Object.keys(schoolData.staffCounts).length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FaChalkboardTeacher className="text-gray-400" /> Staff Overview
              </h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(schoolData.staffCounts).map(([role, count]) => (
                  <div key={role} className="border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-center min-w-[80px]">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{role.replace('_', ' ')}s</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Division Breakdown */}
          {schoolData.divisionBreakdown.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FaChartPie className="text-gray-400" /> Division Performance
              </h3>
              <div className="space-y-3">
                {schoolData.divisionBreakdown.map((d, i) => {
                  const maxAcc = Math.max(...schoolData.divisionBreakdown.map(x => x.avgAccuracy), 1);
                  const barWidth = (d.avgAccuracy / maxAcc) * 100;
                  const barColor = d.avgAccuracy >= 70 ? 'bg-emerald-500' : d.avgAccuracy >= 40 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-mono font-semibold text-gray-500 w-16 text-right">{d.division}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-6 overflow-hidden relative">
                        <div className={`h-full rounded-full ${barColor} opacity-80`} style={{ width: `${barWidth}%` }} />
                        <span className="absolute inset-0 flex items-center text-xs font-medium pl-3 text-gray-700 dark:text-gray-200">
                          {d.avgAccuracy}% · {d.studentCount} students
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaTrophy className="text-amber-400" /> Top Performers
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {topPerformers.map((s, i) => (
                  <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200 shrink-0">
                      {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.totalAttempts} attempts</p>
                    </div>
                    <span className={`text-sm font-bold ${s.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : s.accuracy >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STUDENTS TAB ─── */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/[0.02] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-3 py-3 text-center">Division</th>
                    <th className="px-3 py-3 text-center">Batch</th>
                    <th className="px-3 py-3 text-center">Accuracy</th>
                    <th className="px-3 py-3 text-center">Attempts</th>
                    <th className="px-3 py-3 text-center">XP</th>
                    <th className="px-3 py-3 text-center">Streak</th>
                    <th className="px-3 py-3 text-center">Topics</th>
                    <th className="px-3 py-3 text-center">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredStudents.map((s, i) => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                            {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{s.name}</p>
                            <p className="text-gray-400 text-xs">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-mono text-gray-500">{s.division}</td>
                      <td className="px-3 py-3 text-center text-xs text-gray-500">{s.batchYear}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-sm font-semibold ${s.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : s.accuracy >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{s.totalAttempts}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{s.points?.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center">
                        {s.streak > 0
                          ? <span className="text-orange-500 flex items-center justify-center gap-1 text-xs"><FaFire />{s.streak}</span>
                          : <span className="text-gray-400 text-xs">0</span>
                        }
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{s.topicsCompleted}</td>
                      <td className="px-3 py-3 text-center text-xs text-gray-400">
                        {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <FaUsers className="mx-auto text-3xl mb-3 opacity-30" />
                  <p>No students found{search ? ' matching your search' : ''}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TRENDS TAB ─── */}
      {activeTab === 'trends' && trends && (
        <div className="space-y-5">

          {/* Weekly attempt trends */}
          {trends.weeklyTrends.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FaChartLine className="text-gray-400" /> Weekly Attempts (Last 8 Weeks)
              </h3>
              <div className="flex gap-2 items-end h-32">
                {trends.weeklyTrends.map((w, i) => {
                  const maxVal = Math.max(...trends.weeklyTrends.map(x => x.totalAttempts), 1);
                  const height = (w.totalAttempts / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">{w.totalAttempts}</span>
                      <div className="w-full flex flex-col-reverse rounded-sm overflow-hidden border border-gray-100 dark:border-white/5" style={{ height: `${Math.max(height, 4)}%` }}>
                        <div className="bg-blue-500/70" style={{ height: `${w.accuracy}%` }} />
                        <div className="bg-red-400/30" style={{ height: `${100 - w.accuracy}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400">{w.week}</span>
                      <span className="text-[10px] text-emerald-500">{w.accuracy}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500/70 inline-block" /> Correct</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400/30 inline-block" /> Incorrect</span>
              </div>
            </div>
          )}

          {/* Active students per week */}
          {trends.weeklyTrends.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FaUsers className="text-gray-400" /> Active Students / Week
              </h3>
              <div className="flex gap-2 items-end h-20">
                {trends.weeklyTrends.map((w, i) => {
                  const maxActive = Math.max(...trends.weeklyTrends.map(x => x.activeStudents), 1);
                  const height = (w.activeStudents / maxActive) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">{w.activeStudents}</span>
                      <div className="w-full rounded-sm bg-emerald-500/60" style={{ height: `${Math.max(height, 4)}%` }} />
                      <span className="text-[10px] text-gray-400">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top active this week */}
          {trends.topActiveThisWeek.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaTrophy className="text-amber-400" /> Top Active This Week
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {trends.topActiveThisWeek.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                      {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.attempts} attempts</p>
                    </div>
                    <span className={`text-sm font-bold ${s.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : s.accuracy >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New signups */}
          {trends.newStudentsPerWeek.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FaUserGraduate className="text-gray-400" /> New Student Signups
              </h3>
              <div className="flex gap-2 items-end h-16">
                {trends.newStudentsPerWeek.map((w, i) => {
                  const maxNew = Math.max(...trends.newStudentsPerWeek.map(x => x.count), 1);
                  const height = (w.count / maxNew) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-emerald-500">{w.count}</span>
                      <div className="w-full rounded-sm bg-emerald-500/50" style={{ height: `${Math.max(height, 8)}%` }} />
                      <span className="text-[10px] text-gray-400">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {trends.weeklyTrends.length === 0 && trends.topActiveThisWeek.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
              <FaChartLine className="mx-auto text-3xl text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No trend data yet. Trends appear once students start solving questions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
