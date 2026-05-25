import React from 'react';
import { motion } from 'framer-motion';
import { popIn } from '../../animations/variants';

/**
 * Badge — Achievement badge with icon, label, and locked/unlocked state.
 *
 * @param {string} icon - Emoji icon
 * @param {string} label - Badge name
 * @param {boolean} unlocked
 * @param {'sm'|'md'} size
 */
export default function Badge({
  icon = '🏆',
  label = 'Badge',
  unlocked = true,
  size = 'md',
  className = '',
}) {
  const isSmall = size === 'sm';

  return (
    <motion.div
      initial={popIn.initial}
      animate={popIn.animate}
      transition={popIn.transition}
      className={`
        flex flex-col items-center gap-1.5
        ${isSmall ? 'w-16' : 'w-20'}
        ${className}
      `}
    >
      <div
        className={`
          ${isSmall ? 'w-14 h-14 text-2xl' : 'w-18 h-18 text-3xl'}
          rounded-2xl flex items-center justify-center
          border-2 shadow-sm relative overflow-hidden
          ${unlocked
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
            : 'bg-slate-100 border-slate-200 grayscale opacity-50'
          }
        `}
      >
        <span className={unlocked ? '' : 'blur-[1px]'}>{icon}</span>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/40">
            <span className="text-lg">🔒</span>
          </div>
        )}
      </div>
      <span className={`
        font-bold text-center leading-tight
        ${isSmall ? 'text-[10px]' : 'text-xs'}
        ${unlocked ? 'text-slate-700' : 'text-slate-400'}
      `}>
        {label}
      </span>
    </motion.div>
  );
}
