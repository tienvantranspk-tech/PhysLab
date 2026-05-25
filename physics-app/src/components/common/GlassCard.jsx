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
  default: 'bg-[#0F172A]/70 backdrop-blur-md border border-white/5 shadow-lg text-slate-100',
  frosted: 'bg-[#1E293B]/50 backdrop-blur-xl border border-white/10 shadow-xl text-slate-100',
  solid: 'bg-[#0F172A]/80 backdrop-blur-sm border-2 border-white/5 shadow-sm text-slate-100',
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
