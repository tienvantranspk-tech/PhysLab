import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

export default function HookeLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  const [k, setK] = useState(50); // N/m (Stiffness)
  const [mass, setMass] = useState(1); // kg (Mass hanging)
  const [gravity, setGravity] = useState(9.8); // m/s2
  const [history, setHistory] = useState([]);

  // F = m * g = k * x  => x = (m * g) / k
  const force = mass * gravity; // N
  const elongation = force / k; // m
  const elongationCm = elongation * 100; // cm

  // Record history when variables change
  useEffect(() => {
    setHistory(prev => {
      const exists = prev.find(h => Math.abs(h.k - k) < 0.1 && Math.abs(h.mass - mass) < 0.05);
      if (exists) return prev;
      return [...prev, { k, mass, force, x: elongationCm }].slice(-25);
    });
  }, [k, mass, force, elongationCm]);

  const drawSpring = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    // Ceiling support
    ctx.fillStyle = '#475569';
    ctx.fillRect(w / 2 - 40, 20, 80, 8);

    // Spring drawing properties
    const startY = 28;
    const restLength = 80;
    // Scale elongation for visibility
    const displayElongation = elongationCm * 3;
    const currentLength = restLength + displayElongation;
    const endY = startY + currentLength;
    const cx = w / 2;

    // Draw Spring zig-zags
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, startY);

    const coils = 16;
    const coilHeight = currentLength / coils;
    for (let i = 0; i < coils; i++) {
      const cy = startY + coilHeight * (i + 0.5);
      const rx = cx + (i % 2 === 0 ? 12 : -12);
      ctx.lineTo(rx, cy);
    }
    ctx.lineTo(cx, endY);
    ctx.stroke();

    // Draw hanging hook & weight block
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    // Hook
    ctx.beginPath();
    ctx.arc(cx, endY + 8, 8, -Math.PI / 2, Math.PI);
    ctx.stroke();

    // Weight block
    const blockH = Math.min(60, 25 + mass * 15);
    const blockW = Math.min(60, 25 + mass * 15);
    ctx.fillRect(cx - blockW / 2, endY + 16, blockW, blockH);
    ctx.strokeRect(cx - blockW / 2, endY + 16, blockW, blockH);

    // Weight labels
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass} kg`, cx, endY + 16 + blockH / 2 + 3);

    // Ruler measurement line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx - 80, startY + restLength); ctx.lineTo(cx + 80, startY + restLength); ctx.stroke();
    ctx.strokeStyle = '#EF4444';
    ctx.beginPath(); ctx.moveTo(cx - 80, endY); ctx.lineTo(cx + 80, endY); ctx.stroke();
    ctx.setLineDash([]);

    // Ruler sidebar
    const rx = cx - 70;
    ctx.fillStyle = '#64748B';
    ctx.fillRect(rx - 2, startY, 4, 200);
    ctx.font = '7px Monospace';
    ctx.textAlign = 'right';
    for (let offset = 0; offset <= 150; offset += 10) {
      const ry = startY + offset * 1.2;
      ctx.beginPath(); ctx.moveTo(rx - 4, ry); ctx.lineTo(rx + 4, ry); ctx.stroke();
      ctx.fillText(`${offset} cm`, rx - 8, ry + 2.5);
    }
  }, [mass, elongationCm]);

  const drawGraph = useCallback(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 35, r: 10, t: 10, b: 25 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

    // Axes
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Độ giãn x (cm)', w / 2, h - 3);
    ctx.save(); ctx.translate(10, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Lực F (N)', 0, 0); ctx.restore();

    const maxF = 40, maxX = 60; // Max plot bounds

    // Theoretical line (F = k * x)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.moveTo(pad.l, h - pad.b);
    ctx.lineTo(pad.l + gw, h - pad.b - ((k * (maxX / 100)) / maxF) * gh);
    ctx.stroke();

    // Plot historical dots
    history.forEach(pt => {
      const px = pad.l + (pt.x / maxX) * gw;
      const py = h - pad.b - (pt.force / maxF) * gh;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.6)'; ctx.fill();
    });

    // Current point
    const cx = pad.l + (elongationCm / maxX) * gw;
    const cy = h - pad.b - (force / maxF) * gh;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24'; ctx.fill();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }, [history, elongationCm, force, k]);

  useEffect(() => {
    drawSpring();
    drawGraph();
  }, [drawSpring, drawGraph]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">ĐỊNH LUẬT HOOKE (ĐÀN HỒI)</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Spring Elasticity · F = k × x</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="font-mono text-xs">
                <span className="text-amber-400 font-bold">F = k × x</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="font-mono text-[10px]">
                <span className="text-amber-400">{force.toFixed(1)} N</span> = <span className="text-sky-400">{k} N/m</span> × <span className="text-purple-400">{elongation.toFixed(3)} m ({elongationCm.toFixed(1)} cm)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          {/* F-x graph */}
          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">ĐỒ THỊ ĐÀN HỒI F-x</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden shadow-lg" style={{ height: 140 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
          </div>

          {/* Mass hanger slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">KHỐI LƯỢNG MÓC TREO (m)</span>
              <span className="text-sm font-extrabold text-amber-400">{mass} kg</span>
            </div>
            <input type="range" min="0.2" max="3" step="0.1" value={mass}
              onChange={e => setMass(+e.target.value)} className="w-full accent-amber-500" />
          </div>

          {/* Spring constant k slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">ĐỘ CỨNG LÒ XO (k)</span>
              <span className="text-sm font-extrabold text-sky-400">{k} N/m</span>
            </div>
            <input type="range" min="20" max="150" step="5" value={k}
              onChange={e => setK(+e.target.value)} className="w-full accent-sky-500" />
          </div>

          {/* Planet gravity slider */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">MÔI TRƯỜNG GIA TỐC (g)</span>
              <span className="text-xs font-bold text-slate-300">
                {gravity === 9.8 ? 'Trái Đất (9.8m/s²)' : gravity === 1.6 ? 'Mặt Trăng (1.6m/s²)' : 'Mộc Tinh (24.8m/s²)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'M.Trăng', val: 1.6 },
                { name: 'T.Đất', val: 9.8 },
                { name: 'Mộc Tinh', val: 24.8 }
              ].map(planet => (
                <button
                  key={planet.val}
                  onClick={() => setGravity(planet.val)}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all ${gravity === planet.val ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                >
                  {planet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2">Ý NGHĨA VẬT LÝ</div>
            <div className="bg-white/5 rounded-xl p-3 text-[10px] text-slate-300 font-semibold leading-relaxed space-y-1">
              <p>💡 Lực đàn hồi tỉ lệ thuận với độ biến dạng x của lò xo.</p>
              <p>💡 Lò xo càng cứng (k lớn) thì càng khó kéo giãn (độ giãn x càng nhỏ khi cùng lực tác dụng).</p>
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="hooke" />
    </div>
  );
}
