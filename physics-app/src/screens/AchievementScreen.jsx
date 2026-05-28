import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Star, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { ChunkyButton, GlassCard } from '../components/common';
import useSoundEffects from '../hooks/useSoundEffects';
import lessonsData from '../data/lessons.json';

export default function AchievementScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const { xp, addXp } = useUser();
  const { playSuccess, playLevelUp } = useSoundEffects();

  const xpReward = parseInt(searchParams.get('xp') || '50', 10);
  const [displayXp, setDisplayXp] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  // Find lesson information
  const lesson = lessonsData.lessons.find(l => l.id === lessonId);
  const title = lesson ? lesson.title : 'Phòng thí nghiệm';

  const quotes = [
    "Tuyệt vời! Em vừa mở khóa thêm một chân trời vật lý mới đấy! 🦉",
    "Kiến thức là sức mạnh! Thầy Cú rất tự hào về tinh thần tự học của em! 🚀",
    "Một bước tiến lớn để trở thành nhà khoa học thực thụ! Tiếp tục phát huy nhé! 🔬",
    "Mạch điện, ánh sáng, lực cơ học... không gì có thể làm khó được em! ⚡"
  ];
  
  const [mascotQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    // 1. Trigger Confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
    });

    // 2. Play Sound
    playSuccess();

    // 3. XP Count-up animation
    let current = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / xpReward), 15);
    
    const timer = setInterval(() => {
      current += Math.ceil(xpReward / 20);
      if (current >= xpReward) {
        setDisplayXp(xpReward);
        clearInterval(timer);
      } else {
        setDisplayXp(current);
      }
    }, stepTime);

    // 4. Mascot typewriter effect
    let charIndex = 0;
    const typeTimer = setInterval(() => {
      setTypedText(prev => prev + mascotQuote.charAt(charIndex));
      charIndex++;
      if (charIndex >= mascotQuote.length) {
        clearInterval(typeTimer);
      }
    }, 40);

    return () => {
      clearInterval(timer);
      clearInterval(typeTimer);
    };
  }, [xpReward, mascotQuote, playSuccess]);

  const handleNext = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Dynamic star particles background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md flex flex-col items-center text-center z-10"
      >
        {/* Floating sparkles */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute inset-0 filter blur-xl bg-amber-500/20 rounded-full scale-125"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[35px] flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] border-2 border-amber-300"
          >
            <Award size={60} className="text-slate-950 font-bold" />
          </motion.div>
          
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ✨
          </motion.span>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-white tracking-tight uppercase"
        >
          Hoàn Thành Xuất Sắc!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 font-extrabold text-xs tracking-wider uppercase mt-1 mb-6"
        >
          {title}
        </motion.p>

        {/* XP Reward card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
          className="w-full mb-6"
        >
          <GlassCard variant="default" className="border-amber-500/20 bg-amber-500/5 relative overflow-hidden py-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl" />
            
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Star size={16} fill="currentColor" /> Thưởng điểm kinh nghiệm
              </span>
              <div className="text-6xl font-black text-amber-400 tracking-tighter mt-3 flex items-center justify-center gap-1 drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                +{displayXp} <span className="text-3xl font-extrabold text-amber-500">XP</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Mascot Dialogue */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-[#0F172A]/70 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-xl mb-8 relative text-left"
        >
          <div className="text-4xl filter drop-shadow-md shrink-0 self-start animate-bounce">
            🦉
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Sparkles size={10} /> Thầy Cú thông thái
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-relaxed min-h-[40px] font-mono">
              {typedText}
            </p>
          </div>
        </motion.div>

        {/* Next Action button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <ChunkyButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNext}
            icon="🏠"
            className="shadow-xl shadow-amber-500/10"
          >
            QUAY VỀ BẢN ĐỒ BÀI HỌC
          </ChunkyButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
