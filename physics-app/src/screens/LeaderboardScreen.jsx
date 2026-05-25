import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Avatar } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import { useUser } from '../context/UserContext';
import gameData from '../data/gameData.json';

export default function LeaderboardScreen() {
  const { username, avatarEmoji, xp } = useUser();
  const [tab, setTab] = useState('week');
  const tabs = [
    { id: 'week', label: 'Tuần' },
    { id: 'month', label: 'Tháng' },
    { id: 'all', label: 'Tất cả' },
  ];

  // Insert current user into leaderboard
  const board = [...gameData.leaderboard];
  const userEntry = { rank: 0, name: username, emoji: avatarEmoji, xp, level: Math.max(1, Math.floor(Math.sqrt(xp/100))), streak: 12, isMe: true };
  const userRank = board.filter(u => u.xp > xp).length + 1;
  userEntry.rank = userRank;

  // Top 3
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  const podiumOrder = [1, 0, 2]; // silver, gold, bronze positioning
  const podiumHeight = ['h-20', 'h-28', 'h-16'];
  const podiumColor = ['from-slate-300 to-slate-400', 'from-amber-300 to-amber-500', 'from-orange-300 to-orange-400'];
  const podiumLabel = ['🥈', '🥇', '🥉'];

  return (
    <div className="p-5 pb-8">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">🏆 Bảng xếp hạng</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${tab===t.id?'bg-white text-slate-800 shadow-sm':'text-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-6 px-4">
        {podiumOrder.map((idx, pos) => {
          const user = top3[idx];
          if (!user) return null;
          return (
            <motion.div key={idx} initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:pos*0.15,type:'spring',stiffness:300,damping:20}}
              className="flex flex-col items-center flex-1">
              <Avatar size={pos===1?'lg':'md'} emoji={user.emoji} level={user.level} ringColor={pos===1?'primary':'action'} />
              <span className="font-extrabold text-slate-700 text-xs mt-2 truncate max-w-full">{user.name}</span>
              <span className="text-xs font-bold text-slate-400">{user.xp} XP</span>
              <div className={`w-full ${podiumHeight[pos]} bg-gradient-to-t ${podiumColor[pos]} rounded-t-2xl mt-2 flex items-start justify-center pt-2`}>
                <span className="text-2xl">{podiumLabel[pos]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2">
        {rest.map(user => (
          <motion.div key={user.rank} variants={staggerItem}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${user.rank===userRank?'bg-primary/5 border-primary/20':'bg-white border-slate-100'}`}>
              <span className="w-8 text-center font-extrabold text-slate-400 text-sm">{user.rank}</span>
              <Avatar size="sm" emoji={user.emoji} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-700 text-sm truncate block">{user.name}</span>
                <span className="text-xs text-slate-400 font-semibold">Level {user.level}</span>
              </div>
              <span className="font-extrabold text-amber-500 text-sm">{user.xp} XP</span>
            </div>
          </motion.div>
        ))}

        {/* Current user row */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-primary/10 border-primary/30">
            <span className="w-8 text-center font-extrabold text-primary text-sm">{userRank}</span>
            <Avatar size="sm" emoji={avatarEmoji} ringColor="primary" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-primary text-sm">Bạn ({username})</span>
            </div>
            <span className="font-extrabold text-amber-500 text-sm">{xp} XP</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
