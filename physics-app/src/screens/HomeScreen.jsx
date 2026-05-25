import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, Zap, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

const LessonNode = ({ title, isLocked, isCurrent, isCompleted, onClick, align = "center" }) => {
  const alignmentClass = align === "left" ? "-ml-24" : align === "right" ? "ml-24" : "";
  
  return (
    <div className={`relative flex flex-col items-center my-6 ${alignmentClass}`}>
      <motion.button
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={isLocked}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl z-10 border-b-[6px] transition-colors relative
          ${isLocked 
            ? 'bg-slate-200 border-slate-300 text-slate-400 opacity-80 cursor-not-allowed' 
            : isCompleted
              ? 'bg-success border-success-shadow text-white'
              : 'bg-primary border-[#D97706] text-white animate-bounce-slow'
          }`}
      >
        {isLocked ? '🔒' : isCompleted ? '⭐' : '💡'}
        
        {/* Crown indicator for current */}
        {isCurrent && (
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: -5 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="absolute -top-6 text-2xl"
          >
            👑
          </motion.div>
        )}
      </motion.button>
      <div className={`mt-3 font-bold text-sm ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
        {title}
      </div>
    </div>
  );
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { xp, streak, completedLessons, unlockedLessons } = useUser();

  const lessons = [
    { id: 'lesson_0', title: 'Điện tích là gì?', align: 'center' },
    { id: 'lesson_1', title: 'Dòng điện', align: 'center' },
    { id: 'lesson_2', title: 'Mạch điện cơ bản', align: 'left', path: '/simulation' },
    { id: 'lesson_3', title: 'Định luật Ohm', align: 'left' },
    { id: 'lesson_4', title: 'Mạch nối tiếp', align: 'right' },
    { id: 'lesson_5', title: 'Mạch song song', align: 'right' },
    { id: 'lesson_6', title: 'An toàn điện', align: 'center' },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-2xl relative flex flex-col h-screen">
        
        {/* Header Dashboard */}
        <header className="flex items-center justify-between p-4 bg-white z-20 border-b-2 border-slate-100 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-bold text-orange-500">
              <Flame size={24} fill="currentColor" /> {streak}
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-500">
              <Star size={24} fill="currentColor" /> {xp}
            </div>
          </div>
          <div className="flex items-center gap-1 font-bold text-rose-500">
            ❤️ 3
          </div>
        </header>

        {/* Path Map */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 bg-sky-50 relative" style={{ backgroundImage: 'radial-gradient(#bae6fd 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
          
          <div className="py-8 flex flex-col items-center relative">
            {/* SVG Path connecting nodes */}
            <svg className="absolute top-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <path d="M 200 50 L 200 150 L 120 250 L 120 350 L 280 450 L 280 550 L 200 650" fill="transparent" stroke="#E2E8F0" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 200 50 L 200 150 L 120 250" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Nodes */}
            <div className="z-10 w-full flex flex-col items-center">
              {lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isUnlocked = unlockedLessons.includes(lesson.id);
                const isCurrent = isUnlocked && !isCompleted;
                const isLocked = !isUnlocked;
                
                return (
                  <LessonNode 
                    key={lesson.id}
                    title={lesson.title} 
                    isCompleted={isCompleted} 
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    align={lesson.align} 
                    onClick={() => {
                      if (lesson.path) navigate(lesson.path);
                    }} 
                  />
                )
              })}
            </div>
            
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t-2 border-slate-200 flex justify-around p-3 pb-6 shrink-0 z-20">
          <button className="flex flex-col items-center text-primary font-bold">
            <Zap size={28} />
            <span className="text-xs mt-1">Học tập</span>
          </button>
          <button className="flex flex-col items-center text-slate-400 hover:text-slate-600 font-bold transition-colors">
            <Star size={28} />
            <span className="text-xs mt-1">Nhiệm vụ</span>
          </button>
          <button className="flex flex-col items-center text-slate-400 hover:text-slate-600 font-bold transition-colors">
            <User size={28} />
            <span className="text-xs mt-1">Hồ sơ</span>
          </button>
        </div>

      </div>
    </div>
  );
}
