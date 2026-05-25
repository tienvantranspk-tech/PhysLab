import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function MirrorLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [incidentAngle, setIncidentAngle] = useState(45); // degrees
  const [showNormal, setShowNormal] = useState(true);
  const [showProtractor, setShowProtractor] = useState(true);
  const [mirrorType, setMirrorType] = useState('flat'); // flat, concave

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

    const mirrorX = w * 0.5;
    const mirrorTop = h * 0.15;
    const mirrorBot = h * 0.85;
    const mirrorLen = mirrorBot - mirrorTop;
    const hitY = h * 0.5;
    const hitX = mirrorX;

    // Mirror surface
    const mGrad = ctx.createLinearGradient(mirrorX, mirrorTop, mirrorX, mirrorBot);
    mGrad.addColorStop(0, 'rgba(148,163,184,0.1)');
    mGrad.addColorStop(0.5, 'rgba(148,163,184,0.4)');
    mGrad.addColorStop(1, 'rgba(148,163,184,0.1)');
    ctx.strokeStyle = mGrad;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(mirrorX, mirrorTop); ctx.lineTo(mirrorX, mirrorBot); ctx.stroke();

    // Mirror reflection lines (hatching)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    for (let y = mirrorTop; y < mirrorBot; y += 12) {
      ctx.beginPath();
      ctx.moveTo(mirrorX + 2, y);
      ctx.lineTo(mirrorX + 12, y + 8);
      ctx.stroke();
    }

    // Mirror glow
    ctx.strokeStyle = 'rgba(148,163,184,0.08)';
    ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(mirrorX, mirrorTop); ctx.lineTo(mirrorX, mirrorBot); ctx.stroke();

    // Normal line (dashed)
    if (showNormal) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hitX - 200, hitY);
      ctx.lineTo(hitX + 200, hitY);
      ctx.stroke();

      // Vertical normal
      ctx.beginPath();
      ctx.moveTo(hitX, hitY - 120);
      ctx.lineTo(hitX, hitY + 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Normal label
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 10px Quicksand';
      ctx.textAlign = 'center';
      ctx.fillText('Pháp tuyến', hitX, hitY - 130);
    }

    // Calculate angles
    const angleRad = (incidentAngle * Math.PI) / 180;
    const beamLen = Math.min(w * 0.4, 300);

    // Incident ray
    const incStartX = hitX - Math.sin(angleRad) * beamLen;
    const incStartY = hitY - Math.cos(angleRad) * beamLen;

    // Incident beam glow
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(incStartX, incStartY); ctx.lineTo(hitX, hitY); ctx.stroke();
    ctx.shadowBlur = 0;

    // Wider glow
    ctx.strokeStyle = 'rgba(251,191,36,0.08)';
    ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(incStartX, incStartY); ctx.lineTo(hitX, hitY); ctx.stroke();

    // Arrow on incident
    const arrowDist = 0.6;
    const ax = incStartX + (hitX - incStartX) * arrowDist;
    const ay = incStartY + (hitY - incStartY) * arrowDist;
    const aAngle = Math.atan2(hitY - incStartY, hitX - incStartX);
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(ax + Math.cos(aAngle) * 8, ay + Math.sin(aAngle) * 8);
    ctx.lineTo(ax + Math.cos(aAngle + 2.5) * 8, ay + Math.sin(aAngle + 2.5) * 8);
    ctx.lineTo(ax + Math.cos(aAngle - 2.5) * 8, ay + Math.sin(aAngle - 2.5) * 8);
    ctx.closePath(); ctx.fill();

    // Reflected ray (same angle, mirrored)
    const refEndX = hitX - Math.sin(angleRad) * beamLen;
    const refEndY = hitY + Math.cos(angleRad) * beamLen;

    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(hitX, hitY); ctx.lineTo(refEndX, refEndY); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(56,189,248,0.08)';
    ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(hitX, hitY); ctx.lineTo(refEndX, refEndY); ctx.stroke();

    // Arrow on reflected
    const rx = hitX + (refEndX - hitX) * arrowDist;
    const ry = hitY + (refEndY - hitY) * arrowDist;
    const rAngle = Math.atan2(refEndY - hitY, refEndX - hitX);
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(rx + Math.cos(rAngle) * 8, ry + Math.sin(rAngle) * 8);
    ctx.lineTo(rx + Math.cos(rAngle + 2.5) * 8, ry + Math.sin(rAngle + 2.5) * 8);
    ctx.lineTo(rx + Math.cos(rAngle - 2.5) * 8, ry + Math.sin(rAngle - 2.5) * 8);
    ctx.closePath(); ctx.fill();

    // Hit point glow
    const hGlow = ctx.createRadialGradient(hitX, hitY, 0, hitX, hitY, 25);
    hGlow.addColorStop(0, 'rgba(255,255,255,0.3)');
    hGlow.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(hitX, hitY, 25, 0, Math.PI * 2);
    ctx.fillStyle = hGlow; ctx.fill();
    ctx.beginPath(); ctx.arc(hitX, hitY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF'; ctx.fill();

    // Protractor arcs
    if (showProtractor) {
      const arcR = 60;
      // Incident angle arc
      ctx.beginPath();
      ctx.arc(hitX, hitY, arcR, -Math.PI / 2, -Math.PI / 2 + angleRad);
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Reflected angle arc
      ctx.beginPath();
      ctx.arc(hitX, hitY, arcR, Math.PI / 2 - angleRad, Math.PI / 2);
      ctx.strokeStyle = 'rgba(56,189,248,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angle labels
      const iLabelR = arcR + 20;
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 13px Quicksand';
      ctx.textAlign = 'center';
      const iLx = hitX + Math.cos(-Math.PI / 2 + angleRad / 2) * iLabelR;
      const iLy = hitY + Math.sin(-Math.PI / 2 + angleRad / 2) * iLabelR;
      ctx.fillText(`i = ${incidentAngle}°`, iLx - 30, iLy);

      ctx.fillStyle = '#38BDF8';
      const rLx = hitX + Math.cos(Math.PI / 2 - angleRad / 2) * iLabelR;
      const rLy = hitY + Math.sin(Math.PI / 2 - angleRad / 2) * iLabelR;
      ctx.fillText(`r = ${incidentAngle}°`, rLx - 30, rLy);
    }

    // Labels
    ctx.font = 'bold 11px Quicksand';
    ctx.fillStyle = '#FBBF24';
    ctx.textAlign = 'left';
    ctx.fillText('Tia tới', incStartX + 10, incStartY + 5);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('Tia phản xạ', refEndX + 10, refEndY - 10);

  }, [incidentAngle, showNormal, showProtractor, mirrorType]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHẢN XẠ ÁNH SÁNG</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Mirror Reflection</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">ĐỊNH LUẬT</div>
              <div className="font-mono text-sm text-emerald-400 font-bold">Góc tới = Góc phản xạ</div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="font-mono text-sm">
                <span className="text-amber-400">i</span>
                <span className="text-slate-400"> = </span>
                <span className="text-sky-400">r</span>
                <span className="text-slate-400"> = </span>
                <span className="text-white font-bold">{incidentAngle}°</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">GÓC TỚI</span>
              <span className="text-sm font-extrabold text-amber-400">{incidentAngle}°</span>
            </div>
            <input type="range" min="5" max="85" step="1" value={incidentAngle}
              onChange={e => setIncidentAngle(+e.target.value)}
              className="w-full accent-amber-500" />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>5°</span><span>85°</span>
            </div>
          </div>

          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Pháp tuyến</span>
              <button onClick={() => setShowNormal(!showNormal)}
                className={`w-10 h-6 rounded-full transition-colors relative ${showNormal ? 'bg-sky-500' : 'bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showNormal ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Thước đo góc</span>
              <button onClick={() => setShowProtractor(!showProtractor)}
                className={`w-10 h-6 rounded-full transition-colors relative ${showProtractor ? 'bg-sky-500' : 'bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showProtractor ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">GÓC ĐẶC BIỆT</div>
            <div className="flex gap-2 flex-wrap">
              {[15, 30, 45, 60, 75].map(a => (
                <button key={a} onClick={() => setIncidentAngle(a)}
                  className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all ${incidentAngle === a ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {a}°
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">LÝ THUYẾT</div>
            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                <span className="text-amber-400 font-bold">Tia tới</span> chiếu vào gương, gặp <span className="text-slate-200 font-bold">pháp tuyến</span> vuông góc với mặt gương tại điểm tới.
              </div>
              <div className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                <span className="text-sky-400 font-bold">Tia phản xạ</span> nằm trong cùng mặt phẳng với tia tới và pháp tuyến.
              </div>
              <div className="text-[10px] text-emerald-400 font-bold">
                ✦ Góc tới (i) luôn bằng góc phản xạ (r)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
