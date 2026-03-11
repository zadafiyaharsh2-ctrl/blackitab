import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import {
  TrendingUp, Target, Flame, Clock, Award, CheckCircle,
  BarChart3, BookOpen, Brain, Zap, ArrowUp, ArrowDown, Minus,
  Trophy, Users, Activity, PieChart, Medal, Gauge, Timer, Gift, Code
} from 'lucide-react';
import ActivityHeatmap from '../../components/student/ActivityHeatmap';

const difficultyColor = { Easy: 'text-emerald-500', Medium: 'text-amber-500', Hard: 'text-red-500' };
const difficultyBg = { Easy: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', Medium: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', Hard: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' };

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
          <TrendIcon className="h-3 w-3" />{Math.abs(change)}{suffix}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}{suffix}</p>
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (['teacher', 'hod', 'institute_admin'].includes(u.role)) navigate('/school-analytics', { replace: true });
    } catch {}
  }, [navigate]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { problemsSolved: 0, problemsChange: 0, accuracy: 0, accuracyChange: 0, currentStreak: 0, streakChange: 0, studyHours: 0, hoursChange: 0 },
    subjectProgress: [], strengths: [], weaknesses: [], recentActivity: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/attempts/analytics`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setData(prev => ({ ...prev, ...res.data.data }));
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const { stats, subjectProgress, strengths, weaknesses, recentActivity } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-400" /> Performance Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your progress and identify top improvement areas.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target}    title="Problems Solved"   value={stats.problemsSolved} change={stats.problemsChange} />
        <StatCard icon={TrendingUp} title="Accuracy"         value={stats.accuracy}       change={stats.accuracyChange} suffix="%" />
        <StatCard icon={Flame}      title="Current Streak"   value={stats.currentStreak}  change={stats.streakChange}  suffix=" days" />
        <StatCard icon={Clock}      title="Study Hours"      value={stats.studyHours}     change={stats.hoursChange}   suffix="h" />
      </div>

      {/* Activity heatmap + weekly bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5" /> Weekly Activity
          </h3>
          {data.weeklyActivity?.length > 0 ? (
            <div className="flex items-end gap-1.5 h-28">
              {data.weeklyActivity.map((day, i) => {
                const max = Math.max(...data.weeklyActivity.map(d => d.count), 1);
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
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

        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity Heatmap</h3>
          </div>
          <div className="p-4"><ActivityHeatmap /></div>
        </div>
      </div>

      {/* Domain Mastery */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <BookOpen className="h-3.5 w-3.5" /> Domain Mastery
        </h3>
        {subjectProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectProgress.map((subject, i) => {
              const radius = 28; const circ = 2 * Math.PI * radius;
              return (
                <div key={i} className="border border-gray-200 dark:border-white/10 rounded-lg p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="-rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-white/10" />
                      <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={circ} strokeDashoffset={circ - (subject.progress / 100) * circ}
                        strokeLinecap="round" className="text-blue-500" />
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

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-emerald-500/20 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Award className="h-3.5 w-3.5 text-emerald-500" /> Core Strengths
          </h3>
          {strengths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
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
              {weaknesses.map((w, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                  <Zap className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400 py-6">Attempt harder problems to identify weak points.</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Code className="h-3.5 w-3.5" /> Recent Activity
          </h3>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivity.map((a, i) => {
              const isOk = a.type === 'completed';
              const dCls = difficultyColor[a.difficulty] || 'text-gray-400';
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isOk ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className={dCls + ' font-medium'}>{a.difficulty || 'Medium'}</span>
                    <span className={isOk ? 'text-emerald-500' : 'text-red-400'}>{isOk ? '+XP' : 'Failed'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity yet. Start solving!</p>
          </div>
        )}
      </div>

      {/* Bottom Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: PieChart, title: 'Difficulty Distribution' },
          { icon: Timer, title: 'Speed Metrics' },
          { icon: Gift, title: 'Quick Wins' },
          { icon: Trophy, title: 'Global Rankings' },
          { icon: Gauge, title: 'Consistency Score' },
          { icon: Users, title: 'Peer Comparison' },
        ].map(({ icon: Icon, title }, i) => (
          <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center py-8">
            <Icon className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">{title}</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        ))}
      </div>

      {/* Top Topics */}
      {subjectProgress.length > 0 && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Medal className="h-3.5 w-3.5" /> Top Performing Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectProgress.map((t, i) => (
              <div key={i} className="border border-gray-100 dark:border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</span>
                  <span className="text-xs text-gray-400">{t.mastery}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${t.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{t.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
