import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function RewardModal({ isOpen, onClose, xpGained }) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#38BDF8', '#58CC02']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#38BDF8', '#58CC02']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center shadow-2xl border-4 border-amber-300"
          >
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-6xl mb-4"
            >
              💎
            </motion.div>
            
            <h2 className="text-3xl font-extrabold text-amber-500 mb-2">Tuyệt Vời!</h2>
            <p className="text-slate-500 font-bold text-center mb-8">
              Bạn đã hoàn thành xuất sắc bài học và nhận được điểm thưởng.
            </p>
            
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl w-full py-4 flex flex-col items-center mb-8">
              <span className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-1">Kinh nghiệm</span>
              <span className="text-4xl font-black text-amber-600">+{xpGained} XP</span>
            </div>

            <button 
              onClick={onClose}
              className="w-full chunky-btn bg-success border-success-shadow text-white font-extrabold text-lg py-4 rounded-2xl"
            >
              TIẾP TỤC
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
