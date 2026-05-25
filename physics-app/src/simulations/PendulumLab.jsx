import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, RotateCcw, Pause } from 'lucide-react';

const G = 9.8;
const TWO_PI = Math.PI * 2;

export default function PendulumLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const animRef = useRef(null);

  const [length, setLength] = useState(1.5); // meters
  const [initAngle, setInitAngle] = useState(30); // degrees
  const [damping, setDamping] = useState(0.998);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(30);
  const [angularVel, setAngularVel] = useState(0);
  const [graphData, setGraphData] = useState([]);

  const period = 2 * Math.PI * Math.sqrt(length / G);
  const frequency = 1 / period;

  const resetSim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setTime(0);
    setCurrentAngle(initAngle);
    setAngularVel(0);
    setGraphData([]);
  }, [initAngle]);

  const startSim = useCallback(() => {
    resetSim();
    setIsRunning(true);

    let t = 0;
    let theta = (initAngle * Math.PI) / 180;
    let omega = 0;
    const dt = 1 / 60;
    const data = [];
    let lastT = performance.now();

    const tick = (now) => {
      const realDt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      // Physics: d²θ/dt² = -(g/L)sin(θ)
      const alpha = -(G / length) * Math.sin(theta);
      omega += alpha * realDt;
      omega *= damping;
      theta += omega * realDt;
      t += realDt;

      const angleDeg = (theta * 180) / Math.PI;
      setTime(t);
      setCurrentAngle(angleDeg);
      setAngularVel(omega);

      if (data.length === 0 || t - data[data.length - 1].t > 0.03) {
        data.push({ t, angle: angleDeg });
        if (data.length > 600) data.shift();
        setGraphData([...data]);
      }

      if (t < 30) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsRunning(false);
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }, [initAngle, length, damping, resetSim]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    const pivotX = w * 0.5;
    const pivotY = 60;
    const scale = Math.min((h - 120) / 3, 200); // pixels per meter
    const ropeLen = length * scale;
    const angleRad = (currentAngle * Math.PI) / 180;

    const bobX = pivotX + Math.sin(angleRad) * ropeLen;
    const bobY = pivotY + Math.cos(angleRad) * ropeLen;
    const bobR = 18;

    // Pivot mount
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 40, 0, 80, 12);
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, TWO_PI);
    ctx.fillStyle = '#64748B';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Equilibrium line (dashed)
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + ropeLen + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arc showing angle
    if (Math.abs(currentAngle) > 0.5) {
      const arcR = Math.min(ropeLen * 0.25, 50);
      const startA = Math.PI / 2;
      const endA = Math.PI / 2 - angleRad;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, arcR, Math.min(startA, endA), Math.max(startA, endA));
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angle label
      const labelR = arcR + 15;
      const labelA = (startA + endA) / 2;
      const lx = pivotX + Math.cos(labelA) * labelR;
      const ly = pivotY + Math.sin(labelA) * labelR;
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 12px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(currentAngle).toFixed(1)}°`, lx, ly);
    }

    // Trail (ghost positions)
    if (isRunning && graphData.length > 2) {
      const trailCount = Math.min(graphData.length, 12);
      for (let i = 0; i < trailCount; i++) {
        const d = graphData[graphData.length - 1 - i * 2];
        if (!d) continue;
        const ta = (d.angle * Math.PI) / 180;
        const tx = pivotX + Math.sin(ta) * ropeLen;
        const ty = pivotY + Math.cos(ta) * ropeLen;
        const alpha = 0.02 + ((trailCount - i) / trailCount) * 0.08;
        ctx.beginPath();
        ctx.arc(tx, ty, bobR * 0.7, 0, TWO_PI);
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.fill();
      }
    }

    // Rope
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rope glow
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Bob glow
    const glow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobR * 3);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobR * 3, 0, TWO_PI);
    ctx.fillStyle = glow;
    ctx.fill();

    // Bob
    const bobGrad = ctx.createRadialGradient(bobX - 5, bobY - 5, 2, bobX, bobY, bobR);
    bobGrad.addColorStop(0, '#7DD3FC');
    bobGrad.addColorStop(1, '#0284C7');
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobR, 0, TWO_PI);
    ctx.fillStyle = bobGrad;
    ctx.fill();
    ctx.strokeStyle = '#0369A1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.arc(bobX - 5, bobY - 5, 5, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    // Length label on rope
    const midX = (pivotX + bobX) / 2;
    const midY = (pivotY + bobY) / 2;
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 11px Quicksand, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`L = ${length.toFixed(1)} m`, midX + 15, midY);

  }, [currentAngle, length, isRunning, graphData]);

  // Graph canvas
  useEffect(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 35, r: 10, t: 10, b: 25 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    // Center line
    const centerY = pad.t + gh / 2;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.beginPath();
    ctx.moveTo(pad.l, centerY);
    ctx.lineTo(w - pad.r, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('t (s)', w / 2, h - 4);
    ctx.save(); ctx.translate(10, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('θ (°)', 0, 0); ctx.restore();

    if (graphData.length < 2) return;

    const maxT = Math.max(graphData[graphData.length - 1].t, 3);
    const windowT = Math.min(maxT, 8);
    const startT = Math.max(0, maxT - windowT);
    const maxAngle = Math.max(initAngle * 1.2, 10);

    // Data
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 6;

    let first = true;
    graphData.forEach(d => {
      if (d.t < startT) return;
      const x = pad.l + ((d.t - startT) / windowT) * gw;
      const y = centerY - (d.angle / maxAngle) * (gh / 2);
      if (first) { ctx.moveTo(x, y); first = false; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current point
    const last = graphData[graphData.length - 1];
    const lx = pad.l + ((last.t - startT) / windowT) * gw;
    const ly = centerY - (last.angle / maxAngle) * (gh / 2);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, TWO_PI);
    ctx.fillStyle = '#38BDF8'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 8, 0, TWO_PI);
    ctx.fillStyle = 'rgba(56,189,248,0.2)'; ctx.fill();

  }, [graphData, initAngle]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">CON LẮC ĐƠN</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Simple Pendulum</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Live formulas */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">GÓC LỆCH</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">θ = </span>
                <span className="text-amber-400 font-bold">{currentAngle.toFixed(1)}°</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">VẬN TỐC GÓC</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">ω = </span>
                <span className="text-sky-400 font-bold">{angularVel.toFixed(2)} rad/s</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">THỜI GIAN</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">t = </span>
                <span className="text-green-400 font-bold">{time.toFixed(2)} s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:w-[360px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Graph */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">ĐỒ THỊ GÓC — THỜI GIAN (θ-t)</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 160 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
          </div>

          {/* Length slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">CHIỀU DÀI DÂY</span>
              <span className="text-sm font-extrabold text-sky-400">{length.toFixed(1)} m</span>
            </div>
            <input type="range" min="0.3" max="3.0" step="0.1" value={length}
              onChange={e => { setLength(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-sky-500" />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>0.3m</span><span>3.0m</span>
            </div>
          </div>

          {/* Angle slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">GÓC BAN ĐẦU</span>
              <span className="text-sm font-extrabold text-amber-400">{initAngle}°</span>
            </div>
            <input type="range" min="5" max="80" step="5" value={initAngle}
              onChange={e => { setInitAngle(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-amber-500" />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>5°</span><span>80°</span>
            </div>
          </div>

          {/* Damping */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">MA SÁT KHÔNG KHÍ</span>
              <span className="text-sm font-extrabold text-purple-400">
                {damping >= 0.999 ? 'Không' : damping >= 0.995 ? 'Nhẹ' : 'Mạnh'}
              </span>
            </div>
            <input type="range" min="0.990" max="1.000" step="0.001" value={damping}
              onChange={e => { setDamping(+e.target.value); resetSim(); }}
              disabled={isRunning} className="w-full accent-purple-500" />
          </div>

          {/* Predictions */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">CÔNG THỨC</div>
            <div className="bg-white/5 rounded-xl p-3 mb-2">
              <div className="font-mono text-xs text-center text-slate-300">
                T = 2π√(<span className="text-sky-400">L</span>/<span className="text-amber-400">g</span>)
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-sky-400">{period.toFixed(2)}s</div>
                <div className="text-[10px] text-slate-400 font-bold">Chu kỳ T</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-green-400">{frequency.toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 font-bold">Tần số f (Hz)</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-3">
            <button onClick={resetSim}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0">
              <RotateCcw size={18} />
            </button>
            <button
              onClick={isRunning ? () => {} : startSim}
              disabled={isRunning}
              className={`flex-1 h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all
                ${isRunning
                  ? 'bg-sky-500/20 text-sky-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'
                }`}
            >
              {isRunning ? <><Pause size={16} /> Đang dao động...</> : <><Play size={16} /> THẢ CON LẮC</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
