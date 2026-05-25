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
    { id: 'week', label: 'Tuần này' },
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
  const podiumHeight = ['h-16', 'h-24', 'h-12'];
  const podiumColor = ['from-slate-500/20 to-slate-400/30 border border-slate-500/30', 'from-amber-500/20 to-amber-400/30 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]', 'from-orange-500/20 to-orange-400/30 border border-orange-500/30'];
  const podiumLabel = ['🥈', '🥇', '🥉'];

  return (
    <div className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">🏆 Bảng xếp hạng</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-6 bg-white/5 border border-white/5 p-1 rounded-2xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all uppercase tracking-wider cursor-pointer ${tab===t.id?'bg-[#0F172A] text-amber-400 shadow-sm border border-white/5':'text-slate-500 hover:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-6 px-4 py-2 bg-[#0F172A]/30 border border-white/5 rounded-3xl">
        {podiumOrder.map((idx, pos) => {
          const user = top3[idx];
          if (!user) return null;
          return (
            <motion.div key={idx} initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:pos*0.15,type:'spring',stiffness:300,damping:20}}
              className="flex flex-col items-center flex-1 min-w-0">
              <Avatar size={pos===1?'lg':'md'} emoji={user.emoji} level={user.level} ringColor={pos===1?'primary':'action'} />
              <span className="font-extrabold text-slate-200 text-xs mt-2 truncate max-w-full">{user.name}</span>
              <span className="text-[10px] font-bold text-slate-500">{user.xp} XP</span>
              <div className={`w-full ${podiumHeight[pos]} bg-gradient-to-t ${podiumColor[pos]} rounded-t-2xl mt-3.5 flex items-start justify-center pt-2`}>
                <span className="text-xl">{podiumLabel[pos]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2.5">
        {rest.map(user => (
          <motion.div key={user.rank} variants={staggerItem}>
            <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 transition-all ${user.rank===userRank?'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]':'bg-[#0F172A]/70 border-white/5'}`}>
              <span className="w-6 text-center font-extrabold text-slate-500 text-xs">{user.rank}</span>
              <Avatar size="sm" emoji={user.emoji} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-200 text-xs truncate block">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mt-0.5">Level {user.level}</span>
              </div>
              <span className="font-extrabold text-amber-400 text-xs shrink-0">{user.xp} XP</span>
            </div>
          </motion.div>
        ))}

        {/* Current user row */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="w-6 text-center font-extrabold text-amber-400 text-xs">{userRank}</span>
            <Avatar size="sm" emoji={avatarEmoji} ringColor="primary" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-amber-400 text-xs truncate block">Bạn ({username})</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">Level {Math.max(1, Math.floor(Math.sqrt(xp/100)))}</span>
            </div>
            <span className="font-extrabold text-amber-400 text-xs shrink-0">{xp} XP</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
