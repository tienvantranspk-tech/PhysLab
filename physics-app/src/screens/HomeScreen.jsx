import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { BottomSheet, ChunkyButton } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import lessonsData from '../data/lessons.json';

const topicFilters = [
  { id: 'all', label: 'Tất cả', icon: '📖' },
  { id: 'electricity', label: 'Điện học', icon: '⚡' },
  { id: 'mechanics', label: 'Cơ học', icon: '🔧' },
  { id: 'optics', label: 'Quang học', icon: '🌈' },
];

const LessonNode = ({ lesson, isLocked, isCurrent, isCompleted, onClick, index }) => {
  // Zigzag alignment
  const cycle = index % 6;
  const offsets = [0, -60, -80, -40, 40, 60];
  const xOffset = offsets[cycle] || 0;

  return (
    <motion.div
      variants={staggerItem}
      className="relative flex flex-col items-center my-5"
      style={{ marginLeft: xOffset }}
    >
      <motion.button
        whileHover={!isLocked ? { scale: 1.1 } : {}}
        whileTap={!isLocked ? { scale: 0.9 } : {}}
        onClick={onClick}
        disabled={isLocked}
        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl z-10 border-b-[5px] transition-all relative
          ${isLocked
            ? 'bg-slate-200 border-slate-300 text-slate-400 opacity-70 cursor-not-allowed'
            : isCompleted
              ? 'bg-success border-success-shadow text-white shadow-md'
              : 'bg-primary border-[#D97706] text-white shadow-lg animate-bounce-slow'
          }`}
      >
        {isLocked ? '🔒' : isCompleted ? '⭐' : lesson.thumbnail}

        {isCurrent && (
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="absolute -top-7 text-2xl"
          >
            👑
          </motion.div>
        )}

        {isCompleted && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-sm">✅</span>
          </div>
        )}
      </motion.button>

      <div className={`mt-2 font-bold text-xs text-center max-w-[100px] leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
        {lesson.title}
      </div>
    </motion.div>
  );
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { completedLessons, unlockedLessons } = useUser();
  const [activeTopic, setActiveTopic] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);

  const lessons = lessonsData.lessons.filter(
    l => activeTopic === 'all' || l.topic === activeTopic
  );

  const handleLessonClick = (lesson, isLocked) => {
    if (isLocked) return;
    setSelectedLesson(lesson);
  };

  const handleStartLesson = () => {
    if (!selectedLesson) return;
    if (selectedLesson.simulation.type === 'simple_circuit') {
      navigate('/simulation');
    }
    setSelectedLesson(null);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-sky-50 relative"
        style={{ backgroundImage: 'radial-gradient(#bae6fd 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
      >
        {/* Topic Filter Tabs */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {topicFilters.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all shrink-0
                  ${activeTopic === t.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-primary/30'
                  }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Mascot */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-4 mb-2 bg-white border-2 border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-soft"
        >
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="text-3xl">🦉</motion.div>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">
            Chào em! Hôm nay chúng ta học tiếp bài <strong className="text-primary">mới</strong> nhé! 🚀
          </p>
        </motion.div>

        {/* Lesson Map */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="py-4 flex flex-col items-center relative px-4"
        >
          {lessons.map((lesson, i) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isUnlocked = unlockedLessons.includes(lesson.id);
            const isCurrent = isUnlocked && !isCompleted;
            const isLocked = !isUnlocked;

            return (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={i}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                onClick={() => handleLessonClick(lesson, isLocked)}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Lesson Intro Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title}
      >
        {selectedLesson && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-sky-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                {selectedLesson.thumbnail}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lessonsData.topics.find(t => t.id === selectedLesson.topic)?.name} · Lớp {selectedLesson.grade}
                </span>
                <p className="text-sm font-semibold text-slate-600 mt-1">{selectedLesson.description}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <div className="text-xl">⭐</div>
                <div className="text-sm font-extrabold text-amber-600">{selectedLesson.xpReward} XP</div>
              </div>
              <div className="flex-1 bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
                <div className="text-xl">❓</div>
                <div className="text-sm font-extrabold text-sky-600">{selectedLesson.quiz.length} câu hỏi</div>
              </div>
              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <div className="text-xl">🔬</div>
                <div className="text-sm font-extrabold text-green-600">Mô phỏng</div>
              </div>
            </div>

            <ChunkyButton variant="success" size="lg" fullWidth icon="🚀" onClick={handleStartLesson}>
              BẮT ĐẦU THÍ NGHIỆM
            </ChunkyButton>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
