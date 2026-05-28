import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

export default function RlcLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  const [r, setR] = useState(50); // Ohms
  const [l, setL] = useState(0.2); // Henrys
  const [c, setC] = useState(10); // MicroFarads
  const [frequency, setFrequency] = useState(100); // Hz
  const [voltage, setVoltage] = useState(10); // V

  // Physics Calculations
  const cFarad = c * 1e-6;
  const omega = 2 * Math.PI * frequency;

  // Reactance: X_L = omega * L, X_C = 1 / (omega * C)
  const xl = omega * l;
  const xc = 1 / (omega * cFarad);

  // Impedance: Z = sqrt(R^2 + (X_L - X_C)^2)
  const z = Math.sqrt(r * r + Math.pow(xl - xc, 2));

  // Current amplitude: I_0 = V_0 / Z
  const iMax = voltage / z;
  const currentMA = iMax * 1000;

  // Phase shift: tan(phi) = (X_L - X_C) / R
  const phi = Math.atan((xl - xc) / r);

  // Resonant Frequency: f_0 = 1 / (2pi * sqrt(LC))
  const resonantFreq = 1 / (2 * Math.PI * Math.sqrt(l * cFarad));

  // AC Oscilloscope canvas render
  const drawOscilloscope = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    // Oscilloscope grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Center baseline
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    // Plot Voltage & Current AC Sine Waves
    const now = Date.now() * 0.003;
    const scaleY_V = 4; // Visual scales
    const scaleY_I = 200;

    // Voltage (Amber)
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const time = x * 0.02 + now;
      const y = h / 2 - Math.sin(time) * voltage * scaleY_V;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current (Sky Blue - shifted by phi phase)
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const time = x * 0.02 + now;
      const y = h / 2 - Math.sin(time - phi) * iMax * scaleY_I;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [voltage, iMax, phi]);

  // Resonance curve sweep graph render
  const drawResonanceCurve = useCallback(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 30, r: 10, t: 10, b: 25 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

    // Plot I vs f
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxPlotFreq = 400; // max sweep
    const maxI_val = voltage / r; // pure resistor current at peak resonance

    for (let f = 1; f < maxPlotFreq; f++) {
      const cur_omega = 2 * Math.PI * f;
      const cur_xl = cur_omega * l;
      const cur_xc = 1 / (cur_omega * cFarad);
      const cur_z = Math.sqrt(r * r + Math.pow(cur_xl - cur_xc, 2));
      const cur_i = voltage / cur_z;

      const px = pad.l + (f / maxPlotFreq) * gw;
      const py = h - pad.b - (cur_i / maxI_val) * gh;

      if (f === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Highlight current point
    const cx = pad.l + (frequency / maxPlotFreq) * gw;
    const cy = h - pad.b - (iMax / maxI_val) * gh;
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = '#38BDF8'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }, [voltage, r, l, cFarad, frequency, iMax]);

  useEffect(() => {
    drawOscilloscope();
    const interval = setInterval(drawOscilloscope, 50);
    return () => clearInterval(interval);
  }, [drawOscilloscope]);

  useEffect(() => {
    drawResonanceCurve();
  }, [drawResonanceCurve]);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG THÍ NGHIỆM RLC</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Resonance & Phase Shifts</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative bg-slate-950 flex flex-col min-h-0">
          <div className="p-3 bg-slate-900 border-b border-white/5 flex justify-between text-[10px] text-slate-400 font-bold shrink-0">
            <span>🎛️ OSCILLOSCOPE KHẢO SÁT SÓNG</span>
            <span className="flex gap-4">
              <span className="text-[#FBBF24]">■ Điện áp nguồn (U)</span>
              <span className="text-[#38BDF8]">■ Dòng điện mạch (I)</span>
            </span>
          </div>
          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">PHÂN TÍCH CỘNG HƯỞNG</div>

          {/* Resonance Curve panel */}
          <div className="space-y-2">
            <div className="text-[9px] text-slate-400 font-bold">BIỂU ĐỒ QUYÉT TẦN SỐ (I-f)</div>
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 overflow-hidden" style={{ height: 130 }}>
              <canvas ref={graphRef} className="w-full h-full" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-1">
              <span>Cộng hưởng $f_0$: <b>{resonantFreq.toFixed(1)} Hz</b></span>
              <span>Đang chạy: <b>{frequency} Hz</b></span>
            </div>
          </div>

          {/* RLC Variable Controls */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">TẦN SỐ PHÁT SÓNG (f)</span>
                <span className="font-extrabold text-amber-400">{frequency} Hz</span>
              </div>
              <input type="range" min="10" max="350" step="5" value={frequency}
                onChange={e => setFrequency(+e.target.value)} className="w-full accent-amber-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">ĐIỆN TRỞ (R)</span>
                <span className="font-extrabold text-purple-400">{r} Ω</span>
              </div>
              <input type="range" min="10" max="150" step="5" value={r}
                onChange={e => setR(+e.target.value)} className="w-full accent-purple-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">ĐỘ TỰ CẢM CUỘN DÂY (L)</span>
                <span className="font-extrabold text-sky-400">{l.toFixed(2)} Henry</span>
              </div>
              <input type="range" min="0.05" max="0.5" step="0.02" value={l}
                onChange={e => setL(+e.target.value)} className="w-full accent-sky-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-slate-400">ĐIỆN DUNG TỤ ĐIỆN (C)</span>
                <span className="font-extrabold text-pink-400">{c} μF</span>
              </div>
              <input type="range" min="2" max="30" step="1" value={c}
                onChange={e => setC(+e.target.value)} className="w-full accent-pink-500" />
            </div>
          </div>

          {/* RLC details summary */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400">ĐẶC ĐIỂM CỘNG HƯỞNG</div>
            <div className="text-[9px] text-slate-300 leading-relaxed">
              * Cộng hưởng xảy ra khi dung kháng $X_C = X_L$ → trở kháng $Z$ nhỏ nhất bằng chính điện trở $R$.<br/>
              * Lúc này, dòng điện $I$ trong mạch đạt giá trị lớn nhất, điện áp và dòng điện đồng pha ($\phi = 0$).
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="rlc" />
    </div>
  );
}
