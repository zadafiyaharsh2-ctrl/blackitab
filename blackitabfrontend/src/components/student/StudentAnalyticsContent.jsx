import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../../config';
import {
  TrendingUp, Target, Flame, Clock, Award, CheckCircle,
  BookOpen, Brain, Zap, ArrowUp, ArrowDown, Minus,
  Trophy, Users, Activity, PieChart, Medal, Gauge, Timer, Gift, Code,
  ArrowRight, X, Lock, ChevronDown, ChevronUp, Sparkles, ShieldAlert
} from 'lucide-react';

import StudentHeader from './dashboard/StudentHeader';
import { StudentDailyChallenge, StudentQuickActions, StudentUpcomingExams } from './dashboard/StudentWidgets';
import StudentWeeklyActivity from './dashboard/StudentWeeklyActivity';
import StudentStrengthsWeaknesses from './dashboard/StudentStrengthsWeaknesses';
import StudentActivityFeed from './dashboard/StudentActivityFeed';
import StudentTopTopics from './dashboard/StudentTopTopics';

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

const formatInactiveTime = (days) => {
  const safeDays = Number.isFinite(Number(days)) ? Number(days) : 0;
  if (safeDays <= 0) return 'today';
  if (safeDays === 1) return '1 day';
  return `${safeDays} days`;
};

