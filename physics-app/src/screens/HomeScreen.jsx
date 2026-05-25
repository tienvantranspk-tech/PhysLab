import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { BottomSheet, ChunkyButton, GlassCard } from '../components/common';
import { staggerContainer, staggerItem } from '../animations/variants';
import lessonsData from '../data/lessons.json';

const topicFilters = [
  { id: 'all', label: 'Dải Ngân Hà', icon: '🌌', color: 'from-pink-500 via-purple-500 to-indigo-500', glow: 'rgba(168,85,247,0.4)' },
  { id: 'electricity', label: 'Điện học', icon: '⚡', color: 'from-amber-400 to-yellow-500', glow: 'rgba(251,191,36,0.4)' },
  { id: 'mechanics', label: 'Cơ học', icon: '🔧', color: 'from-sky-400 to-blue-500', glow: 'rgba(56,189,248,0.4)' },
  { id: 'optics', label: 'Quang học', icon: '🌈', color: 'from-purple-400 to-violet-500', glow: 'rgba(168,85,247,0.4)' },
];

const LessonNode = ({ lesson, isLocked, isCurrent, isCompleted, onClick, index }) => {
  // Constellation path zig-zag positions
  const cycle = index % 5;
  const offsets = [0, -50, 40, -30, 30];
  const xOffset = offsets[cycle] || 0;

  const nodeColor = isLocked
    ? 'bg-slate-800 border-slate-700 text-slate-500 shadow-none'
    : isCompleted
      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
      : 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse';

  return (
    <motion.div
      variants={staggerItem}
      className="relative flex flex-col items-center my-8 z-10"
      style={{ marginLeft: xOffset }}
    >
      <motion.button
        whileHover={!isLocked ? { scale: 1.15 } : {}}
        whileTap={!isLocked ? { scale: 0.9 } : {}}
        onClick={onClick}
        disabled={isLocked}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all relative cursor-pointer ${nodeColor}`}
      >
        {isLocked ? '🔒' : isCompleted ? '⭐' : lesson.thumbnail}

        {isCurrent && (
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute -top-7 text-2xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
          >
            👑
          </motion.div>
        )}

        {isCompleted && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border border-slate-900 shadow-sm">
            <span className="text-[10px] text-white font-bold">✓</span>
          </div>
        )}
      </motion.button>

      <div className={`mt-2 font-extrabold text-xs text-center max-w-[120px] leading-tight transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
        {lesson.title}
      </div>
    </motion.div>
  );
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { completedLessons, unlockedLessons } = useUser();
  const [activeTopic, setActiveTopic] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);

  const lessons = lessonsData.lessons.filter(
    l => activeTopic === 'all' || l.topic === activeTopic
  );

  // Starfield background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.01 + 0.005,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha)})`;
        ctx.fill();
      });

      // Subtle neon constellations
      ctx.strokeStyle = 'rgba(56,189,248,0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < W; i += 40) {
        ctx.moveTo(i, 0); ctx.lineTo(i, H);
      }
      for (let i = 0; i < H; i += 40) {
        ctx.moveTo(0, i); ctx.lineTo(W, i);
      }
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLessonClick = (lesson, isLocked) => {
    if (isLocked) return;
    setSelectedLesson(lesson);
  };

  const handleStartLesson = () => {
    if (!selectedLesson) return;
    const simType = selectedLesson.simulation.type;
    if (simType === 'free_fall') navigate('/lab/freefall');
    else if (simType === 'pendulum') navigate('/lab/pendulum');
    else if (simType === 'inclined_plane') navigate('/lab/incline');
    else if (simType === 'mirror_reflection') navigate('/lab/mirror');
    else if (simType === 'prism_dispersion') navigate('/lab/prism');
    else if (simType === 'ohm_law') navigate('/lab/ohm');
    else navigate(`/simulation/${selectedLesson.id}`);
    setSelectedLesson(null);
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-24">
        {/* Topic Filters */}
        <div className="sticky top-0 z-20 bg-[#0F172A]/70 backdrop-blur-md px-4 py-3 border-b border-white/5 shrink-0">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {topicFilters.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm whitespace-nowrap transition-all duration-200 shrink-0
                  ${activeTopic === t.id
                    ? `bg-gradient-to-r ${t.color} text-white shadow-lg shadow-${t.id === 'electricity' ? 'amber' : t.id === 'mechanics' ? 'sky' : 'purple'}-500/20`
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-200'
                  }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mascot Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-5 mb-3 bg-[#0F172A]/60 backdrop-blur-sm border border-white/5 rounded-3xl p-4 flex items-center gap-4 shadow-xl"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="text-4xl filter drop-shadow-md"
          >
            🦉
          </motion.div>
          <div>
            <p className="text-sm font-bold text-slate-200">Chào mừng đến với Vũ trụ Vật lý!</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 leading-relaxed">
              Click vào các chòm sao để bắt đầu cuộc hành trình khám phá các định luật vật lý thú vị! 🚀
            </p>
          </div>
        </motion.div>

        {/* Galaxy Nodes Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-6 py-6 min-h-[400px]">
          {/* Constellation line background */}
          <div className="absolute inset-0 flex justify-center pointer-events-none opacity-20">
            <svg className="w-full h-full max-w-md" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M50,5 L30,25 L70,45 L35,65 L65,85 L50,95" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" />
            </svg>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="w-full max-w-xs flex flex-col items-center relative"
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
      </div>

      {/* Lesson Details Sheet */}
      <BottomSheet
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title}
      >
        {selectedLesson && (
          <div className="flex flex-col gap-5 p-1 text-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-4xl shadow-md shrink-0">
                {selectedLesson.thumbnail}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full">
                  {lessonsData.topics.find(t => t.id === selectedLesson.topic)?.name} · Lớp {selectedLesson.grade}
                </span>
                <p className="text-xs font-semibold text-slate-300 mt-2 leading-relaxed">{selectedLesson.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">⭐</div>
                <div className="text-xs font-extrabold text-amber-400">+{selectedLesson.xpReward} XP</div>
              </div>
              <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">❓</div>
                <div className="text-xs font-extrabold text-sky-400">{selectedLesson.quiz.length} câu hỏi</div>
              </div>
              <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">🔬</div>
                <div className="text-xs font-extrabold text-emerald-400">Playground</div>
              </div>
            </div>

            <ChunkyButton variant="primary" size="lg" fullWidth icon="🚀" onClick={handleStartLesson} className="shadow-lg shadow-amber-500/15">
              BẮT ĐẦU PHÒNG THÍ NGHIỆM
            </ChunkyButton>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
