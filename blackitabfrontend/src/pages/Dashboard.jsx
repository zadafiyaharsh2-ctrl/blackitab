import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBook, FaCode, FaTrophy, FaFire, FaChartLine,
  FaArrowRight, FaCheckCircle, FaDatabase,
  FaLaptopCode, FaCloud, FaCalendarAlt,
  FaCrown, FaPercent, FaBolt, FaHistory,
  FaUserGraduate, FaUsers, FaTimes, FaSpinner
} from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import ActivityHeatmap from '../components/ActivityHeatmap';
import PlaylistCard from '../components/PlaylistCard';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const getMasteryLevel = (pct) => {
  if (pct >= 80) return { label: 'Expert',       cls: 'text-purple-600 dark:text-purple-400' };
  if (pct >= 50) return { label: 'Advanced',     cls: 'text-blue-600 dark:text-blue-400' };
  if (pct >= 20) return { label: 'Intermediate', cls: 'text-amber-600 dark:text-amber-400' };
  return                 { label: 'Beginner',    cls: 'text-gray-500' };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const FALLBACK_PROGRESS = { totalCompleted: 0, bySubject: [], streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0, recentActivity: [] };

const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.role === 'teacher' || u.role === 'hod') navigate('/teacher-dashboard', { replace: true });
      else if (u.role === 'institute_admin' || u.role === 'institute') navigate('/institute/dashboard', { replace: true });
    } catch {}
  }, [navigate]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [progressStats, setProgressStats] = useState({ totalCompleted: 0, bySubject: [] });
  const [stats, setStats] = useState({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [nextContest, setNextContest] = useState({ title: 'Weekly Challenge #14', date: 'Sat, Mar 8 · 3:00 PM', link: '/contest' });
  const [problemOfTheDay, setProblemOfTheDay] = useState({ title: 'Find the second highest salary using SQL', difficulty: 'Medium', topic: 'SQL', link: '/problems' });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);
  const [joinedBatchCount, setJoinedBatchCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData) setUser(JSON.parse(userData));

        try {
          const res = await axios.get(`${API_URL}/api/subjects`);
          if (res.data.success && res.data.data.length > 0) setSubjects(res.data.data);
        } catch {}

        setPlaylists([]);

        if (token) {
          try {
            const res = await axios.get(`${API_URL}/api/progress/stats`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) {
              const d = res.data.data;
              setProgressStats(d);
              setStats({ streak: d.streak || 0, longestStreak: d.longestStreak || 0, totalPoints: d.totalPoints || 0, rank: d.rank || 'Unranked', percentile: d.percentile || 0 });
              setRecentActivity(d.recentActivity || []);
            }
          } catch {
            setProgressStats(FALLBACK_PROGRESS);
            setStats({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0 });
          }
        }

        try {
          const res = await axios.get(`${API_URL}/api/problems/daily`);
          if (res.data.success && res.data.data) {
            const d = res.data.data;
            setProblemOfTheDay({ title: d.question || 'Practice Challenge', difficulty: d.difficulty || 'Medium', topic: d.subject || '', link: '/problems' });
          }
        } catch {}

        try {
          const res = await axios.get(`${API_URL}/api/contests/upcoming`);
          if (res.data.success && res.data.data?.length > 0) {
            const c = res.data.data[0];
            const date = new Date(c.startTime);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const dateStr = isToday ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                           isTomorrow ? `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                           date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            setNextContest({ title: c.title, date: dateStr, link: '/contest' });
          }
        } catch {}

        try {
          const res = await axios.get(`${API_URL}/api/user/batches`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.data.success) setJoinedBatchCount(res.data.data.length);
        } catch {}

      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalTopics = subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0);

  const recentSubjects = subjects.map(subject => {
    const sp = progressStats.bySubject?.find(s => s._id === subject._id);
    const completed = sp ? sp.totalCompleted : 0;
    const total = subject.topicCount || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    let icon = FaBook, barColor = 'bg-gray-400';
    if (subject.name === 'DBMS')  { icon = FaDatabase; barColor = 'bg-blue-500'; }
    else if (subject.name === 'SQL')   { icon = FaCode;     barColor = 'bg-emerald-500'; }
    else if (subject.name === 'CCBDI') { icon = FaCloud;    barColor = 'bg-purple-500'; }
    return { name: subject.name, icon, progress, completed, total, barColor };
  });

  const handleJoinClassSubmit = async (e) => {
    e.preventDefault();
    if (!classCodeInput) return;
    setJoiningClass(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/user/batch/join`, { classCode: classCodeInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        import('react-hot-toast').then(({ default: toast }) => toast.success(res.data.message));
        setShowJoinModal(false);
        setClassCodeInput('');
      }
    } catch (err) {
      import('react-hot-toast').then(({ default: toast }) => toast.error(err.response?.data?.message || 'Failed to join'));
    } finally { setJoiningClass(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <FaSpinner className="animate-spin text-2xl text-gray-400" />
    </div>
  );

  const difficultyBreakdown = [
    { label: 'Easy',   solved: Math.floor(progressStats.totalCompleted * 0.5),  total: Math.floor(totalTopics * 0.4),  color: 'bg-emerald-500' },
    { label: 'Medium', solved: Math.floor(progressStats.totalCompleted * 0.35), total: Math.floor(totalTopics * 0.4),  color: 'bg-amber-500' },
    { label: 'Hard',   solved: progressStats.totalCompleted - Math.floor(progressStats.totalCompleted * 0.85), total: totalTopics - Math.floor(totalTopics * 0.8), color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-20">

      {/* ── Profile Header ── */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-lg font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserGraduate />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name || 'Student'} 👋</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><FaFire className="text-orange-400" /> {stats.streak} day streak</span>
              {user?.createdAt && <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {joinedBatchCount > 0 ? (
            <Link
              to="/student/classes"
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5"
            >
              <FaUsers className="text-xs" /> My Classes
            </Link>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5"
            >
              <FaUsers className="text-xs" /> Join Class
            </button>
          )}
          <Link to="/analytics" className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5">
            <FaChartLine className="text-xs" /> Analytics
          </Link>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Day Streak', value: stats.streak, icon: <FaFire className="text-orange-400" /> },
          { label: 'Total XP', value: stats.totalPoints.toLocaleString(), icon: <FaBolt className="text-amber-400" /> },
          { label: 'Global Rank', value: stats.rank, icon: <FaCrown className="text-purple-400" /> },
          { label: 'Completed', value: `${progressStats.totalCompleted}/${totalTopics || 57}`, icon: <FaCheckCircle className="text-emerald-400" /> },
        ].map((card, i) => (
          <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
            <p className="text-base mb-2">{card.icon}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Solved Overview + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Solved */}
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" /> Solved Overview
          </h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{progressStats.totalCompleted}</p>
            <p className="text-xs text-gray-400 mt-1">of {totalTopics || 57} problems</p>
          </div>
          <div className="space-y-2.5">
            {difficultyBreakdown.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 w-12">{d.label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: d.total > 0 ? `${(d.solved / d.total) * 100}%` : '0%' }} />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right font-mono">{d.solved}/{d.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaFire className="text-orange-400" /> Activity Log
            </h3>
            <span className="text-xs text-gray-400">{progressStats.totalCompleted} submissions this year</span>
          </div>
          <div className="p-4">
            <ActivityHeatmap />
          </div>
        </div>
      </div>

      {/* ── Subject Mastery + Daily Challenge ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subject mastery */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaChartLine className="text-blue-500" /> Subject Mastery
            </h3>
            <Link to="/analytics" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Deep Report →</Link>
          </div>
          {recentSubjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No subjects found. Start solving to see progress!</p>
          ) : (
            <div className="space-y-3">
              {recentSubjects.map((subject, i) => {
                const mastery = getMasteryLevel(subject.progress);
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <subject.icon className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</span>
                          <span className={`text-[10px] font-semibold ${mastery.cls}`}>{mastery.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{subject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
                        <div className={`h-full rounded-full ${subject.barColor}`} style={{ width: `${subject.progress}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{subject.completed}/{subject.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Problem of Day + Contest */}
        <div className="flex flex-col gap-4">
          {/* Problem of the Day */}
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FaCode className="text-emerald-500" /> Daily Challenge
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                problemOfTheDay.difficulty === 'Easy' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10' :
                problemOfTheDay.difficulty === 'Hard' ? 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10' :
                'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10'
              }`}>{problemOfTheDay.difficulty}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-snug">{problemOfTheDay.title}</p>
            <Link to={problemOfTheDay.link} className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">
              Solve <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {/* Next Contest */}
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] flex-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <FaTrophy className="text-amber-400" /> Next Contest
            </h3>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{nextContest.title}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
              <FaCalendarAlt /> {nextContest.date}
            </p>
            <Link to={nextContest.link} className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">
              View Arena <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaHistory className="text-blue-400" /> Recent Activity
            </h3>
          </div>
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recentActivity.slice(0, 5).map((activity, i) => (
                <div key={activity._id || i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2">{activity.subjectId?.name || 'Topic'}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{activity.topicId?.name || 'Completed Topic'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-500 font-semibold">+10 XP</span>
                    <span className="text-gray-400">{timeAgo(activity.completedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <FaCheckCircle className="text-3xl mx-auto mb-3 opacity-20" />
              <p className="text-sm">No activity yet. Start solving!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {[
              joinedBatchCount > 0
                ? { title: 'My Classes', icon: <FaUsers />, link: '/student/classes' }
                : { title: 'Join Class', icon: <FaUsers />, onClick: () => setShowJoinModal(true) },
              { title: 'Practice', icon: <MdReportProblem />, link: '/problems' },
              { title: 'Analytics', icon: <FaChartLine />, link: '/analytics' },
              { title: 'Contest', icon: <FaTrophy />, link: '/contest' },
            ].map((action, i) => {
              const content = (
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400">{action.icon}</span>
                  <span className="text-sm font-medium">{action.title}</span>
                  <FaArrowRight className="text-gray-300 dark:text-gray-600 text-xs ml-auto" />
                </div>
              );
              return action.link
                ? <Link key={i} to={action.link}>{content}</Link>
                : <button key={i} onClick={action.onClick} className="w-full text-left">{content}</button>;
            })}
          </div>
        </div>
      </div>

      {/* ── Playlists ── */}
      {playlists.length > 0 && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured Series</h3>
            <Link to="/theory" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((pl, i) => <PlaylistCard key={pl._id || i} playlist={pl} />)}
          </div>
        </div>
      )}

      {/* ── Join Class Modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Join a Class</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleJoinClassSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono tracking-widest bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center uppercase"
                />
              </div>
              <p className="text-xs text-gray-400">Your teacher will approve your join request.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" disabled={joiningClass || classCodeInput.length < 6} className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {joiningClass ? <FaSpinner className="animate-spin" /> : null} Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