const getExamCountdownLabel = (dateStr) => {
  if (!dateStr) return 'Schedule pending';

  const now = Date.now();
  const examTime = new Date(dateStr).getTime();
  if (!Number.isFinite(examTime)) return 'Schedule pending';

  const diffMs = examTime - now;
  if (diffMs <= 0) return 'Starting now';

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${Math.max(1, minutes)}m`;
};

const isExamStartingSoon = (dateStr) => {
  if (!dateStr) return false;
  const now = Date.now();
  const examTime = new Date(dateStr).getTime();
  if (!Number.isFinite(examTime)) return false;
  const diffMs = examTime - now;
  return diffMs > 0 && diffMs <= (24 * 60 * 60 * 1000);
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

const SubjectMasteryRadar = ({ subjects, selectedId, onSelect }) => {
  const chartSubjects = subjects.slice(0, 6);
  const [hoveredId, setHoveredId] = useState(null);

  if (!chartSubjects.length) return null;

  const cx = 110;
  const cy = 110;
  const radius = 78;
  const levels = [0.25, 0.5, 0.75, 1];

  const activeId = hoveredId || selectedId || chartSubjects[0].id;

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

  const radarPoints = chartSubjects.map((subject, index) => {
    const angle = angles[index];
    const scale = clampProgress(subject.progress) / 100;
    const point = getPoint(angle, scale);
    const labelPoint = getPoint(angle, 1.16);
    return { subject, index, angle, scale, point, labelPoint };
  });

  const activeIndex = radarPoints.findIndex((item) => item.subject.id === activeId);
  const resolvedActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeNode = radarPoints[resolvedActiveIndex];
  const activeSubject = activeNode.subject;

  const dataPolygon = radarPoints
    .map((item) => `${item.point.x},${item.point.y}`)
    .join(' ');

  const activeAxisEnd = getPoint(activeNode.angle, 1);

  const handleSelect = (subjectId) => {
    if (typeof onSelect === 'function') onSelect(subjectId);
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 220 220" className="w-full max-w-[250px] mx-auto overflow-visible">
        <defs>
          <linearGradient id="masteryAreaGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="masteryStrokeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="masteryGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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

        <line
          x1={cx}
          y1={cy}
          x2={activeAxisEnd.x}
          y2={activeAxisEnd.y}
          className="stroke-blue-400/70 dark:stroke-cyan-400/70"
          strokeWidth="1.6"
          strokeDasharray="3 3"
        />

        <polygon
          points={dataPolygon}
          fill="url(#masteryAreaGradient)"
          stroke="url(#masteryStrokeGradient)"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {radarPoints.map((item) => {
          const isActive = item.subject.id === activeSubject.id;

          return (
            <g key={`dot-${item.subject.id}`}>
              {isActive && (
                <circle
                  cx={item.point.x}
                  cy={item.point.y}
                  r="9"
                  className="fill-fuchsia-400/20 dark:fill-cyan-400/20"
                />
              )}

              <circle
                cx={item.point.x}
                cy={item.point.y}
                r={isActive ? '4.8' : '3.2'}
                className={`${isActive ? 'fill-fuchsia-500 dark:fill-cyan-300' : 'fill-blue-500 dark:fill-cyan-400'} cursor-pointer outline-none`}
                filter={isActive ? 'url(#masteryGlow)' : undefined}
                tabIndex={0}
                role="button"
                aria-label={`Inspect ${item.subject.name} domain`}
                onMouseEnter={() => setHoveredId(item.subject.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(item.subject.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => handleSelect(item.subject.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(item.subject.id);
                  }
                }}
              >
                <title>{`${item.subject.name}: ${item.subject.progress}% mastery${item.subject.elo ? `, Elo ${item.subject.elo}` : ''}`}</title>
              </circle>
            </g>
          );
        })}

        {radarPoints.map((item) => {
          const { x, y } = item.labelPoint;
          const textAnchor = x > cx + 5 ? 'start' : x < cx - 5 ? 'end' : 'middle';
          const label = item.subject.name.length > 12
            ? `${item.subject.name.slice(0, 12)}…`
            : item.subject.name;
          const isActive = item.subject.id === activeSubject.id;

          return (
            <text
              key={`label-${item.subject.id}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              onMouseEnter={() => setHoveredId(item.subject.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(item.subject.id)}
              className={`${isActive ? 'fill-fuchsia-600 dark:fill-cyan-300' : 'fill-gray-500 dark:fill-gray-400'} text-[9px] font-semibold cursor-pointer transition-colors`}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected Domain</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activeSubject.visual?.badge || 'border-gray-200 text-gray-500'}`}>
            {activeSubject.mastery}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">{activeSubject.name}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-gray-100 dark:border-white/10 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-gray-400">Progress</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{activeSubject.progress}%</p>
          </div>
          <div className="rounded-md border border-gray-100 dark:border-white/10 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-gray-400">Elo</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{activeSubject.elo || '—'}</p>
          </div>
          <div className="rounded-md border border-gray-100 dark:border-white/10 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-gray-400">Rank</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">#{resolvedActiveIndex + 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ───────────────────────────────────────────── */

const StatCard = ({ icon, title, value, change, suffix = '', color = 'blue', progress = 0, sublabel = '' }) => {
  const IconComponent = icon;
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
          {IconComponent ? <IconComponent className="h-4 w-4 text-white" /> : null}
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
    focusAreas: [],
    weaknesses: [],
    recentActivity: []
  });
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedMasteryId, setSelectedMasteryId] = useState(null);

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

  const { stats, subjectProgress, strengths, focusAreas, weaknesses, recentActivity } = data;
  const resolvedFocusAreas = Array.isArray(focusAreas) && focusAreas.length > 0 ? focusAreas : weaknesses;

  const masterySubjects = (subjectProgress || [])
    .map((subject, index) => {
      const progress = clampProgress(subject?.progress);
      const mastery = deriveMasteryLabel(progress, subject?.mastery);
      const name =
        typeof subject?.name === 'string' && subject.name.trim()
          ? subject.name.trim()
          : `Domain ${index + 1}`;

      const effectiveEloRaw = Number(subject?.effectiveElo ?? subject?.elo);
      const storedEloRaw = Number(subject?.storedElo);
      const effectiveElo = Number.isFinite(effectiveEloRaw) ? Math.round(effectiveEloRaw) : 1000;
      const storedElo = Number.isFinite(storedEloRaw) ? Math.round(storedEloRaw) : effectiveElo;
      const eloLossRaw = Number(subject?.eloLoss);
      const inferredLoss = Math.max(0, storedElo - effectiveElo);
      const eloLoss = Number.isFinite(eloLossRaw) ? Math.max(0, Math.round(eloLossRaw)) : inferredLoss;
      const inactivityDaysRaw = Number(subject?.inactivityDays);
      const inactivityDays = Number.isFinite(inactivityDaysRaw) ? Math.max(0, Math.round(inactivityDaysRaw)) : 0;
      const recoveryProblemsTargetRaw = Number(subject?.recoveryProblemsTarget);
      const recoveryProblemsTarget = Number.isFinite(recoveryProblemsTargetRaw)
        ? Math.max(1, Math.round(recoveryProblemsTargetRaw))
        : Math.max(1, Math.ceil(eloLoss / 70));

      return {
        id: `${name}-${index}`,
        name,
        progress,
        mastery,
        visual: getMasteryVisual(progress),
        elo: effectiveElo,
        effectiveElo,
        storedElo,
        eloLoss,
        inactivityDays,
        lastAttemptedAt: subject?.lastAttemptedAt || null,
        decayStatus: subject?.decayStatus || 'healthy',
        decayMessage: subject?.decayMessage || '',
        recoveryProblemsTarget,
      };
    })
    .sort((a, b) => b.progress - a.progress);

  const selectedMasterySubject = masterySubjects.find((subject) => subject.id === selectedMasteryId) || masterySubjects[0] || null;
  const decayingMasterySubjects = masterySubjects
    .filter((subject) => subject.decayStatus !== 'healthy' && subject.eloLoss >= 8)
    .sort((a, b) => {
      if (b.eloLoss !== a.eloLoss) return b.eloLoss - a.eloLoss;
      return b.inactivityDays - a.inactivityDays;
    });
  const primaryDecayAlert = decayingMasterySubjects[0] || null;

  useEffect(() => {
    if (!masterySubjects.length) {
      if (selectedMasteryId !== null) setSelectedMasteryId(null);
      return;
    }

    if (!selectedMasteryId || !masterySubjects.some((subject) => subject.id === selectedMasteryId)) {
      setSelectedMasteryId(masterySubjects[0].id);
    }
  }, [masterySubjects, selectedMasteryId]);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-20 space-y-5">
      <StudentHeader userName={userName} />

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
      <StudentUpcomingExams 
        upcomingExams={upcomingExams} 
        isExamStartingSoon={isExamStartingSoon} 
        getExamCountdownLabel={getExamCountdownLabel} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StudentDailyChallenge problemOfTheDay={problemOfTheDay} />
        <StudentQuickActions 
          joinedBatchCount={joinedBatchCount} 
          onJoinClick={() => setShowJoinModal(true)} 
        />
      </div>

      <StudentWeeklyActivity weeklyActivity={data.weeklyActivity} />

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

          {primaryDecayAlert && (
            <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 px-3.5 py-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide">Subject Health Alert</p>
                  <p className="text-xs text-amber-700 dark:text-amber-200/90 mt-1 leading-relaxed">
                    {primaryDecayAlert.decayMessage || `Your ${primaryDecayAlert.name} mastery is decaying. Solve ${primaryDecayAlert.recoveryProblemsTarget} problems today to recover toward Elo ${primaryDecayAlert.storedElo}.`}
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-200/80 mt-1">
                    Effective Elo {primaryDecayAlert.effectiveElo}
                    {primaryDecayAlert.storedElo ? ` (stored ${primaryDecayAlert.storedElo})` : ''}
                    {primaryDecayAlert.inactivityDays > 0 ? ` after ${formatInactiveTime(primaryDecayAlert.inactivityDays)} inactive.` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {masterySubjects.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 dark:from-slate-900/40 dark:via-black/10 dark:to-blue-500/5 p-4">
                <SubjectMasteryRadar
                  subjects={masterySubjects}
                  selectedId={selectedMasteryId}
                  onSelect={setSelectedMasteryId}
                />
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <p className="text-xs text-gray-500">Focused domain</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedMasterySubject?.name || masterySubjects[0]?.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedMasterySubject?.effectiveElo
                      ? `Effective Elo: ${selectedMasterySubject.effectiveElo}`
                      : `${selectedMasterySubject?.progress || masterySubjects[0]?.progress || 0}% mastery`}
                  </p>
                  {selectedMasterySubject?.storedElo && selectedMasterySubject?.eloLoss > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-300 mt-1">
                      Stored Elo {selectedMasterySubject.storedElo} • decay loss {selectedMasterySubject.eloLoss}
                    </p>
                  )}
                  {selectedMasterySubject?.inactivityDays > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Last practiced {formatInactiveTime(selectedMasterySubject.inactivityDays)} ago
                    </p>
                  )}
                </div>
              </div>

              <div className="xl:col-span-3 space-y-2.5">
                {masterySubjects.map((subject, index) => {
                  const isSelected = selectedMasterySubject?.id === subject.id;

                  return (
                    <button
                      type="button"
                      key={subject.id}
                      onClick={() => setSelectedMasteryId(subject.id)}
                      onMouseEnter={() => setSelectedMasteryId(subject.id)}
                      className={`w-full text-left rounded-lg border backdrop-blur-sm p-3 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-300 dark:border-cyan-400/50 bg-blue-50/70 dark:bg-cyan-500/10 shadow-sm'
                          : 'border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] hover:border-blue-200 dark:hover:border-cyan-400/30'
                      }`}
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
                            <p className="text-[10px] text-gray-400 font-mono">Eff Elo {subject.elo}</p>
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

                      {(subject.inactivityDays > 0 || subject.eloLoss > 0) && (
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-gray-400">Idle {formatInactiveTime(subject.inactivityDays)}</span>
                          {subject.eloLoss > 0 && (
                            <span className={`font-semibold ${subject.decayStatus === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                              -{subject.eloLoss} Elo decay
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <PlaceholderRadarChart />
          )}
        </div>
      </div>

      <StudentStrengthsWeaknesses strengths={strengths} resolvedFocusAreas={resolvedFocusAreas} />

      <StudentActivityFeed 
        recentActivityItems={recentActivityItems} 
        activityCompletedCount={activityCompletedCount} 
        activityAttemptedCount={activityAttemptedCount} 
        activityCompletionRate={activityCompletionRate} 
      />

      {/* ── Advanced Insights (Live) ────────────────────── */}
      <AdvancedInsightsSection insights={insights} loading={insightsLoading} />

      <StudentTopTopics 
        masterySubjects={masterySubjects} 
        selectedMasterySubject={selectedMasterySubject} 
        setSelectedMasteryId={setSelectedMasteryId} 
      />

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
