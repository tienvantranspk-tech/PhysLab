import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Diamond } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import Sidebar from '../components/layout/Sidebar';
import { Avatar } from '../components/common';
import { useUser } from '../context/UserContext';

/**
 * MainLayout — Main application layout with header stats, sidebar (desktop), bottom nav (mobile).
 * Used for: Home, Lab, Missions, Profile, Leaderboard, Settings.
 */
export default function MainLayout() {
  const { xp, streak, gems } = useUser();

  return (
    <div className="flex h-screen bg-[#0B1120] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen max-w-2xl mx-auto w-full lg:max-w-none overflow-hidden">
        
        {/* Top Header Bar (stats) */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md z-20 border-b border-white/5 shrink-0 sticky top-0">
          {/* Left: Logo (mobile only) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-amber-400 rounded-xl flex items-center justify-center text-sm shadow-md">
              ⚡
            </div>
          </div>

          {/* Center / Stats */}
          <div className="flex items-center gap-2 lg:gap-3.5">
            {/* Streak */}
            <div className="flex items-center gap-1.5 font-extrabold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] relative overflow-hidden group">
              <motion.div
                animate={{ scale: [1, 1.15, 1], filter: ["drop-shadow(0 0 2px #F97316)", "drop-shadow(0 0 8px #EA580C)", "drop-shadow(0 0 2px #F97316)"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Flame size={18} fill="currentColor" />
              </motion.div>
              <span className="text-xs">{streak}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                <Star size={16} fill="currentColor" />
              </motion.div>
              <span className="text-xs">{xp}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 font-extrabold text-sky-500 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Diamond size={15} fill="currentColor" />
              </motion.div>
              <span className="text-xs">{gems || 0}</span>
            </div>
          </div>

          {/* Right: Avatar */}
          <Avatar size="sm" emoji="🧑‍🔬" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Navigation (mobile) */}
        <BottomNav />
      </div>
    </div>
  );
}
