import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bottomSheetVariants, modalOverlay } from '../../animations/variants';

/**
 * BottomSheet — Sliding bottom sheet with drag-to-dismiss and backdrop overlay.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title - Optional header title
 * @param {React.ReactNode} children
 */
export default function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bs-overlay"
            {...modalOverlay}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="bs-content"
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col ${className}`}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 pt-2 pb-4 shrink-0">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
