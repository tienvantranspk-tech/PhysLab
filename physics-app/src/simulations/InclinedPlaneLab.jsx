import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw } from 'lucide-react';

const G = 9.8;

export default function InclinedPlaneLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(2);
  const [friction, setFriction] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const [blockPos, setBlockPos] = useState(0); // fraction 0-1 along incline
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState(0);

  const angleRad = (angle * Math.PI) / 180;
  const gParallel = G * Math.sin(angleRad);
  const gNormal = G * Math.cos(angleRad);
  const frictionForce = friction * mass * gNormal;
  const netAccel = Math.max(0, gParallel - friction * gNormal);
  const weight = mass * G;
  const normalForce = mass * gNormal;

  const resetSim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setBlockPos(0);
    setVelocity(0);
    setTime(0);
  }, []);

  const startSim = useCallback(() => {
    if (netAccel <= 0) return;
    resetSim();
    setIsRunning(true);
    let t = 0, v = 0, s = 0;
    let lastT = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      v += netAccel * dt;
      s += v * dt;
      t += dt;

      const frac = Math.min(s / 5, 1); // 5m incline
      setBlockPos(frac);
      setVelocity(v);
      setTime(t);

      if (frac < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsRunning(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [netAccel, resetSim]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(56,189,248,0.03)';
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Incline geometry
    const margin = 80;
    const baseX = margin;
    const baseY = h - margin;
    const inclineLen = Math.min(w - 2 * margin, h - 2 * margin) * 0.85;
    const topX = baseX + Math.cos(angleRad) * inclineLen;
    const topY = baseY - Math.sin(angleRad) * inclineLen;

    // Ground
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(margin - 20, baseY); ctx.lineTo(w - margin + 20, baseY); ctx.stroke();
    // Ground hatching
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    for (let x = margin - 20; x < w - margin + 20; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x - 8, baseY + 8); ctx.stroke();
    }

    // Incline surface
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(topX, topY); ctx.stroke();
    // Incline glow
    ctx.strokeStyle = 'rgba(148,163,184,0.06)';
    ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(topX, topY); ctx.stroke();

    // Angle arc
    const arcR = 50;
    ctx.beginPath();
    ctx.arc(baseX, baseY, arcR, -Math.PI / 2 + (Math.PI / 2 - angleRad), 0);
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 13px Quicksand';
    ctx.textAlign = 'left';
    ctx.fillText(`${angle}°`, baseX + arcR + 5, baseY - 10);

    // Block position on incline
    const bx = baseX + Math.cos(angleRad) * inclineLen * (1 - blockPos) * 0.85 + inclineLen * 0.1 * Math.cos(angleRad);
    const by = baseY - Math.sin(angleRad) * inclineLen * (1 - blockPos) * 0.85 - inclineLen * 0.1 * Math.sin(angleRad);
    const blockW = 36, blockH = 28;

    // Block shadow
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-angleRad);
    ctx.fillStyle = 'rgba(251,191,36,0.1)';
    ctx.fillRect(-blockW / 2 + 3, -blockH + 3, blockW, blockH);
    ctx.restore();

    // Block
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-angleRad);
    const bGrad = ctx.createLinearGradient(0, -blockH, 0, 0);
    bGrad.addColorStop(0, '#FDE68A');
    bGrad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = bGrad;
    ctx.fillRect(-blockW / 2, -blockH, blockW, blockH);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(-blockW / 2, -blockH, blockW, blockH);
    // Mass label
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 11px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 0, -blockH / 2 + 4);
    ctx.restore();

    // Force vectors (from block center)
    const fScale = 3; // pixels per Newton
    const bcx = bx, bcy = by - blockH / 2;

    // Weight (straight down)
    const wLen = weight * fScale * 0.3;
    drawArrow(ctx, bcx, bcy, bcx, bcy + wLen, '#EF4444', 'P');

    // Normal force (perpendicular to incline, outward)
    const nLen = normalForce * fScale * 0.3;
    const nx = bcx - Math.sin(angleRad) * nLen;
    const ny = bcy - Math.cos(angleRad) * nLen;
    drawArrow(ctx, bcx, bcy, nx, ny, '#22C55E', 'N');

    // Parallel component (down the incline)
    if (isRunning || blockPos === 0) {
      const pLen = gParallel * mass * fScale * 0.3;
      const px = bcx + Math.cos(angleRad) * pLen;
      const py = bcy + Math.sin(angleRad) * pLen;
      drawArrow(ctx, bcx, bcy, px, py, '#FBBF24', 'F∥');

      // Friction (up the incline)
      if (friction > 0) {
        const fLen = frictionForce * fScale * 0.3;
        const fx = bcx - Math.cos(angleRad) * fLen;
        const fy = bcy - Math.sin(angleRad) * fLen;
        drawArrow(ctx, bcx, bcy, fx, fy, '#A855F7', 'Fms');
      }
    }

  }, [angle, angleRad, mass, friction, blockPos, weight, normalForce, gParallel, frictionForce, isRunning]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(draw, 30);
    return () => clearInterval(id);
  }, [draw, isRunning]);

  function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (len < 5) return;

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(a - 0.4) * 10, y2 - Math.sin(a - 0.4) * 10);
    ctx.lineTo(x2 - Math.cos(a + 0.4) * 10, y2 - Math.sin(a + 0.4) * 10);
    ctx.closePath(); ctx.fill();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(label, x2 + Math.cos(a + Math.PI / 2) * 15, y2 + Math.sin(a + Math.PI / 2) * 15);
  }

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">MẶT PHẲNG NGHIÊNG</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Inclined Plane</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">GIA TỐC</div>
              <div className="font-mono text-sm text-amber-400 font-bold">a = {netAccel.toFixed(2)} m/s²</div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">VẬN TỐC</div>
              <div className="font-mono text-sm text-sky-400 font-bold">v = {velocity.toFixed(2)} m/s</div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">THỜI GIAN</div>
              <div className="font-mono text-sm text-green-400 font-bold">t = {time.toFixed(2)} s</div>
            </div>
          </div>

          {/* Force legend */}
          <div className="absolute bottom-4 right-4 bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5 z-10">
            <div className="text-[10px] font-bold text-slate-400 mb-1">LỰC</div>
            <div className="space-y-1 text-[10px] font-bold">
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-500" /> <span className="text-red-400">P = {weight.toFixed(1)}N (Trọng lực)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500" /> <span className="text-green-400">N = {normalForce.toFixed(1)}N (Phản lực)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-amber-500" /> <span className="text-amber-400">F∥ = {(gParallel * mass).toFixed(1)}N</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-purple-500" /> <span className="text-purple-400">Fms = {frictionForce.toFixed(1)}N</span></div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">GÓC NGHIÊNG</span>
              <span className="text-sm font-extrabold text-amber-400">{angle}°</span>
            </div>
            <input type="range" min="5" max="75" step="1" value={angle}
              onChange={e => { setAngle(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-amber-500" />
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">KHỐI LƯỢNG</span>
              <span className="text-sm font-extrabold text-sky-400">{mass} kg</span>
            </div>
            <input type="range" min="0.5" max="10" step="0.5" value={mass}
              onChange={e => { setMass(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-sky-500" />
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">HỆ SỐ MA SÁT (μ)</span>
              <span className="text-sm font-extrabold text-purple-400">{friction.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="0.8" step="0.05" value={friction}
              onChange={e => { setFriction(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-purple-500" />
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">CÔNG THỨC</div>
            <div className="bg-white/5 rounded-xl p-3 font-mono text-xs text-center text-slate-300 space-y-1">
              <div>a = g·(sin<span className="text-amber-400">θ</span> − <span className="text-purple-400">μ</span>·cos<span className="text-amber-400">θ</span>)</div>
              <div>a = {G}×(sin{angle}° − {friction.toFixed(2)}×cos{angle}°)</div>
              <div className="text-amber-400 font-bold">a = {netAccel.toFixed(2)} m/s²</div>
            </div>
          </div>

          <div className="p-4 flex gap-3">
            <button onClick={resetSim}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0">
              <RotateCcw size={18} />
            </button>
            <button
              onClick={isRunning ? () => {} : startSim}
              disabled={isRunning || netAccel <= 0}
              className={`flex-1 h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all
                ${netAccel <= 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : isRunning
                    ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                }`}
            >
              {netAccel <= 0 ? 'Ma sát quá lớn' : isRunning ? 'Đang trượt...' : <><Play size={16} /> THẢ VẬT</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
