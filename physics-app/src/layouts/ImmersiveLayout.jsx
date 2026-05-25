import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { AnimatedProgressBar } from '../components/common';
import { useUser } from '../context/UserContext';

/**
 * ImmersiveLayout — Fullscreen layout for lessons, simulations, quizzes, and achievements.
 * No bottom nav, just a minimal header with close button, progress, and hearts.
 */
export default function ImmersiveLayout() {
  const navigate = useNavigate();
  const { hearts } = useUser();

  const handleClose = () => {
    navigate(-1); // Go back
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center min-h-screen bg-slate-800 lg:p-6"
    >
      <div className="w-full max-w-5xl bg-slate-50 lg:rounded-3xl shadow-2xl relative flex flex-col h-screen lg:h-[92vh] overflow-hidden">
        
        {/* Immersive Header */}
        <header className="flex items-center justify-between p-4 bg-white z-20 border-b-2 border-slate-100 shrink-0">
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X size={24} strokeWidth={3} />
          </button>

          <div className="flex-1 mx-4">
            {/* Progress bar will be controlled by child pages via context/props */}
            <AnimatedProgressBar progress={0} size="md" color="success" />
          </div>

          <div className="flex items-center gap-1 font-extrabold text-danger text-lg">
            <Heart size={20} fill="currentColor" /> {hearts ?? 5}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </motion.div>
  );
}
