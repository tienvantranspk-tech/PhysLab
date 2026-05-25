import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedProgressBar — Rounded progress bar with shimmer/glow effect.
 *
 * @param {number} progress - 0 to 100
 * @param {'sm'|'md'|'lg'} size - Bar height
 * @param {'success'|'primary'|'action'|'danger'} color - Bar color
 * @param {boolean} showLabel - Show percentage text
 * @param {boolean} shimmer - Enable shimmer effect
 */

const colorStyles = {
  success: 'bg-success',
  primary: 'bg-primary',
  action: 'bg-action',
  danger: 'bg-danger',
};

const sizeStyles = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export default function AnimatedProgressBar({
  progress = 0,
  size = 'md',
  color = 'success',
  showLabel = false,
  shimmer = true,
  className = '',
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full relative ${className}`}>
      {/* Track */}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full ${colorStyles[color]} rounded-full relative overflow-hidden`}
        >
          {/* Inner highlight */}
          <div className="absolute top-[2px] left-2 right-2 h-[3px] bg-white/30 rounded-full" />

          {/* Shimmer effect */}
          {shimmer && clampedProgress > 0 && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="shimmer-bar absolute inset-0" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-xs font-bold text-slate-500 mt-1 text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
