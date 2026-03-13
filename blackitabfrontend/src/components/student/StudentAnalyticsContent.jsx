import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../../config';
import {
  TrendingUp, Target, Flame, Clock, Award, CheckCircle,
  BookOpen, Brain, Zap, ArrowUp, ArrowDown, Minus,
  Trophy, Users, Activity, PieChart, Medal, Gauge, Timer, Gift, Code,
  ArrowRight, X
} from 'lucide-react';

const difficultyColor = {
  Easy: 'text-emerald-500',
  Medium: 'text-amber-500',
  Hard: 'text-red-500'
};

const StatCard = ({ icon: Icon, title, value, change, suffix = '' }) => {
  const trend = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  const TrendIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
  const trendCls = trend === 'positive' ? 'text-emerald-500' : trend === 'negative' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5">
          <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendCls}`}>
          <TrendIcon className="h-3 w-3" />
          {Math.abs(change)}
          {suffix}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
        {suffix}
      </p>
    </div>
  );
};

const StudentAnalyticsContent = () => {
  const userName = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}').name || 'there';
    } catch {
      return 'there';
    }
  })();
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);
  const [joinedBatchCount, setJoinedBatchCount] = useState(0);
  const [problemOfTheDay, setProblemOfTheDay] = useState({
    title: 'Find the second highest salary using SQL',
    difficulty: 'Medium',
    link: '/problems'
  });
  const [data, setData] = useState({
    stats: {
      problemsSolved: 0,
      problemsChange: 0,
      accuracy: 0,
      accuracyChange: 0,
      currentStreak: 0,
      streakChange: 0,
      studyHours: 0,
      hoursChange: 0
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
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/attempts/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setData((prev) => ({ ...prev, ...res.data.data }));
        }

        try {
          const dailyRes = await axios.get(`${API_URL}/api/problems/daily`);
          if (dailyRes.data.success && dailyRes.data.data) {
            const daily = dailyRes.data.data;
            setProblemOfTheDay({
              title: daily.question || 'Practice Challenge',
              difficulty: daily.difficulty || 'Medium',
              link: '/problems'
            });
          }
        } catch {}

        try {
          const batchesRes = await axios.get(`${API_URL}/api/user/batches`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (batchesRes.data.success) setJoinedBatchCount(batchesRes.data.data.length);
        } catch {}
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const { stats, subjectProgress, strengths, weaknesses, recentActivity } = data;

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
        toast.success(res.data.message);
        setJoinedBatchCount((count) => count + 1);
        setShowJoinModal(false);
        setClassCodeInput('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setJoiningClass(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-20">
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-10 bg-white dark:bg-white/[0.02] text-center text-gray-500">
          Loading performance data...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-20 space-y-5">
      <div className="border border-gray-200 dark:border-white/10 rounded-xl px-5 py-6 bg-white dark:bg-white/[0.02]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Student dashboard</p>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
          Hey, {userName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Here is your progress at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target} title="Problems Solved" value={stats.problemsSolved} change={stats.problemsChange} />
        <StatCard icon={TrendingUp} title="Accuracy" value={stats.accuracy} change={stats.accuracyChange} suffix="%" />
        <StatCard icon={Flame} title="Current Streak" value={stats.currentStreak} change={stats.streakChange} suffix=" days" />
        <StatCard icon={Clock} title="Study Hours" value={stats.studyHours} change={stats.hoursChange} suffix="h" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-emerald-500" /> Daily Challenge
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              problemOfTheDay.difficulty === 'Easy'
                ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : problemOfTheDay.difficulty === 'Hard'
                  ? 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10'
                  : 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10'
            }`}>
              {problemOfTheDay.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-snug">{problemOfTheDay.title}</p>
          <Link to={problemOfTheDay.link} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">
            Solve now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {[
              joinedBatchCount > 0
                ? { title: 'My Classes', icon: Users, link: '/classes' }
                : { title: 'Join Class', icon: Users, onClick: () => setShowJoinModal(true) },
              { title: 'Practice', icon: Target, link: '/problems' },
              { title: 'Profile', icon: Medal, link: '/profile' },
              { title: 'Contest', icon: Trophy, link: '/contest' }
            ].map((action) => {
              const Icon = action.icon;
              const content = (
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{action.title}</span>
                  <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 ml-auto" />
                </div>
              );

              return action.link ? (
                <Link key={action.title} to={action.link}>{content}</Link>
              ) : (
                <button key={action.title} onClick={action.onClick} className="w-full text-left">{content}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
          <Activity className="h-3.5 w-3.5" /> Weekly Activity
        </h3>
        {data.weeklyActivity?.length > 0 ? (
          <div className="flex items-end gap-1.5 h-28">
            {data.weeklyActivity.map((day, index) => {
              const max = Math.max(...data.weeklyActivity.map((item) => item.count), 1);
              return (
                <div key={`${day.day}-${index}`} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-sm bg-blue-500/80" style={{ height: `${(day.count / max) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-gray-400">{day.day}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center text-gray-400">
            <Activity className="h-6 w-6 mb-2 opacity-30" />
            <p className="text-xs">Solve problems to see activity.</p>
          </div>
        )}
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <BookOpen className="h-3.5 w-3.5" /> Domain Mastery
        </h3>
        {subjectProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectProgress.map((subject, index) => {
              const radius = 28;
              const circumference = 2 * Math.PI * radius;

              return (
                <div key={`${subject.name}-${index}`} className="border border-gray-200 dark:border-white/10 rounded-lg p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="-rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-white/10" />
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (subject.progress / 100) * circumference}
                        strokeLinecap="round"
                        className="text-blue-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{subject.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</p>
                    <p className="text-xs text-gray-400">{subject.mastery}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Complete problems to see your domain mastery.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-emerald-500/20 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Award className="h-3.5 w-3.5 text-emerald-500" /> Core Strengths
          </h3>
          {strengths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strengths.map((item) => (
                <div key={item} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400 py-6">Solve above 75% accuracy to reveal strengths.</p>
          )}
        </div>

        <div className="border border-gray-200 dark:border-red-500/20 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Brain className="h-3.5 w-3.5 text-red-500" /> Focus Areas
          </h3>
          {weaknesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {weaknesses.map((item) => (
                <div key={item} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                  <Zap className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400 py-6">Attempt harder problems to identify weak points.</p>
          )}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Code className="h-3.5 w-3.5" /> Recent Activity
          </h3>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivity.map((activity, index) => {
              const isSuccess = activity.type === 'completed';
              const difficultyCls = difficultyColor[activity.difficulty] || 'text-gray-400';

              return (
                <div key={`${activity.title || 'activity'}-${index}`} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className={`${difficultyCls} font-medium`}>{activity.difficulty || 'Medium'}</span>
                    <span className={isSuccess ? 'text-emerald-500' : 'text-red-400'}>{isSuccess ? '+XP' : 'Failed'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity yet. Start solving.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: PieChart, title: 'Difficulty Distribution' },
          { icon: Timer, title: 'Speed Metrics' },
          { icon: Gift, title: 'Quick Wins' },
          { icon: Trophy, title: 'Global Rankings' },
          { icon: Gauge, title: 'Consistency Score' },
          { icon: Users, title: 'Peer Comparison' }
        ].map(({ icon: Icon, title }) => (
          <div key={title} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center py-8">
            <Icon className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">{title}</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        ))}
      </div>

      {subjectProgress.length > 0 && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Medal className="h-3.5 w-3.5" /> Top Performing Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectProgress.map((topic, index) => (
              <div key={`${topic.name}-${index}`} className="border border-gray-100 dark:border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{topic.name}</span>
                  <span className="text-xs text-gray-400">{topic.mastery}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${topic.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{topic.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Join a Class</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-4 w-4" />
              </button>
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
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={joiningClass || classCodeInput.length < 6} className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {joiningClass ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsContent;
