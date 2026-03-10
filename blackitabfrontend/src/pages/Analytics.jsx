import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import {
  TrendingUp,
  Target,
  Flame,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  BookOpen,
  Code,
  Brain,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  Users,
  Activity,
  CalendarDays,
  PieChart,
  Medal,
  Gauge,
  Timer,
  Gift,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityHeatmap from '../components/ActivityHeatmap';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const trendStyles = {
  positive: 'text-emerald-700 dark:text-emerald-300',
  negative: 'text-rose-700 dark:text-rose-300',
  neutral: 'text-slate-500 dark:text-slate-400',
};

const difficultyStyles = {
  Easy: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  Medium: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  Hard: {
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
};

const masteryStyles = {
  Advanced: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Beginner: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const progressBarPalette = ['bg-blue-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-sky-600'];

const quickWinStyles = {
  blue: { iconBg: 'bg-blue-100 dark:bg-blue-500/15', iconText: 'text-blue-700 dark:text-blue-300', bar: 'bg-blue-600' },
  emerald: { iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', iconText: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-600' },
  amber: { iconBg: 'bg-amber-100 dark:bg-amber-500/15', iconText: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-600' },
  slate: { iconBg: 'bg-slate-200 dark:bg-slate-700/60', iconText: 'text-slate-700 dark:text-slate-300', bar: 'bg-slate-500' },
};

const speedCardStyles = {
  Easy: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  Medium: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
  Hard: 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30',
};

// ── REMOVED HARDCODED ARRAYS. DATA MUST COME FROM API ENDPOINT. ──
// Data like weeklyActivity, peakHours, difficultyDistribution, speedMetrics, quickWins, 
// and topicPerformance are now dynamically driven or hidden if data is missing.

const StatCard = ({ icon: Icon, title, value, change, suffix = '' }) => {
  const trend = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  const TrendIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-panel p-6 border border-slate-200 dark:border-white/10 dark:hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-transparent dark:border-blue-500/30 dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendStyles[trend]}`}>
          <TrendIcon className="h-4 w-4" />
          {Math.abs(change)}{suffix}
        </div>
      </div>
      <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-white drop-shadow-md">{value}{suffix}</p>
    </motion.div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        if (['teacher', 'hod', 'institute_admin'].includes(u.role)) {
          navigate('/school-analytics', { replace: true });
        }
      }
    } catch (e) { }
  }, [navigate]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      problemsSolved: 0,
      problemsChange: 0,
      accuracy: 0,
      accuracyChange: 0,
      currentStreak: 0,
      streakChange: 0,
      studyHours: 0,
      hoursChange: 0,
    },
    subjectProgress: [],
    strengths: [],
    weaknesses: [],
    recentActivity: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_URL}/api/attempts/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setData((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const { stats, subjectProgress, strengths, weaknesses, recentActivity } = data;
  
  // These extended analytics aren't fully supported by backend yet,
  // we will map what we can or show empty states.
  const hasExtendedData = false; 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-white p-6 selection:bg-blue-500/30">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-white/10 dark:hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-transparent dark:border-blue-500/30 dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <BarChart3 className="h-7 w-7 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
              <p className="text-slate-600 dark:text-slate-400">Track progress and focus on the next highest-impact improvements.</p>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} title="Problems Solved" value={stats.problemsSolved} change={stats.problemsChange} />
          <StatCard icon={TrendingUp} title="Accuracy Rate" value={stats.accuracy} change={stats.accuracyChange} suffix="%" />
          <StatCard icon={Flame} title="Current Streak" value={stats.currentStreak} change={stats.streakChange} suffix=" days" />
          <StatCard icon={Clock} title="Study Hours (Week)" value={stats.studyHours} change={stats.hoursChange} suffix="h" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <ActivityHeatmap />
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-5 border border-slate-200 dark:border-white/10 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-700 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <h2 className="text-lg font-bold dark:text-white">Weekly Activity</h2>
            </div>
            <div className="flex items-end justify-between h-[155px] pt-4 space-x-2">
              {data.weeklyActivity && data.weeklyActivity.length > 0 ? data.weeklyActivity.map((day, idx) => {
                const maxCount = Math.max(...data.weeklyActivity.map(d => d.count), 1);
                const heightPct = (day.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full">
                    <div className="w-full flex-1 flex items-end justify-center pb-2 relative group">
                      <div 
                        className="w-full max-w-[24px] bg-blue-500 dark:bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400 dark:group-hover:bg-blue-300 dark:shadow-[0_0_12px_rgba(59,130,246,0.8)]" 
                        style={{ height: `${heightPct}%`, minHeight: '4px' }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 border border-white/20 text-white text-xs px-2 py-1 rounded transition-opacity shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        {day.count}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{day.day}</span>
                  </div>
                );
              }) : (
                <div className="w-full text-center flex flex-col items-center justify-center -mt-6">
                  <Activity className="h-8 w-8 text-slate-300 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Solve problems to track weekly activity.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

          <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <h2 className="text-lg font-bold dark:text-white">Domain Mastery</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectProgress && subjectProgress.length > 0 ? subjectProgress.map((subject, idx) => {
                const masteryClass = masteryStyles[subject.mastery] || masteryStyles.Beginner;
                // Generate a pseudo-random dash array based on progress
                const radius = 38;
                const circumference = 2 * Math.PI * radius;
                const dashoffset = circumference - (subject.progress / 100) * circumference;
                
                return (
                  <div key={`${subject.name}-${idx}`} className="relative p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden group hover:dark:border-white/20 transition-all duration-300 dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-indigo-600 opacity-80 dark:shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                    
                    <div className="flex items-center justify-between pl-4">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 drop-shadow-sm">{subject.name}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border border-transparent dark:border-white/10 ${masteryClass} dark:shadow-[0_0_10px_currentColor]`}>
                          {subject.mastery}
                        </span>
                      </div>
                      
                      {/* Radial Progress */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="-rotate-90 w-20 h-20">
                          <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-white/10" />
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            className="text-blue-600 dark:text-blue-400 transition-all duration-1000 dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{subject.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-white/5 border dark:border-white/10 mb-3 dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <BookOpen className="h-8 w-8 text-slate-400 dark:text-white/40" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold mb-1">No Data Available</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Complete practice problems to map your proficiency across specific subjects.</p>
                </div>
              )}
            </div>
          </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-emerald-200/50 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/5 p-6 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 border dark:border-emerald-500/50 dark:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Award className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white drop-shadow-sm">Core Strengths</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              {strengths && strengths.length > 0 ? strengths.map((strength, idx) => (
                <div key={`${strength}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/50 border border-emerald-100 dark:border-emerald-500/30 shadow-sm backdrop-blur-md group hover:dark:border-emerald-400/70 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100 line-clamp-2">{strength}</span>
                </div>
              )) : (
                <div className="col-span-full py-8 text-center bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-xl border border-dashed border-emerald-200 dark:border-emerald-500/30">
                  <p className="text-sm font-semibold text-emerald-700/70 dark:text-emerald-400/70">Solve problems above 75% accuracy to reveal strengths.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-rose-200/50 dark:border-rose-500/40 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/5 p-6 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            {/* Background Glow */}
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-400/20 dark:bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/20 border dark:border-rose-500/50 dark:shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <Brain className="h-5 w-5 text-rose-700 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-rose-950 dark:text-white drop-shadow-sm">Focus Areas</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              {weaknesses && weaknesses.length > 0 ? weaknesses.map((weakness, idx) => (
                <div key={`${weakness}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/50 border border-rose-100 dark:border-rose-500/30 shadow-sm backdrop-blur-md group hover:dark:border-rose-400/70 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="h-4 w-4 text-rose-600 dark:text-rose-400 dark:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  </div>
                  <span className="text-sm font-bold text-rose-900 dark:text-rose-100 line-clamp-2">{weakness}</span>
                </div>
              )) : (
                <div className="col-span-full py-8 text-center bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-xl border border-dashed border-rose-200 dark:border-rose-500/30">
                  <p className="text-sm font-semibold text-rose-700/70 dark:text-rose-400/70">Metrics clear. Attempt harder problems to find weak points.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Code className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          {loading ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading activity...</div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
              {recentActivity.map((activity, idx) => {
                const diffStyle = difficultyStyles[activity.difficulty] || difficultyStyles.Medium;
                const isCompleted = activity.type === 'completed';
                
                return (
                  <div key={`${activity.title}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon Node */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-white dark:bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-125">
                      {isCompleted ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      )}
                    </div>
                    
                    {/* Card Content */}
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] leading-tight flex-1">{activity.title}</h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${diffStyle.badge}`}>
                          {activity.difficulty || 'Medium'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{activity.time}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isCompleted ? '+XP Awarded' : 'Attempt Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Your recent timeline is empty. Start solving!</p>
            </div>
          )}
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Difficulty Dist.</h2>
            </div>
            <div className="space-y-4">
               {hasExtendedData ? (
                   <div className="text-center py-4 text-sm text-slate-500">Distribution coming soon.</div>
               ) : (
                <div className="text-center py-8">
                  <PieChart className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Not enough data to map difficulty.</p>
                </div>
               )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Speed Metrics</h2>
            </div>
            <div className="space-y-3">
               {hasExtendedData ? (
                  <div className="text-center py-4 text-sm text-slate-500">Speed metrics coming soon.</div>
               ) : (
                <div className="text-center py-8">
                  <Timer className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Track and report solve speed by solving problems.</p>
                </div>
               )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Quick Wins</h2>
            </div>
            <div className="space-y-3">
               {hasExtendedData ? (
                   <div className="text-center py-4 text-sm text-slate-500">Wins generated based on data.</div>
               ) : (
                <div className="text-center py-8">
                  <Gift className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Unlock quick wins by generating some initial activity.</p>
                </div>
               )}
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Global Rankings Snapshot</h2>
            </div>
            <div className="space-y-3">
              {hasExtendedData ? (
                 <div className="text-center py-4 text-sm text-slate-500">Rankings coming soon.</div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Participate in contests to unlock global rankings.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Consistency Score</h2>
            </div>
            <div className="space-y-3">
              {hasExtendedData ? (
                 <div className="text-center py-4 text-sm text-slate-500">Consistency metrics coming soon.</div>
              ) : (
                <div className="text-center py-8">
                  <Gauge className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Solve daily to build your consistency score.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Top Performing Topics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjectProgress && subjectProgress.length > 0 ? subjectProgress.map((topic, idx) => (
              <div key={`${topic.name}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{topic.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {topic.mastery}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${topic.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{topic.progress}%</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-6">
                <p className="text-sm text-slate-500">Solve more problems across different topics to track your best domains.</p>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Peer Comparison</h2>
          </div>
          <div className="space-y-3">
             {hasExtendedData ? (
                <div className="text-center py-4 text-sm text-slate-500">Peer metrics coming soon.</div>
             ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Join an institute to compare your stats with peers.</p>
              </div>
             )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Analytics;
