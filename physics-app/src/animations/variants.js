/**
 * Framer Motion Animation Presets
 * Centralized animation variants for consistent, reusable motion across the app.
 */

// --- Page Transitions ---
export const pageSlideRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '-30%', opacity: 0, transition: { duration: 0.2 } },
};

export const pageSlideLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '30%', opacity: 0, transition: { duration: 0.2 } },
};

export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// --- Element Entrances ---
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 400, damping: 15 },
};

// --- Interactive States ---
export const springBounce = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

export const springSmooth = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
};

export const springGentle = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

// --- Hover / Tap ---
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: springBounce,
};

export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' },
  whileTap: { y: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' },
  transition: springSmooth,
};

// --- Looping Animations ---
export const floatAnimation = {
  animate: { y: [0, -8, 0] },
  transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
};

export const pulseAnimation = {
  animate: { scale: [1, 1.08, 1] },
  transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
};

export const shakeAnimation = {
  animate: { x: [0, -6, 6, -6, 6, 0] },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

export const glowPulse = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
};

// --- Bottom Sheet ---
export const bottomSheetVariants = {
  hidden: { y: '100%', opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

// --- Stagger Children ---
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// --- Modal ---
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent = {
  initial: { scale: 0.5, opacity: 0, y: 80 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 22 },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 40,
    transition: { duration: 0.2 },
  },
};

// --- Notification / Toast ---
export const slideInFromTop = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: springBounce },
  exit: { y: -100, opacity: 0, transition: { duration: 0.2 } },
};

export const slideInFromBottom = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: springBounce },
  exit: { y: 100, opacity: 0, transition: { duration: 0.2 } },
};
