import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Thermometer, Flame, Snowflake, Droplets, Beaker, Play, Pause, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import LabQuizChallenge from '../components/LabQuizChallenge';
import TheoryCardModal from '../components/TheoryCardModal';

/* ════════════════════════════════════════════
   ThermoLab — Interactive Thermodynamics Lab
   Topics: Temperature, Thermometer, Heat Transfer, Thermal Equilibrium
   ════════════════════════════════════════════ */

// Thermometer SVG component
function ThermometerVisual({ temperature, minTemp = -20, maxTemp = 120, label, color = '#EF4444' }) {
  const fillPercent = Math.max(0, Math.min(100, ((temperature - minTemp) / (maxTemp - minTemp)) * 100));
  const bulbRadius = 18;
  const tubeWidth = 12;
  const tubeHeight = 180;
  const totalHeight = tubeHeight + bulbRadius * 2 + 10;

  // Temperature-dependent color
  const tempColor = temperature < 0 ? '#3B82F6' : temperature < 30 ? '#06B6D4' : temperature < 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="60" height={totalHeight + 30} viewBox={`0 0 60 ${totalHeight + 30}`}>
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = 10 + tubeHeight - (pct / 100) * tubeHeight;
          const tempAtPct = minTemp + (pct / 100) * (maxTemp - minTemp);
          return (
            <g key={pct}>
              <line x1="38" y1={y} x2="45" y2={y} stroke="#94A3B8" strokeWidth="1" />
              <text x="48" y={y + 4} fill="#94A3B8" fontSize="8" fontWeight="bold">{Math.round(tempAtPct)}°</text>
            </g>
          );
        })}

        {/* Tube outer */}
        <rect
          x={30 - tubeWidth / 2} y="10"
          width={tubeWidth} height={tubeHeight}
          rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1.5"
        />

        {/* Tube fill (mercury) */}
        <rect
          x={30 - tubeWidth / 2 + 2} y={10 + tubeHeight - (fillPercent / 100) * tubeHeight}
          width={tubeWidth - 4} height={(fillPercent / 100) * tubeHeight}
          rx="4" fill={tempColor}
        />

        {/* Bulb */}
        <circle
          cx="30" cy={10 + tubeHeight + bulbRadius}
          r={bulbRadius} fill={tempColor}
          stroke="#334155" strokeWidth="1.5"
        />
        <circle
          cx="30" cy={10 + tubeHeight + bulbRadius}
          r={bulbRadius - 5} fill={tempColor} opacity="0.6"
        />
      </svg>

      {/* Temperature display */}
      <div className="text-center">
        <div className="text-2xl font-black" style={{ color: tempColor }}>
          {temperature.toFixed(1)}°C
        </div>
        {label && <div className="text-xs font-bold text-slate-400 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

// Beaker with liquid visualization
function BeakerVisual({ temperature, label, color, isHeating, isCooling }) {
  const waterLevel = 65; // percent
  const tempColor = temperature < 20 ? '#3B82F6' : temperature < 50 ? '#06B6D4' : temperature < 80 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="100" height="120" viewBox="0 0 100 120">
          {/* Beaker body */}
          <path
            d="M15,15 L15,95 Q15,105 25,105 L75,105 Q85,105 85,95 L85,15"
            fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Beaker lip */}
          <path d="M10,15 L15,15 M85,15 L90,15" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Water fill */}
          <path
            d={`M17,${105 - waterLevel} L17,93 Q17,103 27,103 L73,103 Q83,103 83,93 L83,${105 - waterLevel} Z`}
            fill={tempColor} opacity="0.35"
          />

          {/* Water surface wave */}
          <motion.path
            d={`M17,${105 - waterLevel} Q35,${103 - waterLevel} 50,${105 - waterLevel} T83,${105 - waterLevel}`}
            fill="none" stroke={tempColor} strokeWidth="2" opacity="0.6"
            animate={{ d: [
              `M17,${105 - waterLevel} Q35,${103 - waterLevel} 50,${105 - waterLevel} T83,${105 - waterLevel}`,
              `M17,${105 - waterLevel} Q35,${107 - waterLevel} 50,${105 - waterLevel} T83,${105 - waterLevel}`,
              `M17,${105 - waterLevel} Q35,${103 - waterLevel} 50,${105 - waterLevel} T83,${105 - waterLevel}`,
            ]}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />

          {/* Bubbles when hot */}
          {temperature > 80 && (
            <>
              <motion.circle cx="35" cy="80" r="3" fill={tempColor} opacity="0.4"
                animate={{ cy: [80, 50, 35], opacity: [0.4, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              />
              <motion.circle cx="55" cy="85" r="2" fill={tempColor} opacity="0.3"
                animate={{ cy: [85, 55, 40], opacity: [0.3, 0.15, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0.5 }}
              />
              <motion.circle cx="65" cy="75" r="2.5" fill={tempColor} opacity="0.35"
                animate={{ cy: [75, 45, 30], opacity: [0.35, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.3, delay: 0.8 }}
              />
            </>
          )}
        </svg>

        {/* Heating indicator */}
        {isHeating && (
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <Flame size={24} className="text-orange-500" fill="currentColor" />
          </motion.div>
        )}

        {/* Cooling indicator */}
        {isCooling && (
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2"
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Snowflake size={22} className="text-blue-400" />
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <div className="text-lg font-black" style={{ color: tempColor }}>
          {temperature.toFixed(1)}°C
        </div>
        <div className="text-[11px] font-bold text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default function ThermoLab() {
  const navigate = useNavigate();
  const { addXp, completeLesson, soundEnabled } = useUser();
  const [mode, setMode] = useState('thermometer'); // 'thermometer' | 'equilibrium'
  const [showTheory, setShowTheory] = useState(true);

  // Thermometer mode state
  const [envTemp, setEnvTemp] = useState(25);

  // Equilibrium mode state
  const [hotTemp, setHotTemp] = useState(90);
  const [coldTemp, setColdTemp] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasReachedEquilibrium, setHasReachedEquilibrium] = useState(false);
  const animRef = useRef(null);
  const hotRef = useRef(90);
  const coldRef = useRef(10);

  // Audio nodes for boiling water synthetic sound effect
  const audioCtxRef = useRef(null);
  const bubbleIntervalRef = useRef(null);

  // Sound generator: synthesized realistic boiling water bubbles
  useEffect(() => {
    // Only synthesize bubble noises if the beaker is extremely hot (> 80°C) OR during hot water equilibrium simulation
    const needsBoilingSound = (mode === 'equilibrium' && isSimulating && hotTemp > 50) || (mode === 'thermometer' && envTemp > 80);

    if (!needsBoilingSound || !soundEnabled) {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      // loop to synthesize bubble sound pulses
      if (!bubbleIntervalRef.current) {
        bubbleIntervalRef.current = setInterval(() => {
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          // Create brief pop sounds (sine wave with rapid downward sweep)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          const now = ctx.currentTime;
          const randomPitch = 150 + Math.random() * 250;
          osc.frequency.setValueAtTime(randomPitch, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.08); // rapid drop

          gain.gain.setValueAtTime(0.015, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.08); // rapid fade

          osc.start(now);
          osc.stop(now + 0.08);
        }, 120); // bubble frequency pulse
      }

    } catch (e) {
      console.warn("Boiling audio synthesis failed:", e);
    }

    return () => {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
    };
  }, [mode, isSimulating, hotTemp, envTemp, soundEnabled]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Reset
  const resetLab = useCallback(() => {
    setEnvTemp(25);
    setHotTemp(90);
    setColdTemp(10);
    setIsSimulating(false);
    setHasReachedEquilibrium(false);
    hotRef.current = 90;
    coldRef.current = 10;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  // Equilibrium simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const step = () => {
      const diff = hotRef.current - coldRef.current;
      if (Math.abs(diff) < 0.5) {
        const eq = (hotRef.current + coldRef.current) / 2;
        setHotTemp(eq);
        setColdTemp(eq);
        hotRef.current = eq;
        coldRef.current = eq;
        setIsSimulating(false);
        setHasReachedEquilibrium(true);
        return;
      }

      const transferRate = 0.02;
      hotRef.current -= diff * transferRate;
      coldRef.current += diff * transferRate;
      setHotTemp(hotRef.current);
      setColdTemp(coldRef.current);
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isSimulating]);

  const equilibriumTemp = useMemo(() => ((90 + 10) / 2).toFixed(1), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm hidden sm:inline">Quay lại</span>
          </button>
          <button
            onClick={() => setShowTheory(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-cyan-400 tracking-wide transition-all"
          >
            <BookOpen size={13} />
            <span>Xem Lý thuyết</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer size={20} className="text-red-400 animate-pulse" />
          <h1 className="font-extrabold text-base tracking-tight">Phòng thí nghiệm Nhiệt học</h1>
        </div>
        <button onClick={resetLab} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <RotateCcw size={16} />
          <span className="font-bold text-xs hidden sm:inline">Làm lại</span>
        </button>
      </header>

      {/* Mode tabs */}
      <div className="flex gap-2 px-4 py-3 bg-[#0F172A]/50 border-b border-white/5">
        <button
          onClick={() => setMode('thermometer')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            mode === 'thermometer'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Thermometer size={16} /> Nhiệt kế
        </button>
        <button
          onClick={() => setMode('equilibrium')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
            mode === 'equilibrium'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Droplets size={16} /> Cân bằng nhiệt
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {mode === 'thermometer' ? (
            <motion.div
              key="thermometer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Info card */}
              <div className="bg-[#1E293B]/60 border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-extrabold text-amber-400 mb-2">🌡️ Khám phá Nhiệt kế</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Kéo thanh trượt bên dưới để thay đổi nhiệt độ môi trường.
                  Quan sát chất lỏng trong nhiệt kế <strong className="text-amber-300">giãn nở khi nóng lên</strong> và{' '}
                  <strong className="text-blue-300">co lại khi lạnh đi</strong>.
                </p>
              </div>

              {/* Thermometer display */}
              <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6">
                <ThermometerVisual temperature={envTemp} label="Nhiệt độ môi trường" />

                {/* Temperature slider */}
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Snowflake size={12} /> -20°C</span>
                    <span className="flex items-center gap-1"><Flame size={12} /> 120°C</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="120"
                    step="0.5"
                    value={envTemp}
                    onChange={(e) => setEnvTemp(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Key temperature markers */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                  {[
                    { temp: 0, label: 'Nước đóng băng', icon: '🧊', color: 'text-blue-400' },
                    { temp: 37, label: 'Thân nhiệt', icon: '🫀', color: 'text-green-400' },
                    { temp: 100, label: 'Nước sôi', icon: '♨️', color: 'text-red-400' },
                  ].map((marker) => (
                    <button
                      key={marker.temp}
                      onClick={() => setEnvTemp(marker.temp)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        Math.abs(envTemp - marker.temp) < 2
                          ? 'bg-white/10 border-white/30 scale-105'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{marker.icon}</span>
                      <span className={`text-xs font-extrabold ${marker.color}`}>{marker.temp}°C</span>
                      <span className="text-[10px] font-bold text-slate-500">{marker.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="equilibrium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Info card */}
              <div className="bg-[#1E293B]/60 border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-extrabold text-cyan-400 mb-2">☕ Cân bằng nhiệt</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Khi trộn <strong className="text-red-400">nước nóng ({hotTemp > 85 ? '90' : hotTemp.toFixed(0)}°C)</strong> với{' '}
                  <strong className="text-blue-400">nước lạnh ({coldTemp < 15 ? '10' : coldTemp.toFixed(0)}°C)</strong>,
                  nhiệt lượng sẽ truyền từ nước nóng sang nước lạnh cho đến khi đạt{' '}
                  <strong className="text-emerald-400">cân bằng nhiệt</strong>.
                </p>
              </div>

              {/* Beakers */}
              <div className="bg-[#1E293B]/40 border border-white/10 rounded-2xl p-8">
                <div className="flex items-end justify-center gap-8 sm:gap-16">
                  <BeakerVisual
                    temperature={hotTemp}
                    label="Nước nóng"
                    isHeating={!isSimulating && !hasReachedEquilibrium}
                  />
                  <div className="flex flex-col items-center gap-2 pb-12">
                    {isSimulating && (
                      <motion.div
                        animate={{ x: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-2xl"
                      >
                        ⇄
                      </motion.div>
                    )}
                    {hasReachedEquilibrium && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        ✅
                      </motion.div>
                    )}
                    {!isSimulating && !hasReachedEquilibrium && (
                      <div className="text-slate-500 text-2xl">→←</div>
                    )}
                  </div>
                  <BeakerVisual
                    temperature={coldTemp}
                    label="Nước lạnh"
                    isCooling={!isSimulating && !hasReachedEquilibrium}
                  />
                </div>

                {/* Equilibrium result */}
                {hasReachedEquilibrium && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
                  >
                    <p className="text-emerald-400 font-extrabold text-sm">
                      🎉 Đã đạt cân bằng nhiệt tại {equilibriumTemp}°C!
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Nhiệt lượng tỏa ra = Nhiệt lượng thu vào → Q<sub>tỏa</sub> = Q<sub>thu</sub>
                    </p>
                  </motion.div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (hasReachedEquilibrium) {
                        resetLab();
                      } else {
                        setIsSimulating(!isSimulating);
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg transition-all ${
                      hasReachedEquilibrium
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                        : isSimulating
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/20'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-blue-500/20'
                    }`}
                  >
                    {hasReachedEquilibrium ? (
                      <><RotateCcw size={16} /> Làm lại</>
                    ) : isSimulating ? (
                      <><Pause size={16} /> Dừng</>
                    ) : (
                      <><Play size={16} /> Trộn nước</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Quiz Challenge Component */}
      <LabQuizChallenge labId="thermo" />

      {/* Theory Card Modal */}
      {showTheory && (
        <TheoryCardModal labId="thermo" onClose={() => setShowTheory(false)} />
      )}
    </div>
  );
}
