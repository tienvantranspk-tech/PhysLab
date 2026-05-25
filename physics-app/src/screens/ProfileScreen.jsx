import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Badge, GlassCard, AnimatedProgressBar } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import { useUser } from '../context/UserContext';
import { Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gameData from '../data/gameData.json';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { username, avatarEmoji, xp, streak, level, levelProgress, completedLessons, unlockedBadges } = useUser();

  const stats = [
    { label: 'Tổng XP', value: xp, icon: '⭐', color: 'text-amber-500' },
    { label: 'Cấp độ', value: level, icon: '🎖️', color: 'text-sky-500' },
    { label: 'Streak', value: `${streak} ngày`, icon: '🔥', color: 'text-orange-500' },
    { label: 'Bài học', value: completedLessons.length, icon: '📚', color: 'text-green-500' },
  ];

  return (
    <div className="p-5 pb-8">
      {/* Profile Header */}
      <GlassCard variant="solid" className="mb-5 text-center">
        <div className="flex justify-end -mt-1 -mr-1 mb-2">
          <button onClick={() => navigate('/settings')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center -mt-2">
          <Avatar size="xl" emoji={avatarEmoji} level={level} ringColor="primary" />
          <h2 className="text-xl font-extrabold text-slate-800 mt-3">{username}</h2>
          <p className="text-slate-400 font-bold text-sm">Lớp 7 · Nhà khoa học nhí</p>

          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <AnimatedProgressBar progress={levelProgress} size="md" color="action" shimmer />
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(s => (
          <motion.div key={s.label} variants={staggerItem}>
            <GlassCard variant="solid" className="text-center py-4">
              <span className="text-2xl">{s.icon}</span>
              <div className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Badges */}
      <div className="mb-5">
        <h2 className="font-extrabold text-slate-700 text-lg mb-3">🏆 Huy hiệu</h2>
        <GlassCard variant="solid">
          <div className="grid grid-cols-4 gap-3">
            {gameData.achievements.slice(0, 8).map(a => (
              <Badge key={a.id} icon={a.icon} label={a.name} unlocked={unlockedBadges.includes(a.id)} size="sm" />
            ))}
          </div>
          <button className="w-full mt-4 text-center text-action font-bold text-sm flex items-center justify-center gap-1">
            Xem tất cả <ChevronRight size={16} />
          </button>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-extrabold text-slate-700 text-lg mb-3">📋 Hoạt động gần đây</h2>
        <div className="flex flex-col gap-2">
          {[
            { text: 'Hoàn thành "Dòng điện"', time: '2 giờ trước', icon: '✅' },
            { text: 'Đạt huy hiệu "Bước đầu tiên"', time: '2 giờ trước', icon: '🏆' },
            { text: 'Streak 12 ngày!', time: 'Hôm nay', icon: '🔥' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 py-3">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <span className="font-bold text-slate-700 text-sm">{item.text}</span>
                <span className="text-xs text-slate-400 ml-2">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
