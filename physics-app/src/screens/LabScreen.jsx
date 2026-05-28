import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard, ChunkyButton } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';

const labs = [
  { id: 'freefall', name: 'Rơi tự do', icon: '🍎', desc: 'Thả vật, đồ thị v-t, so sánh hành tinh', color: 'from-amber-400 to-orange-500', route: '/lab/freefall' },
  { id: 'pendulum', name: 'Con lắc đơn', icon: '🕰️', desc: 'Dao động sin, thay đổi dây & góc', color: 'from-sky-400 to-blue-500', route: '/lab/pendulum' },
  { id: 'prism', name: 'Tán sắc ánh sáng', icon: '🌈', desc: 'Lăng kính tách 7 màu cầu vồng', color: 'from-purple-400 to-violet-500', route: '/lab/prism' },
  { id: 'mirror', name: 'Gương phẳng', icon: '🪞', desc: 'Phản xạ ánh sáng, góc tới = phản xạ', color: 'from-slate-400 to-slate-500', route: '/lab/mirror' },
  { id: 'ohm', name: 'Định luật Ohm', icon: '⚡', desc: 'Electron chạy trong mạch, đồ thị V-I', color: 'from-amber-400 to-yellow-500', route: '/lab/ohm' },
  { id: 'incline', name: 'Mặt phẳng nghiêng', icon: '📐', desc: 'Phân tích lực, thay đổi góc & ma sát', color: 'from-green-400 to-emerald-500', route: '/lab/incline' },
  { id: 'circuit', name: 'Mạch điện kéo thả', icon: '🔌', desc: 'Tự lắp mạch PIN, đèn, khóa K, ampe kế', color: 'from-yellow-400 to-amber-500', route: '/lab/circuit', badge: 'Hot' },
  { id: 'optics', name: 'Quang học kéo thả', icon: '🔍', desc: 'Kéo thả vật sáng, gương phẳng, thấu kính', color: 'from-indigo-400 to-purple-500', route: '/lab/optics', badge: 'Hot' },
  { id: 'hooke', name: 'Lực đàn hồi (Hooke)', icon: '➰', desc: 'Kéo lò xo, treo tạ vật lý, vẽ đồ thị F-x', color: 'from-teal-400 to-emerald-500', route: '/lab/hooke' },
  { id: 'projectile', name: 'Ném xiên Parabol', icon: '🚀', desc: 'Chỉnh góc bắn cannon bay vút, vẽ quỹ đạo', color: 'from-red-400 to-orange-500', route: '/lab/projectile' },
  { id: 'collision', name: 'Va chạm động lực học', icon: '💥', desc: 'Bảo toàn động lượng, va chạm đàn hồi/mềm', color: 'from-sky-400 to-blue-500', route: '/lab/collision' },
  { id: 'archimedes', name: 'Lực đẩy Archimedes', icon: '🐳', desc: 'Nhúng khối chìm/nổi, nâng mực nước, tính lực', color: 'from-blue-400 to-indigo-500', route: '/lab/archimedes' },
  { id: 'faraday', name: 'Cảm ứng Faraday', icon: '🧲', desc: 'Di chuyển nam châm qua cuộn cảm phát điện', color: 'from-pink-400 to-rose-500', route: '/lab/faraday', badge: 'Mới' },
  { id: 'rlc', name: 'Mạch xoay chiều RLC', icon: '📈', desc: 'Quét tần số cộng hưởng, vẽ sóng dao động', color: 'from-purple-500 to-violet-600', route: '/lab/rlc' },
  { id: 'shm', name: 'Dao động điều hòa', icon: '⏱️', desc: 'Con lắc lò xo x(t), v(t), a(t) hình sin', color: 'from-amber-500 to-yellow-600', route: '/lab/shm' },
  { id: 'young', name: 'Giao thoa sóng Young', icon: '🌈', desc: 'Khe sáng hẹp tạo hệ vân sáng tối đa sắc', color: 'from-emerald-400 to-teal-500', route: '/lab/young' },
  { id: 'decay', name: 'Phân rã phóng xạ', icon: '☢️', desc: 'Động học phân rã hạt nhân theo chu kỳ bán rã', color: 'from-rose-500 to-red-600', route: '/lab/decay' }
];

export default function LabScreen() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen"
    >
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
    </motion.div>
  );
}
