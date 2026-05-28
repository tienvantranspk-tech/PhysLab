import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';
import useSoundEffects from '../hooks/useSoundEffects';

export default function NuclearDecayLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  // Sound synthesis
  const { playTick, playPop } = useSoundEffects();

  const [halfLife, setHalfLife] = useState(6); // seconds for local quick visualization
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [time, setTime] = useState(0);

  // Grid of 100 atoms: true = undecayed, false = decayed
  const [atoms, setAtoms] = useState(() => Array(100).fill(true));

  // Reset simulation
  const handleReset = () => {
    setIsPlaying(false);
    setAtoms(Array(100).fill(true));
    setTime(0);
    setHistory([{ t: 0, count: 100 }]);
  };

  const activeCount = atoms.filter(Boolean).length;

  // Nuclear decay probability logic per interval
  useEffect(() => {
    if (!isPlaying || activeCount === 0) return;

    const interval = setInterval(() => {
      setTime(prevT => {
        const nextT = prevT + 0.2; // increment time by 0.2s

        // Decay probability per 0.2s: P = 1 - e^(-lambda * dt) = 1 - 2^(-dt / T_half)
        const dt = 0.2;
        const decayProb = 1 - Math.pow(2, -dt / halfLife);

        setAtoms(prevAtoms => {
          let decayedThisTick = false;
          const nextAtoms = prevAtoms.map(atom => {
            if (!atom) return false; // already decayed
            const remains = Math.random() > decayProb; // rolls probability
            if (!remains) decayedThisTick = true;
            return remains;
          });
          if (decayedThisTick) {
            playTick();
          }
          return nextAtoms;
        });

        return nextT;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, halfLife, activeCount]);

  // Record stats to graph history
  useEffect(() => {
    setHistory(prev => {
      // Avoid writing duplicates too frequently
      if (prev.length > 0 && Math.abs(prev[prev.length - 1].t - time) < 0.1) return prev;
      return [...prev, { t: time, count: activeCount }].slice(-100);
    });
  }, [time, activeCount]);

  // Render Grid Atoms
  const drawAtoms = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const cols = 10;
    const rows = 10;
    const padding = 6;
    const cellSize = Math.min((w - 40) / cols, (h - 40) / rows);
    const startX = (w - (cols * cellSize)) / 2;
    const startY = (h - (rows * cellSize)) / 2;

    atoms.forEach((undecayed, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellSize + cellSize / 2;
      const y = startY + row * cellSize + cellSize / 2;

      // Glow effect based on undecayed state
      const radGlow = ctx.createRadialGradient(x, y, 0, x, y, cellSize / 2.5);
      if (undecayed) {
        radGlow.addColorStop(0, 'rgba(52, 211, 153, 0.45)'); // Glowing green
        radGlow.addColorStop(1, 'transparent');
      } else {
        radGlow.addColorStop(0, 'rgba(239, 68, 68, 0.15)'); // Glowing faint red
        radGlow.addColorStop(1, 'transparent');
      }

      ctx.beginPath();
      ctx.arc(x, y, cellSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = radGlow;
      ctx.fill();

      // Core nucleus sphere
      ctx.beginPath();
      ctx.arc(x, y, cellSize / 3.8, 0, Math.PI * 2);
      ctx.fillStyle = undecayed ? '#34D399' : '#EF4444';
      ctx.fill();
      ctx.strokeStyle = undecayed ? '#059669' : '#DC2626';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [atoms]);

  // Render Exponential Decay Curve
  const drawCurve = useCallback(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 30, r: 10, t: 10, b: 20 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

    const maxT = 25; // max horizontal bounds
    const maxN = 100;

    // Ideal theoretical decay line: N(t) = N0 * 2^(-t / T_half)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let t = 0; t <= maxT; t += 0.5) {
      const idealN = 100 * Math.pow(2, -t / halfLife);
      const px = pad.l + (t / maxT) * gw;
      const py = h - pad.b - (idealN / maxN) * gh;
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Historical dynamic data plotting
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((pt, idx) => {
      const px = pad.l + (pt.t / maxT) * gw;
      const py = h - pad.b - (pt.count / maxN) * gh;
      if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

  }, [history, halfLife]);

  useEffect(() => {
    drawAtoms();
  }, [drawAtoms]);

  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÂN RÃ PHÓNG XẠ</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Exponential Radioactive Decay</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">HẠT NHÂN CHƯA PHÂN RÃ</div>
              <div className="font-mono text-xs text-emerald-400 font-bold">
                N = {activeCount} / 100 Hạt
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">CHU KỲ BÁN RÃ PHÓNG XẠ</div>
              <div className="font-mono text-xs text-amber-400 font-bold">
                T_1/2 = {halfLife} giây
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">THÔNG SỐ PHÓNG XẠ</div>

          {/* Exponential curve */}
          <div className="space-y-2">
            <div className="text-[9px] text-slate-400 font-bold">ĐỒ THỊ PHÂN RÃ HÀM MŨ</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 120 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-1">
              <span>Đang chạy: <b>t = {time.toFixed(1)} s</b></span>
              <span>Đã phân rã: <b>{100 - activeCount} %</b></span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />} {isPlaying ? 'TẠM DỪNG' : 'TIẾP TỤC'}
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> KHỞI ĐỘNG LẠI
            </button>
          </div>

          {/* Half life slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">CHU KỲ BÁN RÃ (T_1/2)</span>
              <span className="font-extrabold text-sky-400">{halfLife} giây</span>
            </div>
            <input type="range" min="3" max="15" step="1" value={halfLife}
              onChange={e => setHalfLife(+e.target.value)} className="w-full accent-sky-500" />
          </div>

          {/* Scientific details */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">ĐỊNH LUẬT PHÂN RÃ HÀM MŨ</div>
            <div className="bg-[#0B1120] rounded-xl p-2.5 font-mono text-xs text-slate-300 text-center">
              N(t) = N_0 × 2^(-t / T_1/2)
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              * Chu kỳ bán rã là khoảng thời gian để một nửa số hạt nhân ban đầu của chất phóng xạ bị phân rã.<br/>
              * Quá trình phân rã của từng nguyên tử đơn lẻ mang tính chất **ngẫu nhiên**, nhưng khi khảo sát tập hợp lớn thì tuân theo hàm giảm mũ cực kỳ chính xác.
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="decay" />
    </div>
  );
}
