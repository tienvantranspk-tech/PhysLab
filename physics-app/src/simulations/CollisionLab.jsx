import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';
import useSoundEffects from '../hooks/useSoundEffects';

export default function CollisionLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Sound synthesis hook
  const { playBoom, playPop } = useSoundEffects();

  const [m1, setM1] = useState(1); // kg
  const [v1, setV1] = useState(4); // m/s
  const [m2, setM2] = useState(2); // kg
  const [v2, setV2] = useState(-2); // m/s
  const [isElastic, setIsElastic] = useState(true);

  // Simulation states
  const [pos1, setPos1] = useState(80);
  const [pos2, setPos2] = useState(300);
  const [currV1, setCurrV1] = useState(4);
  const [currV2, setCurrV2] = useState(-2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [collisionDetected, setCollisionDetected] = useState(false);

  // Reset physics simulation
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setPos1(80);
    setPos2(300);
    setCurrV1(v1);
    setCurrV2(v2);
    setCollisionDetected(false);
  }, [v1, v2]);

  useEffect(() => {
    handleReset();
  }, [v1, v2, m1, m2, isElastic, handleReset]);

  // Solve momentum and energy conservation formulas
  const calculateCollisionOutcomes = useCallback(() => {
    const pTotal = m1 * v1 + m2 * v2;
    const keTotal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

    let finalV1 = 0;
    let finalV2 = 0;

    if (isElastic) {
      // Elastic equations
      finalV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
      finalV2 = (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2);
    } else {
      // Completely Inelastic: stick together
      finalV1 = pTotal / (m1 + m2);
      finalV2 = finalV1;
    }

    return { pTotal, keTotal, finalV1, finalV2 };
  }, [m1, m2, v1, v2, isElastic]);

  const calc = calculateCollisionOutcomes();

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPos1(prev1 => {
        const next1 = prev1 + currV1 * 0.8;
        setPos2(prev2 => {
          const next2 = prev2 + currV2 * 0.8;

          // Check for collision (sphere radius 20px, so midpoint distance 40px)
          if (!collisionDetected && next1 >= next2 - 40) {
            setCollisionDetected(true);
            playBoom();
            // Apply bounce velocities instantly!
            setCurrV1(calc.finalV1);
            setCurrV2(calc.finalV2);
            return next2;
          }

          // Screen boundaries collision bounds
          if (next1 < 30 || next1 > 500) setIsPlaying(false);
          if (next2 < 30 || next2 > 500) setIsPlaying(false);

          return next2;
        });
        return next1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [isPlaying, currV1, currV2, collisionDetected, calc]);

  // Main Canvas Render
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const centerY = h / 2 + 10;

    // Track line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(20, centerY + 20); ctx.lineTo(w - 20, centerY + 20); ctx.stroke();

    // Scale sphere size by mass
    const r1 = Math.max(16, Math.min(30, 16 + m1 * 4));
    const r2 = Math.max(16, Math.min(30, 16 + m2 * 4));

    // Sphere 1 (Left - Blue/Gold)
    ctx.beginPath(); ctx.arc(pos1, centerY + 20 - r1, r1, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8'; ctx.fill();
    ctx.strokeStyle = '#0284C7'; ctx.lineWidth = 2; ctx.stroke();
    // Mass text
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(`${m1}kg`, pos1, centerY + 20 - r1 + 3);

    // Sphere 2 (Right - Orange/Amber)
    ctx.beginPath(); ctx.arc(pos2, centerY + 20 - r2, r2, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B'; ctx.fill();
    ctx.strokeStyle = '#B45309'; ctx.lineWidth = 2; ctx.stroke();
    // Mass text
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${m2}kg`, pos2, centerY + 20 - r2 + 3);

    // Velocity Vectors
    ctx.lineWidth = 2;
    // Sphere 1 Vector
    if (Math.abs(currV1) > 0.1) {
      ctx.strokeStyle = '#38BDF8';
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(pos1, centerY + 20 - r1 * 2 - 5);
      const vxEnd = pos1 + currV1 * 10;
      ctx.lineTo(vxEnd, centerY + 20 - r1 * 2 - 5);
      ctx.stroke();
      // Arrow cap
      ctx.beginPath();
      ctx.moveTo(vxEnd, centerY + 20 - r1 * 2 - 5);
      ctx.lineTo(vxEnd - (currV1 > 0 ? 5 : -5), centerY + 20 - r1 * 2 - 8);
      ctx.lineTo(vxEnd - (currV1 > 0 ? 5 : -5), centerY + 20 - r1 * 2 - 2);
      ctx.fill();
    }

    // Sphere 2 Vector
    if (Math.abs(currV2) > 0.1) {
      ctx.strokeStyle = '#FBBF24';
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(pos2, centerY + 20 - r2 * 2 - 5);
      const vxEnd = pos2 + currV2 * 10;
      ctx.lineTo(vxEnd, centerY + 20 - r2 * 2 - 5);
      ctx.stroke();
      // Arrow cap
      ctx.beginPath();
      ctx.moveTo(vxEnd, centerY + 20 - r2 * 2 - 5);
      ctx.lineTo(vxEnd - (currV2 > 0 ? 5 : -5), centerY + 20 - r2 * 2 - 8);
      ctx.lineTo(vxEnd - (currV2 > 0 ? 5 : -5), centerY + 20 - r2 * 2 - 2);
      ctx.fill();
    }
  }, [pos1, pos2, m1, m2, currV1, currV2]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG THÍ NGHIỆM VA CHẠM</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Conservation of Momentum & Energy</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Current Live Stats overlay */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">VẬN TỐC THỜI GIAN THỰC</div>
              <div className="font-mono text-xs text-sky-400 font-bold space-y-0.5">
                <div>Vật 1: <span className="text-amber-400">{currV1.toFixed(2)} m/s</span></div>
                <div>Vật 2: <span className="text-purple-400">{currV2.toFixed(2)} m/s</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">CÀI ĐẶT VA CHẠM</div>

          {/* Conservation Check table */}
          <div className="bg-[#0B1120] rounded-2xl border border-white/5 p-3.5 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">ĐỊNH LUẬT BẢO TOÀN</div>
            <div className="text-[10px] text-slate-300 font-semibold leading-relaxed space-y-1.5">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Động lượng tổng ($p$):</span>
                <span className="font-bold text-sky-400">{calc.pTotal.toFixed(1)} kg·m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Động năng tổng ($K_e$):</span>
                <span className="font-bold text-amber-400">{calc.keTotal.toFixed(1)} Joules</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPlaying(true)}
              disabled={isPlaying}
              className="py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Play size={16} fill="currentColor" /> THẢ BÓNG
            </button>
            <button
              onClick={handleReset}
              className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> RESET
            </button>
          </div>

          {/* Collision elasticity toggle */}
          <div className="flex justify-between items-center bg-white/3 rounded-xl p-2.5">
            <span className="text-xs font-bold text-slate-300">Loại va chạm</span>
            <button
              onClick={() => setIsElastic(!isElastic)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors ${isElastic ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-200'}`}
            >
              {isElastic ? 'ĐÀN HỒI HOÀN TOÀN' : 'MỀM (DÍNH NHAU)'}
            </button>
          </div>

          {/* Spheres inputs sliders */}
          <div className="space-y-3.5 bg-white/3 border border-white/5 rounded-2xl p-3">
            <div className="text-[10px] font-extrabold text-slate-400">VẬT 1 (XANH LAM)</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Khối lượng ($m_1$)</span>
                <span className="font-extrabold text-sky-400">{m1} kg</span>
              </div>
              <input type="range" min="1" max="5" value={m1} onChange={e => setM1(+e.target.value)} className="w-full accent-sky-500" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Vận tốc ($v_1$)</span>
                <span className="font-extrabold text-sky-400">{v1} m/s</span>
              </div>
              <input type="range" min="1" max="6" value={v1} onChange={e => setV1(+e.target.value)} className="w-full accent-sky-500" />
            </div>
          </div>

          <div className="space-y-3.5 bg-white/3 border border-white/5 rounded-2xl p-3">
            <div className="text-[10px] font-extrabold text-slate-400">VẬT 2 (VÀNG)</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Khối lượng ($m_2$)</span>
                <span className="font-extrabold text-amber-400">{m2} kg</span>
              </div>
              <input type="range" min="1" max="5" value={m2} onChange={e => setM2(+e.target.value)} className="w-full accent-amber-500" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Vận tốc ($v_2$)</span>
                <span className="font-extrabold text-amber-400">{v2} m/s</span>
              </div>
              <input type="range" min="-6" max="-1" value={v2} onChange={e => setV2(+e.target.value)} className="w-full accent-amber-500" />
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="collision" />
    </div>
  );
}
