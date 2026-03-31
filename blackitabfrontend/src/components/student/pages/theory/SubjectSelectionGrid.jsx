import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Zap, Flame, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';

// ── Subject → icon + color ─────────────────────────────────────────────────
const SUBJECT_ICON_MAP = [
  { keywords: ['java', 'basic', 'fundamental', 'intro'],              icon: '/icons/icon_java.png',        color: '#00d4ff' },
  { keywords: ['oop', 'object', 'interface', 'class', 'inherit'],     icon: '/icons/icon_oop.png',         color: '#a855f7' },
  { keywords: ['collect', 'list', 'array', 'data struct', 'map','set'], icon: '/icons/icon_collections.png', color: '#10b981' },
  { keywords: ['exception', 'error', 'handle', 'try', 'catch'],        icon: '/icons/icon_exceptions.png',  color: '#f97316' },
  { keywords: ['backend', 'server', 'api', 'rest', 'express', 'node'], icon: '/icons/icon_backend.png',     color: '#3b82f6' },
];
const FALLBACK = { icon: '/icons/icon_generic.png', color: '#8b5cf6' };
function getSubjectIcon(name = '') {
  const lower = name.toLowerCase();
  for (const e of SUBJECT_ICON_MAP) if (e.keywords.some(k => lower.includes(k))) return e;
  return FALLBACK;
}

// ── Glowing Cyan Progress Bar ──────────────────────────────────────────────
const XPBar = ({ progress }) => (
  <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      className="h-full rounded-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
        boxShadow: '0 0 10px rgba(6,182,212,0.9), 0 0 20px rgba(6,182,212,0.4)',
      }}
    >
      {/* shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))',
        backgroundSize: '200% 100%',
        animation: 'barShimmer 2s linear infinite',
      }} />
    </motion.div>
  </div>
);

// ── Horizontal Subject Card ────────────────────────────────────────────────
// Matches the reference: icon-left, text-center, checkmark-top-right, progress-bottom
const SubjectCard = ({ subject, completedTopics, index, onSelect }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const completedCount = Object.keys(completedTopics[subject._id] || {}).length;
  const totalTopics    = subject.topicCount || 0;
  const progress       = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isCompleted    = progress === 100;
  const { icon, color } = getSubjectIcon(subject.name);

  const handleMouseMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      rotateX: -((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * 5,
      rotateY:  ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 5,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTilt({ rotateX: 0, rotateY: 0 }); }}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(subject)}
      style={{ perspective: '900px' }}
      className="cursor-pointer select-none w-full"
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          y: isHovered ? -5 : 0,
          scale: isHovered ? 1.015 : 1,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1e3a 0%, #0a1628 60%, #07101e 100%)',
          boxShadow: isHovered
            ? `0 20px 48px -10px rgba(0,0,0,0.85), 0 0 0 1px ${color}50`
            : '0 8px 28px -6px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
          transformStyle: 'preserve-3d',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Ambient top glow matching subject color */}
        <div
          className="absolute top-0 left-0 w-64 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${color}20 0%, transparent 70%)`,
          }}
        />

        {/* ── Main horizontal body ── */}
        <div className="flex items-center gap-5 px-6 pt-6 pb-4 relative z-10">

          {/* LEFT: Icon container */}
          <div
            className="flex-shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              border: `1px solid ${color}40`,
              boxShadow: isHovered ? `0 0 20px ${color}30` : 'none',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <motion.img
              animate={{ y: isHovered ? -3 : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              src={icon}
              alt={subject.name}
              className="w-11 h-11 object-contain"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
            />
          </div>

          {/* CENTER: Title + module count */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-[18px] leading-snug tracking-tight truncate">
              {subject.name}
            </h3>
            <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {completedCount} of {totalTopics} Modules Completed
            </p>
          </div>

          {/* RIGHT: Completed checkmark */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid #34d399',
                boxShadow: '0 0 12px rgba(52,211,153,0.5)',
              }}
            >
              <svg className="w-4 h-4" fill="#34d399" viewBox="0 0 20 20"
                   style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,1))' }}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* ── Progress Section ── */}
        <div className="px-6 pb-5 relative z-10">
          {/* thin separator */}
          <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />

          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
              PROGRESS
            </span>
            <span
              className="text-[15px] font-black"
              style={{ color: '#22d3ee', textShadow: '0 0 12px rgba(34,211,238,0.7)' }}
            >
              {progress}%
            </span>
          </div>
          <XPBar progress={progress} />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Stats Banner ───────────────────────────────────────────────────────────
const StatsBanner = ({ subjects, completedTopics, isDark }) => {
  const totalCompleted = subjects.reduce((acc, s) =>
    acc + Object.values(completedTopics[s._id] || {}).filter(Boolean).length, 0);
  const totalTopics = subjects.reduce((acc, s) => acc + (s.topicCount || 0), 0);
  const totalDone   = subjects.filter(s => {
    const c = Object.keys(completedTopics[s._id] || {}).length;
    return s.topicCount > 0 && c >= s.topicCount;
  }).length;
  const overall = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  return (
    <div className="mb-8 rounded-2xl p-4 grid grid-cols-3 gap-4"
         style={{
           background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
           border: '1px solid rgba(59,130,246,0.15)',
         }}>
      {[
        { icon: <Flame className="h-4 w-4 text-orange-400" />, value: totalCompleted, label: 'Topics Done' },
        { icon: <Target className="h-4 w-4 text-blue-400" />, value: `${overall}%`, label: 'Overall XP' },
        { icon: <Award className="h-4 w-4 text-yellow-400" />, value: totalDone, label: 'Mastered' },
      ].map((s, i) => (
        <div key={i} className={`text-center ${i === 1 ? 'border-x border-white/10' : ''}`}>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {s.icon}
            <span className="text-xl font-black" style={{ color: isDark ? 'white' : '#0f172a' }}>{s.value}</span>
          </div>
          <p className="text-xs font-semibold" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Loading Skeleton ───────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-2xl h-[130px] animate-pulse"
           style={{ background: 'linear-gradient(135deg, #0f1e3a, #07101e)', border: '1px solid rgba(255,255,255,0.05)' }} />
    ))}
  </div>
);

// ── Main Export ────────────────────────────────────────────────────────────
const SubjectSelectionGrid = ({ subjects, completedTopics, loading }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSelect = (subject) => navigate(`/theory/${subject._id}`);

  if (loading) return <LoadingSkeleton />;

  if (!subjects.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="font-bold text-xl mb-2" style={{ color: isDark ? 'white' : '#0f172a' }}>No Subjects Yet</h3>
        <p className="font-medium" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>New courses are coming soon!</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="mb-6 pl-1">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>
          Theory <span style={{ color: '#38bdf8' }}>Subjects</span>
        </h1>
        <p className="text-sm mt-1 font-semibold" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>
          Choose your subject and start earning XP
        </p>
      </div>

      {/* Stats */}
      {subjects.length > 0 && (
        <StatsBanner subjects={subjects} completedTopics={completedTopics} isDark={isDark} />
      )}

      {/* HORIZONTAL cards — 2 per row on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={subject._id}
            subject={subject}
            completedTopics={completedTopics}
            index={index}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <style>{`
        @keyframes barShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SubjectSelectionGrid;
