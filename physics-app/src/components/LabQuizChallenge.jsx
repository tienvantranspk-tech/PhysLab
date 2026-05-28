import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, X, Check, HelpCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../context/UserContext';
import useSoundEffects from '../hooks/useSoundEffects';

// Mapping from labId to lesson progression in the map
const LAB_LESSON_MAP = {
  freefall: { id: 'mech_01', nextId: 'mech_02' },
  pendulum: { id: 'mech_02', nextId: 'mech_03' },
  incline: { id: 'mech_03', nextId: 'mech_04' },
  mirror: { id: 'optic_01', nextId: 'optic_02' },
  optics: { id: 'optic_02', nextId: 'optic_03' },
  prism: { id: 'optic_03', nextId: null },
  ohm: { id: 'elec_04', nextId: 'elec_05' },
  circuit: { id: 'elec_03', nextId: 'elec_04' }
};

// Database of specific conceptual questions for each lab
const LAB_QUESTIONS = {
  circuit: {
    question: "Nếu nối hai cực của viên pin bằng một đoạn dây dẫn mà không qua thiết bị tiêu thụ điện nào, hiện tượng gì sẽ xảy ra?",
    options: [
      "Bóng đèn trong mạch sẽ sáng mạnh gấp đôi thông thường",
      "Xảy ra đoản mạch (ngắn mạch) cực kỳ nguy hiểm, làm nóng pin và có thể cháy hỏng",
      "Không có bất kỳ dòng điện nào chạy qua mạch"
    ],
    correctIdx: 1,
    tip: "💡 Khi điện trở của mạch quá nhỏ (gần bằng 0), cường độ dòng điện tăng vọt gây chập cháy!"
  },
  optics: {
    question: "Khi đặt một vật sáng trước thấu kính hội tụ và nằm trong khoảng tiêu cự (d < f), thấu kính sẽ tạo ra ảnh có đặc điểm gì?",
    options: [
      "Ảnh thật, ngược chiều và nhỏ hơn vật",
      "Ảnh ảo, cùng chiều và lớn hơn vật",
      "Ảnh thật, ngược chiều và lớn hơn vật"
    ],
    correctIdx: 1,
    tip: "💡 d < f tạo ảnh ảo nằm cùng phía với vật, phóng to và thẳng đứng, ứng dụng làm kính lúp!"
  },
  hooke: {
    question: "Theo định luật Hooke, trong giới hạn đàn hồi, lực đàn hồi của lò xo liên hệ thế nào với độ biến dạng x?",
    options: [
      "Tỉ lệ nghịch với độ biến dạng x",
      "Tỉ lệ thuận với độ biến dạng x (F = k * |x|)",
      "Không phụ thuộc gì vào độ biến dạng x"
    ],
    correctIdx: 1,
    tip: "💡 Độ biến dạng (kéo giãn hoặc nén) càng lớn thì lò xo sinh ra lực phản kháng đàn hồi càng mạnh."
  },
  projectile: {
    question: "Bỏ qua sức cản không khí, để vật ném xiên từ mặt đất đạt được tầm xa nằm ngang cực đại, ta nên chọn góc bắn bằng bao nhiêu độ?",
    options: [
      "Góc bắn 30 độ",
      "Góc bắn 45 độ",
      "Góc bắn 60 độ"
    ],
    correctIdx: 1,
    tip: "💡 Góc bắn 45 độ chia đều vector vận tốc ban đầu sang cả phương ngang và phương đứng, tối ưu tầm xa."
  },
  collision: {
    question: "Trong một vụ va chạm hoàn toàn đàn hồi (elastic collision), đại lượng vật lý nào sau đây được bảo toàn?",
    options: [
      "Chỉ bảo toàn động lượng của hệ",
      "Chỉ bảo toàn tổng động năng của hệ",
      "Bảo toàn cả tổng động lượng và tổng động năng của hệ"
    ],
    correctIdx: 2,
    tip: "💡 Va chạm đàn hồi lý tưởng không làm thất thoát năng lượng dưới dạng nhiệt năng hay âm thanh."
  },
  archimedes: {
    question: "Khi một khối gỗ nổi ổn định và cân bằng trên mặt nước, độ lớn của lực đẩy Archimedes lúc này bằng bao nhiêu?",
    options: [
      "Lớn hơn trọng lượng thực tế của khối gỗ",
      "Nhỏ hơn trọng lượng thực tế của khối gỗ",
      "Bằng đúng trọng lượng của khối gỗ (F_A = P)"
    ],
    correctIdx: 2,
    tip: "💡 Vì khối gỗ nằm cân bằng tĩnh, hợp lực tác dụng lên nó bằng 0, lực đẩy hướng lên triệt tiêu hoàn toàn trọng lực hướng xuống."
  },
  faraday: {
    question: "Theo định luật cảm ứng điện từ Faraday, dòng điện cảm ứng chỉ được sinh ra trong cuộn dây kín khi nào?",
    options: [
      "Thanh nam châm nằm yên hoàn toàn ngay sát cuộn cảm",
      "Có sự biến thiên từ thông qua diện tích cuộn dây (nam châm di chuyển)",
      "Cuộn dây làm bằng chất liệu phi kim cách điện"
    ],
    correctIdx: 1,
    tip: "💡 Từ thông biến thiên sinh ra suất điện động cảm ứng. Nam châm chuyển động càng nhanh dòng cảm ứng càng lớn."
  },
  rlc: {
    question: "Hiện tượng cộng hưởng điện xảy ra trong mạch điện xoay chiều nối tiếp RLC khi thỏa mãn điều kiện nào?",
    options: [
      "Cảm kháng của cuộn dây bằng dung kháng của tụ điện (Z_L = Z_C)",
      "Điện trở R lớn gấp đôi dung kháng Z_C",
      "Dòng điện xoay chiều có tần số bằng không"
    ],
    correctIdx: 0,
    tip: "💡 Z_L = Z_C làm triệt tiêu phần kháng trở, mạch đạt dòng điện cực đại và dao động đồng pha với điện áp nguồn."
  },
  shm: {
    question: "Trong dao động điều hòa của con lắc lò xo, khi vật nặng đi qua vị trí cân bằng (x = 0), đại lượng nào đạt giá trị cực đại?",
    options: [
      "Thế năng đàn hồi của lò xo",
      "Động năng và tốc độ của vật nặng",
      "Gia tốc kéo về của hệ"
    ],
    correctIdx: 1,
    tip: "💡 Tại vị trí cân bằng x = 0, toàn bộ thế năng biến đổi hoàn toàn thành động năng cực đại."
  },
  young: {
    question: "Khi ta tăng khoảng cách D từ hai khe hẹp đến màn quan sát, khoảng cách giữa các vân sáng liên tiếp (khoảng vân i) sẽ thay đổi như thế nào?",
    options: [
      "Khoảng vân i sẽ tăng lên (giãn rộng ra)",
      "Khoảng vân i sẽ giảm đi (khít sát lại)",
      "Khoảng vân i giữ nguyên không đổi"
    ],
    correctIdx: 0,
    tip: "💡 Khoảng vân i = lambda * D / a, do đó i tỉ lệ thuận với khoảng cách D."
  },
  decay: {
    question: "Sau khoảng thời gian bằng đúng 2 chu kỳ bán rã (2 * T), khối lượng chất phóng xạ còn lại bằng bao nhiêu phần trăm so với ban đầu?",
    options: [
      "50% khối lượng ban đầu",
      "25% khối lượng ban đầu",
      "12.5% khối lượng ban đầu"
    ],
    correctIdx: 1,
    tip: "💡 Sau 1 chu kỳ còn 1/2. Sau chu kỳ tiếp theo còn 1/2 của 1/2 là 1/4 (tương ứng với 25%)."
  }
};

