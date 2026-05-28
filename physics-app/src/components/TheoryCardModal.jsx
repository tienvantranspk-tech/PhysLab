import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, X, Award, HelpCircle } from 'lucide-react';

const THEORY_DATABASE = {
  wave: [
    {
      title: "🌊 Sóng âm là gì?",
      content: "Sóng âm thanh là một dạng **sóng cơ học** lan truyền nhờ sự dao động tuần hoàn của các phần tử môi trường vật chất xung quanh (rắn, lỏng, khí).",
      illustration: "🔊",
      highlight: "Sóng âm KHÔNG THỂ truyền qua chân không vì ở đó không có phần tử vật chất để truyền dao động!"
    },
    {
      title: "🎵 Tần số & Biên độ",
      content: "Hai đại lượng quyết định trực tiếp đến cảm giác âm thanh của tai chúng ta:\n\n• **Tần số (Hz):** Quyết định **Độ cao** (Tần số càng cao âm nghe càng bổng/réo rắt, thấp nghe càng trầm).\n• **Biên độ (A):** Quyết định **Độ to** (Biên độ càng lớn âm nghe càng mạnh và to).",
      illustration: "📈",
      highlight: "Tai người bình thường chỉ nghe được âm thanh trong khoảng tần số từ 20 Hz đến 20,000 Hz."
    },
    {
      title: "🚀 Môi trường truyền âm",
      content: "Tốc độ truyền âm phụ thuộc chặt chẽ vào mật độ phân tử của môi trường:\n\n• **Rắn (Thép):** Truyền nhanh nhất (~5,120 m/s).\n• **Lỏng (Nước):** Truyền trung bình (~1,480 m/s).\n• **Khí (Không khí):** Truyền chậm nhất (~343 m/s).",
      illustration: "💨",
      highlight: "Nhiệm vụ Lab: Hãy thay đổi tần số, biên độ và chọn các môi trường khác nhau để quan sát bước sóng thay đổi!"
    }
  ],
  thermo: [
    {
      title: "🌡️ Nhiệt độ là gì?",
      content: "Nhiệt độ là số đo mức độ nóng hay lạnh của một vật. Trong đời sống hàng ngày, chúng ta đo bằng thang **Celsius (°C)**, đặt theo tên nhà thiên văn học Anders Celsius.",
      illustration: "❄️",
      highlight: "Ở áp suất tiêu chuẩn, nước tinh khiết đóng băng ở đúng 0°C và sôi sùng sục ở đúng 100°C."
    },
    {
      title: "☕ Nguyên lý truyền nhiệt",
      content: "Nhiệt lượng luôn luôn tự động truyền từ **vật có nhiệt độ cao hơn** (nóng hơn) sang **vật có nhiệt độ thấp hơn** (lạnh hơn) khi chúng tiếp xúc với nhau.",
      illustration: "🔥",
      highlight: "Sự truyền nhiệt tự phát này sẽ dừng lại khi hai vật đạt trạng thái Cân bằng nhiệt (cùng nhiệt độ)."
    },
    {
      title: "⚖️ Định luật Cân bằng nhiệt",
      content: "Trong một hệ cô lập chỉ có hai vật trao đổi nhiệt:\n\n**Nhiệt lượng tỏa ra = Nhiệt lượng thu vào**\n$$\\mathbf{Q_{tỏa} = Q_{thu}}$$\n\nCông thức tính nhiệt lượng: $Q = m \\cdot c \\cdot \\Delta t$",
      illustration: "🧪",
      highlight: "Nhiệm vụ Lab: Hãy thử nghiệm đo nhiệt độ môi trường và trộn nước nóng/lạnh để quan sát nhiệt độ cân bằng thực tế!"
    }
  ],
  freefall: [
    {
      title: "🍎 Sự rơi tự do",
      content: "Sự rơi tự do là sự rơi của các vật chỉ dưới tác dụng của **trọng lực** (bỏ qua mọi lực cản của không khí và gió).",
      illustration: "🌍",
      highlight: "Trong chân không, một sợi lông chim và một quả tạ sắt sẽ rơi nhanh như nhau và chạm đất cùng lúc!"
    },
    {
      title: "📐 Gia tốc trọng trường g",
      content: "Mọi vật rơi tự do đều chuyển động **nhanh dần đều** với cùng một gia tốc gọi là gia tốc trọng trường $g \\approx 9.8\\text{ m/s}^2$ (hoặc làm tròn thành $10\\text{ m/s}^2$).",
      illustration: "📏",
      highlight: "Cứ sau mỗi giây rơi, vận tốc của vật lại tăng thêm một lượng đều đặn khoảng 9.8 m/s."
    },
    {
      title: "📊 Công thức rơi tự do",
      content: "Các công thức cốt lõi cần ghi nhớ:\n\n• Vận tốc rơi: $v = g \\cdot t$\n• Quãng đường rơi: $s = \\frac{1}{2} g \\cdot t^2$\n• Thời gian rơi: $t = \\sqrt{\\frac{2h}{g}}$",
      illustration: "⏱️",
      highlight: "Nhiệm vụ Lab: Thả rơi các vật ở các độ cao khác nhau và đo thời gian rơi để kiểm chứng công thức!"
    }
  ],
  pendulum: [
    {
      title: "🕰️ Con lắc đơn là gì?",
      content: "Con lắc đơn gồm một vật nhỏ khối lượng $m$ treo vào đầu một sợi dây nhẹ không giãn có chiều dài $l$, đầu kia của dây được giữ cố định.",
      illustration: "⚖️",
      highlight: "Khi kéo nhẹ con lắc lệch khỏi vị trí cân bằng rồi thả ra, nó sẽ dao động qua lại quanh vị trí đó."
    },
    {
      title: "⏱️ Chu kỳ dao động T",
      content: "Chu kỳ $T$ là khoảng thời gian con lắc thực hiện hết một dao động toàn phần:\n\n$$\\mathbf{T = 2\\pi \\sqrt{\\frac{l}{g}}}$$",
      illustration: "⏳",
      highlight: "Chu kỳ T chỉ phụ thuộc chiều dài l và gia tốc g, hoàn toàn KHÔNG phụ thuộc vào khối lượng m của vật nặng!"
    },
    {
      title: "🚀 Ứng dụng & Thực nghiệm",
      content: "Nhờ tính chu kỳ cực kỳ ổn định, con lắc đơn từng được sử dụng phổ biến trong chế tạo đồng hồ quả lắc cổ điển hoặc dùng để đo gia tốc trọng trường $g$ thực tế.",
      illustration: "⏰",
      highlight: "Nhiệm vụ Lab: Hãy thay đổi chiều dài dây l và khối lượng m để kiểm tra xem chu kỳ T biến đổi thế nào!"
    }
  ]
};

