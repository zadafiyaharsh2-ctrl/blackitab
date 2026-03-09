/**
 * ============================================================================
 * DASHBOARD PAGE (Dashboard.jsx)
 * ============================================================================
 * 
 * LeetCode / Codeforces-inspired student dashboard.
 * Sections: Profile Header, 6 Stat Cards, Activity Heatmap, Subject Mastery,
 *           Daily Challenge + Contest, Recent Activity Timeline, Quick Actions,
 *           Featured Series.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaBook, FaCode, FaTrophy, FaFire, FaChartLine,
  FaArrowRight, FaCheckCircle, FaDatabase,
  FaLaptopCode, FaCloud, FaCalendarAlt, FaListUl,
  FaCrown, FaMedal, FaPercent, FaBolt, FaHistory,
  FaStar, FaUserGraduate
} from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import ActivityHeatmap from '../components/ActivityHeatmap';
import PlaylistCard from '../components/PlaylistCard';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

// ── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getTierInfo = (points, tier) => {
  // If backend provides the tier (from percentile), use it directly
  const tierName = tier || 'Bronze';
  const tiers = {
    'Legendary': { name: 'Legendary', class: 'tier-badge-legendary', icon: FaCrown, next: null, needed: 0 },
    'Platinum':  { name: 'Platinum',  class: 'tier-badge-platinum',  icon: FaCrown, next: 'Legendary', needed: 0 },
    'Gold':      { name: 'Gold',      class: 'tier-badge-gold',      icon: FaTrophy, next: 'Platinum', needed: 0 },
    'Silver':    { name: 'Silver',    class: 'tier-badge-silver',    icon: FaMedal, next: 'Gold', needed: 0 },
    'Bronze':    { name: 'Bronze',    class: 'tier-badge-bronze',    icon: FaStar, next: 'Silver', needed: 0 },
  };
  return tiers[tierName] || tiers['Bronze'];
};

const getMasteryLevel = (percentage) => {
  if (percentage >= 80) return { label: 'Expert',       class: 'mastery-expert' };
  if (percentage >= 50) return { label: 'Advanced',     class: 'mastery-advanced' };
  if (percentage >= 20) return { label: 'Intermediate', class: 'mastery-intermediate' };
  return                       { label: 'Beginner',     class: 'mastery-beginner' };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ── SVG Circular Progress Component ─────────────────────────────────────────
const CircularProgress = ({ value, max, size = 100, strokeWidth = 8, color = '#3b82f6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - percentage);

  return (
    <svg width={size} height={size} className="radial-progress-ring">
      <circle cx={size/2} cy={size/2} r={radius} fill="none"
        className="stroke-gray-200 dark:stroke-white/[0.06]" strokeWidth={strokeWidth} />
      <motion.circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
};

// ── Empty State Fallbacks ────────────────────────────────────────────────────────────
const FALLBACK_SUBJECTS = [];
const FALLBACK_PROGRESS = {
  totalCompleted: 0,
  bySubject: [],
  streak: 0,
  longestStreak: 0,
  totalPoints: 0,
  rank: 'Unranked',
  percentile: 0,
  rankTier: 'Bronze',
  recentActivity: [],
};
const FALLBACK_PLAYLISTS = [];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        if (u.role === 'teacher' || u.role === 'hod') {
          navigate('/teacher-dashboard', { replace: true });
        } else if (u.role === 'institute_admin') {
          navigate('/institute-dashboard', { replace: true });
        }
      }
    } catch (e) { }
  }, [navigate]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [progressStats, setProgressStats] = useState({ totalCompleted: 0, bySubject: [] });
  const [stats, setStats] = useState({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Loading...', percentile: 0, rankTier: 'Bronze' });
  const [recentActivity, setRecentActivity] = useState([]);
  const [nextContest, setNextContest] = useState({
    title: "Weekly Challenge #14", date: "Sat, Mar 8 · 3:00 PM", link: "/contest"
  });
  const [problemOfTheDay, setProblemOfTheDay] = useState({
    title: "Find the second highest salary using SQL", difficulty: "Medium", topic: "SQL", link: "/problems"
  });

  // ── Fetch All Data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData) setUser(JSON.parse(userData));

        // Subjects
        try {
          const subjectsRes = await axios.get(`${API_URL}/api/subjects`);
          if (subjectsRes.data.success && subjectsRes.data.data.length > 0) setSubjects(subjectsRes.data.data);
          else setSubjects(FALLBACK_SUBJECTS);
        } catch { setSubjects(FALLBACK_SUBJECTS); }

        // Playlists (Endpoint not built yet, returning empty to avoid 404)
        setPlaylists(FALLBACK_PLAYLISTS);

        // Progress stats
        if (token) {
          try {
            const progressRes = await axios.get(`${API_URL}/api/progress/stats`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (progressRes.data.success) {
              const d = progressRes.data.data;
              setProgressStats(d);
              setStats({
                streak: d.streak || 0,
                longestStreak: d.longestStreak || 0,
                totalPoints: d.totalPoints || 0,
                rank: d.rank || 'Unranked',
                percentile: d.percentile || 0,
                rankTier: d.rankTier || 'Bronze'
              });
              setRecentActivity(d.recentActivity || []);
            }
          } catch {
            setProgressStats(FALLBACK_PROGRESS);
            setStats({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0, rankTier: 'Bronze' });
            setRecentActivity([]);
          }
        } else {
          setProgressStats(FALLBACK_PROGRESS);
          setStats({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0, rankTier: 'Bronze' });
          setRecentActivity([]);
        }

        // Daily problem
        try {
          const dailyRes = await axios.get(`${API_URL}/api/problems/daily`);
          if (dailyRes.data.success && dailyRes.data.data) {
            const d = dailyRes.data.data;
            setProblemOfTheDay({ title: d.question || 'Practice Challenge', difficulty: d.difficulty || 'Medium', topic: d.subject || '', link: `/problems` });
          }
        } catch { /* keep fallback */ }

        // Upcoming contest
        try {
          const contestRes = await axios.get(`${API_URL}/api/contests/upcoming`);
          if (contestRes.data.success && contestRes.data.data?.length > 0) {
            const c = contestRes.data.data[0];
            const date = new Date(c.startTime);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const dateStr = isToday ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                           isTomorrow ? `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                           date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            setNextContest({ title: c.title, date: dateStr, link: '/contest' });
          }
        } catch { /* keep fallback */ }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived Data ────────────────────────────────────────────────────────
  const tier = getTierInfo(stats.totalPoints, stats.rankTier);
  const totalTopics = subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0);

  const recentSubjects = subjects.map(subject => {
    const subjectProgress = progressStats.bySubject.find(s => s._id === subject._id);
    const completed = subjectProgress ? subjectProgress.totalCompleted : 0;
    const total = subject.topicCount || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    let icon = FaBook, color = 'text-gray-400', barColor = 'from-gray-600 to-gray-500', accentHex = '#9ca3af';
    if (subject.name === 'DBMS')  { icon = FaDatabase; color = 'text-blue-400';    barColor = 'from-blue-500 to-blue-400';      accentHex = '#60a5fa'; }
    else if (subject.name === 'SQL')  { icon = FaCode;     color = 'text-emerald-400'; barColor = 'from-emerald-500 to-emerald-400'; accentHex = '#34d399'; }
    else if (subject.name === 'CCBDI') { icon = FaCloud;    color = 'text-purple-400';  barColor = 'from-purple-500 to-purple-400';  accentHex = '#a78bfa'; }

    return { name: subject.name, icon, progress: percentage, completed, total, color, barColor, accentHex };
  });

  const quickActions = [
    { title: 'Theory', description: 'Core Concepts', icon: FaBook, link: '/theory', color: 'from-indigo-500 to-indigo-600' },
    { title: 'Practice', description: 'Coding Challenges', icon: MdReportProblem, link: '/problems', color: 'from-emerald-500 to-emerald-600' },
    { title: 'Projects', description: 'Real-world tasks', icon: FaLaptopCode, link: '/ide', color: 'from-pink-500 to-pink-600' },
    { title: 'Analytics', description: 'Track progress', icon: FaChartLine, link: '/analytics', color: 'from-cyan-500 to-cyan-600' }
  ];

  const difficultyBreakdown = [
    { label: 'Easy',   solved: Math.floor(progressStats.totalCompleted * 0.5), total: Math.floor(totalTopics * 0.4), cls: 'diff-easy' },
    { label: 'Medium', solved: Math.floor(progressStats.totalCompleted * 0.35), total: Math.floor(totalTopics * 0.4), cls: 'diff-medium' },
    { label: 'Hard',   solved: progressStats.totalCompleted - Math.floor(progressStats.totalCompleted * 0.5) - Math.floor(progressStats.totalCompleted * 0.35), total: totalTopics - Math.floor(totalTopics * 0.4) - Math.floor(totalTopics * 0.4), cls: 'diff-hard' },
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-800 dark:text-gray-100 overflow-x-hidden pt-20">
      {/* Ambient BG Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-20,20,-20], y: [-20,20,-20], opacity: [0.3,0.5,0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <motion.div animate={{ x: [20,-20,20], y: [20,-20,20], opacity: [0.2,0.4,0.2] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <motion.div className="relative z-10 max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — PROFILE + RANK HEADER
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="glass-panel p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-gray-200 dark:border-white/10 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-5 relative z-10">
              {/* Avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserGraduate />}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                  {user?.name || 'Architect'}
                  <span className="inline-block animate-bounce ml-2 text-xl">👋</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Tier Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${tier.class}`}>
                    <tier.icon className="text-[10px]" /> {tier.name}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <FaFire className="text-orange-400" /> {stats.streak} day streak
                  </span>
                  {user?.createdAt && (
                    <>
                      <span className="text-gray-500 hidden sm:inline">•</span>
                      <span className="text-gray-500 hidden sm:inline text-xs">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rank Display */}
            <div className="relative z-10 text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Global Rank</p>
              <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-glow">{stats.rank}</p>
              {stats.percentile > 0 && (
                <p className="text-[11px] text-gray-500 mt-1">Top <span className="text-blue-400 font-bold">{Math.max(100 - stats.percentile, 1)}%</span></p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — STAT CARDS (LeetCode-Style)
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {/* Solved Donut Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel stat-card-glow p-5 flex flex-col items-center text-center border border-gray-200 dark:border-white/5 relative overflow-hidden group">
            <div className="relative mb-3">
              <CircularProgress value={progressStats.totalCompleted} max={totalTopics || 57} size={80} strokeWidth={6} color="#3b82f6" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">{progressStats.totalCompleted}</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-500 uppercase">Solved</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-500 font-semibold uppercase tracking-wider">of {totalTopics || 57} Topics</p>
          </motion.div>

          {/* Streak Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel stat-card-glow p-5 flex flex-col items-center text-center border border-orange-200 dark:border-orange-500/10 hover:border-orange-500/30 relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-3 group-hover:scale-110 transition-transform">
              <FaFire className="text-orange-400 text-2xl animate-pulse-glow" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.streak}</h3>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Day Streak</p>
            <p className="text-[10px] text-gray-600 mt-1">Longest: {stats.longestStreak || stats.streak}</p>
          </motion.div>

          {/* XP Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel stat-card-glow p-5 flex flex-col items-center text-center border border-yellow-200 dark:border-yellow-500/10 hover:border-yellow-500/30 relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-3 group-hover:scale-110 transition-transform">
              <FaBolt className="text-yellow-400 text-2xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalPoints.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Total XP</p>
            {stats.percentile > 0 && (
              <div className="w-full mt-2">
                <div className="w-full bg-gray-200 dark:bg-black/40 rounded-full h-1.5 overflow-hidden border border-gray-300 dark:border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percentile}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Rank Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel stat-card-glow p-5 flex flex-col items-center text-center border border-purple-200 dark:border-purple-500/10 hover:border-purple-500/30 relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
              <FaChartLine className="text-fuchsia-400 text-2xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.rank}</h3>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Global Rank</p>
            <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.class}`}>
              {tier.name}
            </span>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — MAIN GRID: Solved Breakdown + Heatmap + Contest
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

          {/* Problem Difficulty Breakdown (LeetCode-style) */}
          <motion.div variants={itemVariants} className="lg:col-span-1 glass-panel p-6 border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-6 tracking-tight">
              <FaCheckCircle className="text-blue-500 dark:text-blue-400 mr-2" /> Solved Overview
            </h3>

            {/* Central donut */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CircularProgress value={progressStats.totalCompleted} max={totalTopics || 57} size={120} strokeWidth={10} color="#3b82f6" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{progressStats.totalCompleted}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider">/ {totalTopics || 57}</span>
                </div>
              </div>
            </div>

            {/* Difficulty bars */}
            <div className="space-y-3">
              {difficultyBreakdown.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border min-w-[60px] text-center ${d.cls}`}>{d.label}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-black/40 rounded-full h-2 overflow-hidden border border-gray-300 dark:border-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: d.total > 0 ? `${(d.solved / d.total) * 100}%` : '0%' }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                      className={`h-full rounded-full ${d.label === 'Easy' ? 'bg-emerald-500' : d.label === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[40px] text-right">{d.solved}/{d.total}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center tracking-tight">
                <FaFire className="text-orange-500 dark:text-orange-400 mr-2" /> Activity Log
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                {progressStats.totalCompleted} submissions in the past year
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center bg-gray-50/50 dark:bg-black/20">
              <ActivityHeatmap />
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — SUBJECT MASTERY + DAILY CHALLENGE + CONTEST
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

          {/* Subject Mastery Progress */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-6 border border-gray-200 dark:border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] z-0 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center tracking-tight">
                <FaChartLine className="mr-2 text-blue-500 dark:text-blue-400" /> Subject Mastery
              </h2>
              <Link to="/analytics" className="text-xs text-blue-400 font-semibold hover:text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/10 transition-colors">
                Deep Report
              </Link>
            </div>

            <div className="space-y-4 relative z-10">
              {recentSubjects.map((subject, i) => {
                const mastery = getMasteryLevel(subject.progress);
                return (
                  <div key={i} className="group flex flex-col sm:flex-row sm:items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                    <div className={`p-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 shadow-inner ${subject.color} group-hover:scale-110 transition-transform mb-3 sm:mb-0 shrink-0`}>
                      <subject.icon className="text-xl" />
                    </div>
                    <div className="sm:ml-5 flex-1 w-full">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">{subject.name}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${mastery.class}`}>
                            {mastery.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-gray-900 dark:text-white">{subject.progress}%</span>
                          <span className="text-xs text-gray-500 ml-2 font-medium bg-gray-100 dark:bg-black/40 px-2 py-0.5 rounded-md border border-gray-300 dark:border-white/5">
                            {subject.completed}/{subject.total}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-black/50 rounded-full h-2.5 overflow-hidden border border-gray-300 dark:border-white/5 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${subject.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${subject.barColor} relative`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Daily Challenge + Upcoming Contest stacked */}
          <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
            {/* Problem of the Day */}
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} className="glass-panel p-5 flex flex-col border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-500/40 relative overflow-hidden group flex-1">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity z-0">
                <FaCode className="text-8xl text-emerald-500 transform rotate-12" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <FaCode className="text-lg" />
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                  problemOfTheDay.difficulty === 'Easy' ? 'diff-easy' :
                  problemOfTheDay.difficulty === 'Hard' ? 'diff-hard' : 'diff-medium'
                }`}>
                  {problemOfTheDay.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 relative z-10 tracking-tight">🎯 Problem of the Day</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 relative z-10 flex-1">{problemOfTheDay.title}</p>
              <Link to={problemOfTheDay.link}
                className="relative z-10 flex items-center justify-center w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                Solve Challenge <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>

            {/* Upcoming Contest */}
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} className="glass-panel p-5 flex flex-col border border-yellow-200 dark:border-yellow-500/20 hover:border-yellow-500/40 relative overflow-hidden group flex-1">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center tracking-tight text-sm">
                  <FaTrophy className="text-yellow-400 mr-2" /> Next Contest
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Registered
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center relative z-10 tracking-tight">{nextContest.title}</h4>
              <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs mb-4 mx-auto relative z-10">
                <FaCalendarAlt className="mr-1.5 text-blue-400" /> {nextContest.date}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4 relative z-10">
                {[{ label: 'Time', value: '2h' }, { label: 'Ques', value: '4' }, { label: 'XP', value: '+100', cls: 'text-yellow-500 dark:text-yellow-400' }].map((m, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-gray-200 dark:border-white/5">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">{m.label}</span>
                    <span className={`font-bold text-gray-900 dark:text-white text-sm ${m.cls || ''}`}>{m.value}</span>
                  </div>
                ))}
              </div>
              <Link to={nextContest.link} className="relative z-10 w-full py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white font-bold text-xs text-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors backdrop-blur-md block">
                View Arena Details
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — RECENT ACTIVITY TIMELINE + QUICK ACTIONS
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

          {/* Recent Activity Timeline */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-6 border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-6 tracking-tight">
              <FaHistory className="text-blue-500 dark:text-blue-400 mr-2" /> Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[5px] top-2 bottom-2 timeline-line" />

                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, i) => (
                    <motion.div key={activity._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className="flex items-start gap-4 ml-0 relative">
                      <div className="timeline-dot mt-1.5" />
                      <div className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {activity.subjectId?.name || 'Topic'}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{activity.topicId?.name || 'Completed Topic'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-400 font-bold">+10 XP</span>
                            <span className="text-[10px] text-gray-600">{timeAgo(activity.completedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <FaCheckCircle className="text-4xl mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No activity yet. Start solving to build your timeline!</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-1 glass-panel p-6 border border-gray-200 dark:border-white/10 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center tracking-tight">
              <FaArrowRight className="mr-2 text-cyan-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2.5 flex-1">
              {quickActions.map((action, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to={action.link}
                    className="flex items-center p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
                    <div className={`p-2.5 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner group-hover:bg-gradient-to-br ${action.color} group-hover:border-transparent transition-all duration-300 shrink-0`}>
                      <action.icon className="text-lg text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="font-bold text-sm text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{action.title}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">{action.description}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — FEATURED SERIES
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center tracking-tight mb-1">
                <FaListUl className="mr-2 text-purple-500 dark:text-purple-400" /> Featured Series
              </h2>
              <p className="text-gray-500 text-xs">Curated playlists to master specific domains</p>
            </div>
            <Link to="/playlists" className="hidden sm:flex group items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              View All <FaArrowRight className="ml-1.5 text-[10px] text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {playlists.slice(0, 4).map((playlist) => (
              <motion.div key={playlist._id} whileHover={{ y: -5 }}>
                <div className="h-full"><PlaylistCard playlist={playlist} /></div>
              </motion.div>
            ))}
            {playlists.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 glass-panel rounded-2xl border border-gray-300 dark:border-white/5 border-dashed">
                <FaCloud className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-300 mb-1">No series available yet</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Premium learning content is being prepared.</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
