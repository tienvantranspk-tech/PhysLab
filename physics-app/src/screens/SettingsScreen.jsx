import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, ChunkyButton } from '../components/common';
import { useUser } from '../context/UserContext';
import { Volume2, VolumeX, Vibrate, Moon, Trash2, ChevronRight, Info } from 'lucide-react';

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-slate-500" />
        <span className="font-bold text-slate-700 text-sm">{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-colors relative ${value ? 'bg-success' : 'bg-slate-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${value ? 'left-6' : 'left-1'}`} />
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
    <div className="p-5 pb-8">
      <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6">⚙️ Cài đặt</h1>

      {/* Grade */}
      <GlassCard variant="solid" className="mb-4">
        <h3 className="font-extrabold text-slate-700 text-sm mb-3">Lớp học</h3>
        <div className="grid grid-cols-4 gap-2">
          {[6,7,8,9].map(g => (
            <button key={g} onClick={() => setGrade(g)}
              className={`py-2.5 rounded-xl font-extrabold text-sm border-2 transition-all ${grade===g?'bg-primary text-white border-primary':'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/30'}`}>
              Lớp {g}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Toggles */}
      <GlassCard variant="solid" className="mb-4">
        <ToggleRow icon={soundEnabled ? Volume2 : VolumeX} label="Âm thanh" value={soundEnabled} onChange={setSoundEnabled} />
        <div className="border-t border-slate-100" />
        <ToggleRow icon={Vibrate} label="Rung phản hồi" value={hapticEnabled} onChange={setHapticEnabled} />
        <div className="border-t border-slate-100" />
        <ToggleRow icon={Moon} label="Chế độ tối" value={false} onChange={() => {}} />
      </GlassCard>

      {/* App Info */}
      <GlassCard variant="solid" className="mb-4">
        <div className="flex items-center gap-3 py-1">
          <Info size={20} className="text-slate-500" />
          <div className="flex-1">
            <span className="font-bold text-slate-700 text-sm">Phiên bản</span>
          </div>
          <span className="text-sm font-semibold text-slate-400">1.0.0 Beta</span>
        </div>
      </GlassCard>

      {/* Reset */}
      <ChunkyButton variant="danger" size="md" fullWidth icon="🗑️" onClick={handleReset}>
        XÓA TIẾN TRÌNH
      </ChunkyButton>
    </div>
  );
}
