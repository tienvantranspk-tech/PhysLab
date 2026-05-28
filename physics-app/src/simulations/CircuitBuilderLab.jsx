import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCcw, Trash2, Plus, Zap } from 'lucide-react';
import LabQuizChallenge from '../components/LabQuizChallenge';
import useSoundEffects from '../hooks/useSoundEffects';

const PALETTE = [
  { type: 'battery', name: 'Pin (Nguồn)', icon: '🔋', desc: 'Cung cấp năng lượng', defaultVal: 9, unit: 'V' },
  { type: 'bulb', name: 'Bóng đèn', icon: '💡', desc: 'Tiêu thụ điện & phát sáng', defaultVal: 10, unit: 'Ω' },
  { type: 'resistor', name: 'Điện trở', icon: '🎛️', desc: 'Cản trở dòng điện', defaultVal: 20, unit: 'Ω' },
  { type: 'switch', name: 'Công tắc', icon: '🔌', desc: 'Đóng/ngắt mạch điện', defaultVal: false, unit: '' },
  { type: 'ammeter', name: 'Ampe kế', icon: '🅰️', desc: 'Đo cường độ dòng điện', defaultVal: 0, unit: 'A' },
  { type: 'wire', name: 'Dây nối', icon: '🔗', desc: 'Liên kết các linh kiện', defaultVal: 0, unit: '' }
];

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary caught", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-950 text-red-200 font-mono overflow-auto h-screen z-50 relative">
          <h1 className="text-xl font-bold mb-4">Mô phỏng Điện học bị lỗi:</h1>
          <pre className="text-xs bg-black/40 p-4 rounded-xl border border-red-500/20 whitespace-pre-wrap">
            {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">Tải lại</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CircuitBuilderLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Sound effects
  const { playPop, playSnap, playSpark, playBuzz } = useSoundEffects();

  const [components, setComponents] = useState([
    { id: 'bat_1', type: 'battery', name: 'Pin', x: 100, y: 150, val: 9, terminals: [{ name: '+', dx: -30, dy: 0 }, { name: '-', dx: 30, dy: 0 }] },
    { id: 'bulb_1', type: 'bulb', name: 'Bóng đèn', x: 250, y: 80, val: 10, terminals: [{ name: 'a', dx: -25, dy: 0 }, { name: 'b', dx: 25, dy: 0 }], isLit: false },
    { id: 'sw_1', type: 'switch', name: 'Công tắc', x: 250, y: 220, val: false, terminals: [{ name: 'a', dx: -25, dy: 0 }, { name: 'b', dx: 25, dy: 0 }] }
  ]);

  const [wires, setWires] = useState([
    { id: 'w1', from: 'bat_1', fromTerm: '+', to: 'bulb_1', toTerm: 'a' },
    { id: 'w2', from: 'bulb_1', fromTerm: 'b', to: 'sw_1', toTerm: 'b' },
    { id: 'w3', from: 'sw_1', fromTerm: 'a', to: 'bat_1', toTerm: '-' }
  ]);

  const [draggedComp, setDraggedComp] = useState(null);
  const [activeWireStart, setActiveWireStart] = useState(null); // { compId, termName, x, y }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedComp, setSelectedComp] = useState(null);
  const [isRunning, setIsRunning] = useState(true);

  // Circuit calculation results
  const [circuitState, setCircuitState] = useState({
    isClosed: false,
    isShort: false,
    current: 0,
    rTotal: 0,
    litBulbs: new Set()
  });

  // Calculate current & loop paths
  const solveCircuit = useCallback(() => {
    // Basic loop path solver: starts from '+' terminal of a battery and traces along wires
    const battery = components.find(c => c.type === 'battery');
    if (!battery) {
      setCircuitState({ isClosed: false, isShort: false, current: 0, rTotal: 0, litBulbs: new Set() });
      return;
    }

    // Node-link connections builder
    const adj = {};
    components.forEach(c => {
      c.terminals.forEach(t => {
        adj[`${c.id}:${t.name}`] = [];
      });
    });

    wires.forEach(w => {
      const u = `${w.from}:${w.fromTerm}`;
      const v = `${w.to}:${w.toTerm}`;
      if (adj[u] && adj[v]) {
        adj[u].push(v);
        adj[v].push(u);
      }
    });

    // Also connect internal terminals inside components (unless it's an open switch)
    components.forEach(c => {
      if (c.type === 'switch' && !c.val) {
        // switch open -> no internal connection
        return;
      }
      const t1 = `${c.id}:${c.terminals[0].name}`;
      const t2 = `${c.id}:${c.terminals[1].name}`;
      adj[t1].push(t2);
      adj[t2].push(t1);
    });

    // Trace path from battery '+' to battery '-'
    const startNode = `${battery.id}:+`;
    const endNode = `${battery.id}:-`;

    const visited = new Set();
    const queue = [[startNode, []]];
    let foundPath = null;

    while (queue.length > 0) {
      const [curr, path] = queue.shift();
      if (curr === endNode) {
        foundPath = [...path, curr];
        break;
      }
      visited.add(curr);
      const neighbors = adj[curr] || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          queue.push([n, [...path, curr]]);
        }
      }
    }

    if (!foundPath) {
      // Loop not closed
      setCircuitState({ isClosed: false, isShort: false, current: 0, rTotal: 0, litBulbs: new Set() });
      return;
    }

    // Analyze elements inside the closed path loop
    const elementsInLoop = new Set();
    foundPath.forEach(node => {
      const compId = node.split(':')[0];
      elementsInLoop.add(compId);
    });

    let totalR = 0;
    let totalV = battery.val;
    let isShort = true;

    elementsInLoop.forEach(id => {
      const c = components.find(comp => comp.id === id);
      if (!c) return;
      if (c.type === 'bulb' || c.type === 'resistor') {
        totalR += c.val;
        isShort = false; // load exists, not short circuited
      }
    });

    if (isShort) {
      setCircuitState({ isClosed: true, isShort: true, current: 0, rTotal: 0, litBulbs: new Set() });
      return;
    }

    const calculatedI = totalV / totalR;
    const litBulbs = new Set();
    components.forEach(c => {
      if (c.type === 'bulb' && elementsInLoop.has(c.id)) {
        litBulbs.add(c.id);
      }
    });

    setCircuitState({
      isClosed: true,
      isShort: false,
      current: calculatedI,
      rTotal: totalR,
      litBulbs
    });
  }, [components, wires]);

  useEffect(() => {
    solveCircuit();
  }, [components, wires, solveCircuit]);

  // Immersive sound triggers on physical state changes
  useEffect(() => {
    if (circuitState.isShort) {
      playSpark();
    } else if (circuitState.isClosed) {
      playSnap();
    }
  }, [circuitState.isClosed, circuitState.isShort]);

  // Main Canvas Render
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    ctx.clearRect(0, 0, w, h);

    // Dynamic grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Wires Glow & Paths
    wires.forEach(wire => {
      const fromC = components.find(c => c.id === wire.from);
      const toC = components.find(c => c.id === wire.to);
      if (!fromC || !toC) return;

      const fromT = fromC.terminals.find(t => t.name === wire.fromTerm);
      const toT = toC.terminals.find(t => t.name === wire.toTerm);
      if (!fromT || !toT) return;

      const x1 = fromC.x + fromT.dx;
      const y1 = fromC.y + fromT.dy;
      const x2 = toC.x + toT.dx;
      const y2 = toC.y + toT.dy;

      // Draw wire shadow/glow if current flowing
      if (circuitState.isClosed && !circuitState.isShort && circuitState.current > 0 && isRunning) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Active wire being drawn
    if (activeWireStart) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(activeWireStart.x, activeWireStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Electron animations in loops
    if (circuitState.isClosed && !circuitState.isShort && circuitState.current > 0 && isRunning) {
      const now = Date.now();
      wires.forEach((wire, wireIdx) => {
        const fromC = components.find(c => c.id === wire.from);
        const toC = components.find(c => c.id === wire.to);
        if (!fromC || !toC) return;

        const fromT = fromC.terminals.find(t => t.name === wire.fromTerm);
        const toT = toC.terminals.find(t => t.name === wire.toTerm);
        if (!fromT || !toT) return;

        const x1 = fromC.x + fromT.dx;
        const y1 = fromC.y + fromT.dy;
        const x2 = toC.x + toT.dx;
        const y2 = toC.y + toT.dy;

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const flowSpeed = circuitState.current * 40;
        const numElectrons = Math.max(2, Math.floor(dist / 40));

        for (let i = 0; i < numElectrons; i++) {
          const phase = ((now * flowSpeed * 0.001) + (i / numElectrons)) % 1;
          const ex = x1 + (x2 - x1) * phase;
          const ey = y1 + (y2 - y1) * phase;

          ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56,189,248,0.4)'; ctx.fill();
          ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8'; ctx.fill();
        }
      });
    }

    // Render Components
    components.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Selected glow
      if (selectedComp?.id === c.id) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 8;
        ctx.strokeRect(-40, -30, 80, 60);
      }

      // Draw component body
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = selectedComp?.id === c.id ? '#38BDF8' : '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(-35, -25, 70, 50);
      ctx.strokeRect(-35, -25, 70, 50);

      // Label/Icon
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let displayIcon = '🔌';
      if (c.type === 'battery') displayIcon = '🔋';
      else if (c.type === 'bulb') displayIcon = circuitState.litBulbs?.has(c.id) ? '💡' : '💡💤';
      else if (c.type === 'resistor') displayIcon = '🎛️';
      else if (c.type === 'switch') displayIcon = c.val ? '⚡' : '❌';
      else if (c.type === 'ammeter') displayIcon = '🅰️';

      ctx.fillText(displayIcon, 0, -5);

      // Text/Value
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px Quicksand';
      let valStr = '';
      if (c.type === 'battery') valStr = `${c.val}V`;
      else if (c.type === 'bulb') valStr = `${c.val}Ω`;
      else if (c.type === 'resistor') valStr = `${c.val}Ω`;
      else if (c.type === 'switch') valStr = c.val ? 'Đóng' : 'Mở';
      else if (c.type === 'ammeter') {
        const displayI = (circuitState.isClosed && !circuitState.isShort) ? circuitState.current : 0;
        valStr = `${displayI.toFixed(2)}A`;
      }
      ctx.fillText(valStr, 0, 15);

      // Terminals
      c.terminals.forEach(term => {
        ctx.beginPath();
        ctx.arc(term.dx, term.dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Terminal labels (+/-)
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 8px Monospace';
        ctx.fillText(term.name, term.dx * 0.7, term.dy - 8);
      });

      // Sparks / Explosion on short circuit
      if (c.type === 'battery' && circuitState.isShort) {
        ctx.fillStyle = '#EF4444';
        const now = Date.now();
        const offset = Math.sin(now * 0.05) * 4;
        ctx.beginPath();
        ctx.arc(offset, -10, 8 + offset, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }, [components, wires, draggedComp, activeWireStart, mousePos, selectedComp, circuitState, isRunning]);

  useEffect(() => {
    draw();
    if (!isRunning) return;
    const interval = setInterval(draw, 60);
    return () => clearInterval(interval);
  }, [draw, isRunning]);

  // Pointer event coordinate conversions
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Mouse Handlers
  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e);

    // 1. Check if clicked a terminal first
    for (const c of components) {
      for (const t of c.terminals) {
        const tx = c.x + t.dx;
        const ty = c.y + t.dy;
        if (Math.hypot(x - tx, y - ty) < 12) {
          setActiveWireStart({ compId: c.id, termName: t.name, x: tx, y: ty });
          return;
        }
      }
    }

    // 2. Check if clicked a component to drag or select
    for (const c of components) {
      if (Math.abs(x - c.x) < 35 && Math.abs(y - c.y) < 25) {
        setDraggedComp({ id: c.id, offsetX: x - c.x, offsetY: y - c.y });
        setSelectedComp(c);
        return;
      }
    }

    setSelectedComp(null);
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoords(e);
    setMousePos({ x, y });

    if (draggedComp) {
      setComponents(prev =>
        prev.map(c =>
          c.id === draggedComp.id
            ? { ...c, x: Math.max(40, Math.min(600, x - draggedComp.offsetX)), y: Math.max(40, Math.min(400, y - draggedComp.offsetY)) }
            : c
        )
      );
    }
  };

  const handleMouseUp = (e) => {
    if (activeWireStart) {
      const { x, y } = getCanvasCoords(e);
      // Find endpoint terminal
      let matchedTerm = null;
      for (const c of components) {
        if (c.id === activeWireStart.compId) continue; // no self wire
        for (const t of c.terminals) {
          const tx = c.x + t.dx;
          const ty = c.y + t.dy;
          if (Math.hypot(x - tx, y - ty) < 16) {
            matchedTerm = { compId: c.id, termName: t.name };
            break;
          }
        }
        if (matchedTerm) break;
      }

      if (matchedTerm) {
        // Check if wire already exists
        const exists = wires.some(w =>
          (w.from === activeWireStart.compId && w.fromTerm === activeWireStart.termName && w.to === matchedTerm.compId && w.toTerm === matchedTerm.termName) ||
          (w.to === activeWireStart.compId && w.toTerm === activeWireStart.termName && w.from === matchedTerm.compId && w.fromTerm === matchedTerm.termName)
        );

        if (!exists) {
          setWires(prev => [
            ...prev,
            {
              id: `w_${Date.now()}`,
              from: activeWireStart.compId,
              fromTerm: activeWireStart.termName,
              to: matchedTerm.compId,
              toTerm: matchedTerm.termName
            }
          ]);
        }
      }

      setActiveWireStart(null);
    }

    setDraggedComp(null);
  };

  // Add new component from sidebar
  const addComponentToCanvas = (type) => {
    const pInfo = PALETTE.find(p => p.type === type);
    const newId = `${type}_${Date.now()}`;
    const newComp = {
      id: newId,
      type,
      name: pInfo.name,
      x: 150 + Math.random() * 100,
      y: 150 + Math.random() * 100,
      val: pInfo.defaultVal,
      terminals: [
        { name: type === 'battery' ? '+' : 'a', dx: -25, dy: 0 },
        { name: type === 'battery' ? '-' : 'b', dx: 25, dy: 0 }
      ]
    };
    setComponents(prev => [...prev, newComp]);
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedComp) return;
    setComponents(prev => prev.filter(c => c.id !== selectedComp.id));
    setWires(prev => prev.filter(w => w.from !== selectedComp.id && w.to !== selectedComp.id));
    setSelectedComp(null);
  };

  // Reset entire playground
  const handleClearAll = () => {
    setComponents([
      { id: 'bat_1', type: 'battery', name: 'Pin', x: 100, y: 150, val: 9, terminals: [{ name: '+', dx: -30, dy: 0 }, { name: '-', dx: 30, dy: 0 }] }
    ]);
    setWires([]);
    setSelectedComp(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-wide">PHÒNG LAB ĐIỆN HỌC</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Circuit Builder & Safety Labs</p>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Components Library */}
        <div className="w-full lg:w-72 bg-[#0F172A]/70 border-b lg:border-b-0 lg:border-r border-white/5 flex lg:flex-col shrink-0 overflow-x-auto lg:overflow-y-auto no-scrollbar p-4 gap-3">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hidden lg:block mb-1">
            Linh kiện mạch điện
          </div>
          {PALETTE.map(item => (
            <button
              key={item.type}
              onClick={() => addComponentToCanvas(item.type)}
              className="flex items-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl p-2.5 text-left transition-all hover:scale-[1.02] shrink-0 lg:w-full"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl shadow-md">
                {item.icon}
              </div>
              <div className="hidden lg:block">
                <div className="font-bold text-xs text-slate-200">{item.name}</div>
                <div className="text-[9px] text-slate-400 leading-snug">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Center: Circuit canvas board */}
        <div
          className="flex-1 relative bg-slate-950/80 min-h-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

          {/* Action floating buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2.5 z-10">
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <RotateCcw size={15} /> Xóa hết
            </button>
            {selectedComp && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2.5 bg-rose-600 border border-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-2"
              >
                <Trash2 size={15} /> Xóa linh kiện
              </button>
            )}
          </div>

          {/* Spark Overlay */}
          {circuitState.isShort && (
            <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse max-w-xs">
              <Zap size={22} className="text-red-500 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-red-400">NGẮN MẠCH (CHẬP ĐIỆN)!</div>
                <div className="text-[10px] text-slate-300 font-semibold leading-normal mt-0.5">
                  Dòng điện nối tắt không có điện trở. Cần thêm bóng đèn hoặc điện trở vào mạch ngay để tránh nổ pin!
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 text-[10px] text-slate-500 font-bold max-w-xs space-y-1">
            <p>💡 Thêm linh kiện từ thư viện bên trái</p>
            <p>💡 Kéo thả từ các chốt tròn màu xanh để nối dây dẫn</p>
            <p>💡 Click vào linh kiện để chọn và thay đổi thông số</p>
          </div>
        </div>

        {/* Right Panel: Controls & Details */}
        <div className="w-full lg:w-80 bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">THÔNG TIN MẠCH ĐIỆN</div>

          {/* Current & Power panel */}
          <div className="bg-[#0B1120] rounded-2xl border border-white/5 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/3 rounded-xl p-2.5 text-center">
                <div className={`text-lg font-extrabold ${circuitState.isShort ? 'text-red-500' : 'text-amber-400'}`}>
                  {circuitState.isShort ? '🔥 Chập' : `${circuitState.current.toFixed(2)} A`}
                </div>
                <div className="text-[9px] text-slate-400 font-bold">Cường độ (I)</div>
              </div>
              <div className="bg-white/3 rounded-xl p-2.5 text-center">
                <div className="text-lg font-extrabold text-purple-400">
                  {circuitState.isShort ? '0 Ω' : `${circuitState.rTotal.toFixed(1)} Ω`}
                </div>
                <div className="text-[9px] text-slate-400 font-bold">Tổng Điện Trở (R)</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-bold leading-relaxed flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>Trạng thái: <b>{circuitState.isClosed ? (circuitState.isShort ? 'NGUY HIỂM' : 'MẠCH KÍN') : 'MẠCH HỞ'}</b></span>
            </div>
          </div>

          {/* Variable Tweaks for Selected Component */}
          {selectedComp ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200">Hiệu chỉnh: {selectedComp.name}</div>
              {selectedComp.type === 'switch' ? (
                <div className="flex justify-between items-center bg-white/3 rounded-xl p-2.5">
                  <span className="text-xs font-semibold text-slate-300">Trạng thái công tắc</span>
                  <button
                    onClick={() => {
                      setComponents(prev =>
                        prev.map(c =>
                          c.id === selectedComp.id ? { ...c, val: !c.val } : c
                        )
                      );
                      setSelectedComp(prev => ({ ...prev, val: !prev.val }));
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${selectedComp.val ? 'bg-amber-500 text-slate-900' : 'bg-slate-600 text-slate-200'}`}
                  >
                    {selectedComp.val ? 'ĐÓNG' : 'MỞ'}
                  </button>
                </div>
              ) : (selectedComp.type === 'battery' || selectedComp.type === 'bulb' || selectedComp.type === 'resistor') ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Giá trị ({selectedComp.type === 'battery' ? 'V' : 'R'})</span>
                    <span className="font-extrabold text-amber-400">
                      {selectedComp.val} {selectedComp.type === 'battery' ? 'Volt' : 'Ohm'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedComp.type === 'battery' ? 1.5 : 1}
                    max={selectedComp.type === 'battery' ? 36 : 100}
                    step={selectedComp.type === 'battery' ? 1.5 : 5}
                    value={selectedComp.val}
                    onChange={e => {
                      const v = +e.target.value;
                      setComponents(prev =>
                        prev.map(c =>
                          c.id === selectedComp.id ? { ...c, val: v } : c
                        )
                      );
                      setSelectedComp(prev => ({ ...prev, val: v }));
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 leading-normal">
                  Linh kiện đo hoặc phụ trợ không có giá trị tùy chỉnh trực tiếp.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/3 rounded-2xl p-4 text-center border border-dashed border-white/5">
              <span className="text-xs text-slate-500">Chưa có linh kiện nào được chọn</span>
            </div>
          )}

          {/* Theory and Tips */}
          <div className="bg-white/5 rounded-2xl p-3 space-y-2.5">
            <div className="text-[10px] font-extrabold text-slate-400">TƯ DUY THÍ NGHIỆM</div>
            <div className="text-[10px] text-slate-300 leading-relaxed space-y-1.5">
              <p>💡 <b>Mạch nối tiếp:</b> R_tđ = R1 + R2 + ... Dòng điện giống nhau ở mọi nhánh. Đèn sáng yếu hơn khi mắc nối tiếp nhiều đèn.</p>
              <p>💡 <b>Mạch song song:</b> 1/R_tđ = 1/R1 + 1/R2 + ... Giúp giữ nguyên điện áp pin đặt lên mỗi đèn, đèn sáng rực rỡ nhất!</p>
            </div>
          </div>
        </div>
      </div>
      <LabQuizChallenge labId="circuit" />
    </div>
  );
}

export default function CircuitBuilderLabWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CircuitBuilderLab />
    </ErrorBoundary>
  );
}
