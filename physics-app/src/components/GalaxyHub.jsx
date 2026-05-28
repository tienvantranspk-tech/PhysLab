import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { GlassCard, AnimatedProgressBar, ChunkyButton } from './common';
import { staggerContainer, staggerItem } from '../animations/variants';
import lessonsData from '../data/lessons.json';
import gameData from '../data/gameData.json';
import {
  Zap, Flame, Heart, Gem, Trophy, Target, Sparkles, ChevronRight,
  BookOpen, Star, Award, Rocket, TrendingUp
} from 'lucide-react';

/* ────────────────────────────────────────────
   Topic constellation config
   ──────────────────────────────────────────── */
const topicMeta = {
  electricity: {
    name: 'Điện học', icon: '⚡', emoji: '⚡',
    gradient: 'from-amber-400 to-yellow-500',
    bgGlow: 'rgba(251,191,36,0.12)',
    borderColor: 'border-amber-500/25',
    textColor: 'text-amber-400',
    ring: 'ring-amber-500/30',
  },
  mechanics: {
    name: 'Cơ học', icon: '🔧', emoji: '🔧',
    gradient: 'from-sky-400 to-blue-500',
    bgGlow: 'rgba(56,189,248,0.12)',
    borderColor: 'border-sky-500/25',
    textColor: 'text-sky-400',
    ring: 'ring-sky-500/30',
  },
  thermodynamics: {
    name: 'Nhiệt học', icon: '🌡️', emoji: '🌡️',
    gradient: 'from-red-400 to-rose-500',
    bgGlow: 'rgba(239,68,68,0.12)',
    borderColor: 'border-red-500/25',
    textColor: 'text-red-400',
    ring: 'ring-red-500/30',
  },
  electromagnetism: {
    name: 'Điện từ học', icon: '🧲', emoji: '🧲',
    gradient: 'from-pink-400 to-rose-500',
    bgGlow: 'rgba(244,63,94,0.12)',
    borderColor: 'border-pink-500/25',
    textColor: 'text-pink-400',
    ring: 'ring-pink-500/30',
  },
  optics: {
    name: 'Quang học', icon: '🌈', emoji: '🌈',
    gradient: 'from-purple-400 to-violet-500',
    bgGlow: 'rgba(168,85,247,0.12)',
    borderColor: 'border-purple-500/25',
    textColor: 'text-purple-400',
    ring: 'ring-purple-500/30',
  },
  waves: {
    name: 'Sóng', icon: '🌊', emoji: '🌊',
    gradient: 'from-cyan-400 to-teal-500',
    bgGlow: 'rgba(6,182,212,0.12)',
    borderColor: 'border-cyan-500/25',
    textColor: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
  },
  modern_physics: {
    name: 'Hạt nhân', icon: '⚛️', emoji: '⚛️',
    gradient: 'from-emerald-400 to-green-500',
    bgGlow: 'rgba(16,185,129,0.12)',
    borderColor: 'border-emerald-500/25',
    textColor: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
};

/* ────────────────────────────────────────────
   Helper: circular progress ring (SVG)
   ──────────────────────────────────────────── */
function ProgressRing({ progress, size = 88, stroke = 6, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#ringGradient)" strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   GALAXY HUB — Main component
   ════════════════════════════════════════════ */
export default function GalaxyHub() {
  const navigate = useNavigate();
  const {
    xp, streak, hearts, gems, level, levelProgress,
    nextLevelXp, currentLevelXp, completedLessons, unlockedLessons, unlockedBadges,
    username, avatarEmoji,
  } = useUser();

  /* ── Next suggested lesson ── */
  const nextLesson = useMemo(() => {
    if (!lessonsData || !lessonsData.lessons || !Array.isArray(unlockedLessons) || !Array.isArray(completedLessons)) return null;
    return lessonsData.lessons.find(
      l => unlockedLessons.includes(l.id) && !completedLessons.includes(l.id)
    );
  }, [unlockedLessons, completedLessons]);

  /* ── Per-topic stats ── */
  const topicStats = useMemo(() => {
    return Object.keys(topicMeta).map(topicId => {
      const topicLessons = (lessonsData?.lessons || []).filter(l => l.topic === topicId);
      const completed = topicLessons.filter(l => Array.isArray(completedLessons) && completedLessons.includes(l.id)).length;
      return { id: topicId, total: topicLessons.length, completed, ...topicMeta[topicId] };
    });
  }, [completedLessons]);

  /* ── Live daily quests ── */
  const dailyQuests = useMemo(() => [
    { id: 'dq_1', title: 'Hoàn thành 1 bài học', icon: '📚', progress: Math.min(completedLessons.length, 3), target: 3, reward: 30 },
    { id: 'dq_2', title: 'Tích lũy 500 XP', icon: '⭐', progress: Math.min(xp, 500), target: 500, reward: 50 },
    { id: 'dq_3', title: 'Duy trì streak 7 ngày', icon: '🔥', progress: Math.min(streak, 7), target: 7, reward: 25 },
  ], [completedLessons, xp, streak]);

  /* ── Recent achievements ── */
  const recentAchievements = useMemo(() => {
    if (!gameData || !gameData.achievements || !Array.isArray(unlockedBadges)) return [];
    return gameData.achievements
      .filter(a => unlockedBadges.includes(a.id))
      .slice(0, 4);
  }, [unlockedBadges]);

  /* ── Route map for navigation ── */
  const routeMap = {
    // Electricity
    intro_charge: '/lab/ohm', current_flow: '/lab/ohm', ohm_law: '/lab/ohm',
    simple_circuit: '/lab/circuit', series_circuit: '/lab/circuit', parallel_circuit: '/lab/circuit', short_circuit: '/lab/circuit',
    // Mechanics
    free_fall: '/lab/freefall', pendulum: '/lab/pendulum', inclined_plane: '/lab/incline', newton_laws: '/lab/incline',
    hooke_law: '/lab/hooke', projectile_motion: '/lab/projectile', collision_momentum: '/lab/collision', archimedes_force: '/lab/archimedes',
    // Optics
    mirror_reflection: '/lab/mirror', lens_refraction: '/lab/optics', prism_dispersion: '/lab/prism', young_interference: '/lab/young',
    // Electromagnetism
    faraday_magnetic: '/lab/faraday', rlc_circuit: '/lab/rlc',
    // Waves
    shm_oscillation: '/lab/shm',
    wave_generic: '/lab/wave',
    // Thermodynamics
    thermo_generic: '/lab/thermo',
    // Modern Physics
    nuclear_decay: '/lab/decay',
  };

  const handleStartNext = () => {
    if (!nextLesson) return;
    const route = routeMap[nextLesson.simulation.type] || `/simulation/${nextLesson.id}`;
    navigate(route);
  };

  const totalLessons = lessonsData?.lessons?.length || 0;
  const completedCount = Array.isArray(completedLessons) ? completedLessons.length : 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5 px-5 pt-5 pb-8"
    >
      {/* ───── 1. Hero Stats Card ───── */}
      <motion.div variants={staggerItem}>
        <GlassCard variant="frosted" className="relative overflow-hidden">
          {/* Decorative glow blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-5">
            {/* Level ring */}
            <ProgressRing progress={levelProgress} size={88} stroke={5}>
              <span className="text-2xl">{avatarEmoji}</span>
              <span className="text-[10px] font-extrabold text-amber-400 -mt-0.5">Lv.{level}</span>
            </ProgressRing>

            {/* Stats grid */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-white truncate mb-0.5">
                Xin chào, {username}! 👋
              </h2>
              <p className="text-[11px] font-semibold text-slate-400 mb-3">
                {xp} / {nextLevelXp} XP đến Level {level + 1}
              </p>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: <Star size={13} />, value: xp, label: 'XP', color: 'text-amber-400' },
                  { icon: <Flame size={13} />, value: streak, label: 'Streak', color: 'text-orange-400' },
                  { icon: <Heart size={13} />, value: hearts, label: 'Tim', color: 'text-rose-400' },
                  { icon: <Gem size={13} />, value: gems, label: 'Gem', color: 'text-cyan-400' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center bg-white/[0.03] rounded-xl py-2 px-1">
                    <span className={`${s.color} mb-0.5`}>{s.icon}</span>
                    <span className="text-sm font-extrabold text-white">{s.value}</span>
                    <span className="text-[9px] font-bold text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ───── 2. Next Lesson CTA ───── */}
      {nextLesson && (
        <motion.div variants={staggerItem}>
          <GlassCard
            variant="default"
            hoverable
            onClick={handleStartNext}
            className="relative overflow-hidden border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-orange-500/[0.06] cursor-pointer group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shrink-0"
              >
                {nextLesson.thumbnail}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket size={12} className="text-amber-400" />
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Tiếp tục học</span>
                </div>
                <h3 className="text-sm font-extrabold text-white truncate">{nextLesson.title}</h3>
                <p className="text-[11px] font-semibold text-slate-400 line-clamp-1 mt-0.5">{nextLesson.description}</p>
              </div>

              <motion.div
                className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} className="text-black" />
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ───── 3. Topic Constellation Map ───── */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-400" />
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">Bản đồ Chòm Sao</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {topicStats.map((topic, i) => {
            const pct = topic.total > 0 ? Math.round((topic.completed / topic.total) * 100) : 0;
            return (
              <motion.div
                key={topic.id}
                variants={staggerItem}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer"
              >
                <GlassCard
                  variant="default"
                  animated={false}
                  className={`relative overflow-hidden ${topic.borderColor} p-4 text-center`}
                  style={{ background: topic.bgGlow }}
                >
                  {/* Glow dot */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-30"
                    style={{ background: topic.bgGlow }}
                  />

                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 + i * 0.3, ease: 'easeInOut' }}
                    className="relative text-3xl mb-2"
                  >
                    {topic.emoji}
                  </motion.div>
                  <h4 className={`text-xs font-extrabold ${topic.textColor} mb-2`}>{topic.name}</h4>
                  <AnimatedProgressBar progress={pct} size="sm" color={topic.id === 'electricity' ? 'action' : topic.id === 'mechanics' ? 'info' : 'primary'} />
                  <p className="text-[10px] font-bold text-slate-500 mt-1.5">
                    {topic.completed}/{topic.total} bài
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ───── 4. Daily Quests (compact) ───── */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-emerald-400" />
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">Nhiệm vụ hôm nay</h3>
          </div>
          <span className="text-[10px] font-extrabold text-slate-500">
            {dailyQuests.filter(q => q.progress >= q.target).length}/{dailyQuests.length} ✓
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {dailyQuests.map(q => {
            const done = q.progress >= q.target;
            const pct = Math.min((q.progress / q.target) * 100, 100);
            return (
              <GlassCard
                key={q.id}
                variant="default"
                animated={false}
                className={`p-3.5 ${done ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold truncate ${done ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>
                        {q.title}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-500 shrink-0 ml-2">
                        {q.progress}/{q.target}
                      </span>
                    </div>
                    <AnimatedProgressBar progress={pct} size="sm" color={done ? 'success' : 'action'} shimmer={!done} />
                  </div>
                  <div className="bg-white/5 border border-white/5 px-2 py-1 rounded-lg text-[10px] font-extrabold text-slate-400 shrink-0">
                    +{q.reward}💎
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>

      {/* ───── 5. Overall Progress ───── */}
      <motion.div variants={staggerItem}>
        <GlassCard variant="default" className="border-sky-500/15 bg-gradient-to-br from-sky-500/[0.05] to-indigo-500/[0.05]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20 shrink-0">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-extrabold text-sky-300">Tổng tiến trình Vũ trụ</h4>
                <span className="text-xs font-extrabold text-sky-400">{overallProgress}%</span>
              </div>
              <AnimatedProgressBar progress={overallProgress} size="md" color="info" shimmer />
              <p className="text-[10px] font-semibold text-slate-500 mt-1.5">
                {completedCount} / {totalLessons} bài học · {unlockedBadges.length} huy hiệu
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ───── 6. Recent Achievements ───── */}
      {recentAchievements.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest">Thành tích gần đây</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {recentAchievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1.5 min-w-[80px] shrink-0"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/25 flex items-center justify-center text-2xl shadow-md">
                  {a.icon}
                </div>
                <span className="text-[10px] font-extrabold text-slate-300 text-center leading-tight">
                  {a.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ───── 7. Fun Fact Footer ───── */}
      <motion.div variants={staggerItem}>
        <GlassCard variant="default" className="border-violet-500/15 bg-gradient-to-r from-violet-500/[0.05] to-pink-500/[0.05]">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-2xl shrink-0"
            >
              💡
            </motion.div>
            <div>
              <h4 className="text-[11px] font-extrabold text-violet-300 mb-1">Bạn có biết?</h4>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                Ánh sáng mặt trời mất khoảng 8 phút 20 giây để đi từ Mặt Trời đến Trái Đất — 
                tức là khi bạn nhìn thấy mặt trời, bạn đang thấy nó ở 8 phút trước! ☀️
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
