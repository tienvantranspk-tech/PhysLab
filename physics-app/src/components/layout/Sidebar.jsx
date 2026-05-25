import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Beaker, Target, User, Settings, Trophy } from 'lucide-react';

/**
 * Sidebar — Desktop sidebar navigation (hidden on mobile, shown on lg+).
 */
const navItems = [
  { to: '/', icon: Zap, label: 'Học tập' },
  { to: '/lab', icon: Beaker, label: 'Phòng Lab' },
  { to: '/missions', icon: Target, label: 'Nhiệm vụ' },
  { to: '/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
  { to: '/profile', icon: User, label: 'Hồ sơ' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r-2 border-slate-100 h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-400 rounded-2xl flex items-center justify-center text-xl shadow-md">
            ⚡
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">PhysLab</h1>
            <p className="text-[11px] font-bold text-slate-400 -mt-0.5">Vật lý vui nhộn</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 relative
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Settings */}
      <div className="p-4 border-t border-slate-100">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200
            ${isActive ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
          `}
        >
          <Settings size={20} />
          Cài đặt
        </NavLink>
      </div>
    </aside>
  );
}
