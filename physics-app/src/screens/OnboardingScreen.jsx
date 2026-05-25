import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChunkyButton } from '../components/common';
import { useUser } from '../context/UserContext';

const slides = [
  {
    emoji: '🔬',
    title: 'Thí nghiệm ảo',
    description: 'Khám phá Vật lý qua các thí nghiệm tương tác — lắp mạch điện, thả rơi tự do, tán sắc ánh sáng!',
    bg: 'from-sky-400 to-blue-500',
  },
  {
    emoji: '🎮',
    title: 'Học mà chơi',
    description: 'Tích điểm XP, giữ streak, mở khóa huy hiệu — học Vật lý chưa bao giờ vui đến thế!',
    bg: 'from-amber-400 to-orange-500',
  },
  {
    emoji: '🧑‍🔬',
    title: 'Chọn lớp của em',
    description: 'Chọn lớp để bắt đầu hành trình khám phá Vật lý nào!',
    bg: 'from-emerald-400 to-green-500',
    isGradeSelect: true,
  },
];

/**
 * OnboardingScreen — 3-step onboarding with grade selection.
 */
export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { setGrade } = useUser();
  const [step, setStep] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const slide = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    }
  };

  const handleStart = () => {
    if (selectedGrade) {
      setGrade(selectedGrade);
      localStorage.setItem('physlab_onboarded', 'true');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${slide.bg} flex flex-col items-center justify-center p-6 z-50`}>
      {/* Skip button */}
      {step < 2 && (
        <button
          onClick={() => setStep(2)}
          className="absolute top-6 right-6 text-white/70 font-bold text-sm hover:text-white transition-colors"
        >
          Bỏ qua →
        </button>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          {/* Emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[40px] flex items-center justify-center mb-8 shadow-xl"
          >
            <span className="text-7xl">{slide.emoji}</span>
          </motion.div>

          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-white/80 font-semibold text-base leading-relaxed mb-8">
            {slide.description}
          </p>

          {/* Grade Selection (step 3) */}
          {slide.isGradeSelect && (
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {[6, 7, 8, 9].map((g) => (
                <motion.button
                  key={g}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGrade(g)}
                  className={`
                    py-4 rounded-2xl font-extrabold text-lg transition-all duration-200 border-b-4
                    ${selectedGrade === g
                      ? 'bg-white text-green-600 border-green-300 shadow-lg'
                      : 'bg-white/20 text-white border-white/10 hover:bg-white/30'
                    }
                  `}
                >
                  Lớp {g}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="flex gap-2 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Action button */}
      <div className="w-full max-w-sm">
        {slide.isGradeSelect ? (
          <ChunkyButton
            variant="success"
            size="lg"
            fullWidth
            disabled={!selectedGrade}
            onClick={handleStart}
            icon="🚀"
          >
            BẮT ĐẦU HỌC
          </ChunkyButton>
        ) : (
          <ChunkyButton
            variant="neutral"
            size="lg"
            fullWidth
            onClick={handleNext}
          >
            TIẾP TỤC
          </ChunkyButton>
        )}
      </div>
    </div>
  );
}
