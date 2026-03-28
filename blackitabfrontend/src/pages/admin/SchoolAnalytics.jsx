import { useState, useEffect } from 'react';
import {
  FaSchool, FaChalkboardTeacher, FaUserGraduate, FaChartPie,
  FaBrain, FaUsers, FaChartLine, FaSearch, FaSpinner,
  FaFire, FaTrophy
} from 'react-icons/fa';
import axios from 'axios';
import API from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';

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

  if (loading) return <PageShimmer variant="dashboard" />;

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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[85rem] mx-auto space-y-10">

        {/* Master Top Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-gray-200 dark:border-white/10 pb-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaSchool className="text-[#0061FF] dark:text-[#a5c3ff] text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Institutional Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              {schoolData.institute.name}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl">
              Comprehensive analytics and performance demographics for the entire academic institution.
            </p>
          </div>

          {/* Segmented Controls (Tabs) */}
          <div className="flex-shrink-0 bg-white dark:bg-black/50 p-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm flex overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all focus:outline-none whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

        </div>

        {/* ======================= OVERVIEW TAB ======================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <FaUserGraduate />, label: 'Active Learners', value: schoolData.totalStudents, color: 'text-[#0061FF]', bg: 'bg-[#0061FF]/10' },
                { icon: <FaBrain />, label: 'Aggregate Accuracy', value: `${schoolData.aggregateStats.avgAccuracy}%`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: <FaChartLine />, label: 'Life-Cycle Attempts', value: schoolData.aggregateStats.totalAttempts.toLocaleString(), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: <FaFire />, label: '7-Day Activity', value: schoolData.aggregateStats.activeThisWeek, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              ].map((card, i) => (
                <div key={i} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/50 dark:border-transparent ${card.bg}`}>
                    <span className={`text-xl ${card.color}`}>{card.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2 group-hover:scale-105 origin-left transition-transform">
                      {card.value}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{card.label}</p>
                  </div>
                  {/* Subtle Background Icon */}
                  <div className={`absolute -right-4 -bottom-4 text-8xl opacity-[0.03] dark:opacity-5 transform -rotate-12 ${card.color} pointer-events-none`}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
              
              {/* Left Column (Divisions & Staff) */}
              <div className="xl:col-span-2 flex flex-col gap-8">
                
                {/* Division Breakdown */}
                {schoolData.divisionBreakdown.length > 0 && (
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                        <FaChartPie className="text-emerald-500 text-sm" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Division Performance</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Accuracy Distributions</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {schoolData.divisionBreakdown.map((d, i) => {
                        const maxAcc = Math.max(...schoolData.divisionBreakdown.map(x => x.avgAccuracy), 1);
                        const barWidth = (d.avgAccuracy / maxAcc) * 100;
                        const barColor = d.avgAccuracy >= 75 ? 'bg-emerald-500' : d.avgAccuracy >= 50 ? 'bg-amber-400' : 'bg-rose-500';
                        
                        return (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 group">
                            <div className="w-24 flex-shrink-0 flex items-center justify-between">
                              <span className="text-sm font-black text-gray-900 dark:text-white truncate">{d.division}</span>
                              <span className="text-[10px] font-bold text-gray-400">({d.studentCount})</span>
                            </div>
                            
                            <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-8 sm:h-10 overflow-hidden relative shadow-inner border border-gray-200/50 dark:border-white/5">
                              <div 
                                className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
                                style={{ width: `${barWidth}%` }} 
                              />
                              <div className="absolute inset-y-0 right-4 flex items-center mix-blend-difference filter drop-shadow">
                                <span className="text-sm font-bold text-white tracking-widest">{d.avgAccuracy}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Staff Clusters */}
                 {schoolData.staffCounts && Object.keys(schoolData.staffCounts).length > 0 && (
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
                        <FaChalkboardTeacher className="text-purple-500 text-sm" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Staff Deployment</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Current Role Distribution</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(schoolData.staffCounts).map(([role, count]) => (
                        <div key={role} className="flex-1 min-w-[120px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-5 hover:border-[#0061FF]/30 transition-colors">
                          <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">{count}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest break-words">{role.replace('_', ' ')}s</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (Top Performers) */}
              {topPerformers.length > 0 && (
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <FaTrophy className="text-amber-500 text-sm" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Top Scholars</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">By Highest Accuracy</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 divide-y divide-gray-100 dark:divide-white/5 p-4">
                    {topPerformers.map((s, i) => (
                      <div key={s._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                          i === 0 ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' : 
                          i === 1 ? 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-white/20 dark:text-white dark:border-white/30' : 
                          i === 2 ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' : 
                          'bg-gray-50 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-gray-500 dark:border-white/10'
                        }`}>
                          <span className="text-xs font-black">{i + 1}</span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-white/10">
                          {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{s.name}</p>
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">{s.totalAttempts} Attempts</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`text-base font-black ${s.accuracy >= 75 ? 'text-emerald-500' : s.accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {s.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ======================= STUDENTS TAB ======================= */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Search Input */}
            <div className="relative max-w-xl mx-auto xl:mx-0 xl:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search learners by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF]/50 transition-all shadow-sm"
              />
            </div>

            {/* Pristine Wide Table */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden transform-gpu">
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5">
                      {['#', 'Student Profile', 'Division', 'Batch', 'Accuracy', 'Attempts', 'Points (XP)', 'Streak', 'Topics', 'Last Active'].map((col, idx) => (
                        <th key={idx} className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredStudents.map((s, i) => (
                      <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                        
                        <td className="px-6 py-4 text-xs font-bold text-gray-400">
                          {(i + 1).toString().padStart(2, '0')}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-black text-gray-600 dark:text-gray-300 shrink-0 border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                              {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{s.name}</p>
                              <p className="text-[11px] font-medium text-gray-500 font-mono mt-0.5">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-black text-gray-800 dark:text-gray-200">
                          {s.division}
                        </td>
                        
                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {s.batchYear}
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            s.accuracy >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                            s.accuracy >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                            'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                          }`}>
                            {s.accuracy}%
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-[13px] font-black text-gray-700 dark:text-gray-300 font-mono">
                          {s.totalAttempts}
                        </td>
                        
                        <td className="px-6 py-4 text-[13px] font-black text-[#0061FF] dark:text-[#a5c3ff] font-mono">
                          +{s.points?.toLocaleString() || 0}
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          {s.streak > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-500/20 shadow-sm">
                              <FaFire /> {s.streak} Day
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">—</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-[13px] font-black text-gray-700 dark:text-gray-300 font-mono">
                          {s.topicsCompleted}
                        </td>
                        
                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          {s.lastActive ? new Date(s.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-24 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="text-2xl text-gray-300 dark:text-gray-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">No Learners Found</h4>
                  <p className="text-sm font-medium text-gray-500 mt-2">Try adjusting your search query.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================= TRENDS TAB ======================= */}
        {activeTab === 'trends' && trends && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Weekly Attempts Target Bar Chart */}
              {trends.weeklyTrends.length > 0 && (
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-[#0061FF]/10 flex items-center justify-center border border-blue-100 dark:border-[#0061FF]/20">
                      <FaChartLine className="text-[#0061FF] text-sm" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Total Volumes & Accuracy</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">8-Week Historical View</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-end h-48 justify-between">
                    {trends.weeklyTrends.map((w, i) => {
                      const maxVal = Math.max(...trends.weeklyTrends.map(x => x.totalAttempts), 1);
                      const height = (w.totalAttempts / maxVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0 duration-300">{w.totalAttempts}</span>
                          <div 
                            className="w-full max-w-[40px] flex flex-col-reverse rounded-xl overflow-hidden shadow-inner border border-gray-100 dark:border-white/5 transition-all duration-700 ease-out hover:shadow-[#0061FF]/20" 
                            style={{ height: `${Math.max(height, 8)}%` }}
                          >
                            <div className="bg-[#0061FF]/80 backdrop-blur-sm transition-all duration-300" style={{ height: `${w.accuracy}%` }} />
                            <div className="bg-rose-400/30 backdrop-blur-sm transition-all duration-300" style={{ height: `${100 - w.accuracy}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{w.week.split('-')[1] || w.week}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-md bg-[#0061FF]/80 shadow-sm" /> 
                       <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Correct Attempt</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-md bg-rose-400/30 shadow-sm" /> 
                       <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Error</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Students Bar Chart */}
              {trends.weeklyTrends.length > 0 && (
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                      <FaUsers className="text-emerald-500 text-sm" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Active Population</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Unique Learners Engaging</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-end h-48 justify-between">
                    {trends.weeklyTrends.map((w, i) => {
                      const maxActive = Math.max(...trends.weeklyTrends.map(x => x.activeStudents), 1);
                      const height = (w.activeStudents / maxActive) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0 duration-300">{w.activeStudents}</span>
                          <div 
                            className="w-full max-w-[40px] rounded-xl bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm transition-all duration-700 ease-out hover:shadow-emerald-500/30" 
                            style={{ height: `${Math.max(height, 8)}%` }} 
                          />
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{w.week.split('-')[1] || w.week}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               
               {/* Signups Chart */}
               {trends.newStudentsPerWeek.length > 0 && (
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20">
                        <FaUserGraduate className="text-violet-500 text-sm" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Onboarding Velvet Rope</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">New Student Registrations</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-end h-32 justify-between">
                      {trends.newStudentsPerWeek.map((w, i) => {
                        const maxNew = Math.max(...trends.newStudentsPerWeek.map(x => x.count), 1);
                        const height = (w.count / maxNew) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-[10px] font-black text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0 duration-300">{w.count}</span>
                            <div 
                              className="w-full max-w-[30px] rounded-xl bg-gradient-to-t from-violet-600 to-violet-400 opacity-90 transition-all duration-700 ease-out hover:opacity-100 hover:shadow-lg hover:shadow-violet-500/20" 
                              style={{ height: `${Math.max(height, 12)}%` }} 
                            />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{w.week.split('-')[1] || w.week}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
               
               {/* Top Active Mini-List */}
               {trends.topActiveThisWeek.length > 0 && (
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden max-h-[350px]">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
                          <FaFire className="text-orange-500 text-sm" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">This Week's Vanguard</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Highest Engagement Metrics</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 divide-y divide-gray-100 dark:divide-white/5 p-4 overflow-y-auto custom-scrollbar">
                      {trends.topActiveThisWeek.map((s, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm shadow-black/5">
                            {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">{s.name}</p>
                            <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">{s.attempts} Volumes Pushed</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Win Rate</span>
                            <span className="text-sm font-black text-[#0061FF] dark:text-[#a5c3ff]">
                              {s.accuracy}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

            {/* Empty State Tends */}
            {trends.weeklyTrends.length === 0 && trends.topActiveThisWeek.length === 0 && (
              <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                  <FaChartLine className="text-3xl text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Insufficient Intelligence</h3>
                <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                  Historical telemetry and trend data will begin populating here automatically once students log operational volumes on the platform over consecutive weeks.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

