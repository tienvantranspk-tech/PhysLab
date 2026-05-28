import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

// Get RGB values representing wavelength colors
function getColorFromWavelength(wave) {
  if (wave >= 380 && wave < 440) return { r: 120, g: 0, b: 220, hex: '#8B5CF6' }; // Violet
  if (wave >= 440 && wave < 485) return { r: 0, g: 100, b: 255, hex: '#3B82F6' }; // Blue
  if (wave >= 485 && wave < 500) return { r: 0, g: 200, b: 200, hex: '#06B6D4' }; // Cyan
  if (wave >= 500 && wave < 565) return { r: 34, g: 197, b: 94, hex: '#22C55E' }; // Green
  if (wave >= 565 && wave < 590) return { r: 234, g: 179, b: 8, hex: '#EAB308' }; // Yellow
  if (wave >= 590 && wave < 625) return { r: 249, g: 115, b: 22, hex: '#F97316' }; // Orange
  if (wave >= 625 && wave <= 780) return { r: 239, g: 68, b: 68, hex: '#EF4444' }; // Red
  return { r: 255, g: 255, b: 255, hex: '#FFFFFF' };
}

export default function YoungInterferenceLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [wavelength, setWavelength] = useState(550); // nm
  const [slitA, setSlitA] = useState(0.5); // mm (a: separation between slits)
  const [distD, setDistD] = useState(2.0); // m (D: distance to screen)

  // Fringe width calculation: i = lambda * D / a
  const lambdaM = wavelength * 1e-9;
  const distDM = distD;
  const slitAM = slitA * 1e-3;
  const fringeWidthM = (lambdaM * distDM) / slitAM;
  const fringeWidthMm = fringeWidthM * 1000; // mm

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const midY = h / 2 - 10;
    const colorInfo = getColorFromWavelength(wavelength);

    // 1. Draw Lasers propagation rays
    ctx.strokeStyle = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, 0.25)`;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(30, midY);
    ctx.lineTo(120, midY);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, midY); ctx.lineTo(120, midY); ctx.stroke();

    // Laser box Emitter
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(20, midY - 12, 40, 24);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(20, midY - 12, 40, 24);

    // Slits barrier
    ctx.fillStyle = '#475569';
    ctx.fillRect(120, 20, 6, 200);

    // Render slits opening holes
    const visualGap = slitA * 30; // visual scaler
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(120, midY - visualGap / 2 - 3, 6, 6);
    ctx.fillRect(120, midY + visualGap / 2 - 3, 6, 6);

    // Draw propagating overlapping waves (ripples)
    ctx.strokeStyle = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, 0.08)`;
    ctx.lineWidth = 1;
    for (let r = 10; r < 140; r += 15) {
      ctx.beginPath(); ctx.arc(126, midY - visualGap / 2, r, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(126, midY + visualGap / 2, r, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }

    // 2. Draw Interference Fringes Pattern on Screen
    // The screen is on the right side (from x = w - 60 to w - 20)
    const screenX = w - 60;
    const screenW = 40;
    const screenH = h - 40;
    const screenY = 20;

    // Render bright and dark bands on the screen using mathematical intensity distributions
    // Intensity I = I_0 * cos^2(pi * y * a / (lambda * D))
    ctx.fillStyle = '#090D16';
    ctx.fillRect(screenX, screenY, screenW, screenH);

    for (let y = screenY; y < screenY + screenH; y++) {
      const dy = y - (screenY + screenH / 2); // distance from center fringe
      const dyMm = dy * 0.04; // convert pixel position to mm scale
      const pathDifference = (slitAM * dyMm * 1e-3) / distDM;
      const phaseDiff = (2 * Math.PI * pathDifference) / lambdaM;
      const intensity = Math.pow(Math.cos(phaseDiff / 2), 2); // 0 to 1

      ctx.fillStyle = `rgba(${colorInfo.r * intensity}, ${colorInfo.g * intensity}, ${colorInfo.b * intensity}, 1)`;
      ctx.fillRect(screenX + 2, y, screenW - 4, 1);
    }

    // Screen frame
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX, screenY, screenW, screenH);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 8px Quicksand';
    ctx.fillText('Màn chắn', screenX, screenY - 8);

  }, [wavelength, slitA, distD, lambdaM, slitAM, distDM]);

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
          <h1 className="font-extrabold text-sm tracking-wide">THÍ NGHIỆM GIAO THOA ÁNH SÁNG</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Young's Slit Light Interference</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative bg-slate-950/80 min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">KHOẢNG VÂN GIAO THOA (i)</div>
              <div className="font-mono text-xs text-sky-400 font-bold">
                i = {fringeWidthMm.toFixed(3)} mm
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">THIẾT LẬP THÔNG SỐ SÓNG</div>

          {/* Wavelength Slider (changes color) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">BƯỚC SÓNG ÁNH SÁNG (λ)</span>
              <span className="font-extrabold" style={{ color: getColorFromWavelength(wavelength).hex }}>
                {wavelength} nm
              </span>
            </div>
            <input type="range" min="390" max="750" step="5" value={wavelength}
              onChange={e => setWavelength(+e.target.value)} className="w-full accent-purple-500" />
            <div className="h-2 bg-gradient-to-r from-violet-600 via-green-500 to-red-600 rounded-full" />
          </div>

          {/* Slit separation Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">KHOẢNG CÁCH 2 KHE (a)</span>
              <span className="font-extrabold text-sky-400">{slitA} mm</span>
            </div>
            <input type="range" min="0.2" max="1.5" step="0.05" value={slitA}
              onChange={e => setSlitA(+e.target.value)} className="w-full accent-sky-500" />
          </div>

          {/* Slit to Screen distance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">KHOẢNG CÁCH ĐẾN MÀN (D)</span>
              <span className="font-extrabold text-pink-400">{distD} meter</span>
            </div>
            <input type="range" min="1.0" max="3.0" step="0.1" value={distD}
              onChange={e => setDistD(+e.target.value)} className="w-full accent-pink-500" />
          </div>

          {/* Scientific explanation */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">CÔNG THỨC KHOẢNG VÂN</div>
            <div className="bg-[#0B1120] rounded-xl p-2.5 font-mono text-xs text-slate-300 text-center">
              i = λ × D / a
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              * Khoảng cách giữa 2 vân sáng (hoặc 2 vân tối) liên tiếp gọi là khoảng vân $i$.<br/>
              * Tăng bước sóng $\lambda$ (chuyển từ Tím sang Đỏ) hoặc tăng khoảng cách màn $D$ làm khoảng vân giãn rộng ra.<br/>
              * Thu hẹp khe hở $a$ làm các vạch khít sát lại gần nhau hơn.
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="young" />
    </div>
  );
}
