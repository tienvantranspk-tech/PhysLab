import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Play, Pause, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LabQuizChallenge from '../components/LabQuizChallenge';
import TheoryCardModal from '../components/TheoryCardModal';

/* ════════════════════════════════════════════
   WaveLab — Interactive Sound Waves Lab
   Topics: Sound waves, frequency, amplitude, medium propagation
   ════════════════════════════════════════════ */

// Animated wave visualization
function WaveCanvas({ frequency, amplitude, medium, isPlaying }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  const mediumSpeed = { air: 1, water: 4.3, steel: 15 };
  const speed = mediumSpeed[medium] || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(148,163,184,0.1)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); stroke();
      }
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); stroke();
      }

      function stroke() {
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      ctx.setLineDash([]);

      // Wave
      if (isPlaying) timeRef.current += 0.03 * speed;

      const waveColor = medium === 'air' ? '#38BDF8' : medium === 'water' ? '#06B6D4' : '#F59E0B';
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const normalizedX = x / w;
        const y = h / 2 + Math.sin(normalizedX * Math.PI * 2 * frequency - timeRef.current) * amplitude * (h / 3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particle dots along the wave
      if (isPlaying) {
        ctx.fillStyle = waveColor;
        for (let i = 0; i < frequency * 2; i++) {
          const px = (i / (frequency * 2)) * w;
          const normalizedPx = px / w;
          const py = h / 2 + Math.sin(normalizedPx * Math.PI * 2 * frequency - timeRef.current) * amplitude * (h / 3);
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Biên độ (A)', 10, 20);
      ctx.fillText('Bước sóng (λ)', w - 110, h - 10);

      // Amplitude arrow
      if (amplitude > 0.1) {
        const arrowX = 50;
        const arrowTop = h / 2 - amplitude * (h / 3);
        const arrowBot = h / 2;
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(arrowX, arrowTop); ctx.lineTo(arrowX, arrowBot); ctx.stroke();
        ctx.setLineDash([]);
        // Arrow head
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath(); ctx.moveTo(arrowX - 4, arrowTop + 8); ctx.lineTo(arrowX + 4, arrowTop + 8); ctx.lineTo(arrowX, arrowTop); ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [frequency, amplitude, medium, isPlaying, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={250}
      className="w-full h-auto rounded-xl bg-[#0B1120]"
      style={{ maxHeight: '250px' }}
    />
  );
}

export default function WaveLab() {
  const navigate = useNavigate();
  const { addXp, completeLesson, soundEnabled } = useUser();

  const [frequency, setFrequency] = useState(3);
  const [amplitude, setAmplitude] = useState(0.6);
  const [medium, setMedium] = useState('air');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTheory, setShowTheory] = useState(true);

  // Web Audio API refs for interactive sound wave generation
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const mediumInfo = {
    air: { label: 'Không khí', speed: '343 m/s', icon: '💨', color: 'from-sky-500 to-blue-500' },
    water: { label: 'Nước', speed: '1,480 m/s', icon: '💧', color: 'from-cyan-500 to-teal-500' },
    steel: { label: 'Thép', speed: '5,120 m/s', icon: '🔩', color: 'from-amber-500 to-orange-500' },
  };

  // Play real-time sine wave through Web Audio API
  useEffect(() => {
    if (!isPlaying || !soundEnabled) {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.connect(ctx.destination);
      }

      if (!oscillatorRef.current) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.connect(gainNodeRef.current);
        osc.start();
        oscillatorRef.current = osc;
      }

      // Map frequency slider (1 to 10) to actual audible pitch (220 Hz to 880 Hz - A3 to A5)
      const targetFreq = 220 + (frequency - 1) * 73.3;
      oscillatorRef.current.frequency.setValueAtTime(targetFreq, ctx.currentTime);

      // Map amplitude slider (0.05 to 1) to gain volume (max 0.12 to prevent clipping/loudness)
      const targetVolume = amplitude * 0.12;
      gainNodeRef.current.gain.setValueAtTime(targetVolume, ctx.currentTime);

    } catch (err) {
      console.warn("Web Audio API not supported or autoplay blocked:", err);
    }
  }, [frequency, amplitude, isPlaying, soundEnabled]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const resetLab = useCallback(() => {
    setFrequency(3);
    setAmplitude(0.6);
    setMedium('air');
    setIsPlaying(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm hidden sm:inline">Quay lại</span>
          </button>
          <button
            onClick={() => setShowTheory(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-cyan-400 tracking-wide transition-all"
          >
            <BookOpen size={13} />
            <span>Xem Lý thuyết</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={20} className={`text-cyan-400 ${isPlaying && soundEnabled ? 'animate-pulse' : 'opacity-40'}`} />
          <h1 className="font-extrabold text-base tracking-tight">Phòng thí nghiệm Sóng âm</h1>
        </div>
        <button onClick={resetLab} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <RotateCcw size={16} />
          <span className="font-bold text-xs hidden sm:inline">Làm lại</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Info card */}
        <div className="bg-[#1E293B]/60 border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-extrabold text-cyan-400 mb-2">🔊 Sóng âm thanh</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Điều chỉnh <strong className="text-amber-300">tần số</strong> và <strong className="text-pink-300">biên độ</strong>{' '}
            của sóng âm, rồi thay đổi <strong className="text-cyan-300">môi trường truyền sóng</strong> để quan sát sự khác biệt.
            Sóng âm là sóng cơ học — nó <strong className="text-red-400">không thể truyền qua chân không</strong>!
          </p>
        </div>

        {/* Wave visualization */}
        <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-5">
          <WaveCanvas frequency={frequency} amplitude={amplitude} medium={medium} isPlaying={isPlaying} />

          {/* Play/Pause */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-lg transition-all ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/10'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/10'
              }`}
            >
              {isPlaying ? <><Pause size={16} /> Tạm dừng</> : <><Play size={16} /> Phát sóng</>}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frequency */}
          <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-extrabold text-amber-400">🎵 Tần số âm</span>
              <span className="text-lg font-black text-amber-300">{frequency} Hz</span>
            </div>
            <input
              type="range" min="1" max="10" step="0.5" value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-amber-800 to-amber-400 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span>Trầm (1 Hz)</span>
              <span>Bổng (10 Hz)</span>
            </div>
          </div>

          {/* Amplitude */}
          <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-extrabold text-pink-400">📢 Biên độ âm</span>
              <span className="text-lg font-black text-pink-300">{(amplitude * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range" min="0.05" max="1" step="0.05" value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-pink-800 to-pink-400 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span>Nhỏ (yếu)</span>
              <span>To (mạnh)</span>
            </div>
          </div>
        </div>

        {/* Medium selection */}
        <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-extrabold text-slate-300 mb-3">🌊 Chọn môi trường truyền sóng</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(mediumInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setMedium(key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  medium === key
                    ? `bg-gradient-to-br ${info.color} text-white border-white/30 shadow-lg scale-105`
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className="text-xs font-extrabold">{info.label}</span>
                <span className={`text-[10px] font-bold ${medium === key ? 'text-white/80' : 'text-slate-500'}`}>
                  v = {info.speed}
                </span>
              </button>
            ))}
          </div>

          {/* Vacuum note */}
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
            <VolumeX size={20} className="text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-300">
              <strong>Chân không:</strong> Sóng âm KHÔNG THỂ truyền qua chân không vì không có phần tử vật chất để dao động!
            </p>
          </div>
        </div>

        {/* Speed comparison */}
        <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-extrabold text-slate-300 mb-3">📊 So sánh tốc độ truyền âm</h3>
          <div className="space-y-3">
            {[
              { key: 'air', label: 'Không khí', speed: 343, max: 6000, color: '#38BDF8' },
              { key: 'water', label: 'Nước', speed: 1480, max: 6000, color: '#06B6D4' },
              { key: 'steel', label: 'Thép', speed: 5120, max: 6000, color: '#F59E0B' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-20 shrink-0">{item.label}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.speed / item.max) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color, opacity: medium === item.key ? 1 : 0.4 }}
                  />
                </div>
                <span className={`text-xs font-extrabold w-20 text-right ${medium === item.key ? 'text-white' : 'text-slate-500'}`}>
                  {item.speed} m/s
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Quiz Challenge Component */}
      <LabQuizChallenge labId="wave" />

      {/* Theory Card Modal */}
      {showTheory && (
        <TheoryCardModal labId="wave" onClose={() => setShowTheory(false)} />
      )}
    </div>
  );
}
