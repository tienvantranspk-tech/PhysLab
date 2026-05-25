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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-2xl mx-auto w-full lg:max-w-none">
        
        {/* Top Header Bar (stats) */}
        <header className="flex items-center justify-between px-4 py-3 bg-white z-20 border-b-2 border-slate-100 shrink-0 sticky top-0">
          {/* Left: Logo (mobile only) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-amber-400 rounded-xl flex items-center justify-center text-sm shadow-md">
              ⚡
            </div>
          </div>

          {/* Center / Stats */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Streak */}
            <div className="flex items-center gap-1.5 font-extrabold text-orange-500">
              <Flame size={22} fill="currentColor" />
              <span className="text-sm">{streak}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
              <Star size={22} fill="currentColor" />
              <span className="text-sm">{xp}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 font-extrabold text-sky-500">
              <Diamond size={20} fill="currentColor" />
              <span className="text-sm">{gems || 0}</span>
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
