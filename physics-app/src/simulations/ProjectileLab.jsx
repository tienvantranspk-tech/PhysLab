import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';
import useSoundEffects from '../hooks/useSoundEffects';

export default function ProjectileLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Sound synthesis hook
  const { playBoom, playPop } = useSoundEffects();

  const [angle, setAngle] = useState(45); // degrees
  const [speed, setSpeed] = useState(25); // m/s
  const [gravity, setGravity] = useState(9.8); // m/s2
  const [isFiring, setIsFiring] = useState(false);
  const [trajectory, setTrajectory] = useState([]);
  const [time, setTime] = useState(0);

  // Theoretical calculations
  const rad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy0 = speed * Math.sin(rad);

  // Time of flight = 2 * vy0 / g
  const timeOfFlight = (2 * vy0) / gravity;
  // Max range = vx * timeOfFlight
  const maxRange = vx * timeOfFlight;
  // Max height = vy0^2 / (2 * g)
  const maxHeight = (vy0 * vy0) / (2 * gravity);

  // Simulation tick loop
  useEffect(() => {
    if (!isFiring) return;
    let animId;
    const start = Date.now();
    const update = () => {
      const elapsed = (Date.now() - start) / 200; // time scaler
      if (elapsed >= timeOfFlight) {
        setTime(timeOfFlight);
        setIsFiring(false);
        return;
      }
      setTime(elapsed);
      animId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animId);
  }, [isFiring, timeOfFlight]);

  // Compute positions
  const getPositionAt = (t) => {
    const x = vx * t;
    const y = vy0 * t - 0.5 * gravity * t * t;
    return { x, y: Math.max(0, y) };
  };

  const currentPos = getPositionAt(time);

  // Record path coordinates for historical trajectory line
  useEffect(() => {
    if (isFiring) {
      setTrajectory(prev => {
        const pt = getPositionAt(time);
        // Avoid adding duplicate points
        if (prev.length > 0 && Math.abs(prev[prev.length - 1].x - pt.x) < 2) return prev;
        return [...prev, pt];
      });
    }
  }, [time, isFiring]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const groundY = h - 40;
    const leftX = 50;

    // Coordinate grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Ground
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, groundY, w, 40);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

    // Scale meters to pixels (e.g. 1 meter = 4 pixels)
    const scale = 3.5;

    // Plot full trajectory dashed line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(leftX, groundY);
    for (let t = 0; t <= timeOfFlight; t += 0.1) {
      const x = leftX + (vx * t) * scale;
      const y = groundY - (vy0 * t - 0.5 * gravity * t * t) * scale;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot real-time flying trajectory line
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(leftX, groundY);
    trajectory.forEach(pt => {
      const cx = leftX + pt.x * scale;
      const cy = groundY - pt.y * scale;
      ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Cannon at origin
    ctx.save();
    ctx.translate(leftX, groundY);
    ctx.rotate(-rad);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-8, -10, 24, 12); // barrel
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); // wheel
    ctx.restore();

    // Projectile ball
    const px = leftX + currentPos.x * scale;
    const py = groundY - currentPos.y * scale;

    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B'; ctx.fill();
    ctx.strokeStyle = '#D97706'; ctx.lineWidth = 1.5; ctx.stroke();

    // Flame burst behind the flying ball
    if (isFiring) {
      ctx.beginPath(); ctx.arc(px - vx * 0.1, py + (vy0 - gravity * time) * 0.1, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; ctx.fill();
    }

    // Peak marker (max height)
    const peakX = leftX + (maxRange / 2) * scale;
    const peakY = groundY - maxHeight * scale;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath(); ctx.arc(peakX, peakY, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.font = '8px Quicksand';
    ctx.fillText(`H_max: ${maxHeight.toFixed(1)}m`, peakX - 10, peakY - 8);

    // Range marker
    const rangeX = leftX + maxRange * scale;
    ctx.fillStyle = '#10B981';
    ctx.beginPath(); ctx.arc(rangeX, groundY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(`Tầm xa: ${maxRange.toFixed(1)}m`, rangeX - 15, groundY - 10);
  }, [rad, currentPos, trajectory, timeOfFlight, vx, vy0, gravity, time, maxHeight, maxRange, isFiring]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleFire = () => {
    setTrajectory([]);
    setTime(0);
    setIsFiring(true);
    playBoom();
  };

  const handleReset = () => {
    setIsFiring(false);
    setTrajectory([]);
    setTime(0);
  };

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG LAB NÉM XIÊN</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Parabolic Projectile Trajectories</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2.5 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">VỊ TRÍ THỜI GIAN THỰC</div>
              <div className="font-mono text-xs text-sky-400 font-bold">
                X = {currentPos.x.toFixed(1)}m, Y = {currentPos.y.toFixed(1)}m
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">THỜI GIAN BAY</div>
              <div className="font-mono text-xs text-amber-400 font-bold">
                t = {time.toFixed(2)} s / {timeOfFlight.toFixed(2)} s
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">CÀI ĐẶT THÔNG SỐ BẮN</div>

          {/* Theoretical Outputs Panel */}
          <div className="bg-[#0B1120] rounded-2xl border border-white/5 p-4 space-y-3.5 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/3 rounded-xl p-2.5 text-center">
                <div className="text-lg font-extrabold text-emerald-400">{maxRange.toFixed(1)} m</div>
                <div className="text-[9px] text-slate-400 font-bold">Tầm xa (R)</div>
              </div>
              <div className="bg-white/3 rounded-xl p-2.5 text-center">
                <div className="text-lg font-extrabold text-red-400">{maxHeight.toFixed(1)} m</div>
                <div className="text-[9px] text-slate-400 font-bold">Độ cao cực đại (H)</div>
              </div>
            </div>
          </div>

          {/* Firing buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleFire}
              disabled={isFiring}
              className="py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Play size={16} fill="currentColor" /> BẮN CANON
            </button>
            <button
              onClick={handleReset}
              className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> RESET
            </button>
          </div>

          {/* Launch Angle Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">GÓC BẮN (α)</span>
              <span className="font-extrabold text-amber-400">{angle}°</span>
            </div>
            <input type="range" min="10" max="90" step="1" value={angle}
              onChange={e => setAngle(+e.target.value)} className="w-full accent-amber-500" />
          </div>

          {/* Launch Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">VẬN TỐC ĐẦU NÒNG (v₀)</span>
              <span className="font-extrabold text-sky-400">{speed} m/s</span>
            </div>
            <input type="range" min="10" max="40" step="1" value={speed}
              onChange={e => setSpeed(+e.target.value)} className="w-full accent-sky-500" />
          </div>

          {/* Gravity selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">TRỌNG LỰC HÀNH TINH (g)</span>
              <span className="font-extrabold text-red-400">{gravity} m/s²</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Mặt Trăng', val: 1.6 },
                { name: 'Trái Đất', val: 9.8 },
                { name: 'Mộc Tinh', val: 24.8 }
              ].map(g => (
                <button
                  key={g.val}
                  onClick={() => setGravity(g.val)}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all ${gravity === g.val ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Science tip */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-400">LÝ THUYẾT NÉM XIÊN</div>
            <div className="text-[10px] text-slate-300 leading-relaxed">
              * Tầm bắn đạt <b>cực đại ở góc 45°</b> (ở môi trường không có lực cản không khí).<br/>
              * Thời gian bay phụ thuộc trực tiếp vào thành phần vận tốc thẳng đứng $v_{y0}$ và gia tốc trọng trường $g$.
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="projectile" />
    </div>
  );
}
