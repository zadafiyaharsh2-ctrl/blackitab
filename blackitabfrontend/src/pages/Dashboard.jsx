/**
 * ============================================================================
 * DASHBOARD PAGE (Dashboard.jsx)
 * ============================================================================
 * 
 * The main landing page for logged-in users.
 * Refactored for 'Addictive UI' with Framer Motion, Glassmorphism, and glowing aesthetics.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaBook, FaCode, FaTrophy, FaFire, FaChartLine,
  FaArrowRight, FaCheckCircle, FaDatabase,
  FaLaptopCode, FaCloud, FaQuoteLeft, FaCalendarAlt, FaListUl
} from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import ActivityHeatmap from '../components/ActivityHeatmap';
import PlaylistCard from '../components/PlaylistCard';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

// Framer Motion Variants for Staggered Entrances
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const Dashboard = () => {
  usePageTitle('Dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [subjects, setSubjects] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [progressStats, setProgressStats] = useState({
    totalCompleted: 0,
    bySubject: []
  });

  const [stats, setStats] = useState({
    streak: 0,
    totalPoints: 0,
    rank: 'Loading...'
  });

  const [quote, setQuote] = useState({ text: '', author: '' });

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" }
  ];

  const [nextContest, setNextContest] = useState({
    title: "No upcoming contests",
    date: "—",
    participants: 0,
    link: "/contest"
  });

  const [problemOfTheDay, setProblemOfTheDay] = useState({
    title: "Loading...",
    difficulty: "—",
    topic: "",
    link: "/problems"
  });

  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData) {
          setUser(JSON.parse(userData));
        }

        const subjectsRes = await axios.get(`${API_URL}/api/subjects`);
        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }

        const playlistsRes = await axios.get(`${API_URL}/api/playlists/all`);
        if (playlistsRes.data.success) {
          setPlaylists(playlistsRes.data.playlists);
        }

        if (token) {
          const progressRes = await axios.get(`${API_URL}/api/progress/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (progressRes.data.success) {
            setProgressStats(progressRes.data.data);
            setStats({
              streak: progressRes.data.data.streak || 0,
              totalPoints: progressRes.data.data.totalPoints || 0,
              rank: progressRes.data.data.rank || 'Unranked'
            });
          }
        }
        // Fetch daily problem
        try {
          const dailyRes = await axios.get(`${API_URL}/api/problems/daily`);
          if (dailyRes.data.success && dailyRes.data.data) {
            const d = dailyRes.data.data;
            setProblemOfTheDay({
              title: d.question || 'Practice Challenge',
              difficulty: d.difficulty || 'Medium',
              topic: d.subject || '',
              link: `/problems`
            });
          }
        } catch { }

        // Fetch upcoming contest
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
            setNextContest({ title: c.title, date: dateStr, participants: 0, link: '/contest' });
          }
        } catch { }

        // Resume last session
        const savedSession = localStorage.getItem('blackitab_last_page');
        if (savedSession) {
          try {
            setLastSession(JSON.parse(savedSession));
          } catch { }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const statsCards = [
    {
      title: 'Topics Completed',
      value: progressStats.totalCompleted,
      icon: FaCheckCircle,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'group-hover:border-cyan-500/50'
    },
    {
      title: 'Current Streak',
      value: `${stats.streak} days`,
      icon: FaFire,
      gradient: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'group-hover:border-orange-500/50'
    },
    {
      title: 'Total Points',
      value: stats.totalPoints,
      icon: FaTrophy,
      gradient: 'from-yellow-500/20 to-amber-500/20',
      iconColor: 'text-yellow-400',
      borderColor: 'group-hover:border-yellow-500/50'
    },
    {
      title: 'Global Rank',
      value: stats.rank,
      icon: FaChartLine,
      gradient: 'from-purple-500/20 to-fuchsia-500/20',
      iconColor: 'text-fuchsia-400',
      borderColor: 'group-hover:border-fuchsia-500/50'
    }
  ];

  const quickActions = [
    { title: 'Theory', description: 'Core Concepts', icon: FaBook, link: '/theory', color: 'from-indigo-500 to-indigo-600' },
    { title: 'Practice', description: 'Coding Challenges', icon: MdReportProblem, link: '/problems', color: 'from-emerald-500 to-emerald-600' },
    { title: 'Projects', description: 'Real-world tasks', icon: FaLaptopCode, link: '/ide', color: 'from-pink-500 to-pink-600' },
    { title: 'Analytics', description: 'Track progress', icon: FaChartLine, link: '/analytics', color: 'from-cyan-500 to-cyan-600' }
  ];

  const recentSubjects = subjects.map(subject => {
    const subjectProgress = progressStats.bySubject.find(s => s._id === subject._id);
    const completed = subjectProgress ? subjectProgress.totalCompleted : 0;
    const total = subject.topicCount || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    let icon = FaBook;
    let color = 'text-gray-400';
    let barColor = 'from-gray-600 to-gray-500';

    if (subject.name === 'DBMS') { icon = FaDatabase; color = 'text-blue-400'; barColor = 'from-blue-500 to-blue-400'; }
    else if (subject.name === 'SQL') { icon = FaCode; color = 'text-emerald-400'; barColor = 'from-emerald-500 to-emerald-400'; }
    else if (subject.name === 'CCBDI') { icon = FaCloud; color = 'text-purple-400'; barColor = 'from-purple-500 to-purple-400'; }

    return { name: subject.name, icon, progress: percentage, completed, total, color, barColor };
  });

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div 
            animate={{ x: [-20, 20, -20], y: [-20, 20, -20], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
         />
         <motion.div 
            animate={{ x: [20, -20, 20], y: [20, -20, 20], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
         />
      </div>

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
             <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Hello, </span> 
             <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{user?.name || 'Architect'}</span>
             <span className="inline-block animate-bounce ml-2">👋</span>
          </h1>
          <p className="text-gray-400 text-lg">Your dashboard is looking sharp today. Ready to crush some goals?</p>
        </motion.div>

        {/* STATS ROW (Four Cards) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`glass-panel p-6 flex items-center justify-between group transition-all duration-300 border border-white/5 ${stat.borderColor}`}
            >
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white group-hover:text-glow transition-all">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/5 group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon className={`text-2xl ${stat.iconColor}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* BENTO GRID (Main Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* ROW 1: Motivation (Wide) & Problem of Day (Narrow) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 md:p-10 border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl z-0" />
            
            {/* Animated Background Elements inside the card */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-[60px] z-0 pointer-events-none"
            />

            <FaQuoteLeft className="text-white/5 text-9xl absolute -top-6 -left-6 z-0" />
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-4">
                 <FaFire className="text-orange-400 text-xl" />
                 <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Daily Spark</h3>
              </div>
              <p className="text-2xl md:text-4xl font-extrabold italic mb-6 leading-tight text-white drop-shadow-lg">"{quote.text}"</p>
              <div className="flex items-center">
                <div className="h-1 w-10 bg-indigo-500 rounded-full mr-4" />
                <p className="text-indigo-200 font-medium tracking-wide">{quote.author}</p>
              </div>
            </div>
          </motion.div>

          {/* Problem of the Day Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="lg:col-span-1 glass-panel p-6 flex flex-col relative overflow-hidden group border border-emerald-500/20 hover:border-emerald-500/40">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 z-0">
              <FaCode className="text-9xl text-emerald-500 transform rotate-12" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-inner">
                <FaCode className="text-2xl" />
              </div>
              <span className="px-3 py-1 text-xs font-bold text-red-300 bg-red-500/10 border border-red-500/20 rounded-full backdrop-blur-md">
                {problemOfTheDay.difficulty}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10 tracking-tight">Problem of the Day</h3>
            <p className="text-gray-400 text-sm mb-6 relative z-10">{problemOfTheDay.title}</p>
            <div className="mt-auto relative z-10">
              <Link
                to={problemOfTheDay.link}
                className="group/btn flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                Solve Challenge 
                <FaArrowRight className="ml-2 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* ROW 2: Activity Heatmap (Wide) & Upcoming Contest (Narrow) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel overflow-hidden border border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-lg text-white flex items-center tracking-tight">
                <FaFire className="text-orange-400 mr-3 text-xl" /> Activity Log
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center bg-black/20">
              <ActivityHeatmap />
            </div>
          </motion.div>

          {/* Upcoming Contest Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="lg:col-span-1 glass-panel p-6 flex flex-col border border-yellow-500/20 hover:border-yellow-500/40 relative overflow-hidden group">
             {/* Glow effect behind */}
             <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-bold text-lg text-white flex items-center tracking-tight">
                <FaTrophy className="text-yellow-400 mr-2" /> Upcoming
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Registered
              </span>
            </div>

            <div className="text-center flex-1 flex flex-col justify-center relative z-10">
              <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{nextContest.title}</h4>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm mb-8 mx-auto">
                <FaCalendarAlt className="mr-2 text-blue-400" /> {nextContest.date}
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-8">
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Time</span>
                  <span className="font-bold text-white text-lg">2h</span>
                </div>
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Ques</span>
                  <span className="font-bold text-white text-lg">4</span>
                </div>
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">XP</span>
                  <span className="font-bold text-yellow-400 text-lg">+100</span>
                </div>
              </div>
            </div>

            <Link to={nextContest.link} className="relative z-10 w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm text-center hover:bg-white/10 transition-colors backdrop-blur-md">
              View Arena Details
            </Link>
          </motion.div>

          {/* ROW 3: Subject Progress (Wide) & Quick Actions (Narrow) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-6 border border-white/10 relative overflow-hidden">
            {/* Subtle radial gradient background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] z-0 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
                <FaChartLine className="mr-3 text-blue-400" />
                Learning Progress
              </h2>
              <Link to="/analytics" className="text-sm text-blue-400 font-semibold hover:text-blue-300 transition-colors border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/10">
                View Deep Report
              </Link>
            </div>

            <div className="space-y-5 relative z-10">
              {recentSubjects.map((subject, index) => (
                <div key={index} className="group flex flex-col sm:flex-row sm:items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                  <div className={`p-4 rounded-xl bg-black/40 border border-white/5 shadow-inner ${subject.color} group-hover:scale-110 transition-transform mb-4 sm:mb-0 shrink-0`}>
                    <subject.icon className="text-2xl" />
                  </div>
                  <div className="sm:ml-6 flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                      <h3 className="font-bold text-white tracking-wide">{subject.name}</h3>
                      <div className="text-right">
                         <span className="text-2xl font-black text-white">{subject.progress}%</span>
                         <span className="text-xs text-gray-500 ml-2 font-medium bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                            {subject.completed}/{subject.total}
                         </span>
                      </div>
                    </div>
                    {/* Glowing Progress Bar */}
                    <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${subject.barColor} relative`}
                      >
                         {/* Shine effect on progress bar */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div variants={itemVariants} className="lg:col-span-1 glass-panel p-6 border border-white/10 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
              <FaArrowRight className="mr-3 text-cyan-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {quickActions.map((action, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={action.link}
                    className="flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className={`p-3 rounded-xl bg-black/40 border border-white/10 shadow-inner group-hover:bg-gradient-to-br ${action.color} group-hover:border-transparent transition-all duration-300 shrink-0`}>
                      <action.icon className="text-xl text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="ml-4 flex flex-col">
                       <span className="font-bold text-gray-200 group-hover:text-white transition-colors tracking-wide">{action.title}</span>
                       <span className="text-xs text-gray-500 group-hover:text-gray-300">{action.description}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Resume Last Session */}
            {lastSession ? (
              <Link to={lastSession.path} className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center relative overflow-hidden group block hover:bg-blue-500/15 transition-colors">
                 <p className="text-xs text-blue-300 font-medium relative z-10 flex items-center justify-center">
                   <FaLaptopCode className="mr-2" /> Resume: {lastSession.label}
                 </p>
              </Link>
            ) : (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                 <p className="text-xs text-gray-500 font-medium flex items-center justify-center">
                   <FaLaptopCode className="mr-2" /> No recent session
                 </p>
              </div>
            )}
          </motion.div>

        </div>

        {/* FEATURED SERIES */}
        <motion.div variants={itemVariants} className="mb-10 relative">
          <div className="flex items-end justify-between mb-6">
            <div>
               <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center tracking-tight mb-2">
                 <FaListUl className="mr-3 text-purple-400" />
                 Featured Series
               </h2>
               <p className="text-gray-400 text-sm">Curated playlists to master specific domains</p>
            </div>
            <Link to="/playlists" className="hidden sm:flex group items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white font-medium hover:bg-white/10 transition-colors">
              View All <FaArrowRight className="ml-2 text-xs text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {playlists.slice(0, 4).map((playlist, index) => (
              <motion.div key={playlist._id} whileHover={{ y: -5 }}>
                {/* Assume PlaylistCard handles its own dark mode / glass styling inside now, 
                    or we wrap it here */}
                <div className="h-full">
                   <PlaylistCard playlist={playlist} />
                </div>
              </motion.div>
            ))}
            {playlists.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 glass-panel rounded-2xl border border-white/5 border-dashed">
                <FaCloud className="text-5xl text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">No series available yet</h3>
                <p className="text-gray-500">Premium learning content is currently being prepared.</p>
              </div>
            )}
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
};

// Add keyframes for shimmer effect globally if not in tailwind config
// In a real project, this is better off in index.css
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);

export default Dashboard;
