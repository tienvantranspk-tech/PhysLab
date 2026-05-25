import React from 'react';
import { motion } from 'framer-motion';

/**
 * Avatar — Circular avatar with ring border, level badge, and online dot.
 *
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {string} emoji - Emoji character for avatar
 * @param {number} level - User level to display as badge
 * @param {boolean} showOnline - Show online status dot
 * @param {'primary'|'success'|'action'} ringColor
 */

const sizeMap = {
  sm: { container: 'w-10 h-10', text: 'text-lg', badge: 'text-[10px] -bottom-0.5 -right-0.5 w-5 h-5' },
  md: { container: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs -bottom-0.5 -right-0.5 w-6 h-6' },
  lg: { container: 'w-20 h-20', text: 'text-4xl', badge: 'text-sm -bottom-1 -right-1 w-7 h-7' },
  xl: { container: 'w-28 h-28', text: 'text-5xl', badge: 'text-base -bottom-1 -right-1 w-8 h-8' },
};

const ringColors = {
  primary: 'ring-primary',
  success: 'ring-success',
  action: 'ring-action',
};

export default function Avatar({
  size = 'md',
  emoji = '🧑‍🔬',
  level,
  showOnline = false,
  ringColor = 'primary',
  className = '',
}) {
  const s = sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-sky-100 ring-[3px] ${ringColors[ringColor]} ${s.container} ${className}`}
    >
      <span className={s.text}>{emoji}</span>

      {/* Level badge */}
      {level != null && (
        <div className={`absolute ${s.badge} bg-primary text-white font-extrabold rounded-full flex items-center justify-center ring-2 ring-white`}>
          {level}
        </div>
      )}

      {/* Online indicator */}
      {showOnline && (
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-success rounded-full ring-2 ring-white" />
      )}
    </motion.div>
  );
}
