import React, { useEffect, useState } from 'react';
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

const weeklyActivity = [
  { day: 'Mon', problems: 8 },
  { day: 'Tue', problems: 12 },
  { day: 'Wed', problems: 6 },
  { day: 'Thu', problems: 15 },
  { day: 'Fri', problems: 10 },
  { day: 'Sat', problems: 18 },
  { day: 'Sun', problems: 14 },
];

const peakHours = [
  { time: '6 AM - 9 AM', problems: 45, percentage: 80 },
  { time: '2 PM - 5 PM', problems: 32, percentage: 60 },
  { time: '8 PM - 11 PM', problems: 58, percentage: 100 },
  { time: 'Late Night', problems: 12, percentage: 25 },
];

const difficultyDistribution = [
  { difficulty: 'Easy', count: 58, percentage: 45 },
  { difficulty: 'Medium', count: 49, percentage: 39 },
  { difficulty: 'Hard', count: 20, percentage: 16 },
];

const speedMetrics = [
  { difficulty: 'Easy', avgTime: '8 min', best: '3 min' },
  { difficulty: 'Medium', avgTime: '22 min', best: '12 min' },
  { difficulty: 'Hard', avgTime: '45 min', best: '28 min' },
];

const quickWins = [
  { title: 'Complete 3 more Easy problems', reward: '+50 points', progress: 67, icon: Target, tone: 'blue' },
  { title: 'Maintain 7-day streak', reward: 'Streak Master Badge', progress: 86, icon: Flame, tone: 'emerald' },
  { title: 'Solve 1 Hard problem today', reward: '+100 points', progress: 0, icon: Trophy, tone: 'amber' },
  { title: 'Review 5 past solutions', reward: '+25 points', progress: 40, icon: BookOpen, tone: 'slate' },
];

const topicPerformance = [
  { topic: 'Arrays & Strings', solved: 45, total: 50, accuracy: 94 },
  { topic: 'Dynamic Programming', solved: 28, total: 35, accuracy: 89 },
  { topic: 'Trees & Graphs', solved: 32, total: 40, accuracy: 85 },
  { topic: 'Hash Tables', solved: 22, total: 25, accuracy: 92 },
];

const StatCard = ({ icon: Icon, title, value, change, suffix = '' }) => {
  const trend = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  const TrendIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-panel p-6 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/15">
          <Icon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendStyles[trend]}`}>
          <TrendIcon className="h-4 w-4" />
          {Math.abs(change)}{suffix}
        </div>
      </div>
      <h3 className="text-sm text-slate-600 dark:text-slate-300 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}{suffix}</p>
    </motion.div>
  );
};

const Analytics = () => {
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
  const maxActivity = Math.max(...weeklyActivity.map((item) => item.problems));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/15">
              <BarChart3 className="h-7 w-7 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Performance Analytics</h1>
              <p className="text-slate-600 dark:text-slate-300">Track progress and focus on the next highest-impact improvements.</p>
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

          <motion.div variants={itemVariants} className="glass-panel p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Weekly Activity</h2>
            </div>
            <div className="space-y-3">
              {weeklyActivity.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="text-sm w-8 text-slate-600 dark:text-slate-300">{item.day}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 text-white text-xs flex items-center justify-end pr-2"
                      style={{ width: `${(item.problems / maxActivity) * 100}%` }}
                    >
                      {item.problems > 0 ? item.problems : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Subject Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectProgress.map((subject, idx) => {
              const masteryClass = masteryStyles[subject.mastery] || masteryStyles.Beginner;
              const barClass = progressBarPalette[idx % progressBarPalette.length];
              return (
                <div key={`${subject.name}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{subject.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${masteryClass}`}>{subject.mastery}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${subject.progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <h2 className="text-lg font-semibold">Your Strengths</h2>
            </div>
            <div className="space-y-3">
              {strengths.map((strength, idx) => (
                <div key={`${strength}-${idx}`} className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{strength}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              <h2 className="text-lg font-semibold">Areas to Improve</h2>
            </div>
            <div className="space-y-3">
              {weaknesses.map((weakness, idx) => (
                <div key={`${weakness}-${idx}`} className="p-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{weakness}</span>
                  </div>
                  <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          {loading ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading activity...</div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => {
                const diffStyle = difficultyStyles[activity.difficulty] || difficultyStyles.Medium;
                return (
                  <div key={`${activity.title}-${idx}`} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{activity.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{activity.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffStyle.badge}`}>
                      {activity.difficulty || 'Medium'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Peak Study Hours</h2>
            </div>
            <div className="space-y-3">
              {peakHours.map((slot) => (
                <div key={slot.time}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{slot.time}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{slot.problems} problems</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${slot.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3">
              Most productive window: 8 PM - 11 PM.
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Difficulty Distribution</h2>
            </div>
            <div className="space-y-4">
              {difficultyDistribution.map((item) => {
                const style = difficultyStyles[item.difficulty];
                return (
                  <div key={item.difficulty}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{item.difficulty}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Solving Speed Metrics</h2>
            </div>
            <div className="space-y-3">
              {speedMetrics.map((item) => (
                <div key={item.difficulty} className={`rounded-xl border p-4 ${speedCardStyles[item.difficulty]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.difficulty} Problems</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Best: {item.best}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">Average Time: {item.avgTime}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Quick Win Suggestions</h2>
            </div>
            <div className="space-y-3">
              {quickWins.map((suggestion) => {
                const Icon = suggestion.icon;
                const style = quickWinStyles[suggestion.tone];
                return (
                  <div key={suggestion.title} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${style.iconBg}`}>
                        <Icon className={`h-4 w-4 ${style.iconText}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{suggestion.title}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 whitespace-nowrap">{suggestion.reward}</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${suggestion.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Global Rankings Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">Overall Rank</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">#1,234</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">Top Percentile</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">8%</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">You are ahead of 14,523 users based on the current performance window.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">Consistency Score</h2>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-36 h-36">
                <svg className="-rotate-90 w-36 h-36">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-300 dark:text-slate-700" />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 62}`}
                    strokeDashoffset={`${2 * Math.PI * 62 * (1 - 0.82)}`}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">82</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">out of 100</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Daily Activity:</span> 90%</p>
              <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Weekly Goals:</span> 75%</p>
              <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Study Routine:</span> 85%</p>
            </div>
          </motion.div>
        </section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Top Performing Topics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicPerformance.map((topic, idx) => (
              <div key={`${topic.topic}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{topic.topic}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {topic.accuracy}% accuracy
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(topic.solved / topic.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{topic.solved}/{topic.total}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <h2 className="text-lg font-semibold">Peer Comparison</h2>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-200">vs Average User</span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">+47%</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">You solve 47% more problems than the average user.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/70">
              <p className="text-slate-600 dark:text-slate-300">Your Accuracy</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">87.5%</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/70">
              <p className="text-slate-600 dark:text-slate-300">Peer Average</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">73.2%</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/70">
              <p className="text-slate-600 dark:text-slate-300">Top 10% Threshold</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">92.0%</p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Analytics;
