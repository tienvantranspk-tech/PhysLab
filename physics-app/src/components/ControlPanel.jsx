import React from 'react';

export default function ControlPanel({ voltage, setVoltage, isPlaying, handlePlay, resetSimulation }) {
  return (
    <div className="p-6 bg-white relative z-10 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-b-2 border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-slate-700 text-lg flex items-center gap-2">
          <span className="text-primary text-xl">⚡</span> Điện áp
        </span>
        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-extrabold text-lg border border-orange-200">
          {voltage}V
        </div>
      </div>
      
      <div className="mb-6 px-2">
        <input 
          type="range" 
          min="1.5" max="9.0" step="1.5" 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
          disabled={isPlaying}
          className={isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
        />
        <div className="flex justify-between text-xs text-slate-400 font-bold mt-2">
          <span>1.5V (Yếu)</span>
          <span>9.0V (Mạnh)</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={resetSimulation}
          className="chunky-btn flex-1 bg-slate-100 text-slate-500 border-slate-300 font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 hover:text-slate-600 active:bg-slate-200">
          <span className="text-xl">🔄</span> LÀM LẠI
        </button>
        <button 
          onClick={handlePlay}
          className={`chunky-btn flex-[2] text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-lg
            ${isPlaying 
              ? 'bg-danger border-danger-shadow hover:bg-red-500' 
              : 'bg-success border-success-shadow hover:bg-[#61E002]'}`}
        >
          <span className="text-2xl">{isPlaying ? '⏹️' : '▶️'}</span> 
          {isPlaying ? 'NGẮT MẠCH' : 'ĐÓNG MẠCH'}
        </button>
      </div>
    </div>
  );
}
