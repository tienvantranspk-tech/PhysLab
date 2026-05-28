import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, ChunkyButton } from '../components/common';
import { useUser } from '../context/UserContext';
import { Volume2, VolumeX, Vibrate, Moon, Trash2, ChevronRight, Info, AlertTriangle } from 'lucide-react';

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-slate-400" />
        <span className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${value ? 'bg-emerald-500' : 'bg-slate-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-all ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { grade, setGrade, soundEnabled, setSoundEnabled, hapticEnabled, setHapticEnabled, resetProgress } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmReset = () => {
    resetProgress();
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <div className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen relative">
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">⚙️ Cài đặt</h1>

      {/* Grade */}
      <GlassCard variant="default" className="mb-5 border-white/5 bg-[#0F172A]/70 shadow-xl">
        <h3 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-widest mb-4">Lớp học hiện tại</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {[6, 7, 8, 9].map(g => (
            <button key={g} onClick={() => setGrade(g)}
              className={`py-3 rounded-2xl font-extrabold text-xs transition-all border cursor-pointer ${grade === g ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}>
              Lớp {g}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Toggles */}
      <GlassCard variant="default" className="mb-5 border-white/5 bg-[#0F172A]/70 shadow-xl">
        <ToggleRow icon={soundEnabled ? Volume2 : VolumeX} label="Âm thanh" value={soundEnabled} onChange={setSoundEnabled} />
        <div className="border-t border-white/5" />
        <ToggleRow icon={Vibrate} label="Rung phản hồi" value={hapticEnabled} onChange={setHapticEnabled} />
        <div className="border-t border-white/5" />
        <ToggleRow icon={Moon} label="Chế độ tối" value={true} onChange={() => {}} />
      </GlassCard>

      {/* App Info */}
      <GlassCard variant="default" className="mb-6 border-white/5 bg-[#0F172A]/70 shadow-xl">
        <div className="flex items-center gap-3 py-1">
          <Info size={20} className="text-slate-400" />
          <div className="flex-1">
            <span className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">Phiên bản</span>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-xl">1.0.0 Beta</span>
        </div>
      </GlassCard>

      {/* Reset */}
      <ChunkyButton variant="danger" size="md" fullWidth icon="🗑️" onClick={() => setShowConfirm(true)} className="shadow-lg shadow-danger-shadow/20">
        XÓA TIẾN TRÌNH
      </ChunkyButton>

      {/* ─── CUSTOM GLASSMORPHISM CONFIRM MODAL ─── */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-sm w-full bg-[#0F172A]/90 border border-red-500/25 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-md"
            >
              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                  <AlertTriangle size={28} />
                </div>

                <h3 className="text-base font-extrabold text-white mb-2">Xác nhận xóa tiến trình</h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn xóa toàn bộ tiến trình học tập? Hành động này sẽ đặt lại toàn bộ cấp độ, XP, streak, và bài học đã mở khóa. Hành động này **không thể hoàn tác**!
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={confirmReset}
                    className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
                  >
                    XÓA VĨNH VIỄN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
