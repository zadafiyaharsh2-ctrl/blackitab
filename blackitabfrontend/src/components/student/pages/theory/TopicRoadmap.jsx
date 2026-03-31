/**
 * TOPIC ROADMAP — Full Gamified Mission Map
 *
 * Features:
 * - Floating particle field background
 * - Animated energy flow along center path
 * - Radar-ping pulse for active node
 * - Golden shimmer sweep on completed cards
 * - 3D tilt perspective on hover
 * - Staggered bounce-in card entrance
 * - XP badges, chapter labels, difficulty tiers
 * - BOSS NODE styling for final topic
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, CheckCircle, ChevronRight, Trophy, Map, Zap, Flame, Shield, Sword, Crown } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

// ── Color themes ─────────────────────────────────────────────────────────────
const NODE_THEMES = [
  { color: '#00d4ff', glow: 'rgba(0,212,255,0.5)',   label: 'ROOKIE'    },
  { color: '#a855f7', glow: 'rgba(168,85,247,0.5)',  label: 'EXPLORER'  },
  { color: '#10b981', glow: 'rgba(16,185,129,0.5)',  label: 'SKILLED'   },
  { color: '#f97316', glow: 'rgba(249,115,22,0.5)',  label: 'ADVANCED'  },
  { color: '#3b82f6', glow: 'rgba(59,130,246,0.5)',  label: 'EXPERT'    },
  { color: '#ec4899', glow: 'rgba(236,72,153,0.5)',  label: 'MASTER'    },
  { color: '#eab308', glow: 'rgba(234,179,8,0.5)',   label: 'LEGEND'    },
  { color: '#06b6d4', glow: 'rgba(6,182,212,0.5)',   label: 'ELITE'     },
];

const BOSS_THEME = { color: '#ff4d4d', glow: 'rgba(255,77,77,0.6)', label: 'BOSS' };
const XP_PER_TOPIC = 150;

// ── Floating Particle (bg) ────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

// ── Animated background particles ─────────────────────────────────────────────
const ParticleField = React.memo(() => {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 8 + 6,
    opacity: Math.random() * 0.4 + 0.1,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#a855f7', '#00d4ff'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <Particle
          key={p.id}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            opacity: p.opacity,
            transform: 'translateZ(0)', // Force hardware acceleration
            willChange: 'transform',
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
});

// ── Animated XP Counter (Prevents full roadmap re-renders) ───────────────────
const AnimatedXPCounter = ({ targetXP }) => {
  const [currentXP, setCurrentXP] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(targetXP / 30);
    if (!step) {
      setCurrentXP(targetXP);
      return;
    }
    const timer = setInterval(() => {
      start = Math.min(start + step, targetXP);
      setCurrentXP(start);
      if (start >= targetXP) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [targetXP]);

  return <>{currentXP.toLocaleString()}</>;
};

// ── XP Badge ─────────────────────────────────────────────────────────────────
const XPBadge = ({ xp, color, isCompleted }) => (
  <div
    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
    style={{
      background: isCompleted ? 'rgba(250,204,21,0.2)' : `${color}20`,
      border: `1px solid ${isCompleted ? 'rgba(250,204,21,0.5)' : `${color}40`}`,
      color: isCompleted ? '#fbbf24' : color,
      boxShadow: isCompleted ? '0 0 8px rgba(250,204,21,0.3)' : 'none',
    }}
  >
    <Zap className="h-2.5 w-2.5" />
    {isCompleted ? xp : `+${xp}`} XP
  </div>
);

// ── Starburst (completed decoration) ─────────────────────────────────────────
const Starburst = ({ color }) => (
  <div className="absolute inset-0 pointer-events-none">
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
      <div
        key={angle}
        className="absolute"
        style={{
          top: '50%', left: '50%',
          width: '2px', height: '8px',
          background: color,
          boxShadow: `0 0 4px ${color}`,
          transform: `rotate(${angle}deg) translateY(-14px)`,
          transformOrigin: 'top center',
          opacity: 0.8,
          animation: `starburstSpin 4s linear infinite`,
        }}
      />
    ))}
  </div>
);

// ── Topic Card ────────────────────────────────────────────────────────────────
const TopicCard = ({ topic, index, isCompleted, isActive, isBoss, theme, onSelect, totalTopics, position, isDark }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const stars = isCompleted ? 3 : isActive ? 1 : 0;
  const xpValue = isBoss ? XP_PER_TOPIC * 3 : XP_PER_TOPIC;
  const tierLabel = isBoss ? BOSS_THEME.label : theme.label;
  const themeColor = isBoss ? BOSS_THEME.color : theme.color;
  const themeGlow = isBoss ? BOSS_THEME.glow : theme.glow;

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => { setClicked(false); onSelect(topic); }, 180);
  };

  return (
    <div
      className="flex-1 cursor-pointer"
      style={{
        opacity: 1,
        perspective: '800px',
        animation: `bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div
        className="relative rounded-2xl p-4 select-none overflow-hidden transition-all duration-300"
        style={{
          background: isCompleted
            ? (isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06), rgba(250,204,21,0.05))' : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(255,255,255,1))')
            : isBoss
            ? (isDark ? 'linear-gradient(135deg, rgba(255,77,77,0.16), rgba(220,38,38,0.06), rgba(255,140,0,0.04))' : 'linear-gradient(135deg, rgba(255,77,77,0.08), rgba(255,255,255,1))')
            : isActive
            ? (isDark ? `linear-gradient(135deg, ${themeColor}18, ${themeColor}06)` : `linear-gradient(135deg, ${themeColor}15, rgba(255,255,255,1))`)
            : hovered
            ? (isDark ? 'linear-gradient(135deg, #141e38, #0d1530)' : 'linear-gradient(135deg, #f1f5f9, #ffffff)')
            : (isDark ? 'linear-gradient(135deg, #0f1a30, #080d1c)' : 'linear-gradient(135deg, #ffffff, #f8fafc)'),
          border: isCompleted
            ? '1.5px solid rgba(16,185,129,0.55)'
            : isBoss
            ? '1.5px solid rgba(255,77,77,0.6)'
            : isActive
            ? `1.5px solid ${themeColor}aa`
            : hovered
            ? `1.5px solid ${themeColor}60`
            : (isDark ? '1.5px solid rgba(255,255,255,0.07)' : '1.5px solid rgba(0,0,0,0.05)'),
          boxShadow: isCompleted
            ? (isDark ? '0 4px 24px rgba(16,185,129,0.2), 0 0 40px rgba(250,204,21,0.05)' : '0 4px 15px rgba(16,185,129,0.15)')
            : isBoss
            ? (isDark ? '0 6px 32px rgba(255,77,77,0.25), 0 0 60px rgba(255,77,77,0.1)' : '0 6px 20px rgba(255,77,77,0.15)')
            : isActive
            ? (isDark ? `0 8px 32px ${themeGlow}, 0 0 60px ${themeColor}25` : `0 6px 20px ${themeColor}30`)
            : hovered
            ? (isDark ? `0 10px 40px ${themeGlow}, 0 0 30px ${themeColor}15` : `0 8px 20px ${themeColor}20`)
            : (isDark ? '0 2px 16px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.05)'),
          transform: clicked
            ? 'scale(0.95)'
            : hovered
            ? `${position === 'left' ? 'translateX(-6px)' : 'translateX(6px)'} rotateY(${position === 'left' ? '3' : '-3'}deg) scale(1.02)`
            : 'translateX(0) rotateY(0) scale(1)',
        }}
      >
        {/* Shimmer sweep on completed */}
        {isCompleted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div
              className="absolute top-0 bottom-0 w-1/3"
              style={{
                background: 'linear-gradient(90deg, rgba(250,204,21,0), rgba(250,204,21,0.1), rgba(250,204,21,0))',
                animation: 'shimmerSweep 3s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Scan line effect removed based on user request */}

        {/* Boss flame effect */}
        {isBoss && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 pointer-events-none">
            <Flame className="h-5 w-5 text-orange-400"
              style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.8))', animation: 'flicker 1.5s ease-in-out infinite' }} />
          </div>
        )}

        {/* Top: tier label + XP */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-black tracking-widest px-2 py-0.5 rounded"
            style={{
              color: isCompleted ? '#fbbf24' : themeColor,
              background: isCompleted ? 'rgba(250,204,21,0.1)' : `${themeColor}15`,
              border: `1px solid ${isCompleted ? 'rgba(250,204,21,0.3)' : `${themeColor}30`}`,
              fontSize: '9px',
            }}
          >
            {tierLabel}
          </span>
          <XPBadge xp={xpValue} color={themeColor} isCompleted={isCompleted} />
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[0, 1, 2].map(i => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-700 text-gray-700'}`}
              style={i < stars ? {
                filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.9))',
                animation: `starTwinkle ${1 + i * 0.3}s ease-in-out infinite`,
              } : {}}
            />
          ))}
        </div>

        {/* Topic name */}
        <h3
          className="font-black text-sm leading-snug mb-3"
          style={{
            color: isCompleted
              ? '#4ade80'
              : isBoss
              ? '#ff6b6b'
              : isActive
              ? themeColor
              : hovered
              ? (isDark ? '#e2e8f0' : '#0f172a')
              : (isDark ? '#64748b' : '#334155'),
            textShadow: (isActive || hovered || isBoss) ? `0 0 16px ${themeColor}70` : 'none',
          }}
        >
          {isBoss ? '⚔️ ' : isCompleted ? '✓ ' : ''}{topic.name}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(15,23,42,0.4)' }}>
            CH.{String(index + 1).padStart(2, '0')}
          </span>
          <div
            className="flex items-center gap-1 text-xs font-bold transition-all duration-200"
            style={{
              color: isCompleted ? '#10b981' : isActive ? themeColor : isBoss ? BOSS_THEME.color : '#475569',
              transform: hovered ? 'translateX(3px)' : 'none',
            }}
          >
            {isCompleted
              ? <><CheckCircle className="h-3 w-3" /> Done</>
              : isActive
              ? <>▶ Play Now <ChevronRight className="h-3 w-3" /></>
              : isBoss
              ? <><Sword className="h-3 w-3" /> Challenge</>
              : <>Enter <ChevronRight className="h-3 w-3" /></>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Center Path Node ──────────────────────────────────────────────────────────
const PathNode = ({ index, isCompleted, isActive, isBoss, theme, isDark }) => {
  const themeColor = isBoss ? BOSS_THEME.color : theme.color;
  const themeGlow = isBoss ? BOSS_THEME.glow : theme.glow;

  return (
    <div className="relative z-10 flex-shrink-0" style={{ animation: isActive ? 'nodeFloat 3s ease-in-out infinite' : 'none' }}>
      {/* Outer rings for active/boss */}
      {(isActive || isBoss) && !isCompleted && (
        <>
          <div className="absolute inset-0 rounded-full" style={{
            border: `2px solid ${themeColor}50`,
            animation: 'radarPing 2s ease-out infinite',
          }} />
          <div className="absolute inset-0 rounded-full" style={{
            border: `2px solid ${themeColor}30`,
            animation: 'radarPing 2s ease-out 0.7s infinite',
          }} />
        </>
      )}

      {/* Starburst for completed */}
      {isCompleted && <Starburst color={themeColor} />}

      {/* Main dot */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm relative z-10 transition-colors duration-300"
        style={{
          background: isCompleted
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : isBoss
            ? 'linear-gradient(135deg, #ff4d4d, #dc2626)'
            : isActive
            ? `linear-gradient(135deg, ${themeColor}ee, ${themeColor}aa)`
            : (isDark ? 'linear-gradient(135deg, #1a2540, #0f1628)' : '#e2e8f0'),
          border: isCompleted
            ? '3px solid #10b981'
            : isBoss
            ? '3px solid #ff4d4d'
            : isActive
            ? `3px solid ${themeColor}`
            : (isDark ? '2px solid rgba(255,255,255,0.12)' : '2px solid rgba(0,0,0,0.1)'),
          boxShadow: isCompleted
            ? '0 0 20px rgba(16,185,129,0.8), 0 0 50px rgba(16,185,129,0.3)'
            : isBoss
            ? '0 0 24px rgba(255,77,77,0.8), 0 0 60px rgba(255,77,77,0.3)'
            : isActive
            ? `0 0 24px ${themeGlow}, 0 0 60px ${themeColor}40`
            : 'none',
          color: (isCompleted || isActive || isBoss) ? 'white' : (isDark ? '#475569' : '#94a3b8'),
          animation: isCompleted ? 'completedSpin 8s linear infinite' : 'none',
        }}
      >
        {isCompleted
          ? <CheckCircle className="h-5 w-5" />
          : isBoss
          ? <Crown className="h-5 w-5" />
          : index + 1}
      </div>
    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const RoadmapSkeleton = ({ isDark }) => (
  <div className="space-y-6 mt-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4" style={{ animation: `pulseScale 1.5s ease-in-out ${i * 0.15}s infinite` }}>
        {i % 2 === 0 ? (
          <>
            <div className="flex-1 h-28 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }} />
            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />
            <div className="flex-1" />
          </>
        ) : (
          <>
            <div className="flex-1" />
            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />
            <div className="flex-1 h-28 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }} />
          </>
        )}
      </div>
    ))}
  </div>
);

// ── Main TopicRoadmap ─────────────────────────────────────────────────────────
const TopicRoadmap = ({ subject, topics, completedTopics, onSelectTopic, onBack, loading }) => {
  const { isDark } = useTheme();
  
  const completedCount = Object.keys(completedTopics || {}).filter(id => completedTopics[id]).length;
  const totalTopics = topics.length;
  const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const activeIndex = (() => { const i = topics.findIndex(t => !completedTopics?.[t._id]); return i === -1 ? totalTopics - 1 : i; })();

  // Calculate target XP without causing re-renders
  const targetXP = topics.reduce((acc, t, i) => {
    if (completedTopics?.[t._id]) {
      return acc + ((i === topics.length - 1) ? XP_PER_TOPIC * 3 : XP_PER_TOPIC);
    }
    return acc;
  }, 0);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: isDark ? 'linear-gradient(160deg, #030610 0%, #07091a 40%, #05080f 100%)' : 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)' }}
    >
      {/* Particle field */}
      {isDark && <ParticleField />}

      {/* Circuit grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: isDark ? 0.03 : 0.05,
        backgroundImage: `
          linear-gradient(${isDark ? 'rgba(99,179,237,1)' : 'rgba(99,179,237,0.7)'} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? 'rgba(99,179,237,1)' : 'rgba(99,179,237,0.7)'} 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Large ambient orbs */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.025) 0%, transparent 70%)', transform: 'translateZ(0)', willChange: 'transform', animation: 'orbDrift 12s ease-in-out infinite' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(139,92,246,0.025) 0%, transparent 70%)', transform: 'translateZ(0)', willChange: 'transform', animation: 'orbDrift 15s ease-in-out 3s infinite reverse' }} />

      <div className="relative max-w-3xl mx-auto px-4 py-6 pb-24">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8" style={{ animation: 'fadeInDown 0.4s ease-out', willChange: 'opacity, transform' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: isDark ? 'white' : 'black' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' })}
          >
            <ArrowLeft className="h-4 w-4" />
            All Subjects
          </button>

          {/* XP Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.35)' }}>
              <Zap className="h-4 w-4 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.8))' }} />
              <span className="text-yellow-400 font-black text-sm"><AnimatedXPCounter targetXP={targetXP} /></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)' }}>
              <Trophy className="h-3.5 w-3.5 text-emerald-400" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' }} />
              <span className="text-emerald-400 font-black text-sm">{completedCount}/{totalTopics}</span>
            </div>
          </div>
        </div>

        {/* ── Subject Title ── */}
        <div className="text-center mb-12" style={{ animation: 'fadeInDown 0.5s ease-out 0.1s both', willChange: 'opacity, transform' }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4 tracking-widest"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', transform: 'translateZ(0)', animation: 'borderGlow 3s ease-in-out infinite' }}>
            <Map className="h-3 w-3" />
            ⚡ MISSION MAP ⚡
          </div>

          <h1 className="text-5xl font-black mb-3 tracking-tight"
            style={{ color: isDark ? 'white' : '#0f172a', textShadow: isDark ? '0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2)' : '0 2px 10px rgba(59,130,246,0.15)', animation: isDark ? 'titleGlow 3s ease-in-out infinite' : 'none' }}>
            {subject?.name}
          </h1>

          {subject?.description && (
            <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: isDark ? 'rgba(156,163,175,1)' : 'rgba(100,116,139,1)' }}>{subject.description}</p>
          )}

          {/* Progress bar */}
          <div className="mt-6 mx-auto max-w-sm">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold" style={{ color: isDark ? '#6b7280' : '#64748b' }}>MISSION PROGRESS</span>
              <span className="font-black" style={{ color: overallProgress === 100 ? '#10b981' : (isDark ? '#60a5fa' : '#3b82f6') }}>
                {overallProgress}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)' }}>
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: `${overallProgress}%`,
                  background: overallProgress === 100
                    ? 'linear-gradient(90deg, #10b981, #059669, #34d399)'
                    : 'linear-gradient(90deg, #1d4ed8, #3b82f6, #6366f1, #8b5cf6)',
                  boxShadow: `0 0 14px ${overallProgress === 100 ? 'rgba(16,185,129,0.7)' : 'rgba(59,130,246,0.7)'}`,
                  transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'progressShimmer 2s linear infinite',
                }}
              />
            </div>
            {overallProgress > 0 && (
              <p className="text-xs text-center mt-1.5 font-semibold"
                style={{ color: overallProgress === 100 ? '#10b981' : '#4b6cb7' }}>
                {overallProgress === 100 ? '🏆 SUBJECT MASTERED!' : `${completedCount} topic${completedCount !== 1 ? 's' : ''} cleared`}
              </p>
            )}
          </div>
        </div>

        {/* ── Roadmap ── */}
        {loading ? (
          <RoadmapSkeleton isDark={isDark} />
        ) : (
          <div className="relative">
            {/* Static track */}
            <div className="absolute left-1/2 top-0 pointer-events-none" style={{ bottom: '40px', transform: 'translateX(-50%)', width: '2px' }}>
              <div className="absolute inset-0" style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }} />
              {/* Dropping Light Beam */}
              <div className="absolute left-1/2 -translate-x-1/2 w-[3px] h-32 rounded-full" style={{
                transformOrigin: 'bottom',
                background: 'linear-gradient(180deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.4) 40%, rgba(16,185,129,0.9) 80%, #10b981 100%)',
                boxShadow: '0 0 20px rgba(16,185,129,1), 0 0 40px rgba(16,185,129,0.5)',
                animation: 'dropFall 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }} />
            </div>



            {/* Topic nodes */}
            <div className="space-y-6">
              {topics.map((topic, index) => {
                const isCompleted = completedTopics?.[topic._id] === true;
                const isActive = index === activeIndex;
                const isBoss = index === topics.length - 1;
                const theme = NODE_THEMES[index % NODE_THEMES.length];
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={topic._id}
                    className="relative flex items-center gap-4"
                    style={{ animation: `bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s both` }}
                  >
                    {/* Left card (even) */}
                    {isLeft ? (
                      <TopicCard
                        topic={topic} index={index}
                        isCompleted={isCompleted} isActive={isActive} isBoss={isBoss}
                        theme={theme} onSelect={onSelectTopic} totalTopics={totalTopics} position="left" isDark={isDark}
                      />
                    ) : <div className="flex-1" />}

                    {/* Center node */}
                    <PathNode
                      index={index} isCompleted={isCompleted}
                      isActive={isActive} isBoss={isBoss} theme={theme} isDark={isDark}
                    />

                    {/* Right card (odd) */}
                    {!isLeft ? (
                      <TopicCard
                        topic={topic} index={index}
                        isCompleted={isCompleted} isActive={isActive} isBoss={isBoss}
                        theme={theme} onSelect={onSelectTopic} totalTopics={totalTopics} position="right" isDark={isDark}
                      />
                    ) : <div className="flex-1" />}
                  </div>
                );
              })}
            </div>

            {/* Finish line */}
            <div className="flex justify-center mt-10 pt-4">
              <div className="flex flex-col items-center"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
                <Trophy className="h-10 w-10 relative z-10"
                  style={{
                    color: overallProgress === 100 ? '#fbbf24' : '#374151',
                    filter: overallProgress === 100 ? 'drop-shadow(0 0 20px rgba(250,204,21,0.9))' : 'none',
                    animation: overallProgress === 100 ? 'none' : 'trophyIconLightUp 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    transition: 'all 0.3s ease',
                  }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── All Animations ── */}
      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translate3d(0px, 0px, 0); opacity: var(--op, 0.2); }
          33%       { transform: translate3d(8px, -20px, 0); }
          66%       { transform: translate3d(-6px, 10px, 0); }
        }
        @keyframes dropFall {
          0% { top: -128px; opacity: 0; box-shadow: 0 0 0px transparent; transform: translateX(-50%) scaleY(1) translateZ(0); }
          5% { opacity: 1; box-shadow: 0 0 20px rgba(16,185,129,0.5); transform: translateX(-50%) scaleY(1) translateZ(0); }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.8); transform: translateX(-50%) scaleY(1) translateZ(0); }
          80% { top: calc(100% - 128px); opacity: 1; box-shadow: 0 0 40px rgba(16,185,129,1); transform: translateX(-50%) scaleY(1) translateZ(0); }
          86% { top: calc(100% - 128px); opacity: 0; box-shadow: 0 0 60px rgba(16,185,129,1); transform: translateX(-50%) scaleY(0) translateZ(0); }
          100% { top: calc(100% - 128px); opacity: 0; }
        }
        @keyframes trophyBaseLightUp {
          0%, 80% { border-color: rgba(255,255,255,0.08); box-shadow: none; background: rgba(255,255,255,0.04); transform: scale(1); }
          84% { border-color: #facc15; box-shadow: 0 0 90px rgba(250,204,21,1), inset 0 0 50px rgba(250,204,21,0.8); background: rgba(250,204,21,0.3); transform: scale(1.15); }
          100% { border-color: rgba(255,255,255,0.08); box-shadow: none; background: rgba(255,255,255,0.04); transform: scale(1); }
        }
        @keyframes trophyIconLightUp {
          0%, 80% { color: #374151; filter: drop-shadow(0 0 0px transparent); transform: scale(1); }
          84% { color: #facc15; filter: drop-shadow(0 0 40px #facc15) brightness(2); transform: scale(1.3); }
          100% { color: #374151; filter: drop-shadow(0 0 0px transparent); transform: scale(1); }
        }
        @keyframes trophyTextLightUp {
          0%, 80% { color: inherit; text-shadow: none; }
          84% { color: #facc15; text-shadow: 0 0 30px rgba(250,204,21,1); }
          100% { color: inherit; text-shadow: none; }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.7) translateY(30px); }
          60%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
          80%  { transform: scale(0.98) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes radarPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes nodeFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes shimmerSweep {
          0%   { left: -40%; }
          60%  { left: 140%; }
          100% { left: 140%; }
        }
        @keyframes scanLine {
          0%   { top: -2px; opacity: 0.8; }
          80%  { top: 100%; opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes starburstSpin {
          from { transform: rotate(var(--r, 0deg)) translateY(-14px); }
          to   { transform: rotate(calc(var(--r, 0deg) + 360deg)) translateY(-14px); }
        }
        @keyframes completedSpin {
          from { box-shadow: 0 0 20px rgba(16,185,129,0.8), 0 0 50px rgba(16,185,129,0.3); }
          50%  { box-shadow: 0 0 30px rgba(16,185,129,1), 0 0 70px rgba(16,185,129,0.5), 0 0 100px rgba(16,185,129,0.2); }
          to   { box-shadow: 0 0 20px rgba(16,185,129,0.8), 0 0 50px rgba(16,185,129,0.3); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.1) rotate(5deg); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2); }
          50%      { text-shadow: 0 0 60px rgba(59,130,246,0.7), 0 0 120px rgba(139,92,246,0.3); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(59,130,246,0.3); }
          50%      { box-shadow: 0 0 16px rgba(59,130,246,0.6); }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes trophySpin {
          0%, 100% { transform: rotateY(0deg); }
          50%      { transform: rotateY(180deg); }
        }
        @keyframes progressShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes pulseScale {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default TopicRoadmap;
