import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Beaker, Target, User } from 'lucide-react';

/**
 * BottomNav — Mobile bottom navigation bar with 4 tabs.
 */
const navItems = [
  { to: '/', icon: Zap, label: 'Học tập', id: 'nav-learn' },
  { to: '/lab', icon: Beaker, label: 'Phòng Lab', id: 'nav-lab' },
  { to: '/missions', icon: Target, label: 'Nhiệm vụ', id: 'nav-missions' },
  { to: '/profile', icon: User, label: 'Hồ sơ', id: 'nav-profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bg-white border-t-2 border-slate-200 flex justify-around py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0 z-30 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;

        return (
          <NavLink
            key={item.id}
            to={item.to}
            id={item.id}
            className="flex flex-col items-center gap-0.5 min-w-[64px] py-1 relative"
          >
            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-2 w-6 h-1 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.85 }}
              className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400'}`}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>

            <span className={`text-[11px] font-bold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
