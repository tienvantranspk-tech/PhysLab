import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw } from 'lucide-react';

export default function OhmLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  const [voltage, setVoltage] = useState(6); // Volts
  const [resistance, setResistance] = useState(100); // Ohms
  const [isRunning, setIsRunning] = useState(true);
  const [measurements, setMeasurements] = useState([]);

  const current = voltage / resistance; // Amps
  const currentMA = current * 1000; // mA
  const power = voltage * current; // Watts

  // Record measurement
  const addMeasurement = useCallback(() => {
    setMeasurements(prev => {
      const exists = prev.find(m => Math.abs(m.v - voltage) < 0.1 && Math.abs(m.r - resistance) < 1);
      if (exists) return prev;
      return [...prev, { v: voltage, i: current, r: resistance }].slice(-20);
    });
  }, [voltage, current, resistance]);

  useEffect(() => { addMeasurement(); }, [voltage, resistance]);

  // Circuit canvas
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

    // Circuit path
    const cx = w / 2, cy = h / 2;
    const rw = Math.min(w * 0.35, 250);
    const rh = Math.min(h * 0.3, 150);
    const left = cx - rw, right = cx + rw, top = cy - rh, bot = cy + rh;

    // Wires
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(left, top); ctx.lineTo(right, top);
    ctx.lineTo(right, bot); ctx.lineTo(left, bot);
    ctx.lineTo(left, top);
    ctx.stroke();

    // Wire glow
    const wireGlow = current > 0 ? Math.min(current * 80, 15) : 0;
    if (wireGlow > 0) {
      ctx.strokeStyle = `rgba(251,191,36,${Math.min(current * 3, 0.15)})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(left, top); ctx.lineTo(right, top);
      ctx.lineTo(right, bot); ctx.lineTo(left, bot);
      ctx.lineTo(left, top);
      ctx.stroke();
    }

    // Battery (left side)
    const batX = left, batY = cy;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(batX - 25, batY - 30, 50, 60);
    // + terminal
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(batX - 12, batY - 15); ctx.lineTo(batX + 12, batY - 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(batX, batY - 22); ctx.lineTo(batX, batY - 8); ctx.stroke();
    // - terminal
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(batX - 8, batY + 15); ctx.lineTo(batX + 8, batY + 15); ctx.stroke();
    // Battery body
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(batX - 18, batY - 25, 36, 50);
    // Voltage label
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 14px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, batX, batY + 5);

    // Resistor (top side)
    const resX = cx, resY = top;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(resX - 35, resY - 15, 70, 30);
    // Zigzag
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(resX - 30, resY);
    const zigs = 6;
    for (let i = 0; i < zigs; i++) {
      const zx = resX - 25 + (50 * i / zigs);
      ctx.lineTo(zx + 4, resY - 8);
      ctx.lineTo(zx + 8, resY + 8);
    }
    ctx.lineTo(resX + 30, resY);
    ctx.stroke();
    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 11px Quicksand';
    ctx.fillText(`${resistance}Ω`, resX, resY - 22);

    // Electron particles flowing
    if (current > 0 && isRunning) {
      const numElectrons = Math.floor(Math.min(current * 200, 25));
      const speed = Math.min(current * 500, 100);
      const now = Date.now();
      const perimeter = 2 * (right - left) + 2 * (bot - top);

      for (let i = 0; i < numElectrons; i++) {
        const phase = ((now * speed * 0.0001) + (i / numElectrons)) % 1;
        const dist = phase * perimeter;
        let ex, ey;

        if (dist < right - left) {
          ex = left + dist; ey = bot; // bottom, left to right
        } else if (dist < right - left + bot - top) {
          ex = right; ey = bot - (dist - (right - left)); // right, bottom to top
        } else if (dist < 2 * (right - left) + bot - top) {
          ex = right - (dist - (right - left) - (bot - top)); ey = top; // top, right to left
        } else {
          ex = left; ey = top + (dist - 2 * (right - left) - (bot - top)); // left, top to bottom
        }

        // Electron glow
        const eGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
        eGlow.addColorStop(0, 'rgba(56,189,248,0.6)');
        eGlow.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fillStyle = eGlow; ctx.fill();

        // Electron dot
        ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8'; ctx.fill();

        // e⁻ label on some
        if (i % 5 === 0) {
          ctx.fillStyle = 'rgba(56,189,248,0.5)';
          ctx.font = '8px Quicksand';
          ctx.textAlign = 'center';
          ctx.fillText('e⁻', ex, ey - 8);
        }
      }
    }

    // Ammeter (right side)
    const amX = right, amY = cy;
    ctx.beginPath(); ctx.arc(amX, amY, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 10px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('A', amX, amY - 5);
    ctx.font = 'bold 11px Quicksand';
    ctx.fillText(`${currentMA.toFixed(1)}`, amX, amY + 10);

    // Current direction arrows
    const arrowPositions = [
      { x: cx, y: bot, angle: 0 },
      { x: right, y: cy + rh / 2, angle: -Math.PI / 2 },
      { x: cx, y: top, angle: Math.PI },
      { x: left, y: cy - rh / 2, angle: Math.PI / 2 },
    ];
    ctx.fillStyle = 'rgba(251,191,36,0.5)';
    arrowPositions.forEach(({ x, y, angle }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-4, -5); ctx.lineTo(-4, 5); ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

  }, [voltage, resistance, current, currentMA, isRunning]);

  useEffect(() => {
    draw();
    if (!isRunning) return;
    const id = setInterval(draw, 50);
    return () => clearInterval(id);
  }, [draw, isRunning]);

  // V-I Graph
  useEffect(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 40, r: 10, t: 10, b: 28 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('U (V)', w / 2, h - 4);
    ctx.save(); ctx.translate(10, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('I (mA)', 0, 0); ctx.restore();

    const maxV = 14, maxI = 150;

    // Theoretical line for current R
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(168,85,247,0.2)';
    ctx.beginPath();
    ctx.moveTo(pad.l, h - pad.b);
    ctx.lineTo(pad.l + gw, h - pad.b - (maxV / resistance * 1000 / maxI) * gh);
    ctx.stroke();
    ctx.setLineDash([]);

    // Data points
    measurements.forEach((m, i) => {
      const x = pad.l + (m.v / maxV) * gw;
      const y = h - pad.b - (m.i * 1000 / maxI) * gh;

      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.8)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.1)'; ctx.fill();
    });

    // Current point highlight
    const cx = pad.l + (voltage / maxV) * gw;
    const cy = h - pad.b - (currentMA / maxI) * gh;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24'; ctx.fill();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.shadowBlur = 0;

  }, [measurements, voltage, currentMA, resistance]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">ĐỊNH LUẬT OHM</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Ohm's Law · U = I × R</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="font-mono text-sm">
                <span className="text-amber-400">U</span>
                <span className="text-slate-400"> = </span>
                <span className="text-sky-400">I</span>
                <span className="text-slate-400"> × </span>
                <span className="text-purple-400">R</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="font-mono text-xs">
                <span className="text-amber-400 font-bold">{voltage}V</span>
                <span className="text-slate-400"> = </span>
                <span className="text-sky-400 font-bold">{currentMA.toFixed(1)}mA</span>
                <span className="text-slate-400"> × </span>
                <span className="text-purple-400 font-bold">{resistance}Ω</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">CÔNG SUẤT</div>
              <div className="font-mono text-sm text-red-400 font-bold">P = {(power * 1000).toFixed(1)} mW</div>
            </div>
          </div>
        </div>

        <div className="lg:w-[360px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">ĐỒ THỊ V-I</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 150 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">ĐIỆN ÁP (U)</span>
              <span className="text-sm font-extrabold text-amber-400">{voltage} V</span>
            </div>
            <input type="range" min="0" max="12" step="0.5" value={voltage}
              onChange={e => setVoltage(+e.target.value)} className="w-full accent-amber-500" />
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">ĐIỆN TRỞ (R)</span>
              <span className="text-sm font-extrabold text-purple-400">{resistance} Ω</span>
            </div>
            <input type="range" min="10" max="500" step="10" value={resistance}
              onChange={e => setResistance(+e.target.value)} className="w-full accent-purple-500" />
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">KẾT QUẢ ĐO</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-xl p-2 text-center">
                <div className="text-lg font-extrabold text-amber-400">{voltage}</div>
                <div className="text-[9px] text-slate-400 font-bold">Volt (V)</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 text-center">
                <div className="text-lg font-extrabold text-sky-400">{currentMA.toFixed(1)}</div>
                <div className="text-[9px] text-slate-400 font-bold">mA (I)</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 text-center">
                <div className="text-lg font-extrabold text-purple-400">{resistance}</div>
                <div className="text-[9px] text-slate-400 font-bold">Ohm (Ω)</div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">NHẬN XÉT</div>
            <div className="bg-white/5 rounded-xl p-3 text-[10px] text-slate-300 font-semibold leading-relaxed space-y-1">
              <p>⚡ Khi <span className="text-amber-400 font-bold">tăng U</span> mà R không đổi → <span className="text-sky-400 font-bold">I tăng</span> (electron chạy nhanh hơn)</p>
              <p>⚡ Khi <span className="text-purple-400 font-bold">tăng R</span> mà U không đổi → <span className="text-sky-400 font-bold">I giảm</span> (electron khó đi qua hơn)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
