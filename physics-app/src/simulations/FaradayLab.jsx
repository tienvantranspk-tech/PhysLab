import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

export default function FaradayLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [coilTurns, setCoilTurns] = useState(3); // Number of loops in coil
  const [magnetX, setMagnetX] = useState(80); // Magnet x-position
  const [showFieldLines, setShowFieldLines] = useState(true);

  // Induced EMF / current state
  const [inducedCurrent, setInducedCurrent] = useState(0);
  const [bulbBrightness, setBulbBrightness] = useState(0);
  const [dragged, setDragged] = useState(false);
  const [lastX, setLastX] = useState(80);
  const [lastTime, setLastTime] = useState(Date.now());

  // Magnet drag calculations
  const handleCanvasMove = useCallback((e) => {
    if (!dragged) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const currentX = clientX - rect.left;

    const now = Date.now();
    const dt = (now - lastTime) / 1000; // seconds

    if (dt > 0.01) {
      const dx = currentX - lastX;
      const velocity = dx / dt; // pixels per second

      // Calculate proximity to the coil center (x = 300)
      const coilCenterX = 300;
      const distToCoil = Math.abs(currentX - coilCenterX);

      // Induction is strongest when near the mouth/ends of the coil (around x = 240 and x = 360)
      let fluxDeriv = 0;
      if (distToCoil < 150) {
        // Flux gradient is high at the boundaries, drops near center or far away
        const dPhi = Math.sin((currentX - coilCenterX) / 45) * Math.exp(-Math.pow((currentX - coilCenterX) / 80, 2));
        fluxDeriv = velocity * dPhi * 0.05;
      }

      const emf = -coilTurns * fluxDeriv * 0.02; // Faraday's Law: e = -N * dPhi/dt
      setInducedCurrent(Math.max(-10, Math.min(10, emf)));
      setBulbBrightness(Math.min(1, Math.pow(Math.abs(emf), 2) * 1.5));

      setLastX(currentX);
      setLastTime(now);
    }

    setMagnetX(Math.max(40, Math.min(500, currentX)));
  }, [dragged, lastX, lastTime, coilTurns]);

  // Decays current back to zero when stationary
  useEffect(() => {
    if (dragged) return;
    const interval = setInterval(() => {
      setInducedCurrent(prev => prev * 0.85);
      setBulbBrightness(prev => prev * 0.8);
    }, 40);
    return () => clearInterval(interval);
  }, [dragged]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const cy = h / 2 - 15;
    const coilCX = 320;

    // 1. Magnetic Field Lines (Iron Filings)
    if (showFieldLines) {
      ctx.strokeStyle = 'rgba(168,85,247,0.06)';
      ctx.lineWidth = 1.5;
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        const rx = 100 * Math.abs(i);
        const ry = 40 * Math.abs(i);

        ctx.beginPath();
        // Elliptic loops representing magnetic lines of force
        ctx.ellipse(magnetX, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 2. Coil (Solenoid)
    // Solenoid loops
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';

    const loopW = 20;
    const startX = coilCX - (coilTurns * loopW) / 2;

    // Draw bottom/back wire segments of the coil loops
    for (let i = 0; i < coilTurns; i++) {
      const lx = startX + i * loopW;
      ctx.beginPath();
      ctx.arc(lx + loopW / 2, cy, 25, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();
    }

    // 3. Draw Bar Magnet (Red: North, Blue: South)
    const magW = 100;
    const magH = 30;
    const mx = magnetX;

    // South Pole (Left half - Blue)
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(mx - magW / 2, cy - magH / 2, magW / 2, magH);
    // North Pole (Right half - Red)
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(mx, cy - magH / 2, magW / 2, magH);

    // Pole labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('S', mx - magW / 4, cy + 4);
    ctx.fillText('N', mx + magW / 4, cy + 4);

    // Draw front wire segments of solenoid
    ctx.strokeStyle = '#D97706';
    for (let i = 0; i < coilTurns; i++) {
      const lx = startX + i * loopW;
      ctx.beginPath();
      ctx.arc(lx + loopW / 2, cy, 25, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }

    // Solenoid Circuit Wires down to Meter & Bulb
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, cy + 25);
    ctx.lineTo(startX, cy + 70);
    ctx.lineTo(w / 2 - 40, cy + 70);

    ctx.moveTo(startX + coilTurns * loopW, cy + 25);
    ctx.lineTo(startX + coilTurns * loopW, cy + 70);
    ctx.lineTo(w / 2 + 40, cy + 70);
    ctx.stroke();

    // 4. Induced Bulb (top of the circuit meter)
    const bx = w / 2;
    const by = cy + 100;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#64748B'; ctx.stroke();

    // Bulb glow intensity
    if (bulbBrightness > 0.05) {
      const bGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 35);
      bGlow.addColorStop(0, `rgba(251,191,36,${bulbBrightness * 0.8})`);
      bGlow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(bx, by, 35, 0, Math.PI * 2);
      ctx.fillStyle = bGlow; ctx.fill();
    }

    // Bulb filament icon
    ctx.fillStyle = bulbBrightness > 0.1 ? '#FBBF24' : '#64748B';
    ctx.font = '22px Arial';
    ctx.fillText('💡', bx, by + 6);

    // 5. Galvanometer Meter (Kim Ampe kế lệch tâm)
    const gx = w / 2 - 70;
    const gy = cy + 110;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath(); ctx.arc(gx, gy, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.stroke();

    // Meter Needle: Center vertical is 0. Deflects depending on induced current
    const angleOffset = (inducedCurrent / 10) * (Math.PI / 3); // max deflection 60 deg
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + 10);
    ctx.lineTo(gx + Math.sin(angleOffset) * 16, gy + 10 - Math.cos(angleOffset) * 16);
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 6px Monospace';
    ctx.fillText('G', gx, gy + 16);

  }, [coilTurns, magnetX, showFieldLines, inducedCurrent, bulbBrightness]);

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
          <h1 className="font-extrabold text-sm tracking-wide">CẢM ỨNG ĐIỆN TỪ (FARADAY)</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Faraday Induction & Magnets</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div
          className="flex-1 relative bg-slate-950/80 min-h-0"
          onMouseDown={() => { setDragged(true); setLastTime(Date.now()); }}
          onMouseUp={() => setDragged(false)}
          onMouseLeave={() => setDragged(false)}
          onMouseMove={handleCanvasMove}
          onTouchStart={() => { setDragged(true); setLastTime(Date.now()); }}
          onTouchEnd={() => setDragged(false)}
          onTouchMove={handleCanvasMove}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">DÒNG ĐIỆN CẢM ỨNG</div>
              <div className={`text-sm font-extrabold ${Math.abs(inducedCurrent) > 0.2 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                {inducedCurrent.toFixed(2)} A
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-bold">
            💡 Click và kéo thanh nam châm N-S xuyên qua cuộn dây đồng để phát điện!
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">THIẾT LẬP THÍ NGHIỆM</div>

          {/* Solenoid turns selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">SỐ VÒNG DÂY CUỘN CẢM (N)</span>
              <span className="font-extrabold text-amber-400">{coilTurns} vòng</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map(turns => (
                <button
                  key={turns}
                  onClick={() => setCoilTurns(turns)}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all ${coilTurns === turns ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                >
                  N = {turns}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle field lines lines */}
          <div className="flex justify-between items-center bg-white/3 rounded-xl p-2.5">
            <span className="text-xs font-bold text-slate-300">Hiện đường sức từ</span>
            <button
              onClick={() => setShowFieldLines(!showFieldLines)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors ${showFieldLines ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-200'}`}
            >
              {showFieldLines ? 'ĐANG BẬT' : 'ĐANG TẮT'}
            </button>
          </div>

          {/* Science details */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">ĐỊNH LUẬT LENZ & FARADAY</div>
            <div className="bg-[#0B1120] rounded-xl p-2.5 font-mono text-[10px] text-slate-300 text-center">
              e = -N × (dΦ / dt)
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              * Dòng điện cảm ứng xuất hiện chỉ khi <b>từ thông Φ biến thiên</b> qua cuộn dây (nam châm chuyển động).<br/>
              * Kéo nam châm càng nhanh → tốc độ biến thiên dΦ/dt càng lớn → dòng điện càng mạnh → đèn sáng rực rỡ!
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="faraday" />
    </div>
  );
}
