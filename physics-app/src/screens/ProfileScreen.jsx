import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Badge, GlassCard, AnimatedProgressBar } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import { useUser } from '../context/UserContext';
import { Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gameData from '../data/gameData.json';
import lessonsData from '../data/lessons.json';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { username, avatarEmoji, xp, streak, level, levelProgress, completedLessons, unlockedBadges } = useUser();

  const completedCount = Array.isArray(completedLessons) ? completedLessons.length : 0;

  const stats = [
    { label: 'Tổng XP', value: xp, icon: '⭐', color: 'text-amber-400' },
    { label: 'Cấp độ', value: level, icon: '🎖️', color: 'text-sky-400' },
    { label: 'Streak', value: `${streak} ngày`, icon: '🔥', color: 'text-orange-400' },
    { label: 'Bài học', value: completedCount, icon: '📚', color: 'text-emerald-400' },
  ];

  // Generate live activity logs based on real user progression
  const liveActivities = [];
  
  if (Array.isArray(completedLessons)) {
    completedLessons.forEach(lessonId => {
      const lesson = lessonsData?.lessons?.find(l => l.id === lessonId);
      if (lesson) {
        liveActivities.push({
          text: `Hoàn thành bài học "${lesson.title}"`,
          time: 'Gần đây',
          icon: '✅'
        });
      }
    });
  }

  if (Array.isArray(unlockedBadges)) {
    unlockedBadges.forEach(badgeId => {
      const badge = gameData?.achievements?.find(a => a.id === badgeId);
      if (badge) {
        liveActivities.push({
          text: `Nhận huy hiệu "${badge.name}"`,
          time: 'Đã nhận',
          icon: '🏆'
        });
      }
    });
  }

  if (streak > 0) {
    liveActivities.push({
      text: `Duy trì streak liên tiếp ${streak} ngày!`,
      time: 'Hôm nay',
      icon: '🔥'
    });
  }

  // Fallback
  if (liveActivities.length === 0) {
    liveActivities.push({
      text: 'Chưa có hoạt động học tập nào. Hãy bắt đầu ngay!',
      time: 'Bây giờ',
      icon: '✨'
    });
  }

  // Limit to 4 recent activities
  const displayActivities = liveActivities.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen"
    >
      {/* Profile Header */}
      <GlassCard variant="default" className="mb-6 text-center border-white/5 bg-[#0F172A]/70 shadow-xl relative">
        <div className="absolute top-4 right-4">
          <button onClick={() => navigate('/settings')} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <Settings size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center py-2">
          <Avatar size="xl" emoji={avatarEmoji} level={level} ringColor="primary" />
          <h2 className="text-xl font-extrabold text-white mt-4">{username}</h2>
          <p className="text-slate-400 font-bold text-xs mt-0.5">Lớp 7 · Nhà khoa học nhí 🔬</p>

          <div className="w-full max-w-xs mt-5">
            <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <AnimatedProgressBar progress={levelProgress} size="md" color="action" shimmer />
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(s => (
          <motion.div key={s.label} variants={staggerItem}>
            <GlassCard variant="default" className="text-center py-4 border-white/5 bg-[#0F172A]/70 shadow-xl">
              <span className="text-2xl">{s.icon}</span>
              <div className={`text-2xl font-extrabold mt-1.5 ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Badges */}
      <div className="mb-6">
        <h2 className="font-extrabold text-slate-300 text-sm mb-4 uppercase tracking-widest">🏆 Huy hiệu đạt được</h2>
        <GlassCard variant="default" className="border-white/5 bg-[#0F172A]/70 shadow-xl">
          <div className="grid grid-cols-4 gap-3">
            {gameData.achievements.slice(0, 8).map(a => (
              <Badge key={a.id} icon={a.icon} label={a.name} unlocked={Array.isArray(unlockedBadges) && unlockedBadges.includes(a.id)} size="sm" />
            ))}
          </div>
          <button className="w-full mt-5 text-center text-action font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-1 hover:text-[#38BDF8] transition-colors cursor-pointer">
            Xem tất cả <ChevronRight size={14} />
          </button>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-extrabold text-slate-300 text-sm mb-4 uppercase tracking-widest">📋 Nhật ký hoạt động</h2>
        <div className="flex flex-col gap-2.5">
          {displayActivities.map((item, i) => (
            <div key={i} className="flex items-center gap-3.5 bg-[#0F172A]/60 border border-white/5 rounded-2xl px-4 py-3.5 shadow-sm">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-200 text-xs truncate block">{item.text}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
