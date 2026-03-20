import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBook,FaSpinner, FaTrophy, FaFire, FaChartLine,
  FaCheckCircle, FaDatabase, FaCalendarAlt,FaArrowRight,FaCode,
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

const clampMasteryProgress = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const getMasteryTheme = (progress) => {
  if (progress >= 85) {
    return {
      dot: 'bg-violet-500',
      bar: 'from-violet-500 via-fuchsia-500 to-indigo-500',
      track: 'bg-violet-100 dark:bg-violet-500/10',
      badge: 'text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10'
    };
  }
  if (progress >= 65) {
    return {
      dot: 'bg-blue-500',
      bar: 'from-blue-500 via-cyan-500 to-sky-500',
      track: 'bg-blue-100 dark:bg-blue-500/10',
      badge: 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10'
    };
  }
  if (progress >= 40) {
    return {
      dot: 'bg-amber-500',
      bar: 'from-amber-500 via-orange-500 to-rose-500',
      track: 'bg-amber-100 dark:bg-amber-500/10',
      badge: 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
    };
  }

  return {
    dot: 'bg-gray-500',
    bar: 'from-gray-500 via-gray-600 to-gray-700',
    track: 'bg-gray-100 dark:bg-gray-700/30',
    badge: 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'
  };
};

const HomeMasteryRadar = ({ subjects }) => {
  const chartSubjects = subjects.slice(0, 6);
  if (!chartSubjects.length) return null;

  const cx = 100;
  const cy = 100;
  const radius = 70;
  const levels = [0.25, 0.5, 0.75, 1];

  const angles = chartSubjects.map((_, index) => (
    (Math.PI * 2 * index) / chartSubjects.length - Math.PI / 2
  ));

  const getPoint = (angle, scale) => ({
    x: cx + radius * scale * Math.cos(angle),
    y: cy + radius * scale * Math.sin(angle)
  });

  const polygonForScale = (scale) => (
    angles
      .map((angle) => {
        const { x, y } = getPoint(angle, scale);
        return `${x},${y}`;
      })
      .join(' ')
  );

  const dataPolygon = angles
    .map((angle, index) => {
      const scale = chartSubjects[index].progress / 100;
      const { x, y } = getPoint(angle, scale);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
      <defs>
        <linearGradient id="homeMasteryArea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="homeMasteryStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {levels.map((scale) => (
        <polygon
          key={`ring-${scale}`}
          points={polygonForScale(scale)}
          fill="none"
          className="stroke-gray-200 dark:stroke-white/10"
          strokeWidth="1"
        />
      ))}

      {angles.map((angle, index) => {
        const { x, y } = getPoint(angle, 1);
        return (
          <line
            key={`axis-${index}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            className="stroke-gray-200 dark:stroke-white/10"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="url(#homeMasteryArea)"
        stroke="url(#homeMasteryStroke)"
        strokeWidth="2"
      />

      {angles.map((angle, index) => {
        const scale = chartSubjects[index].progress / 100;
        const { x, y } = getPoint(angle, scale);
        return (
          <circle
            key={`dot-${chartSubjects[index].id}`}
            cx={x}
            cy={y}
            r="3"
            className="fill-blue-500 dark:fill-cyan-400"
          />
        );
      })}

      {angles.map((angle, index) => {
        const { x, y } = getPoint(angle, 1.15);
        const textAnchor = x > cx + 4 ? 'start' : x < cx - 4 ? 'end' : 'middle';
        const label = chartSubjects[index].name.length > 10
          ? `${chartSubjects[index].name.slice(0, 10)}...`
          : chartSubjects[index].name;

        return (
          <text
            key={`label-${chartSubjects[index].id}`}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="fill-gray-500 dark:fill-gray-400 text-[8px] font-semibold"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
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

  const masterySubjects = recentSubjects
    .map((subject, index) => {
      const progress = clampMasteryProgress(subject.progress);
      const mastery = getMasteryLevel(progress).label;
      return {
        id: `${subject.name || 'subject'}-${index}`,
        ...subject,
        progress,
        mastery,
        theme: getMasteryTheme(progress)
      };
    })
    .sort((a, b) => b.progress - a.progress);

  const masteryOverview = masterySubjects.length > 0
    ? Math.round(masterySubjects.reduce((sum, subject) => sum + subject.progress, 0) / masterySubjects.length)
    : 0;

  const difficultyBreakdown = [
    { label: 'Easy', solved: Math.floor(progressStats.totalCompleted * 0.5), total: Math.floor(totalTopics * 0.4), color: 'bg-emerald-500' },
    { label: 'Medium', solved: Math.floor(progressStats.totalCompleted * 0.35), total: Math.floor(totalTopics * 0.4), color: 'bg-amber-500' },
    { label: 'Hard', solved: progressStats.totalCompleted - Math.floor(progressStats.totalCompleted * 0.85), total: totalTopics - Math.floor(totalTopics * 0.8), color: 'bg-red-500' }
  ];

  if (loading) return <PageShimmer variant="dashboard" />;

  const wrapperClass = embedded ? 'space-y-6' : 'max-w-5xl mx-auto px-4 py-8 space-y-6 pt-20';

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-lg font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserGraduate />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {`${user?.name || 'Student'} Workspace`}
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
      )}

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
      {!embedded && (
        <div className="relative lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-blue-200/40 dark:bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-fuchsia-200/40 dark:bg-fuchsia-500/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FaChartLine className="text-blue-500" /> Subject Mastery
              </h3>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Overall Mastery</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{masteryOverview}%</p>
              </div>
            </div>

            {masterySubjects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No subjects found. Start solving to see progress.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 dark:from-slate-900/40 dark:via-black/10 dark:to-blue-500/5 p-4">
                  <HomeMasteryRadar subjects={masterySubjects} />
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500">Top subject</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{masterySubjects[0].name}</p>
                    <p className="text-xs text-gray-400">{masterySubjects[0].progress}% mastery</p>
                  </div>
                </div>

                <div className="xl:col-span-3 space-y-2.5">
                  {masterySubjects.map((subject, index) => {
                    const SubjectIcon = subject.icon;

                    return (
                      <div key={subject.id} className="rounded-lg border border-gray-100 dark:border-white/5 p-3 bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                              <SubjectIcon className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className={`w-2 h-2 rounded-full ${subject.theme.dot}`} />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{subject.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">#{index + 1}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${subject.theme.badge}`}>
                              {subject.mastery}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">{subject.progress}%</span>
                        </div>

                        <div className={`w-full h-2 rounded-full overflow-hidden ${subject.theme.track}`}>
                          <div className={`h-full rounded-full bg-gradient-to-r ${subject.theme.bar}`} style={{ width: `${subject.progress}%` }} />
                        </div>

                        <div className="mt-2 text-right">
                          <span className="text-xs text-gray-400 font-mono">{subject.completed}/{subject.total}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {!embedded && (
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
      )}

    </div>
  );
};

export default StudentHomeContent;
