import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, ChunkyButton } from '../components/common';
import { useUser } from '../context/UserContext';
import { Volume2, VolumeX, Vibrate, Moon, Trash2, ChevronRight, Info } from 'lucide-react';

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

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình? Hành động này không thể hoàn tác!')) {
      resetProgress();
      navigate('/');
    }
  };

  return (
    <div className="p-5 pb-24 bg-[#0B1120] text-slate-100 min-h-screen">
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">⚙️ Cài đặt</h1>

      {/* Grade */}
      <GlassCard variant="default" className="mb-5 border-white/5 bg-[#0F172A]/70 shadow-xl">
        <h3 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-widest mb-4">Lớp học hiện tại</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {[6,7,8,9].map(g => (
            <button key={g} onClick={() => setGrade(g)}
              className={`py-3 rounded-2xl font-extrabold text-xs transition-all border cursor-pointer ${grade===g?'bg-primary text-black border-primary shadow-lg shadow-primary/20':'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}>
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
      <ChunkyButton variant="danger" size="md" fullWidth icon="🗑️" onClick={handleReset} className="shadow-lg shadow-danger-shadow/20">
        XÓA TIẾN TRÌNH
      </ChunkyButton>
    </div>
  );
}