export default function LabQuizChallenge({ labId }) {
  const navigate = useNavigate();
  const { addXp, unlockBadge, hearts, loseHeart, completeLesson } = useUser();
  const { playSuccess, playError } = useSoundEffects();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const labData = LAB_QUESTIONS[labId];
  if (!labData) return null;

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAns(idx);
  };

  const handleOpen = () => {
    if (hearts <= 0 && !isCompleted) {
      alert("Hết tim rồi! Cần ít nhất 1 tim để tham gia thử thách. Hãy nạp lại tim ở Bản đồ nhé! ❤️");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (selectedAns === null || isSubmitted) return;

    if (selectedAns === labData.correctIdx) {
      setIsSubmitted(true);
      playSuccess();
      setIsCompleted(true);
      addXp(50);
      unlockBadge('perfect_quiz');

      // Update actual lesson progress
      const lessonMapping = LAB_LESSON_MAP[labId];
      if (lessonMapping) {
        completeLesson(lessonMapping.id, lessonMapping.nextId);
      }

      // Trigger spectacular confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#38BDF8', '#34D399']
      });
    } else {
      playError();
      loseHeart();
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);

      // If user lost their last heart
      if (hearts <= 1) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          alert("Hết tim rồi! Hãy quay lại sau khi nạp thêm tim! ❤️");
        }, 1200);
      }
    }
  };

  const handleFinish = () => {
    setIsOpen(false);
    if (selectedAns === labData.correctIdx) {
      const lessonMapping = LAB_LESSON_MAP[labId];
      const lessonIdParam = lessonMapping ? lessonMapping.id : 'free_exploration';
      navigate(`/achievement/${lessonIdParam}?xp=50`);
    }
  };

  return (
    <>
      {/* Floating trigger button at top right */}
      <button
        onClick={handleOpen}
        className="absolute top-4 right-16 z-20 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-transform active:scale-95 animate-pulse"
      >
        <Award size={14} className="animate-bounce" />
        {isCompleted ? 'ĐÃ ĐẠT 50 XP ✓' : 'LÀM THỬ THÁCH (+50 XP)'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0F172A] border-2 border-amber-500/40 rounded-3xl p-6 relative text-white shadow-2xl flex flex-col gap-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle size={20} className="text-amber-400" />
                  <span className="font-extrabold text-xs text-slate-300 tracking-wider uppercase">Thử thách vật lý lý thuyết</span>
                </div>
                <div className="flex items-center gap-1 text-rose-500 text-xs font-black">
                  <Heart size={14} fill="currentColor" /> {hearts} tim
                </div>
              </div>

              {/* Question */}
              <div className="text-sm font-bold leading-relaxed text-slate-100 py-1">
                {labData.question}
              </div>

              {/* Option List */}
              <motion.div
                animate={shouldShake ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-2.5"
              >
                {labData.options.map((opt, idx) => {
                  let borderStyle = "border-white/5 bg-white/3 text-slate-300 hover:bg-white/5";
                  let badge = null;

                  if (isSubmitted) {
                    if (idx === labData.correctIdx) {
                      borderStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-400";
                      badge = <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">ĐÚNG</span>;
                    } else if (selectedAns === idx) {
                      borderStyle = "border-rose-500/60 bg-rose-500/10 text-rose-400";
                      badge = <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-extrabold">SAI</span>;
                    } else {
                      borderStyle = "border-white/5 bg-white/1 opacity-50 text-slate-500";
                    }
                  } else if (selectedAns === idx) {
                    borderStyle = "border-amber-500 bg-amber-500/10 text-amber-400 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => handleSelect(idx)}
                      className={`flex justify-between items-center text-left px-4 py-3 rounded-2xl border text-xs leading-normal transition-all ${borderStyle}`}
                    >
                      <span>{opt}</span>
                      {badge}
                    </button>
                  );
                })}
              </motion.div>

              {/* Success Tip / feedback explanation */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/5 rounded-2xl p-3 text-[10px] text-slate-300 leading-relaxed"
                >
                  <p>{labData.tip}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="mt-2 flex gap-3">
                {!isSubmitted ? (
                  <button
                    disabled={selectedAns === null}
                    onClick={handleSubmit}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
                  >
                    NỘP BÀI THỬ THÁCH
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className={`w-full py-3 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors ${selectedAns === labData.correctIdx ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                  >
                    {selectedAns === labData.correctIdx ? 'NHẬN QUÀ & ĂN MỪNG 🎉' : 'THỬ LẠI SAU'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
