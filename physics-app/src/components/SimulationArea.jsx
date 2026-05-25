import React from 'react';
import { motion } from 'framer-motion';

export default function SimulationArea({ components, toggleComponent, isPlaying, isCircuitComplete, isLightOn }) {
  
  // Fake drop handler: If dragged upwards (negative Y), we assume it's dropped on the board
  const handleDragEnd = (event, info, type) => {
    if (info.offset.y < -50 && !components[type]) {
      toggleComponent(type);
    }
  };

  return (
    <div className="absolute inset-0 bg-sky-50" style={{ backgroundImage: 'radial-gradient(#bae6fd 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
      {/* Light effect layer */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${isLightOn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Circuit Board */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-40px]">
        <div className={`w-64 h-40 border-4 border-dashed rounded-3xl relative transition-colors duration-300 ${isCircuitComplete ? (isPlaying ? 'border-amber-400 bg-amber-50/30' : 'border-slate-400') : 'border-slate-300'}`}>
            
          {/* Battery Slot (Top) */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-sky-50 px-2 cursor-pointer z-10" onClick={() => toggleComponent('battery')}>
            {components.battery ? (
              <motion.div layoutId="battery" className="text-5xl drop-shadow-md">🔋</motion.div>
            ) : (
              <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-bold bg-white shadow-sm hover:border-action hover:text-action transition-colors">+ Pin -</div>
            )}
          </div>

          {/* Bulb Slot (Bottom) */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-sky-50 px-2 cursor-pointer z-10" onClick={() => toggleComponent('bulb')}>
            {components.bulb ? (
              <motion.div layoutId="bulb" className="text-5xl relative drop-shadow-md">
                💡
                {isLightOn && <div className="absolute -inset-2 bg-yellow-400 rounded-full blur-md opacity-60 -z-10 animate-pulse-glow"></div>}
              </motion.div>
            ) : (
              <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-bold bg-white shadow-sm hover:border-action hover:text-action transition-colors">Đèn</div>
            )}
          </div>

          {/* Switch Slot (Right) */}
          <div className="absolute top-1/2 -right-7 -translate-y-1/2 bg-sky-50 py-2 cursor-pointer z-10" onClick={() => toggleComponent('switch')}>
            {components.switch ? (
              <motion.div layoutId="switch" className="text-5xl drop-shadow-md">{isPlaying ? '🔘' : '🕹️'}</motion.div>
            ) : (
              <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-xs text-center font-bold bg-white shadow-sm hover:border-action hover:text-action transition-colors">Khóa</div>
            )}
          </div>

          {/* Wire overlay (Left) */}
          <div className="absolute top-1/2 -left-7 -translate-y-1/2 bg-sky-50 py-2 cursor-pointer z-10" onClick={() => toggleComponent('wire')}>
            {components.wire ? (
              <motion.div layoutId="wire" className="text-5xl drop-shadow-md">🔌</motion.div>
            ) : (
              <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold bg-white shadow-sm hover:border-action hover:text-action transition-colors">Dây</div>
            )}
          </div>
            
          {/* Continuous Wire path styling when active */}
          {isCircuitComplete && <div className={`absolute inset-0 border-[6px] border-solid rounded-3xl pointer-events-none transition-colors duration-300 ${isPlaying ? 'border-amber-400' : 'border-slate-600'}`}></div>}
        </div>
      </div>

      {/* Inventory Dock (Bottom) */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-white/80 backdrop-blur-md px-4 py-3 rounded-3xl shadow-lg border-2 border-white z-20">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center relative">
            {!components.battery && (
              <motion.div drag dragSnapToOrigin onDragEnd={(e, i) => handleDragEnd(e, i, 'battery')} layoutId="battery" className="text-4xl cursor-grab active:cursor-grabbing z-50">🔋</motion.div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1">Pin</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center relative">
            {!components.bulb && (
              <motion.div drag dragSnapToOrigin onDragEnd={(e, i) => handleDragEnd(e, i, 'bulb')} layoutId="bulb" className="text-4xl cursor-grab active:cursor-grabbing z-50">💡</motion.div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1">Bóng đèn</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center relative">
            {!components.switch && (
              <motion.div drag dragSnapToOrigin onDragEnd={(e, i) => handleDragEnd(e, i, 'switch')} layoutId="switch" className="text-4xl cursor-grab active:cursor-grabbing z-50">🕹️</motion.div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1">Công tắc</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center relative">
            {!components.wire && (
              <motion.div drag dragSnapToOrigin onDragEnd={(e, i) => handleDragEnd(e, i, 'wire')} layoutId="wire" className="text-4xl cursor-grab active:cursor-grabbing z-50">🔌</motion.div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1">Dây nối</span>
        </div>
      </div>
      
    </div>
  );
}
