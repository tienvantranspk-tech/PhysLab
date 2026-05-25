import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, RotateCcw, Pause, ChevronDown } from 'lucide-react';

const PLANETS = [
  { name: 'Trái Đất', g: 9.8, emoji: '🌍', color: '#38BDF8' },
  { name: 'Mặt Trăng', g: 1.62, emoji: '🌙', color: '#94A3B8' },
  { name: 'Sao Hỏa', g: 3.72, emoji: '🔴', color: '#F87171' },
  { name: 'Sao Mộc', g: 24.79, emoji: '🟠', color: '#FB923C' },
];

export default function FreeFallLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const animRef = useRef(null);
  const trailRef = useRef([]);

  const [height, setHeight] = useState(80); // meters
  const [planetIdx, setPlanetIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [hasLanded, setHasLanded] = useState(false);
  const [showPlanetPicker, setShowPlanetPicker] = useState(false);

  const planet = PLANETS[planetIdx];
  const g = planet.g;

  // Physics calculations
  const totalFallTime = Math.sqrt((2 * height) / g);
  const impactVelocity = g * totalFallTime;

  const resetSim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setVelocity(0);
    setPosition(0);
    setGraphData([]);
    setHasLanded(false);
    trailRef.current = [];
  }, []);

  // Main animation loop
  const startSim = useCallback(() => {
    resetSim();
    setIsRunning(true);
    const startTs = performance.now();
    const data = [];

    const tick = (now) => {
      const elapsed = (now - startTs) / 1000; // seconds
      const s = 0.5 * g * elapsed * elapsed; // distance fallen
      const v = g * elapsed;

      if (s >= height) {
        setTime(totalFallTime);
        setVelocity(impactVelocity);
        setPosition(height);
        data.push({ t: totalFallTime, v: impactVelocity });
        setGraphData([...data]);
        setIsRunning(false);
        setHasLanded(true);
        return;
      }

      setTime(elapsed);
      setVelocity(v);
      setPosition(s);

      if (data.length === 0 || elapsed - data[data.length - 1].t > 0.05) {
        data.push({ t: elapsed, v });
        setGraphData([...data]);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [g, height, totalFallTime, impactVelocity, resetSim]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Scale
    const margin = 40;
    const trackTop = margin + 20;
    const trackBot = h - margin - 30;
    const trackH = trackBot - trackTop;
    const ballX = w * 0.5;

    // Height ruler
    const rulerX = 50;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rulerX, trackTop); ctx.lineTo(rulerX, trackBot); ctx.stroke();

    const numTicks = 5;
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Quicksand, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= numTicks; i++) {
      const y = trackTop + (trackH * i) / numTicks;
      const mVal = Math.round((height * i) / numTicks);
      ctx.beginPath(); ctx.moveTo(rulerX - 6, y); ctx.lineTo(rulerX, y); ctx.stroke();
      ctx.fillText(`${mVal}m`, rulerX - 10, y + 4);
    }

    // Drop line (dashed)
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.beginPath(); ctx.moveTo(ballX, trackTop); ctx.lineTo(ballX, trackBot); ctx.stroke();
    ctx.setLineDash([]);

    // Ground
    ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.fillRect(ballX - 60, trackBot, 120, 4);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MẶT ĐẤT', ballX, trackBot + 18);

    // Ball position
    const ballFrac = Math.min(position / height, 1);
    const ballY = trackTop + trackH * ballFrac;
    const ballR = 14;

    // Motion trail
    if (isRunning || hasLanded) {
      const trailLen = Math.min(Math.floor(ballFrac * 20), 20);
      for (let i = 0; i < trailLen; i++) {
        const frac = (ballFrac * i) / trailLen;
        const ty = trackTop + trackH * frac;
        const alpha = 0.05 + (i / trailLen) * 0.15;
        const r = ballR * (0.3 + (i / trailLen) * 0.5);
        ctx.beginPath();
        ctx.arc(ballX, ty, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.fill();
      }
    }

    // Ball glow
    const gradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballR * 3);
    gradient.addColorStop(0, hasLanded ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.3)');
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR * 3, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
    const ballGrad = ctx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, ballR);
    ballGrad.addColorStop(0, hasLanded ? '#FCA5A5' : '#FDE68A');
    ballGrad.addColorStop(1, hasLanded ? '#EF4444' : '#F59E0B');
    ctx.fillStyle = ballGrad;
    ctx.fill();
    ctx.strokeStyle = hasLanded ? '#DC2626' : '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ball highlight
    ctx.beginPath();
    ctx.arc(ballX - 4, ballY - 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    // Impact effect
    if (hasLanded) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const dist = 20 + Math.random() * 15;
        const px = ballX + Math.cos(angle) * dist;
        const py = trackBot - Math.sin(angle) * (dist * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + Math.random() * 0.4})`;
        ctx.fill();
      }
    }

    // Velocity arrow
    if ((isRunning || hasLanded) && velocity > 0) {
      const arrowLen = Math.min(velocity * 2, 80);
      const arrowX = ballX + ballR + 20;
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(arrowX, ballY); ctx.lineTo(arrowX, ballY + arrowLen); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX - 5, ballY + arrowLen - 6);
      ctx.lineTo(arrowX, ballY + arrowLen);
      ctx.lineTo(arrowX + 5, ballY + arrowLen - 6);
      ctx.strokeStyle = '#F87171';
      ctx.stroke();
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 11px Quicksand, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${velocity.toFixed(1)} m/s`, arrowX + 8, ballY + arrowLen / 2 + 4);
    }

  }, [position, height, isRunning, hasLanded, velocity]);

  // Graph drawing
  useEffect(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    ctx.clearRect(0, 0, w, h);

    const pad = { l: 40, r: 15, t: 15, b: 30 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

    // Labels
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 10px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('t (s)', w / 2, h - 5);
    ctx.save(); ctx.translate(12, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('v (m/s)', 0, 0); ctx.restore();

    const maxT = Math.max(totalFallTime * 1.1, 1);
    const maxV = Math.max(impactVelocity * 1.1, 10);

    // Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    for (let i = 1; i <= 4; i++) {
      const y = pad.t + gh - (gh * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px Quicksand';
      ctx.textAlign = 'right';
      ctx.fillText((maxV * i / 4).toFixed(0), pad.l - 5, y + 3);
    }

    // Theoretical line (dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, h - pad.b);
    ctx.lineTo(pad.l + gw * (totalFallTime / maxT), pad.t + gh - gh * (impactVelocity / maxV));
    ctx.stroke();
    ctx.setLineDash([]);

    // Data line
    if (graphData.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      graphData.forEach((d, i) => {
        const x = pad.l + (d.t / maxT) * gw;
        const y = pad.t + gh - (d.v / maxV) * gh;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Current point
      const last = graphData[graphData.length - 1];
      const lx = pad.l + (last.t / maxT) * gw;
      const ly = pad.t + gh - (last.v / maxV) * gh;
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24'; ctx.fill();
      ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.2)'; ctx.fill();
    }
  }, [graphData, totalFallTime, impactVelocity]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">RƠI TỰ DO</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Free Fall Experiment</p>
        </div>
        <div className="w-9" />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Live formulas overlay */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">KHOẢNG CÁCH</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">s = ½g·t² = </span>
                <span className="text-amber-400 font-bold">{position.toFixed(1)} m</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">VẬN TỐC</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">v = g·t = </span>
                <span className="text-red-400 font-bold">{velocity.toFixed(1)} m/s</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">THỜI GIAN</div>
              <div className="font-mono text-sm">
                <span className="text-slate-400">t = </span>
                <span className="text-sky-400 font-bold">{time.toFixed(2)} s</span>
              </div>
            </div>
          </div>

          {/* Impact flash */}
          <AnimatePresence>
            {hasLanded && (
              <motion.div
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-amber-500/10 pointer-events-none z-5"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Controls Panel */}
        <div className="lg:w-[360px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Graph */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">ĐỒ THỊ VẬN TỐC — THỜI GIAN</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 160 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
          </div>

          {/* Planet selector */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">HÀNH TINH</div>
            <button
              onClick={() => setShowPlanetPicker(!showPlanetPicker)}
              disabled={isRunning}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl px-4 py-3 transition-colors disabled:opacity-40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{planet.emoji}</span>
                <div className="text-left">
                  <div className="font-bold text-sm">{planet.name}</div>
                  <div className="text-xs text-slate-400">g = {planet.g} m/s²</div>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showPlanetPicker ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showPlanetPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2 space-y-1"
                >
                  {PLANETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => { setPlanetIdx(i); setShowPlanetPicker(false); resetSim(); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left
                        ${i === planetIdx ? 'bg-white/10 ring-1 ring-amber-500/30' : 'bg-white/3 hover:bg-white/5'}`}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <span className="font-bold text-xs">{p.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">g={p.g}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Height slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">ĐỘ CAO</span>
              <span className="text-sm font-extrabold text-amber-400">{height} m</span>
            </div>
            <input
              type="range" min="10" max="200" step="5" value={height}
              onChange={e => { setHeight(+e.target.value); resetSim(); }}
              disabled={isRunning}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>10m</span><span>200m</span>
            </div>
          </div>

          {/* Predictions */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">DỰ ĐOÁN LÝ THUYẾT</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-sky-400">{totalFallTime.toFixed(2)}s</div>
                <div className="text-[10px] text-slate-400 font-bold">Thời gian rơi</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-red-400">{impactVelocity.toFixed(1)}</div>
                <div className="text-[10px] text-slate-400 font-bold">Vận tốc chạm (m/s)</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 flex gap-3">
            <button
              onClick={resetSim}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={isRunning ? () => {} : startSim}
              disabled={isRunning}
              className={`flex-1 h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all
                ${isRunning
                  ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed'
                  : hasLanded
                    ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                }`}
            >
              {isRunning ? <><Pause size={16} /> Đang rơi...</> : hasLanded ? <><RotateCcw size={16} /> THẢ LẠI</> : <><Play size={16} /> THẢ VẬT</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
