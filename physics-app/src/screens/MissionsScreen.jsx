import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedProgressBar, ChunkyButton } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import { useUser } from '../context/UserContext';
import { Gift, Calendar, CheckCircle } from 'lucide-react';

const mockQuests = [
  { id: 'dq_1', title: 'Hoàn thành 1 bài học', icon: '📚', progress: 0, target: 1, reward: 30 },
  { id: 'dq_2', title: 'Đạt 100 XP', icon: '⭐', progress: 45, target: 100, reward: 20 },
  { id: 'dq_3', title: 'Trả lời đúng 5 câu quiz', icon: '✅', progress: 3, target: 5, reward: 25 },
];

export default function MissionsScreen() {
  const { streak } = useUser();
  const today = new Date();
  const days = ['CN','T2','T3','T4','T5','T6','T7'];
  const cal = Array.from({length:7},(_,i)=>{
    const d=new Date(today); d.setDate(d.getDate()-(6-i));
    return {label:days[d.getDay()], day:d.getDate(), done:i<5, isToday:i===6};
  });

  return (
    <div className="p-5 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">🎯 Nhiệm vụ</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">Hoàn thành nhiệm vụ để nhận thưởng!</p>
      </div>

      <GlassCard variant="solid" className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            <span className="font-extrabold text-slate-800">Chuỗi ngày học</span>
          </div>
          <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl font-extrabold text-sm border border-orange-200">
            🔥 {streak} ngày
          </div>
        </div>
        <div className="flex justify-between gap-1">
          {cal.map((c,i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400">{c.label}</span>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.05,type:'spring',stiffness:400,damping:15}}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${c.isToday?'bg-primary text-white ring-2 ring-primary/30 ring-offset-2':c.done?'bg-success/10 text-success border-2 border-success/30':'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
                {c.done && !c.isToday ? <CheckCircle size={18}/> : c.day}
              </motion.div>
            </div>
          ))}
        </div>
      </GlassCard>

      <h2 className="font-extrabold text-slate-700 text-lg mb-3 flex items-center gap-2">
        <Gift size={20} className="text-action" /> Nhiệm vụ hàng ngày
      </h2>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-3 mb-5">
        {mockQuests.map(q => {
          const done = q.progress >= q.target;
          return (
            <motion.div key={q.id} variants={staggerItem}>
              <GlassCard variant="solid" className={done?'border-success/30 bg-green-50/50':''}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{q.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-bold text-sm ${done?'text-success line-through':'text-slate-700'}`}>{q.title}</span>
                      <span className="text-xs font-extrabold text-slate-400">{q.progress}/{q.target}</span>
                    </div>
                    <AnimatedProgressBar progress={(q.progress/q.target)*100} size="sm" color={done?'success':'action'} shimmer={!done} />
                  </div>
                  <div className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-extrabold">+{q.reward}💎</div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      <GlassCard variant="solid" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0">🏆</div>
          <div className="flex-1">
            <h3 className="font-extrabold text-purple-800 text-base mb-1">Thử thách tuần</h3>
            <p className="text-purple-600 font-semibold text-sm mb-3">Hoàn thành 5 bài học tuần này → 200 XP + 50 💎</p>
            <AnimatedProgressBar progress={40} size="sm" color="primary" showLabel />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
