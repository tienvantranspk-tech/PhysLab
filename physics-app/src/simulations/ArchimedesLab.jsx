import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';

const FLUIDS = [
  { name: 'Dầu ăn', density: 800, color: 'rgba(234, 179, 8, 0.4)' },
  { name: 'Nước nguyên chất', density: 1000, color: 'rgba(14, 165, 233, 0.4)' },
  { name: 'Mật ong', density: 1400, color: 'rgba(180, 83, 9, 0.4)' }
];

const MATERIALS = [
  { name: 'Gỗ khô', density: 600, color: '#D97706' },
  { name: 'Băng đá', density: 920, color: '#E2E8F0' },
  { name: 'Nhôm', density: 2700, color: '#94A3B8' }
];

export default function ArchimedesLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [selectedFluid, setSelectedFluid] = useState(FLUIDS[1]); // Water
  const [selectedMat, setSelectedMat] = useState(MATERIALS[0]); // Wood
  const [volume, setVolume] = useState(0.005); // m3 (Block Volume)

  // Physics Calculations
  const g = 9.8;
  const blockMass = selectedMat.density * volume; // kg
  const blockWeight = blockMass * g; // N (Gravity Force downwards)

  // Floating logic: If D_block < D_fluid -> floats. Submerged volume ratio = D_block / D_fluid.
  // Else -> sinks. Submerged volume ratio = 1 (fully submerged).
  const isFloating = selectedMat.density < selectedFluid.density;
  const submergedRatio = isFloating ? (selectedMat.density / selectedFluid.density) : 1;
  const submergedVolume = volume * submergedRatio;
  const buoyantForce = selectedFluid.density * submergedVolume * g; // N (Upwards Archimedes Force)

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const tankW = 180;
    const tankH = 140;
    const tankX = cx - tankW / 2;
    const tankY = h - tankH - 30;

    // 1. Draw Tank
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(tankX, tankY, tankW, tankH);

    // 2. Draw Fluid inside Tank
    // Liquid height increases slightly based on block volume submerged
    const baseFluidHeight = 80;
    const fluidVolDisplacedOffset = submergedVolume * 3000; // visual scaler
    const currentFluidHeight = baseFluidHeight + fluidVolDisplacedOffset;

    ctx.fillStyle = selectedFluid.color;
    ctx.fillRect(tankX + 2, tankY + tankH - currentFluidHeight, tankW - 4, currentFluidHeight - 2);

    // Liquid surface line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tankX + 2, tankY + tankH - currentFluidHeight);
    ctx.lineTo(tankX + tankW - 2, tankY + tankH - currentFluidHeight);
    ctx.stroke();

    // 3. Draw Block
    const blockSide = Math.min(65, 30 + volume * 4000); // Visual block size
    const blockX = cx - blockSide / 2;

    // Block vertical position:
    // If floating, top part is above fluid level, bottom part is submerged by ratio
    // If sinking, block sits at the bottom of the tank
    let blockY = 0;
    if (isFloating) {
      const submergedPart = blockSide * submergedRatio;
      blockY = tankY + tankH - currentFluidHeight - (blockSide - submergedPart);
    } else {
      blockY = tankY + tankH - blockSide - 2; // bottom
    }

    ctx.fillStyle = selectedMat.color;
    ctx.fillRect(blockX, blockY, blockSide, blockSide);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, blockSide, blockSide);

    // 4. Force Vectors (drawn from block center)
    const bx = cx;
    const by = blockY + blockSide / 2;

    // Force scale (1 N = 0.8 pixels)
    const forceScale = 0.55;

    // Gravity vector (downward red)
    ctx.strokeStyle = '#EF4444';
    ctx.fillStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + blockWeight * forceScale);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(bx, by + blockWeight * forceScale);
    ctx.lineTo(bx - 5, by + blockWeight * forceScale - 7);
    ctx.lineTo(bx + 5, by + blockWeight * forceScale - 7);
    ctx.fill();

    // Buoyant vector (upward green)
    ctx.strokeStyle = '#10B981';
    ctx.fillStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - buoyantForce * forceScale);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(bx, by - buoyantForce * forceScale);
    ctx.lineTo(bx - 5, by - buoyantForce * forceScale + 7);
    ctx.lineTo(bx + 5, by - buoyantForce * forceScale + 7);
    ctx.fill();

    // Vector text labels
    ctx.font = 'bold 8px Quicksand';
    ctx.fillText(`Trọng lực P: ${blockWeight.toFixed(1)}N`, bx + 12, by + blockWeight * forceScale / 2 + 3);
    ctx.fillText(`Đẩy F_A: ${buoyantForce.toFixed(1)}N`, bx + 12, by - buoyantForce * forceScale / 2 + 3);

  }, [selectedFluid, selectedMat, volume, blockWeight, buoyantForce, isFloating, submergedRatio, submergedVolume]);

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
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG LAB LỰC ARCHIMEDES</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Buoyancy Force & Density</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-4 left-4 space-y-2 z-10">
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">TRẠNG THÁI VẬT</div>
              <div className={`text-sm font-extrabold ${isFloating ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                {isFloating ? 'VẬT NỔI' : 'VẬT CHÌM'}
              </div>
            </div>
            <div className="bg-[#0F172A]/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="text-[9px] text-slate-400 font-bold">PHẦN THỂ TÍCH CHÌM</div>
              <div className="font-mono text-xs text-sky-400 font-bold">
                {(submergedRatio * 100).toFixed(0)} % Thể tích
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">CÀI ĐẶT MÔI TRƯỜNG</div>

          {/* Fluid Selector */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Chọn Chất Lỏng</div>
            <div className="flex flex-col gap-2">
              {FLUIDS.map(f => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFluid(f)}
                  className={`flex justify-between items-center px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border ${selectedFluid.name === f.name ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-white/5 border-white/5 text-slate-300'}`}
                >
                  <span>{f.name}</span>
                  <span className="text-[10px] text-slate-500">{f.density} kg/m³</span>
                </button>
              ))}
            </div>
          </div>

          {/* Material Selector */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Chọn Vật Thể</div>
            <div className="flex flex-col gap-2">
              {MATERIALS.map(m => (
                <button
                  key={m.name}
                  onClick={() => setSelectedMat(m)}
                  className={`flex justify-between items-center px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border ${selectedMat.name === m.name ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/5 text-slate-300'}`}
                >
                  <span>{m.name}</span>
                  <span className="text-[10px] text-slate-500">{m.density} kg/m³</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">THỂ TÍCH KHỐI VẬT (V)</span>
              <span className="font-extrabold text-amber-400">{(volume * 1000).toFixed(1)} Lít</span>
            </div>
            <input type="range" min="0.001" max="0.015" step="0.001" value={volume}
              onChange={e => setVolume(+e.target.value)} className="w-full accent-amber-500" />
          </div>

          {/* Scientific formula summary */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400">CÔNG THỨC ARCHIMEDES</div>
            <div className="bg-[#0B1120] rounded-xl p-2.5 font-mono text-xs text-slate-300 text-center">
              F_A = d_fluid × V_submerged
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              * Vật chìm hẳn khi trọng lượng $P &gt; F_A$. Lúc đó, lực đẩy Archimedes đạt cực đại bằng $d_{fluid} \cdot V_{block}$.<br/>
              * Thể tích chất lỏng bị đẩy dâng lên đúng bằng thể tích phần vật chìm trong chất lỏng.
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="archimedes" />
    </div>
  );
}
