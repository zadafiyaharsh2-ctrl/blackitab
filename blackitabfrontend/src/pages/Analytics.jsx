import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Activity,
  TrendingDown,
  CalendarDays,
  Lightbulb,
  PieChart,
  Star,
  Medal,
  Gauge,
  Timer,
  Gift,
  Share2
} from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Analytics = () => {
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      problemsSolved: 0, problemsChange: 0, accuracy: 0, accuracyChange: 0,
      currentStreak: 0, streakChange: 0, studyHours: 0, hoursChange: 0
    },
    subjectProgress: [],
    strengths: [],
    weaknesses: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);
        const res = await axios.get(`${API_URL}/api/attempts/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(prev => ({ ...prev, ...res.data.data }));
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

  const weeklyActivity = [
    { day: 'Mon', problems: 8 },
    { day: 'Tue', problems: 12 },
    { day: 'Wed', problems: 6 },
    { day: 'Thu', problems: 15 },
    { day: 'Fri', problems: 10 },
    { day: 'Sat', problems: 18 },
    { day: 'Sun', problems: 14 }
  ];




  const StatCard = ({ icon: Icon, title, value, change, suffix = '' }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass-panel border-white/5 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          {!isNeutral && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(change)}{suffix}
            </div>
          )}
          {isNeutral && (
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Minus className="h-4 w-4" />
              {change}
            </div>
          )}
        </div>
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl text-glow font-bold text-gray-900 dark:text-white">{value}{suffix}</p>
      </motion.div>
    );
  };

  const maxActivity = Math.max(...weeklyActivity.map(d => d.problems));

  return (
    <div className="min-h-screen p-6 relative bg-[#050505] selection:bg-purple-500/30 overflow-hidden text-white">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress and identify areas for improvement</p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Problems Solved"
            value={stats.problemsSolved}
            change={stats.problemsChange}
          />
          <StatCard
            icon={TrendingUp}
            title="Accuracy Rate"
            value={stats.accuracy}
            change={stats.accuracyChange}
            suffix="%"
          />
          <StatCard
            icon={Flame}
            title="Current Streak"
            value={stats.currentStreak}
            change={stats.streakChange}
            suffix=" days"
          />
          <StatCard
            icon={Clock}
            title="Study Hours (Week)"
            value={stats.studyHours}
            change={stats.hoursChange}
            suffix="h"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Heatmap */}
          <div className="lg:col-span-2">
            <ActivityHeatmap />
          </div>

          {/* Weekly Activity Chart */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Activity</h2>
            </div>
            
            <div className="space-y-3">
              {weeklyActivity.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{item.day}</span>
                  <div className="flex-1 bg-gray-700/30 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(item.problems / maxActivity) * 100}%` }}
                    >
                      {item.problems > 0 && (
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.problems}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Subject Progress */}
        <motion.div variants={itemVariants} className="glass-panel border-white/5 rounded-xl p-6 mb-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subject Performance</h2>
          </div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectProgress.map((subject, idx) => (
              <div key={idx} className="bg-gray-700/30 rounded-lg p-5 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-400 transition-colors">{subject.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    subject.mastery === 'Advanced' ? 'bg-green-500/20 text-green-400' :
                    subject.mastery === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {subject.mastery}
                  </span>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{subject.progress}%</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-600">
                    <div
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-gray-900 dark:text-white justify-center bg-gradient-to-r ${subject.color} transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Strengths</h2>
            </div>
            
            <div className="space-y-3">
              {strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 hover:bg-green-500/20 transition-all">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200 font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="h-5 w-5 text-red-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Areas to Improve</h2>
            </div>
            
            <div className="space-y-3">
              {weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 hover:bg-red-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span className="text-gray-200 font-medium">{weakness}</span>
                  </div>
                  <Zap className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="glass-panel border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Code className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  {activity.type === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Code className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-400 transition-colors">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</span>
                    <span className="text-gray-600">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      activity.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {activity.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Velocity & Peak Study Hours */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Learning Velocity */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learning Velocity</h2>
              <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Trending Up</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last 7 days</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">83 problems</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last 30 days</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">312 problems</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average per day</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">10.4 problems</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-semibold">+23% from last month</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You're accelerating! Keep up the momentum.</p>
              </div>
            </div>
          </div>

          {/* Peak Study Hours */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Peak Study Hours</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { time: '6 AM - 9 AM', problems: 45, percentage: 80 },
                { time: '2 PM - 5 PM', problems: 32, percentage: 60 },
                { time: '8 PM - 11 PM', problems: 58, percentage: 100 },
                { time: 'Late Night', problems: 12, percentage: 25 }
              ].map((slot, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{slot.time}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{slot.problems} problems</span>
                  </div>
                  <div className="bg-gray-700/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${slot.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Most productive: 8 PM - 11 PM
              </p>
            </div>
          </div>
        </motion.div>

        {/* Global Rankings & Monthly Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Global Rankings */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Global Rankings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall Rank</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">#1,234</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Top</p>
                  <p className="text-2xl font-bold text-yellow-400">8%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Country Rank</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">#89</p>
                </div>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Institution Rank</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">#12</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm pt-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-gray-600 dark:text-gray-400">Ahead of <span className="text-gray-900 dark:text-white font-semibold">14,523</span> users</span>
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">This Month Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">312</p>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Attempted</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
              </div>
              
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Study Hours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">186h</p>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Achievements</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skill Progression Tracker */}
        <motion.div variants={itemVariants} className="glass-panel border-white/5 rounded-xl p-6 mb-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skill Progression Tracker</h2>
            <span className="ml-auto text-xs text-gray-600 dark:text-gray-400">Last 6 months</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { skill: 'Arrays', level: 'Expert', progress: 95, color: 'purple' },
              { skill: 'Trees', level: 'Advanced', progress: 85, color: 'blue' },
              { skill: 'Graphs', level: 'Intermediate', progress: 65, color: 'green' },
              { skill: 'DP', level: 'Advanced', progress: 78, color: 'orange' },
              { skill: 'Greedy', level: 'Intermediate', progress: 62, color: 'pink' },
              { skill: 'Backtrack', level: 'Beginner', progress: 42, color: 'teal' }
            ].map((skill, idx) => (
              <div key={idx} className="bg-gray-700/30 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - skill.progress / 100)}`}
                      className={`text-${skill.color}-500 transition-all duration-500`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{skill.progress}%</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">{skill.skill}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  skill.level === 'Expert' ? 'bg-purple-500/20 text-purple-400' :
                  skill.level === 'Advanced' ? 'bg-blue-500/20 text-blue-400' :
                  skill.level === 'Intermediate' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI-Powered Insights */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Insights & Recommendations</h2>
          </div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-300 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Strength to Leverage</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Your mastery in <span className="text-green-400 font-semibold">Dynamic Programming</span> is exceptional. Consider tackling harder problems to maintain momentum and teaching others to reinforce your knowledge.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-300 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Focus Area</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="text-red-400 font-semibold">Graph Algorithms</span> need attention. Dedicate 30 minutes daily to BFS/DFS problems. You're 67% more likely to succeed with consistent practice.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-300 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Optimal Study Time</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Based on your patterns, you perform <span className="text-blue-400 font-semibold">34% better</span> between 8-11 PM. Schedule challenging problems during this peak productivity window.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-300 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Next Milestone</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    You're <span className="text-purple-400 font-semibold">23 problems away</span> from reaching the top 5% globally. Maintain your current pace to achieve this in 2 weeks.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Difficulty Distribution & Topic Performance */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Difficulty Distribution */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Difficulty Distribution</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { difficulty: 'Easy', count: 58, percentage: 45, color: 'green' },
                { difficulty: 'Medium', count: 49, percentage: 39, color: 'yellow' },
                { difficulty: 'Hard', count: 20, percentage: 16, color: 'red' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.difficulty}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 dark:text-white font-bold">{item.count}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-${item.color}-500 h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Problems Solved</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">127</span>
              </div>
            </div>
          </div>

          {/* Topic-Wise Performance */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Performing Topics</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { topic: 'Arrays & Strings', solved: 45, total: 50, accuracy: 94 },
                { topic: 'Dynamic Programming', solved: 28, total: 35, accuracy: 89 },
                { topic: 'Trees & Graphs', solved: 32, total: 40, accuracy: 85 },
                { topic: 'Hash Tables', solved: 22, total: 25, accuracy: 92 }
              ].map((topic, idx) => (
                <div key={idx} className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">{topic.topic}</span>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {topic.accuracy}% accuracy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                        style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {topic.solved}/{topic.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements & Badges */}
        <motion.div variants={itemVariants} className="glass-panel border-white/5 rounded-xl p-6 mb-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <Medal className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements & Badges</h2>
            <span className="ml-auto text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
              12 Unlocked
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: '100 Problems', icon: Trophy, color: 'yellow', unlocked: true },
              { name: '30 Day Streak', icon: Flame, color: 'orange', unlocked: true },
              { name: 'Speed Demon', icon: Zap, color: 'purple', unlocked: true },
              { name: 'Perfect Week', icon: Star, color: 'blue', unlocked: true },
              { name: 'Night Owl', icon: Clock, color: 'indigo', unlocked: true },
              { name: 'Array Master', icon: Award, color: 'green', unlocked: true },
              { name: '500 Problems', icon: Target, color: 'gray', unlocked: false },
              { name: '100 Day Streak', icon: Flame, color: 'gray', unlocked: false }
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg text-center transition-all cursor-pointer ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-' + badge.color + '-500/20 to-' + badge.color + '-600/20 border border-' + badge.color + '-500/30 hover:scale-105'
                      : 'bg-gray-700/20 border border-gray-600/30 opacity-50 grayscale'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    badge.unlocked ? 'bg-' + badge.color + '-500/30' : 'bg-gray-700'
                  }`}>
                    <Icon className={`h-6 w-6 ${badge.unlocked ? 'text-' + badge.color + '-400' : 'text-gray-500'}`} />
                  </div>
                  <p className={`text-xs font-semibold ${badge.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {badge.name}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Peer Comparison & Solving Speed */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Peer Comparison */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Peer Comparison</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">vs Average User</span>
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <ArrowUp className="h-4 w-4" />
                    <span>+47%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">You solve 47% more problems than the average user</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Accuracy</span>
                  <span className="text-gray-900 dark:text-white font-bold">87.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Peer Average</span>
                  <span className="text-gray-700 dark:text-gray-300">73.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Top 10% Threshold</span>
                  <span className="text-yellow-400 font-semibold">92.0%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                <p className="text-xs text-green-400 font-semibold">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  You're in the top 15% of all users globally!
                </p>
              </div>
            </div>
          </div>

          {/* Solving Speed */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Solving Speed Metrics</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { difficulty: 'Easy', avgTime: '8 min', best: '3 min', color: 'green' },
                { difficulty: 'Medium', avgTime: '22 min', best: '12 min', color: 'yellow' },
                { difficulty: 'Hard', avgTime: '45 min', best: '28 min', color: 'red' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-${item.color}-400 font-semibold`}>{item.difficulty} Problems</span>
                    <Zap className={`h-4 w-4 text-${item.color}-400`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg Time</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{item.avgTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Best Time</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{item.best}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Consistency Score & Study Recommendations */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Consistency Score */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Gauge className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Consistency Score</h2>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.82)}`}
                    className="text-purple-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">82</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">out of 100</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Activity</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '90%' }} />
                  </div>
                  <span className="text-xs text-gray-900 dark:text-white font-semibold">90%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Goals</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-xs text-gray-900 dark:text-white font-semibold">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Study Routine</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-xs text-gray-900 dark:text-white font-semibold">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Win Suggestions */}
          <div className="glass-panel border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Win Suggestions</h2>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  title: 'Complete 3 more Easy problems',
                  reward: '+50 points',
                  progress: 67,
                  icon: Target,
                  color: 'green'
                },
                {
                  title: 'Maintain 7-day streak',
                  reward: 'Streak Master Badge',
                  progress: 86,
                  icon: Flame,
                  color: 'orange'
                },
                {
                  title: 'Solve 1 Hard problem today',
                  reward: '+100 points',
                  progress: 0,
                  icon: Trophy,
                  color: 'purple'
                },
                {
                  title: 'Review 5 past solutions',
                  reward: '+25 points',
                  progress: 40,
                  icon: BookOpen,
                  color: 'blue'
                }
              ].map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <div key={idx} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-${suggestion.color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-4 w-4 text-${suggestion.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{suggestion.title}</p>
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full whitespace-nowrap ml-2">
                            {suggestion.reward}
                          </span>
                        </div>
                        <div className="bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`bg-${suggestion.color}-500 h-full rounded-full transition-all duration-500`}
                            style={{ width: `${suggestion.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Analytics;
