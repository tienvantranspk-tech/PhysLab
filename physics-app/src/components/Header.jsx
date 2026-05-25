import React from 'react';
import { X, Heart } from 'lucide-react';

export default function Header({ lives, progress, onClose }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white z-20 border-b-2 border-slate-100 shrink-0">
      <button 
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
      >
        <X size={24} strokeWidth={3} />
      </button>
      
      <div className="flex-1 mx-4 h-4 bg-slate-200 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-success rounded-full relative transition-all duration-500"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 font-extrabold text-danger text-lg">
        <Heart size={20} fill="currentColor" /> {lives}
      </div>
    </header>
  );
}
