import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';

const COLORS = [
  { name: 'Đỏ', hex: '#EF4444', wave: 700 },
  { name: 'Cam', hex: '#F97316', wave: 620 },
  { name: 'Vàng', hex: '#EAB308', wave: 580 },
  { name: 'Lục', hex: '#22C55E', wave: 530 },
  { name: 'Lam', hex: '#3B82F6', wave: 480 },
  { name: 'Chàm', hex: '#6366F1', wave: 450 },
  { name: 'Tím', hex: '#A855F7', wave: 400 },
];

export default function PrismLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [prismAngle, setPrismAngle] = useState(60); // degrees
  const [beamY, setBeamY] = useState(50); // % from top
  const [showLabels, setShowLabels] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

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
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Prism geometry
    const cx = w * 0.45;
    const cy = h * 0.5;
    const prismSize = Math.min(w, h) * 0.25;
    const halfAngle = (prismAngle / 2) * (Math.PI / 180);

    // Triangle vertices
    const topX = cx;
    const topY = cy - prismSize * 0.8;
    const blX = cx - prismSize * Math.tan(halfAngle) * 0.8;
    const blY = cy + prismSize * 0.4;
    const brX = cx + prismSize * Math.tan(halfAngle) * 0.8;
    const brY = cy + prismSize * 0.4;

    // Prism glow
    const pGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, prismSize * 1.5);
    pGlow.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
    pGlow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, prismSize * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = pGlow;
    ctx.fill();

    // Prism body
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(blX, blY);
    ctx.lineTo(brX, brY);
    ctx.closePath();
    const prismGrad = ctx.createLinearGradient(blX, blY, brX, topY);
    prismGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
    prismGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
    prismGrad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
    ctx.fillStyle = prismGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Prism inner edges glow
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(topX, topY); ctx.lineTo(cx, cy); ctx.stroke();

    // Angle label
    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 12px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${prismAngle}°`, topX, topY - 12);

    // Incoming white beam
    const beamStart = 30;
    const entryY = topY + (blY - topY) * (beamY / 100);
    const entryX = blX + (topX - blX) * (1 - beamY / 100);

    // White beam with glow
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beamStart, entryY);
    ctx.lineTo(entryX, entryY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Beam outer glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(beamStart, entryY);
    ctx.lineTo(entryX, entryY);
    ctx.stroke();

    // "White light" label
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 11px Quicksand, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ánh sáng trắng', beamStart, entryY - 15);

    // Dispersion — rainbow beams exiting
    const exitX = brX - (brX - cx) * 0.3;
    const exitY = cy + prismSize * 0.1;
    const spreadAngle = (prismAngle / 60) * 35; // spread proportional to prism angle

    COLORS.forEach((c, i) => {
      const frac = i / (COLORS.length - 1); // 0 to 1
      const angle = ((spreadAngle / 2) - spreadAngle * frac) * (Math.PI / 180);
      const beamLen = w * 0.45;
      const endX = exitX + Math.cos(angle + 0.15) * beamLen;
      const endY = exitY - Math.sin(angle - 0.3) * beamLen + frac * spreadAngle * 2.5;

      // Beam glow
      ctx.shadowColor = c.hex;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = c.hex;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wider glow
      ctx.strokeStyle = c.hex;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Label
      if (showLabels) {
        ctx.fillStyle = c.hex;
        ctx.font = 'bold 10px Quicksand, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${c.name} (${c.wave}nm)`, endX + 8, endY + 4);
      }
    });

    // Internal beam (through prism)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(entryX, entryY);
    ctx.lineTo(exitX, exitY);
    ctx.stroke();

  }, [prismAngle, beamY, showLabels]);

  useEffect(() => { draw(); }, [draw]);

  // Handle beam Y drag
  const handleCanvasMove = useCallback((e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) / rect.height * 100;
    setBeamY(Math.max(20, Math.min(80, y)));
  }, [isDragging]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">TÁN SẮC ÁNH SÁNG</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Prism Dispersion</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleCanvasMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleCanvasMove}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

          {/* Info overlay */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">HIỆN TƯỢNG</div>
              <div className="text-sm font-bold text-purple-300">Tán sắc ánh sáng</div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5 max-w-[220px]">
              <div className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                Ánh sáng trắng qua lăng kính bị <span className="text-purple-300 font-bold">tách thành 7 màu</span> do mỗi màu có bước sóng khác nhau.
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-bold">
            💡 Kéo chuột trên canvas để điều chỉnh tia sáng
          </div>
        </div>

        {/* Controls */}
        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          {/* Color spectrum */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">PHỔ MÀU</div>
            <div className="flex flex-col gap-1.5">
              {COLORS.map(c => (
                <div key={c.name} className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-1.5">
                  <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}40` }} />
                  <span className="font-bold text-xs flex-1" style={{ color: c.hex }}>{c.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{c.wave} nm</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prism angle */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">GÓC LĂNG KÍNH</span>
              <span className="text-sm font-extrabold text-purple-400">{prismAngle}°</span>
            </div>
            <input type="range" min="30" max="90" step="5" value={prismAngle}
              onChange={e => setPrismAngle(+e.target.value)}
              className="w-full accent-purple-500" />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>30°</span><span>90°</span>
            </div>
          </div>

          {/* Toggle labels */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Hiện bước sóng</span>
              <button onClick={() => setShowLabels(!showLabels)}
                className={`w-10 h-6 rounded-full transition-colors relative ${showLabels ? 'bg-purple-500' : 'bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showLabels ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Theory */}
          <div className="p-4">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">LÝ THUYẾT</div>
            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="font-mono text-xs text-center text-slate-300">
                n = <span className="text-purple-400">c</span> / <span className="text-sky-400">v</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Chiết suất (n) khác nhau với mỗi bước sóng → mỗi màu bị bẻ góc khác nhau khi qua lăng kính.
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                🔴 Đỏ: chiết suất nhỏ → lệch ít<br/>
                🟣 Tím: chiết suất lớn → lệch nhiều
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
