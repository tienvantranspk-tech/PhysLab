import React from 'react';
import { motion } from 'framer-motion';
import { springBounce } from '../../animations/variants';

/**
 * ChunkyButton — 3D-style chunky button with press-down effect.
 *
 * @param {'primary'|'success'|'danger'|'action'|'neutral'} variant - Color variant
 * @param {'sm'|'md'|'lg'} size - Button size
 * @param {boolean} fullWidth - Whether button takes full width
 * @param {boolean} disabled - Disabled state
 * @param {string} icon - Emoji or icon to show before label
 * @param {React.ReactNode} children - Button label
 */

const variantStyles = {
  primary: {
    base: 'bg-primary text-white border-b-[4px] border-[#D97706]',
    hover: 'hover:bg-[#FBBF24]',
    active: 'active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
  },
  success: {
    base: 'bg-success text-white border-b-[4px] border-success-shadow',
    hover: 'hover:bg-[#61E002]',
    active: 'active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
  },
  danger: {
    base: 'bg-danger text-white border-b-[4px] border-danger-shadow',
    hover: 'hover:bg-[#FF6B6B]',
    active: 'active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
  },
  action: {
    base: 'bg-action text-white border-b-[4px] border-action-shadow',
    hover: 'hover:bg-[#38BDF8]',
    active: 'active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
  },
  neutral: {
    base: 'bg-slate-100 text-slate-600 border-b-[4px] border-slate-300',
    hover: 'hover:bg-slate-200',
    active: 'active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
  },
};

const sizeStyles = {
  sm: 'py-2 px-4 text-sm rounded-xl',
  md: 'py-3 px-6 text-base rounded-2xl',
  lg: 'py-4 px-8 text-lg rounded-2xl',
};

export default function ChunkyButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  children,
  className = '',
  onClick,
  ...props
}) {
  const styles = variantStyles[variant] || variantStyles.primary;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={springBounce}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.base} ${styles.hover} ${styles.active}
        ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed !border-b-[4px] !translate-y-0' : 'cursor-pointer'}
        font-extrabold transition-all duration-100
        flex items-center justify-center gap-2
        select-none
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </motion.button>
  );
}
