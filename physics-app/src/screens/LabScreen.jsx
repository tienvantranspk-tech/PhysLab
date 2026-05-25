import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard, ChunkyButton } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';

const labs = [
  { id: 'freefall', name: 'Rơi tự do', icon: '🍎', desc: 'Thả vật, đồ thị v-t, so sánh hành tinh', color: 'from-amber-400 to-orange-500', route: '/lab/freefall' },
  { id: 'pendulum', name: 'Con lắc đơn', icon: '🕰️', desc: 'Dao động sin, thay đổi dây & góc', color: 'from-sky-400 to-blue-500', route: '/lab/pendulum' },
  { id: 'prism', name: 'Tán sắc ánh sáng', icon: '🌈', desc: 'Lăng kính tách 7 màu cầu vồng', color: 'from-purple-400 to-violet-500', route: '/lab/prism', badge: 'Hot' },
  { id: 'mirror', name: 'Gương phẳng', icon: '🪞', desc: 'Phản xạ ánh sáng, góc tới = phản xạ', color: 'from-slate-400 to-slate-500', route: '/lab/mirror' },
  { id: 'ohm', name: 'Định luật Ohm', icon: '⚡', desc: 'Electron chạy trong mạch, đồ thị V-I', color: 'from-amber-400 to-yellow-500', route: '/lab/ohm', badge: 'Mới' },
  { id: 'incline', name: 'Mặt phẳng nghiêng', icon: '📐', desc: 'Phân tích lực, thay đổi góc & ma sát', color: 'from-green-400 to-emerald-500', route: '/lab/incline' },
];

export default function LabScreen() {
  const navigate = useNavigate();

  return (
    <div className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">🧪 Phòng thí nghiệm</h1>
        <p className="text-slate-400 font-semibold text-xs mt-1">Tự do khám phá — không giới hạn!</p>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <motion.div key={lab.id} variants={staggerItem}>
            <GlassCard variant="default" hoverable className="relative overflow-hidden border-white/5 bg-[#0F172A]/70 shadow-xl">
              {lab.badge && (
                <div className="absolute top-3 right-3 bg-danger text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {lab.badge}
                </div>
              )}
              <div className="flex gap-4 items-start">
                <div className={`w-14 h-14 bg-gradient-to-br ${lab.color} rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0`}>
                  {lab.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-200 text-base">{lab.name}</h3>
                  <p className="text-slate-400 font-semibold text-xs mt-1 leading-relaxed">{lab.desc}</p>
                </div>
              </div>
              <div className="mt-4">
                <ChunkyButton variant="action" size="sm" fullWidth icon="🔬" onClick={() => navigate(lab.route)}>
                  Vào phòng Lab
                </ChunkyButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 bg-[#0F172A]/40 border border-white/5 rounded-3xl p-4 flex gap-3.5 items-start">
        <span className="text-2xl">💡</span>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed">
          Chế độ Lab cho phép em tự do thí nghiệm mà không bị giới hạn. Mỗi lab có dark mode, đồ thị real-time, và công thức live!
        </p>
      </div>
    </div>
  );
}
