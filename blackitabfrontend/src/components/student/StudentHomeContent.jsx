import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBook,FaSpinner, FaTrophy, FaFire, FaChartLine,
  FaCheckCircle, FaDatabase, FaCalendarAlt,FaArrowRight,
  FaCloud, FaCrown, FaBolt,
  FaHistory, FaUserGraduate
} from 'react-icons/fa';
import ActivityHeatmap from './ActivityHeatmap';
import API_URL from '../../config';
import PageShimmer from '../shared/PageShimmer';

const getMasteryLevel = (pct) => {
  if (pct >= 80) return { label: 'Expert', cls: 'text-purple-600 dark:text-purple-400' };
  if (pct >= 50) return { label: 'Advanced', cls: 'text-blue-600 dark:text-blue-400' };
  if (pct >= 20) return { label: 'Intermediate', cls: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Beginner', cls: 'text-gray-500' };
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

const FALLBACK_PROGRESS = {
  totalCompleted: 0,
  bySubject: [],
  streak: 0,
  longestStreak: 0,
  totalPoints: 0,
  rank: 'Unranked',
  percentile: 0,
  recentActivity: []
};

const StudentHomeContent = ({ embedded = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [progressStats, setProgressStats] = useState({ totalCompleted: 0, bySubject: [] });
  const [stats, setStats] = useState({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [nextContest, setNextContest] = useState({ title: 'Weekly Challenge #14', date: 'Sat, Mar 8 · 3:00 PM', link: '/contest' });

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

        if (token) {
          try {
            const res = await axios.get(`${API_URL}/api/progress/stats`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
              const data = res.data.data;
              setProgressStats(data);
              setStats({
                streak: data.streak || 0,
                longestStreak: data.longestStreak || 0,
                totalPoints: data.totalPoints || 0,
                rank: data.rank || 'Unranked',
                percentile: data.percentile || 0
              });
              setRecentActivity(data.recentActivity || []);
            }
          } catch {
            setProgressStats(FALLBACK_PROGRESS);
            setStats({ streak: 0, longestStreak: 0, totalPoints: 0, rank: 'Unranked', percentile: 0 });
          }
        }

        try {
          const res = await axios.get(`${API_URL}/api/contests/upcoming`);
          if (res.data.success && res.data.data?.length > 0) {
            const contest = res.data.data[0];
            const date = new Date(contest.startTime);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === tomorrow.toDateString();
            const dateStr = isToday
              ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : isTomorrow
                ? `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            setNextContest({ title: contest.title, date: dateStr, link: '/contest' });
          }
        } catch {}

      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTopics = subjects.reduce((sum, subject) => sum + (subject.topicCount || 0), 0);

  const recentSubjects = subjects.map((subject) => {
    const subjectProgress = progressStats.bySubject?.find((item) => item._id === subject._id);
    const completed = subjectProgress ? subjectProgress.totalCompleted : 0;
    const total = subject.topicCount || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    let icon = FaBook;
    let barColor = 'bg-gray-400';

    if (subject.name === 'DBMS') {
      icon = FaDatabase;
      barColor = 'bg-blue-500';
    } else if (subject.name === 'SQL') {
      icon = FaCode;
      barColor = 'bg-emerald-500';
    } else if (subject.name === 'CCBDI') {
      icon = FaCloud;
      barColor = 'bg-purple-500';
    }

    return { name: subject.name, icon, progress, completed, total, barColor };
  });

  const difficultyBreakdown = [
    { label: 'Easy', solved: Math.floor(progressStats.totalCompleted * 0.5), total: Math.floor(totalTopics * 0.4), color: 'bg-emerald-500' },
    { label: 'Medium', solved: Math.floor(progressStats.totalCompleted * 0.35), total: Math.floor(totalTopics * 0.4), color: 'bg-amber-500' },
    { label: 'Hard', solved: progressStats.totalCompleted - Math.floor(progressStats.totalCompleted * 0.85), total: totalTopics - Math.floor(totalTopics * 0.8), color: 'bg-red-500' }
  ];

  if (loading) return <PageShimmer variant="dashboard" />;

  const wrapperClass = embedded ? 'space-y-6' : 'max-w-5xl mx-auto px-4 py-8 space-y-6 pt-20';

  return (
    <div className={wrapperClass}>
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-lg font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserGraduate />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {embedded ? 'Learning Workspace' : `${user?.name || 'Student'} Workspace`}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><FaFire className="text-orange-400" /> {stats.streak} day streak</span>
              {user?.createdAt && (
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Day Streak', value: stats.streak, icon: <FaFire className="text-orange-400" /> },
          { label: 'Total XP', value: stats.totalPoints.toLocaleString(), icon: <FaBolt className="text-amber-400" /> },
          { label: 'Global Rank', value: stats.rank, icon: <FaCrown className="text-purple-400" /> },
          { label: 'Completed', value: `${progressStats.totalCompleted}/${totalTopics || 57}`, icon: <FaCheckCircle className="text-emerald-400" /> }
        ].map((card) => (
          <div key={card.label} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
            <p className="text-base mb-2">{card.icon}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" /> Solved Overview
          </h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{progressStats.totalCompleted}</p>
            <p className="text-xs text-gray-400 mt-1">of {totalTopics || 57} problems</p>
          </div>
          <div className="space-y-2.5">
            {difficultyBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 w-12">{item.label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.total > 0 ? `${(item.solved / item.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right font-mono">{item.solved}/{item.total}</span>
              </div>
            ))}
          </div>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaChartLine className="text-blue-500" /> Subject Mastery
            </h3>
          </div>
          {recentSubjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No subjects found. Start solving to see progress.</p>
          ) : (
            <div className="space-y-3">
              {recentSubjects.map((subject) => {
                const mastery = getMasteryLevel(subject.progress);
                const SubjectIcon = subject.icon;

                return (
                  <div key={subject.name} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <SubjectIcon className="text-gray-600 dark:text-gray-400" />
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

        <div className="flex flex-col gap-4">
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

      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <FaHistory className="text-blue-400" /> Recent Activity
          </h3>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={activity._id || index} className="flex items-center justify-between px-5 py-3">
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
            <p className="text-sm">No activity yet. Start solving.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentHomeContent;
