import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedProgressBar } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import { useUser } from '../context/UserContext';
import { Gift, Calendar, CheckCircle } from 'lucide-react';

export default function MissionsScreen() {
  const { streak, xp, completedLessons } = useUser();
  const today = new Date();
  const days = ['CN','T2','T3','T4','T5','T6','T7'];
  const cal = Array.from({length:7},(_,i)=>{
    const d=new Date(today); d.setDate(d.getDate()-(6-i));
    return {label:days[d.getDay()], day:d.getDate(), done:i<5, isToday:i===6};
  });

  const completedCount = Array.isArray(completedLessons) ? completedLessons.length : 0;

  // Calculate live quests based on safe UserContext states
  const liveQuests = [
    { id: 'dq_1', title: 'Mở khóa 3 bài học vật lý', icon: '📚', progress: Math.min(completedCount, 3), target: 3, reward: 30 },
    { id: 'dq_2', title: 'Tích lũy 500 XP', icon: '⭐', progress: Math.min(xp || 0, 500), target: 500, reward: 50 },
    { id: 'dq_3', title: 'Duy trì chuỗi học tập (Streak)', icon: '🔥', progress: Math.min(streak || 0, 15), target: 15, reward: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">🎯 Nhiệm vụ</h1>
        <p className="text-slate-400 font-semibold text-xs mt-1">Hoàn thành nhiệm vụ nhận ngay năng lượng!</p>
      </div>

      <GlassCard variant="default" className="mb-6 border-white/5 bg-[#0F172A]/70 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-amber-500" />
            <span className="font-extrabold text-sm text-slate-200">Chuỗi ngày học</span>
          </div>
          <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-xl font-extrabold text-xs border border-amber-500/20">
            🔥 {streak} ngày
          </div>
        </div>
        <div className="flex justify-between gap-1 overflow-x-auto py-1">
          {cal.map((c,i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 min-w-[40px]">
              <span className="text-[10px] font-bold text-slate-500">{c.label}</span>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.05,type:'spring',stiffness:400,damping:15}}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs ${c.isToday?'bg-amber-500 text-black shadow-md ring-2 ring-amber-500/30':c.done?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30':'bg-white/5 text-slate-500 border border-white/5'}`}>
                {c.done && !c.isToday ? <CheckCircle size={16}/> : c.day}
              </motion.div>
            </div>
          ))}
        </div>
      </GlassCard>

      <h2 className="font-extrabold text-slate-300 text-sm mb-4 flex items-center gap-2 uppercase tracking-widest">
        <Gift size={18} className="text-sky-400" /> Nhiệm vụ hàng ngày
      </h2>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-3 mb-6">
        {liveQuests.map(q => {
          const done = q.progress >= q.target;
          return (
            <motion.div key={q.id} variants={staggerItem}>
              <GlassCard variant="default" className={`border-white/5 bg-[#0F172A]/70 ${done ? 'border-emerald-500/20 bg-emerald-500/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl shrink-0">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-bold text-xs truncate ${done?'text-emerald-400 line-through':'text-slate-200'}`}>{q.title}</span>
                      <span className="text-[10px] font-extrabold text-slate-500">{q.progress}/{q.target}</span>
                    </div>
                    <AnimatedProgressBar progress={(q.progress/q.target)*100} size="sm" color={done?'success':'action'} shimmer={!done} />
                  </div>
                  <div className="bg-white/5 text-slate-400 border border-white/5 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0">+{q.reward}💎</div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      <GlassCard variant="default" className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-violet-500/5 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-xl shadow-md shrink-0">🏆</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-purple-300 text-sm mb-1 truncate">Thử thách tuần</h3>
            <p className="text-purple-400 font-semibold text-xs mb-3">Hoàn thành 5 bài học tuần này → 200 XP + 50 💎</p>
            <AnimatedProgressBar progress={Math.min((completedCount/5)*100, 100)} size="sm" color="primary" showLabel />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
