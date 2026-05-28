import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw, Plus, Info } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

const BENCH_ITEMS = [
  { type: 'object', name: 'Vật Sáng (Mũi Tên)', icon: '🕯️', desc: 'Vật đặt trước thấu kính', defaultVal: 40, min: 10, max: 100, unit: 'px' },
  { type: 'convex', name: 'Thấu Kính Hội Tụ', icon: '🔍', desc: 'Hội tụ chùm sáng, f > 0', defaultVal: 80, min: 30, max: 150, unit: 'mm' },
  { type: 'concave', name: 'Thấu Kính Phân Kỳ', icon: '👓', desc: 'Phân kỳ chùm sáng, f < 0', defaultVal: -60, min: -120, max: -30, unit: 'mm' },
  { type: 'mirror', name: 'Gương Phẳng', icon: '🪞', desc: 'Phản xạ ánh sáng', defaultVal: 0, min: 0, max: 0, unit: '' }
];

export default function OpticsBenchLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Position of elements on the bench (x-coordinate, relative to optical axis center)
  // Optical bench center represents X = 0.
  const [elements, setElements] = useState([
    { id: 'obj_1', type: 'object', x: -150, height: 40 },
    { id: 'lens_1', type: 'convex', x: 0, f: 80 },
    { id: 'screen_1', type: 'screen', x: 180 }
  ]);

  const [selectedElId, setSelectedElId] = useState('obj_1');
  const [draggedElId, setDraggedElId] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Calculate geometric optics formulas (1/f = 1/d + 1/d')
  const getOpticsCalculation = useCallback(() => {
    const object = elements.find(e => e.type === 'object');
    const lens = elements.find(e => e.type === 'convex' || e.type === 'concave');

    if (!object || !lens) return null;

    const d = lens.x - object.x; // Distance from object to lens (should be > 0 if object is to the left)
    const f = lens.type === 'convex' ? lens.f : -Math.abs(lens.f);

    if (d === f) {
      return { d, dPrime: Infinity, k: 0, type: 'Vô cực', desc: 'Ảnh ở vô cùng (chùm tia ló song song)' };
    }

    // 1/dPrime = 1/f - 1/d => dPrime = (d * f) / (d - f)
    const dPrime = (d * f) / (d - f);
    const k = -dPrime / d;
    const imageHeight = object.height * k;

    return {
      d,
      dPrime,
      k,
      imageHeight,
      isReal: dPrime > 0,
      type: dPrime > 0 ? 'Ảnh Thật' : 'Ảnh Ảo',
      desc: dPrime > 0
        ? `Ảnh THẬT, ${Math.abs(k) > 1 ? 'phóng to' : 'thu nhỏ'}, ngược chiều vật.`
        : `Ảnh ẢO, ${Math.abs(k) > 1 ? 'phóng to' : 'thu nhỏ'}, cùng chiều vật.`
    };
  }, [elements]);

  const calc = getOpticsCalculation();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    ctx.clearRect(0, 0, w, h);

    const centerY = h / 2;
    const centerX = w / 2;

    // Grid background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Principal Optical Axis (Trục chính)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(w - 30, centerY);
    ctx.stroke();

    // Principal Axis ticks
    ctx.fillStyle = '#64748B';
    ctx.font = '8px Monospace';
    ctx.textAlign = 'center';
    for (let x = 50; x < w - 50; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, centerY - 4); ctx.lineTo(x, centerY + 4); ctx.stroke();
      ctx.fillText(`${(x - centerX).toFixed(0)}`, x, centerY + 14);
    }

    const object = elements.find(e => e.type === 'object');
    const lens = elements.find(e => e.type === 'convex' || e.type === 'concave');

    // Draw Lens Focus Points F and F'
    if (lens) {
      const focalDistance = lens.type === 'convex' ? lens.f : -Math.abs(lens.f);
      const absF = Math.abs(focalDistance);
      const lx = centerX + lens.x;

      // F (front focus) & F' (back focus)
      const fx1 = lx - absF;
      const fx2 = lx + absF;

      ctx.fillStyle = '#A855F7';
      ctx.beginPath(); ctx.arc(fx1, centerY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx2, centerY, 4, 0, Math.PI * 2); ctx.fill();

      ctx.font = 'bold 9px Quicksand';
      ctx.fillText(focalDistance > 0 ? 'F' : "F'", fx1, centerY - 8);
      ctx.fillText(focalDistance > 0 ? "F'" : 'F', fx2, centerY - 8);
    }

    // Draw object (🕯️ or light arrow)
    if (object) {
      const ox = centerX + object.x;
      const oy = centerY;

      // Selected highlight
      if (selectedElId === object.id) {
        ctx.strokeStyle = 'rgba(251,191,36,0.2)'; ctx.lineWidth = 6;
        ctx.strokeRect(ox - 10, oy - object.height - 5, 20, object.height + 10);
      }

      // Draw arrow
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - object.height);
      ctx.lineTo(ox - 6, oy - object.height + 8);
      ctx.moveTo(ox, oy - object.height);
      ctx.lineTo(ox + 6, oy - object.height + 8);
      ctx.stroke();

      // Flame/glow on top
      ctx.beginPath();
      ctx.arc(ox, oy - object.height, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 9px Quicksand';
      ctx.fillText('Vật (A)', ox, oy + 26);
    }

    // Draw Lens body
    if (lens) {
      const lx = centerX + lens.x;
      const lHeight = 70;

      // Selected highlight
      if (selectedElId === lens.id) {
        ctx.strokeStyle = 'rgba(56,189,248,0.2)'; ctx.lineWidth = 6;
        ctx.strokeRect(lx - 12, centerY - lHeight - 5, 24, lHeight * 2 + 10);
      }

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, centerY - lHeight);
      ctx.lineTo(lx, centerY + lHeight);
      ctx.stroke();

      // Top/bottom lens arrow caps
      ctx.fillStyle = '#38BDF8';
      if (lens.type === 'convex') {
        // Convex: arrows point outward
        ctx.beginPath();
        ctx.moveTo(lx - 6, centerY - lHeight + 8); ctx.lineTo(lx, centerY - lHeight); ctx.lineTo(lx + 6, centerY - lHeight + 8);
        ctx.moveTo(lx - 6, centerY + lHeight - 8); ctx.lineTo(lx, centerY + lHeight); ctx.lineTo(lx + 6, centerY + lHeight - 8);
        ctx.stroke();
      } else {
        // Concave: arrows point inward
        ctx.beginPath();
        ctx.moveTo(lx - 6, centerY - lHeight); ctx.lineTo(lx, centerY - lHeight + 8); ctx.lineTo(lx + 6, centerY - lHeight);
        ctx.moveTo(lx - 6, centerY + lHeight); ctx.lineTo(lx, centerY + lHeight - 8); ctx.lineTo(lx + 6, centerY + lHeight);
        ctx.stroke();
      }

      ctx.font = 'bold 9px Quicksand';
      ctx.fillText(lens.type === 'convex' ? 'Hội Tụ' : 'Phân Kỳ', lx, centerY - lHeight - 10);
    }

    // Trace primary rays
    if (object && lens && calc) {
      const ox = centerX + object.x;
      const oy = centerY - object.height;
      const lx = centerX + lens.x;
      const absF = Math.abs(lens.f);
      const isConvex = lens.type === 'convex';

      // 1. Parallel ray to lens
      const rx1 = lx;
      const ry1 = oy;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(rx1, ry1); ctx.stroke();

      // Refracted ray 1
      if (isConvex) {
        // refracts through back focus F' (lx + absF)
        const fx2 = lx + absF;
        const slope = (centerY - ry1) / (fx2 - rx1);
        const endX = w - 20;
        const endY = centerY + (endX - fx2) * slope;

        ctx.strokeStyle = '#EF4444';
        ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(endX, endY); ctx.stroke();

        // Trace dashed extension back if image is virtual
        if (!calc.isReal && calc.dPrime !== Infinity) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(centerX + lens.x + calc.dPrime, centerY - calc.imageHeight); ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // Concave: refracts as if originating from front focus F' (lx - absF)
        const fx1 = lx - absF;
        const slope = (ry1 - centerY) / (rx1 - fx1);
        const endX = w - 20;
        const endY = ry1 + (endX - rx1) * slope;

        ctx.strokeStyle = '#EF4444';
        ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(endX, endY); ctx.stroke();

        // Virtual trace back
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(fx1, centerY); ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Optical Center ray (goes straight through center O)
      const endX2 = w - 20;
      const slope2 = (centerY - oy) / (lx - ox);
      const endY2 = centerY + (endX2 - lx) * slope2;

      ctx.strokeStyle = '#38BDF8';
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(lx, centerY); ctx.stroke();
      ctx.strokeStyle = '#EF4444';
      ctx.beginPath(); ctx.moveTo(lx, centerY); ctx.lineTo(endX2, endY2); ctx.stroke();

      if (!calc.isReal) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(lx, centerY); ctx.lineTo(centerX + lens.x + calc.dPrime, centerY - calc.imageHeight); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw the Image arrow (Ảnh)
      if (calc.dPrime !== Infinity && Math.abs(calc.dPrime) < 400) {
        const ix = centerX + lens.x + calc.dPrime;
        const iy = centerY;

        ctx.strokeStyle = calc.isReal ? '#10B981' : '#EC4899';
        ctx.lineWidth = 3;
        ctx.setLineDash(calc.isReal ? [] : [2, 2]);
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix, iy - calc.imageHeight);
        ctx.lineTo(ix - 5, iy - calc.imageHeight + (calc.imageHeight > 0 ? 8 : -8));
        ctx.moveTo(ix, iy - calc.imageHeight);
        ctx.lineTo(ix + 5, iy - calc.imageHeight + (calc.imageHeight > 0 ? 8 : -8));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = calc.isReal ? '#10B981' : '#EC4899';
        ctx.font = 'bold 9px Quicksand';
        ctx.fillText(`Ảnh (A') - ${calc.type}`, ix, iy - calc.imageHeight + (calc.imageHeight > 0 ? -12 : 18));
      }
    }
  }, [elements, selectedElId, calc]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const x = clientX - rect.left;

    // Check if clicked near an element to drag
    const centerX = rect.width / 2;
    for (const el of elements) {
      const elCanvasX = centerX + el.x;
      if (Math.abs(x - elCanvasX) < 25) {
        setDraggedElId(el.id);
        setSelectedElId(el.id);
        setDragOffset(x - elCanvasX);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedElId) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const x = clientX - rect.left;

    const centerX = rect.width / 2;
    const targetX = x - centerX - dragOffset;

    setElements(prev =>
      prev.map(el => {
        if (el.id !== draggedElId) return el;
        // Limit dragging ranges to prevent overlap
        if (el.type === 'object') {
          return { ...el, x: Math.min(-30, Math.max(-280, targetX)) };
        } else if (el.type === 'convex' || el.type === 'concave') {
          return { ...el, x: Math.min(60, Math.max(-60, targetX)) };
        } else if (el.type === 'screen') {
          return { ...el, x: Math.max(30, Math.min(280, targetX)) };
        }
        return el;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggedElId(null);
  };

  const handleToggleLens = () => {
    setElements(prev =>
      prev.map(el => {
        if (el.type === 'convex') {
          return { id: el.id, type: 'concave', x: el.x, f: 60 };
        } else if (el.type === 'concave') {
          return { id: el.id, type: 'convex', x: el.x, f: 80 };
        }
        return el;
      })
    );
  };

  const selectedEl = elements.find(e => e.id === selectedElId);

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG LAB QUANG HỌC</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Geometric Optics Bench & Refraction</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main interactive bench area */}
        <div
          className="flex-1 relative bg-slate-950/90 min-h-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab" />

          {/* Focal / Image overlay stats */}
          {calc && (
            <div className="absolute top-4 left-4 space-y-2.5 z-10">
              <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
                <div className="text-[9px] text-slate-400 font-bold">LOẠI ẢNH TẠO THÀNH</div>
                <div className={`text-sm font-extrabold ${calc.isReal ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {calc.type}
                </div>
              </div>
              <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5 max-w-[240px]">
                <p className="text-xs text-slate-200 font-bold leading-normal">{calc.desc}</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-bold max-w-xs">
            💡 Kéo thả Vật (Arrow) hoặc Thấu kính sang trái/phải để thấy ảnh dịch chuyển
          </div>
        </div>

        {/* Right side controls */}
        <div className="w-full lg:w-80 bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">THÔNG SỐ HÌNH HỌC</div>

          {/* Formula results cards */}
          {calc && (
            <div className="bg-[#0B1120] rounded-2xl border border-white/5 p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-extrabold text-amber-400">{calc.d.toFixed(1)} mm</div>
                  <div className="text-[9px] text-slate-400 font-bold">Khoảng cách vật (d)</div>
                </div>
                <div className="bg-white/3 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-extrabold text-emerald-400">
                    {calc.dPrime === Infinity ? '∞' : `${calc.dPrime.toFixed(1)} mm`}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold">Khoảng cách ảnh (d')</div>
                </div>
              </div>

              <div className="bg-white/3 rounded-xl p-2.5 text-center flex justify-between items-center px-4">
                <span className="text-[10px] text-slate-400 font-bold">Độ phóng đại (k)</span>
                <span className="text-xs font-extrabold text-purple-400">{calc.k.toFixed(2)} lần</span>
              </div>
            </div>
          )}

          {/* Quick toggle lens */}
          <button
            onClick={handleToggleLens}
            className="w-full py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-2xl text-xs font-bold hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            Đổi loại Thấu Kính
          </button>

          {/* Custom values based on selected */}
          {selectedEl ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200">
                Hiệu chỉnh: {selectedEl.type === 'object' ? 'Vật Sáng' : 'Thấu Kính'}
              </div>

              {selectedEl.type === 'object' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Chiều cao vật (h)</span>
                    <span className="font-extrabold text-amber-400">{selectedEl.height} px</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={selectedEl.height}
                    onChange={e => {
                      const h = +e.target.value;
                      setElements(prev => prev.map(el => el.type === 'object' ? { ...el, height: h } : el));
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Tiêu cự tuyệt đối (|f|)</span>
                    <span className="font-extrabold text-sky-400">{selectedEl.f} mm</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="140"
                    step="5"
                    value={selectedEl.f}
                    onChange={e => {
                      const f = +e.target.value;
                      setElements(prev => prev.map(el => el.type === 'convex' || el.type === 'concave' ? { ...el, f } : el));
                    }}
                    className="w-full accent-sky-500"
                  />
                </div>
              )}
            </div>
          ) : null}

          {/* Geometric optics formulas display */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">CÔNG THỨC THẤU KÍNH</div>
            <div className="bg-[#0B1120] rounded-xl p-2.5 font-mono text-xs text-slate-300 text-center space-y-1">
              <div>1/f = 1/d + 1/d'</div>
              <div className="text-[10px] text-slate-500">k = -d' / d = h' / h</div>
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              * Khi d &gt; f: thấu kính hội tụ tạo **ảnh thật** ngược chiều.<br/>
              * Khi d &lt; f: thấu kính hội tụ tạo **ảnh ảo** cùng chiều phóng to.<br/>
              * Thấu kính phân kỳ luôn tạo **ảnh ảo** cùng chiều thu nhỏ.
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="optics" />
    </div>
  );
}
