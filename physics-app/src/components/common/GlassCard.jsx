import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, hoverLift } from '../../animations/variants';

/**
 * GlassCard — Glassmorphism card with backdrop blur and soft shadow.
 *
 * @param {'default'|'frosted'|'solid'} variant
 * @param {boolean} hoverable - Enable hover lift effect
 * @param {boolean} animated - Enable entrance animation
 * @param {string} className
 */

const variantStyles = {
  default: 'bg-white/90 backdrop-blur-md border border-white/50 shadow-lg',
  frosted: 'bg-white/60 backdrop-blur-xl border border-white/30 shadow-xl',
  solid: 'bg-white border-2 border-slate-100 shadow-sm',
};

export default function GlassCard({
  variant = 'solid',
  hoverable = false,
  animated = true,
  children,
  className = '',
  onClick,
  ...props
}) {
  const baseClass = `rounded-3xl p-5 ${variantStyles[variant]}`;

  return (
    <motion.div
      initial={animated ? fadeInUp.initial : false}
      animate={animated ? fadeInUp.animate : false}
      transition={animated ? fadeInUp.transition : undefined}
      whileHover={hoverable ? hoverLift.whileHover : undefined}
      whileTap={hoverable ? hoverLift.whileTap : undefined}
      onClick={onClick}
      className={`${baseClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
