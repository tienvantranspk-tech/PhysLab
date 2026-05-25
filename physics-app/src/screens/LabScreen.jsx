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
    <div className="p-5 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">🧪 Phòng thí nghiệm</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">Tự do khám phá — không giới hạn!</p>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <motion.div key={lab.id} variants={staggerItem}>
            <GlassCard variant="solid" hoverable className="relative overflow-hidden">
              {lab.badge && (
                <div className="absolute top-3 right-3 bg-danger text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {lab.badge}
                </div>
              )}
              <div className="flex gap-4 items-start">
                <div className={`w-14 h-14 bg-gradient-to-br ${lab.color} rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0`}>
                  {lab.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-800 text-base">{lab.name}</h3>
                  <p className="text-slate-500 font-semibold text-xs mt-0.5 leading-relaxed">{lab.desc}</p>
                </div>
              </div>
              <div className="mt-3">
                <ChunkyButton variant="action" size="sm" fullWidth icon="🔬" onClick={() => navigate(lab.route)}>
                  Vào phòng Lab
                </ChunkyButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-2xl">💡</span>
        <p className="text-sm font-semibold text-sky-700 leading-relaxed">
          Chế độ Lab cho phép em tự do thí nghiệm mà không bị giới hạn. Mỗi lab có dark mode, đồ thị real-time, và công thức live!
        </p>
      </div>
    </div>
  );
}