// Fallback data for other labs to ensure no crashes
const DEFAULT_THEORY = [
  {
    title: "🔬 Chào mừng đến với phòng Lab Vật lý!",
    content: "Phòng thí nghiệm ảo giúp em tương tác trực tiếp với các hiện tượng tự nhiên bằng các công cụ đo đạc chuẩn xác.",
    illustration: "🧑‍🔬",
    highlight: "Em hãy điều chỉnh các thanh trượt điều khiển và bấm nút Bắt đầu để quan sát mô phỏng chạy nhé!"
  },
  {
    title: "⚡ Phương pháp thực nghiệm",
    content: "1. Thay đổi thông số đầu vào (khối lượng, chiều dài, điện áp...).\n2. Ghi chép kết quả hiển thị trên đồ thị/đồng hồ đo.\n3. Rút ra định luật vật lý.",
    illustration: "📊",
    highlight: "Vật lý là môn khoa học thực nghiệm — khám phá luôn đi đôi với hành động thực hành trực quan!"
  },
  {
    title: "🏆 Thử thách trắc nghiệm",
    content: "Sau khi hoàn thành thực hành mô phỏng, em hãy nhấp vào nút nổi màu vàng ở góc trên để tham gia **Thử thách Quiz chuỗi 3 câu** nhận ngay **+50 XP** cực đỉnh!",
    illustration: "⭐",
    highlight: "Hãy trả lời đúng cả 3 câu hỏi khái niệm liên tiếp để chứng minh mình là Bậc thầy Vật lý!"
  }
];

export default function TheoryCardModal({ labId, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const theoryCards = THEORY_DATABASE[labId] || DEFAULT_THEORY;

  const handleNext = () => {
    if (currentStep < theoryCards.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const activeCard = theoryCards[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-[#0F172A] border-2 border-cyan-500/40 rounded-3xl p-6 relative text-white shadow-2xl shadow-cyan-500/10 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-cyan-400 animate-pulse" />
            <span className="font-extrabold text-xs text-slate-300 tracking-wider uppercase">
              Tóm tắt lý thuyết ({currentStep + 1}/{theoryCards.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border border-white/5"
          >
            Bỏ qua ✕
          </button>
        </div>

        {/* Carousel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 py-2"
          >
            {/* Illustration Emoji */}
            <div className="text-6xl text-center py-2 animate-bounce">{activeCard.illustration}</div>

            {/* Title */}
            <h3 className="text-lg font-black text-cyan-300 text-center">{activeCard.title}</h3>

            {/* Main Content */}
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line text-justify px-2">
              {activeCard.content}
            </p>

            {/* Highlight Box */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-[10px] text-cyan-300 leading-relaxed font-semibold italic">
              {activeCard.highlight}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 py-1">
          {theoryCards.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex gap-3 mt-2">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold rounded-2xl text-xs border border-white/10 transition-colors"
            >
              QUAY LẠI
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
          >
            <span>
              {currentStep === theoryCards.length - 1 ? 'BẮT ĐẦU THỰC NGHIỆM 🚀' : 'TIẾP TỤC'}
            </span>
            {currentStep < theoryCards.length - 1 && <ArrowRight size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
