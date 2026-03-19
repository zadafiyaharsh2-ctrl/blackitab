import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../../config';
import {
  TrendingUp, Target, Flame, Clock, Award, CheckCircle,
  BookOpen, Brain, Zap, ArrowUp, ArrowDown, Minus,
  Trophy, Users, Activity, PieChart, Medal, Gauge, Timer, Gift, Code,
  ArrowRight, X, Lock, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────── */

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatStudyTime = (hours, minutes) => {
  if (hours >= 1) return `${hours}h`;
  if (minutes > 0) return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  return '0 mins';
};

const difficultyMeta = {
  Easy: {
    pill: 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
    bar: 'from-emerald-500 to-lime-500',
    track: 'bg-emerald-100 dark:bg-emerald-500/10',
    intensity: 45
  },
  Medium: {
    pill: 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
    bar: 'from-amber-500 to-orange-500',
    track: 'bg-amber-100 dark:bg-amber-500/10',
    intensity: 60
  },
  Hard: {
    pill: 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10',
    bar: 'from-rose-500 to-red-500',
    track: 'bg-rose-100 dark:bg-rose-500/10',
    intensity: 78
  }
};

const getActivityStatusVisual = (isSuccess) => {
  if (isSuccess) {
    return {
      label: 'Solved',
      chip: 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
      dot: 'bg-emerald-500',
      line: 'from-emerald-500/70 to-transparent',
      insight: '+10 XP'
    };
  }

  return {
    label: 'Attempted',
    chip: 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10',
    dot: 'bg-rose-400',
    line: 'from-rose-400/70 to-transparent',
    insight: 'Keep going'
  };
};

const getActivityIntensity = (difficulty, isSuccess) => {
  const base = difficultyMeta[difficulty]?.intensity ?? difficultyMeta.Medium.intensity;
  const adjusted = base + (isSuccess ? 20 : -8);
  return Math.max(16, Math.min(100, adjusted));
};

const clampProgress = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const deriveMasteryLabel = (progress, fallbackLabel) => {
  if (typeof fallbackLabel === 'string' && fallbackLabel.trim()) {
    return fallbackLabel;
  }
  if (progress >= 80) return 'Advanced';
  if (progress >= 50) return 'Intermediate';
  return 'Beginner';
};

const getMasteryVisual = (progress) => {
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

const SubjectMasteryRadar = ({ subjects }) => {
  const chartSubjects = subjects.slice(0, 6);
  if (!chartSubjects.length) return null;

  const cx = 110;
  const cy = 110;
  const radius = 78;
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
      const scale = clampProgress(chartSubjects[index].progress) / 100;
      const { x, y } = getPoint(angle, scale);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[250px] mx-auto">
      <defs>
        <linearGradient id="masteryAreaGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="masteryStrokeGradient" x1="0" y1="0" x2="1" y2="1">
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
        fill="url(#masteryAreaGradient)"
        stroke="url(#masteryStrokeGradient)"
        strokeWidth="2"
      />

      {angles.map((angle, index) => {
        const scale = clampProgress(chartSubjects[index].progress) / 100;
        const { x, y } = getPoint(angle, scale);
        return (
          <circle
            key={`dot-${chartSubjects[index].id}`}
            cx={x}
            cy={y}
            r="3.2"
            className="fill-blue-500 dark:fill-cyan-400"
          />
        );
      })}

      {angles.map((angle, index) => {
        const { x, y } = getPoint(angle, 1.16);
        const textAnchor = x > cx + 5 ? 'start' : x < cx - 5 ? 'end' : 'middle';
        const label = chartSubjects[index].name.length > 12
          ? `${chartSubjects[index].name.slice(0, 12)}…`
          : chartSubjects[index].name;

        return (
          <text
            key={`label-${chartSubjects[index].id}`}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="fill-gray-500 dark:fill-gray-400 text-[9px] font-semibold"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

/* ── Stat Card ───────────────────────────────────────────── */

const StatCard = ({ icon: Icon, title, value, change, suffix = '', color = 'blue', progress = 0, sublabel = '' }) => {
  const displayValue = value === null || value === undefined ? '—' : value;
  const trend = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  const TrendIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;

  const trendCls = trend === 'positive'
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
    : trend === 'negative'
    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
    : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10';

  const colorMeta = {
    blue:    { icon: 'from-blue-500 to-cyan-500',    ring: '#3b82f6', glow: 'rgba(59,130,246,0.15)',  track: '#dbeafe', iconText: 'text-blue-500',   border: 'hover:border-blue-300 dark:hover:border-blue-500/30' },
    violet:  { icon: 'from-violet-500 to-purple-500', ring: '#8b5cf6', glow: 'rgba(139,92,246,0.15)', track: '#ede9fe', iconText: 'text-violet-500', border: 'hover:border-violet-300 dark:hover:border-violet-500/30' },
    orange:  { icon: 'from-orange-500 to-amber-500', ring: '#f97316', glow: 'rgba(249,115,22,0.15)',  track: '#ffedd5', iconText: 'text-orange-500', border: 'hover:border-orange-300 dark:hover:border-orange-500/30' },
    emerald: { icon: 'from-emerald-500 to-teal-500', ring: '#10b981', glow: 'rgba(16,185,129,0.15)', track: '#d1fae5', iconText: 'text-emerald-500', border: 'hover:border-emerald-300 dark:hover:border-emerald-500/30' },
  }[color] || {};

  const clampedProgress = Math.max(0, Math.min(100, progress || 0));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      className={`relative group border border-gray-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-white/[0.02] overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/30 ${colorMeta.border} cursor-default`}
    >
      {/* Subtle bottom glow */}
      <div
        className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: colorMeta.glow }}
      />
      <div
        className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40"
        style={{ background: colorMeta.glow }}
      />

      <div className="relative flex items-start justify-between mb-3">
        {/* Icon badge */}
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMeta.icon} shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>

        {/* SVG progress ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 56 56" className="w-12 h-12 -rotate-90">
            <circle cx="28" cy="28" r={radius} fill="none" stroke={colorMeta.track} strokeWidth="4" className="dark:opacity-20" />
            <circle
              cx="28" cy="28" r={radius} fill="none"
              stroke={colorMeta.ring} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <span className={`absolute text-[10px] font-bold ${colorMeta.iconText}`}>{clampedProgress}%</span>
        </div>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{title}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
        {displayValue}{displayValue !== '—' && suffix}
      </p>
      {sublabel && <p className="text-[11px] text-gray-400 mt-0.5">{sublabel}</p>}

      {/* Trend pill */}
      <div className={`inline-flex items-center gap-1 mt-2.5 border text-[10px] font-semibold rounded-full px-2 py-0.5 ${trendCls}`}>
        <TrendIcon className="h-2.5 w-2.5" />
        {Math.abs(change)}{suffix} this week
      </div>
    </div>
  );
};

/* ── Placeholder Radar Chart (blurred) ───────────────────── */

const PlaceholderRadarChart = () => {
  const points = 6;
  const cx = 80, cy = 80, r = 55;
  const angles = Array.from({ length: points }, (_, i) => (Math.PI * 2 * i) / points - Math.PI / 2);
  const labels = ['DBMS', 'SQL', 'DSA', 'OS', 'Networks', 'Theory'];
  const demoValues = [0.7, 0.5, 0.85, 0.4, 0.6, 0.55];

  const axisLines = angles.map((a, i) => (
    <line
      key={`axis-${i}`}
      x1={cx} y1={cy}
      x2={cx + r * Math.cos(a)}
      y2={cy + r * Math.sin(a)}
      className="stroke-gray-200 dark:stroke-white/10"
      strokeWidth="1"
    />
  ));

  const rings = [0.33, 0.66, 1].map((scale, i) => {
    const pts = angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');
    return <polygon key={`ring-${i}`} points={pts} fill="none" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="0.5" />;
  });

  const dataPts = angles.map((a, i) => `${cx + r * demoValues[i] * Math.cos(a)},${cy + r * demoValues[i] * Math.sin(a)}`).join(' ');

  const labelEls = angles.map((a, i) => {
    const lx = cx + (r + 18) * Math.cos(a);
    const ly = cy + (r + 18) * Math.sin(a);
    return (
      <text key={`lbl-${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
        className="fill-gray-400 dark:fill-gray-500 text-[9px] font-medium"
      >
        {labels[i]}
      </text>
    );
  });

  return (
    <div className="relative">
      <div className="filter blur-[3px] opacity-50 pointer-events-none">
        <svg viewBox="0 0 160 160" className="w-full max-w-[220px] mx-auto">
          {rings}
          {axisLines}
          <polygon points={dataPts} className="fill-blue-500/20 stroke-blue-500" strokeWidth="1.5" />
          {angles.map((a, i) => (
            <circle key={`dot-${i}`} cx={cx + r * demoValues[i] * Math.cos(a)} cy={cy + r * demoValues[i] * Math.sin(a)} r="3" className="fill-blue-500" />
          ))}
          {labelEls}
        </svg>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Domain Mastery</p>
        <Link to="/problems" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
          Start your first lesson to unlock
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

/* ── Advanced Insights (Live) ─────────────────────────── */

const difficultyColor = (label) => {
  if (label === 'Easy') return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' };
  if (label === 'Hard') return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10' };
  return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10' };
};

const formatTime = (s) => {
  if (!s) return '—';
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

const AdvancedInsightsSection = ({ insights, loading }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced Insights</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                  <div className="h-4 w-4 shimmer-line rounded mb-3" />
                  <div className="h-3 shimmer-line w-24 mb-2" />
                  <div className="h-6 shimmer-line w-16 mb-3" />
                  <div className="h-2 shimmer-line w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* 1. Difficulty Distribution */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty Distribution</p>
                </div>
                <div className="space-y-2">
                  {(insights?.difficultyDistribution || []).map(({ label, count, pct, accuracy }) => {
                    const col = difficultyColor(label);
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`font-semibold ${col.text}`}>{label}</span>
                          <span className="text-gray-400">{count} ({pct}%) · {accuracy}% acc</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-full ${col.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {!insights?.difficultyDistribution?.some(d => d.count > 0) && (
                    <p className="text-xs text-gray-400 py-2 text-center">No data yet.</p>
                  )}
                </div>
              </div>

              {/* 2. Speed Metrics */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="h-4 w-4 text-cyan-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Speed Metrics</p>
                </div>
                <div className="space-y-3">
                  {(insights?.speedMetrics || []).map(({ label, avgSeconds, count }) => {
                    const col = difficultyColor(label);
                    return (
                      <div key={label} className="flex items-center justify-between">
                        <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${col.badge} ${col.text}`}>{label}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(avgSeconds)}</p>
                          <p className="text-[10px] text-gray-400">{count} attempts</p>
                        </div>
                      </div>
                    );
                  })}
                  {!insights?.speedMetrics?.some(s => s.count > 0) && (
                    <p className="text-xs text-gray-400 py-4 text-center">Solve problems to see speed data.</p>
                  )}
                </div>
              </div>

              {/* 3. Quick Wins */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Wins</p>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{insights?.quickWins?.count ?? 0}</p>
                <p className="text-xs text-gray-400 mb-3">Solved correctly in ≤30s on first try</p>
                <div className="space-y-1.5">
                  {(insights?.quickWins?.examples || []).map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border border-gray-100 dark:border-white/5 rounded-lg px-2 py-1">
                      <span className="text-gray-600 dark:text-gray-300">{ex.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${difficultyColor(ex.difficulty).text}`}>{ex.difficulty}</span>
                        <span className="text-emerald-500 font-bold">{ex.timeTaken}s</span>
                      </div>
                    </div>
                  ))}
                  {!insights?.quickWins?.examples?.length && (
                    <p className="text-xs text-gray-400 text-center pt-2">No quick wins yet.</p>
                  )}
                </div>
              </div>

              {/* 4. Global Rankings */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Global Rankings</p>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">#{insights?.globalRanking?.globalRank ?? '—'}</p>
                <p className="text-xs text-gray-400 mb-3">of {insights?.globalRanking?.totalUsers ?? 0} students</p>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700" style={{ width: `${insights?.globalRanking?.percentile ?? 0}%` }} />
                </div>
                <p className="text-xs text-gray-400">Top {100 - (insights?.globalRanking?.percentile ?? 0)}% · {insights?.globalRanking?.xp ?? 0} XP</p>
              </div>

              {/* 5. Consistency Score */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="h-4 w-4 text-green-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Consistency Score</p>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{insights?.consistencyScore?.score ?? 0}%</p>
                <p className="text-xs text-gray-400 mb-3">{insights?.consistencyScore?.activeDays ?? 0} of 30 days active</p>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-700" style={{ width: `${insights?.consistencyScore?.score ?? 0}%` }} />
                </div>
              </div>

              {/* 6. Peer Comparison */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Peer Comparison</p>
                </div>
                {insights?.peerComparison ? (
                  <>
                    <div className="flex items-end gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400">Your XP</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{insights.peerComparison.myXP}</p>
                      </div>
                      <div className="pb-1">
                        <p className={`text-xs font-semibold ${insights.peerComparison.aboveAverage ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {insights.peerComparison.aboveAverage ? '▲ above' : '▼ below'} avg
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Inst. Avg</p>
                        <p className="text-2xl font-black text-gray-400">{insights.peerComparison.instituteAvgXP}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{insights.peerComparison.peerCount} peers in your institute</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">Join an institute to compare with peers.</p>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */

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
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [problemOfTheDay, setProblemOfTheDay] = useState({
    title: 'Find the second highest salary using SQL',
    difficulty: 'Medium',
    link: '/problems'
  });
  const [data, setData] = useState({
    stats: {
      problemsSolved: 0,
      problemsChange: 0,
      accuracy: null,
      accuracyChange: 0,
      currentStreak: 0,
      streakChange: 0,
      studyHours: 0,
      studyMinutes: 0,
      hoursChange: 0
    },
    subjectProgress: [],
    strengths: [],
    weaknesses: [],
    recentActivity: []
  });
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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
        } catch {
          toast.error('Failed to load problem of the day. Please try again later.');
        }

        try {
          const batchesRes = await axios.get(`${API_URL}/api/user/batches`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (batchesRes.data.success) setJoinedBatchCount(batchesRes.data.data.length);
        } catch {
          toast.error('Failed to load batch information. Please try again later.');
        }

        try {
          const examsRes = await axios.get(`${API_URL}/api/user/upcoming-exams`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (examsRes.data.success) setUpcomingExams(examsRes.data.data);
        } catch {
          toast.error('Failed to load upcoming exams. Please try again later.');
        }

        // Fetch Advanced Insights in parallel
        try {
          setInsightsLoading(true);
          const insightsRes = await axios.get(`${API_URL}/api/attempts/advanced-insights`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (insightsRes.data.success) setInsights(insightsRes.data.data);
        } catch {
          toast.error('Failed to load advanced insights. Please try again later.');
        } finally {
          setInsightsLoading(false);
        }
      } catch {
        toast.error('Failed to load analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const { stats, subjectProgress, strengths, weaknesses, recentActivity } = data;

  const masterySubjects = (subjectProgress || [])
    .map((subject, index) => {
      const progress = clampProgress(subject?.progress);
      const mastery = deriveMasteryLabel(progress, subject?.mastery);
      const name =
        typeof subject?.name === 'string' && subject.name.trim()
          ? subject.name.trim()
          : `Domain ${index + 1}`;

      return {
        id: `${name}-${index}`,
        name,
        progress,
        mastery,
        visual: getMasteryVisual(progress)
      };
    })
    .sort((a, b) => b.progress - a.progress);

  const masteryOverview = masterySubjects.length > 0
    ? Math.round(masterySubjects.reduce((sum, item) => sum + item.progress, 0) / masterySubjects.length)
    : 0;

  const recentActivityItems = (recentActivity || []).map((activity, index) => {
    const isSuccess = activity?.type === 'completed';
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(activity?.difficulty)
      ? activity.difficulty
      : 'Medium';
    const visual = difficultyMeta[difficulty] || difficultyMeta.Medium;
    const statusVisual = getActivityStatusVisual(isSuccess);

    return {
      id: `${activity?.title || 'activity'}-${index}`,
      title:
        typeof activity?.title === 'string' && activity.title.trim()
          ? activity.title.trim()
          : 'Practice Activity',
      timeLabel: timeAgo(activity?.time),
      difficulty,
      visual,
      statusVisual,
      intensity: getActivityIntensity(difficulty, isSuccess)
    };
  });

  const activityCompletedCount = recentActivityItems.filter((item) => item.statusVisual.label === 'Solved').length;
  const activityAttemptedCount = recentActivityItems.length - activityCompletedCount;
  const activityCompletionRate = recentActivityItems.length > 0
    ? Math.round((activityCompletedCount / recentActivityItems.length) * 100)
    : 0;

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
      <div className="max-w-5xl mx-auto px-4 py-8 pt-20 space-y-5">
        {/* Shimmer loading skeleton */}
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white dark:bg-white/[0.02]">
          <div className="h-3 shimmer-line w-32 mb-3" />
          <div className="h-6 shimmer-line w-48 mb-2" />
          <div className="h-3 shimmer-line w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
              <div className="h-8 w-8 shimmer-line rounded-lg mb-3" />
              <div className="h-3 shimmer-line w-20 mb-2" />
              <div className="h-6 shimmer-line w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
            <div className="h-4 shimmer-line w-32 mb-4" />
            <div className="h-16 shimmer-line w-full mb-3" />
            <div className="h-8 shimmer-line w-28" />
          </div>
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
            <div className="h-4 shimmer-line w-24 mb-4" />
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-10 shimmer-line w-full" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format study time display
  const studyTimeDisplay = formatStudyTime(stats.studyHours, stats.studyMinutes || 0);
  const studyTimeSuffix = ''; // already included in formatted string

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

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Target}
          title="Problems Solved"
          value={stats.problemsSolved}
          change={stats.problemsChange}
          color="blue"
          progress={Math.min(100, Math.round((stats.problemsSolved / Math.max(stats.problemsSolved + 20, 50)) * 100))}
          sublabel="problems attempted"
        />
        <StatCard
          icon={TrendingUp}
          title="Accuracy"
          value={stats.problemsSolved === 0 ? null : stats.accuracy}
          change={stats.accuracyChange}
          suffix="%"
          color="violet"
          progress={stats.problemsSolved === 0 ? 0 : Math.min(100, stats.accuracy ?? 0)}
          sublabel="correct answers"
        />
        <StatCard
          icon={Flame}
          title="Current Streak"
          value={stats.currentStreak}
          change={stats.streakChange}
          suffix=" days"
          color="orange"
          progress={Math.min(100, Math.round((stats.currentStreak / Math.max(stats.currentStreak + 7, 30)) * 100))}
          sublabel="keep it going!"
        />
        <StatCard
          icon={Clock}
          title="Study Time"
          value={studyTimeDisplay}
          change={stats.hoursChange}
          color="emerald"
          progress={Math.min(100, Math.round(((stats.studyHours * 60 + (stats.studyMinutes || 0)) / Math.max((stats.studyHours * 60 + (stats.studyMinutes || 0)) + 60, 120)) * 100))}
          sublabel="total this week"
        />
      </div>

      {/* ── Upcoming Exams Announcement Widget ── */}
      {upcomingExams.length > 0 && (
        <div className="border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl p-5 mb-4 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               Upcoming Scheduled Exams
             </h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingExams.map((exam) => (
                 <Link key={exam._id} to={`/classes/${exam.batchId._id}/exam/${exam._id}`} className="block p-4 border border-blue-100 dark:border-blue-500/10 bg-white dark:bg-[#000000]/30 rounded-xl hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all group">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                       <Clock className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5 truncate max-w-[150px]">{exam.batchId?.name || 'Your Class'}</p>
                       <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[150px]">{exam.title}</h4>
                       <p className="text-xs text-gray-500 mt-1">{new Date(exam.scheduledAt).toLocaleString()}</p>
                     </div>
                   </div>
                 </Link>
              ))}
           </div>
        </div>
      )}

      {/* ── Daily Challenge (Interactive Card) + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 group relative border-2 border-transparent rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg dark:hover:shadow-black/20"
          style={{
            background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box',
          }}
        >
          {/* Dark mode gradient border override */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent dark:block hidden pointer-events-none"
            style={{
              background: 'linear-gradient(rgb(0 0 0 / 0.95), rgb(0 0 0 / 0.95)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box',
            }}
          />
          <div className="relative p-5 bg-white dark:bg-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Code className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Challenge</h3>
              </div>
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
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{problemOfTheDay.title}</p>
            <Link to={problemOfTheDay.link} className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-2.5 hover:from-blue-700 hover:to-purple-700 shadow-sm transition-all duration-200 group-hover:shadow-md">
              Solve now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
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

      {/* ── Weekly Activity ────────────────────────────────── */}
      <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-500" /> Weekly Activity
          </h3>
          {data.weeklyActivity?.length > 0 && (
            <span className="text-[10px] text-gray-400">{data.weeklyActivity.reduce((s, d) => s + d.count, 0)} problems this week</span>
          )}
        </div>
        {data.weeklyActivity?.length > 0 ? (
          <div className="flex items-end gap-2 h-28">
            {data.weeklyActivity.map((day, index) => {
              const max = Math.max(...data.weeklyActivity.map((item) => item.count), 1);
              const pct = (day.count / max) * 100;
              const isToday = index === data.weeklyActivity.length - 1;
              return (
                <div key={`${day.day}-${index}`} className="group flex flex-col items-center gap-1.5 flex-1">
                  <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm shadow-blue-500/30'
                          : 'bg-blue-200 dark:bg-blue-500/30 group-hover:bg-blue-300 dark:group-hover:bg-blue-500/50'
                      }`}
                      style={{ height: `${Math.max(pct, 5)}%`, minHeight: '4px' }}
                    />
                    {day.count > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>{day.day}</span>
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

      {/* ── Domain Mastery (Elo-based) ───────────────────────── */}
      <div className="relative border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-blue-200/50 dark:bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-fuchsia-200/50 dark:bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Domain Mastery
            </h3>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Overall Elo Avg</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {masterySubjects.length > 0
                  ? Math.round(masterySubjects.reduce((sum, s) => sum + (s.elo || 1000), 0) / masterySubjects.length)
                  : 1000}
              </p>
            </div>
          </div>

          {masterySubjects.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 dark:from-slate-900/40 dark:via-black/10 dark:to-blue-500/5 p-4">
                <SubjectMasteryRadar subjects={masterySubjects} />
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <p className="text-xs text-gray-500">Top domain</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{masterySubjects[0].name}</p>
                  <p className="text-xs text-gray-400">
                    {masterySubjects[0].elo ? `Elo: ${masterySubjects[0].elo}` : `${masterySubjects[0].progress}% mastery`}
                  </p>
                </div>
              </div>

              <div className="xl:col-span-3 space-y-2.5">
                {masterySubjects.map((subject, index) => (
                  <div
                    key={subject.id}
                    className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${subject.visual.dot}`} />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{subject.name}</p>
                        <span className="text-[10px] text-gray-400 font-semibold">#{index + 1}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${subject.visual.badge}`}>
                          {subject.mastery}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        {subject.elo && (
                          <p className="text-[10px] text-gray-400 font-mono">Elo {subject.elo}</p>
                        )}
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">{subject.progress}%</p>
                      </div>
                    </div>

                    <div className={`w-full h-2 rounded-full overflow-hidden ${subject.visual.track}`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${subject.visual.bar} transition-all duration-700`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PlaceholderRadarChart />
          )}
        </div>
      </div>

      {/* ── Strengths / Weaknesses ─────────────────────────── */}
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

      {/* ── Recent Activity ────────────────────────────────── */}
      <div className="relative border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-14 -right-16 w-44 h-44 rounded-full bg-emerald-200/40 dark:bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-3.5 w-3.5" /> Recent Activity
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {activityCompletedCount} solved
              </span>
              <span className="px-2 py-1 rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300">
                {activityAttemptedCount} attempts
              </span>
            </div>
          </div>

          {recentActivityItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm p-4 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Latest update</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{recentActivityItems[0]?.timeLabel || '—'}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Completion</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{activityCompletionRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 transition-all duration-700"
                      style={{ width: `${activityCompletionRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg py-2">
                    <p className="text-[10px] text-gray-400">Solved</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{activityCompletedCount}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg py-2">
                    <p className="text-[10px] text-gray-400">Timeline</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{recentActivityItems.length}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2.5">
                {recentActivityItems.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative rounded-xl border border-gray-200 dark:border-white/10 bg-white/85 dark:bg-white/[0.02] backdrop-blur-sm px-4 py-3 pl-10"
                  >
                    {index < recentActivityItems.length - 1 && (
                      <span className={`absolute left-[15px] top-8 bottom-[-13px] w-px bg-gradient-to-b ${activity.statusVisual.line}`} />
                    )}
                    <span className={`absolute left-3 top-3.5 w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 ${activity.statusVisual.dot} flex items-center justify-center`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/95" />
                    </span>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activity.visual.pill}`}>
                            {activity.difficulty}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activity.statusVisual.chip}`}>
                            {activity.statusVisual.label}
                          </span>
                          <span className="text-[10px] text-gray-400">{activity.timeLabel}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold shrink-0 ${activity.statusVisual.label === 'Solved' ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {activity.statusVisual.insight}
                      </span>
                    </div>

                    <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${activity.visual.track}`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${activity.visual.bar} transition-all duration-700`}
                        style={{ width: `${activity.intensity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity yet. Start solving.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Advanced Insights (Live) ────────────────────── */}
      <AdvancedInsightsSection insights={insights} loading={insightsLoading} />

      {/* ── Top Performing Topics ───────────────────────────── */}
      {masterySubjects.length > 0 && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Medal className="h-3.5 w-3.5" /> Top Performing Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {masterySubjects.map((topic, index) => (
              <div key={`${topic.id}-${index}`} className="border border-gray-100 dark:border-white/5 rounded-lg p-3">
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

      {/* ── Join Class Modal ───────────────────────────────── */}
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
