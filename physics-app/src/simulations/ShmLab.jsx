import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

export default function ShmLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  const [mass, setMass] = useState(1); // kg
  const [k, setK] = useState(40); // N/m
  const [amplitude, setAmplitude] = useState(8); // cm
  const [isPlaying, setIsPlaying] = useState(true);

  // Time tracking for SHM
  const [time, setTime] = useState(0);

  // Angular frequency omega = sqrt(k/m)
  const omega = Math.sqrt(k / mass);
  const period = (2 * Math.PI) / omega; // T = 2pi / omega

  // Displacement x = A * cos(omega * t)
  const xCm = amplitude * Math.cos(omega * time);
  const xm = xCm / 100;
  // Velocity v = -omega * A * sin(omega * t)
  const v = -omega * (amplitude / 100) * Math.sin(omega * time);
  // Acceleration a = -omega^2 * A * cos(omega * t)
  const a = -omega * omega * (amplitude / 100) * Math.cos(omega * time);

  // Mechanical Energies
  const potentialEnergy = 0.5 * k * xm * xm; // J
  const kineticEnergy = 0.5 * mass * v * v; // J
  const totalEnergy = potentialEnergy + kineticEnergy; // J

  // Tick simulation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(prev => prev + 0.03);
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mass-Spring graphic draw
  const drawSpringOscillator = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const cy = h / 2 - 10;
    const startX = 40;

    // Anchor Wall
    ctx.fillStyle = '#475569';
    ctx.fillRect(startX - 10, cy - 35, 10, 70);

    // Spring length scaling
    const restLength = 110;
    // Scale displacement visually
    const displayDisplacement = xCm * 3.5;
    const currentLength = restLength + displayDisplacement;
    const endX = startX + currentLength;

    // Spring loops
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, cy);

    const coils = 20;
    const coilW = currentLength / coils;
    for (let i = 0; i < coils; i++) {
      const cx = startX + coilW * (i + 0.5);
      const ry = cy + (i % 2 === 0 ? 15 : -15);
      ctx.lineTo(cx, ry);
    }
    ctx.lineTo(endX, cy);
    ctx.stroke();

    // Mass box block
    const boxSide = Math.min(60, 30 + mass * 12);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(endX, cy - boxSide / 2, boxSide, boxSide);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(endX, cy - boxSide / 2, boxSide, boxSide);

    // Mass labels
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass} kg`, endX + boxSide / 2, cy + 3);

    // Frictionless table track
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(20, cy + boxSide / 2 + 1); ctx.lineTo(w - 20, cy + boxSide / 2 + 1); ctx.stroke();

  }, [mass, xCm]);

  // Scroll kinematics curves draw (x, v, a stacked)
  const drawOscillationCurves = useCallback(() => {
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

    // Baselines
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    // Horizontal baseline centered vertically
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(pad.l, h / 2); ctx.lineTo(w - pad.r, h / 2); ctx.stroke();

    // Plot Displacement history (Sin wave)
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const tScaler = 0.15;
    for (let px = 0; px < gw; px++) {
      const evalT = time - (gw - px) * tScaler;
      const evalX = amplitude * Math.cos(omega * evalT);

      const py = h / 2 - (evalX / amplitude) * (gh / 2.5);
      if (px === 0) ctx.moveTo(pad.l + px, py); else ctx.lineTo(pad.l + px, py);
    }
    ctx.stroke();

    // Current point dot highlight
    ctx.fillStyle = '#FBBF24';
    const cy = h / 2 - (xCm / amplitude) * (gh / 2.5);
    ctx.beginPath(); ctx.arc(pad.l + gw, cy, 4, 0, Math.PI * 2); ctx.fill();

  }, [time, amplitude, omega, xCm]);

  useEffect(() => {
    drawSpringOscillator();
  }, [drawSpringOscillator]);

  useEffect(() => {
    drawOscillationCurves();
  }, [drawOscillationCurves]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">DAO ĐỘNG ĐIỀU HÒA LÒ XO</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Simple Harmonic Oscillator</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0 flex flex-col">
          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Energy Bar visualizers */}
          <div className="p-4 bg-slate-900/60 border-t border-white/5 flex gap-4 shrink-0 justify-around">
            <div className="flex-1 max-w-[140px] space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-sky-400">
                <span>ĐỘNG NĂNG (K)</span>
                <span>{kineticEnergy.toFixed(3)} J</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 transition-all duration-75" style={{ width: `${Math.min(100, (kineticEnergy / totalEnergy) * 100)}%` }} />
              </div>
            </div>

            <div className="flex-1 max-w-[140px] space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-pink-400">
                <span>THẾ NĂNG (U)</span>
                <span>{potentialEnergy.toFixed(3)} J</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400 transition-all duration-75" style={{ width: `${Math.min(100, (potentialEnergy / totalEnergy) * 100)}%` }} />
              </div>
            </div>

            <div className="flex-1 max-w-[140px] space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-purple-400">
                <span>CƠ NĂNG TOÀN PHẦN (E)</span>
                <span>{totalEnergy.toFixed(3)} J</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">PHÂN TÍCH DAO ĐỘNG</div>

          {/* Scrolling Realtime curve */}
          <div className="space-y-2">
            <div className="text-[9px] text-slate-400 font-bold">ĐỒ THỊ LI ĐỘ x(t)</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 110 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
              <span>Li độ x: <span className="text-[#FBBF24] font-bold">{xCm.toFixed(1)} cm</span></span>
              <span>Chu kỳ T: <span className="text-[#38BDF8] font-bold">{period.toFixed(2)} s</span></span>
            </div>
          </div>

          {/* Kinematics meters values */}
          <div className="grid grid-cols-2 gap-3 bg-[#0B1120] rounded-2xl border border-white/5 p-3">
            <div className="bg-white/3 rounded-xl p-2 text-center">
              <div className="text-sm font-extrabold text-sky-400">{v.toFixed(2)} m/s</div>
              <div className="text-[8px] text-slate-400 font-bold">Vận tốc (v)</div>
            </div>
            <div className="bg-white/3 rounded-xl p-2 text-center">
              <div className="text-sm font-extrabold text-pink-400">{a.toFixed(2)} m/s²</div>
              <div className="text-[8px] text-slate-400 font-bold">Gia tốc (a)</div>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />} {isPlaying ? 'TẠM DỪNG' : 'TIẾP TỤC'}
            </button>
            <button
              onClick={() => setTime(0)}
              className="py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> KHỞI ĐỘNG LẠI
            </button>
          </div>

          {/* Variable Sliders */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">KHỐI LƯỢNG HỘP (m)</span>
                <span className="font-extrabold text-amber-400">{mass} kg</span>
              </div>
              <input type="range" min="0.5" max="2.5" step="0.1" value={mass}
                onChange={e => setMass(+e.target.value)} className="w-full accent-amber-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">ĐỘ CỨNG LÒ XO (k)</span>
                <span className="font-extrabold text-sky-400">{k} N/m</span>
              </div>
              <input type="range" min="15" max="80" step="5" value={k}
                onChange={e => setK(+e.target.value)} className="w-full accent-sky-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">BIÊN ĐỘ DAO ĐỘNG (A)</span>
                <span className="font-extrabold text-pink-400">{amplitude} cm</span>
              </div>
              <input type="range" min="3" max="12" step="1" value={amplitude}
                onChange={e => setAmplitude(+e.target.value)} className="w-full accent-pink-500" />
            </div>
          </div>

          {/* Science summary */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-1 text-[9px] text-slate-400 leading-relaxed">
            <div className="text-[10px] font-extrabold text-slate-300 mb-1">CƠ NĂNG BẢO TOÀN</div>
            <p>* Khi qua vị trí cân bằng ($x = 0$): thế năng bằng 0, động năng cực đại → tốc độ đạt cực đại.</p>
            <p>* Khi ở hai biên ($x = \pm A$): động năng bằng 0, thế năng cực đại → gia tốc và lực kéo về đạt cực đại.</p>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="shm" />
    </div>
  );
}
