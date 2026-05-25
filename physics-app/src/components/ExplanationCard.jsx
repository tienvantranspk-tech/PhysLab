import React from 'react';
import { motion } from 'framer-motion';

export default function ExplanationCard({ isLightOn, isCircuitComplete }) {
  return (
    <div className="px-6 py-5">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white border-2 border-slate-100 p-4 rounded-3xl shadow-sm flex gap-4 items-start relative"
      >
        {/* Tail of the speech bubble */}
        <div className="absolute top-8 left-16 w-4 h-4 bg-slate-50 border-l-2 border-t-2 border-slate-200 transform -translate-y-1/2 rotate-[-45deg] z-10"></div>
        
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-14 h-14 bg-sky-100 rounded-2xl flex flex-shrink-0 items-center justify-center text-3xl shadow-inner border border-sky-200 z-20 relative"
        >
          🦉
        </motion.div>
        
        <div className="flex-1 z-20">
          <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl rounded-tl-sm text-slate-600 font-semibold text-sm leading-relaxed">
            {isLightOn 
              ? <span className="text-green-600">Tuyệt vời! 🎉 Bạn đã đóng công tắc tạo thành một mạch kín, dòng điện có thể chạy qua làm bóng đèn phát sáng!</span>
              : !isCircuitComplete 
                ? "Chào bạn! Hãy chạm vào các vị trí đứt nét trên bảng để lắp đầy đủ Pin, Bóng đèn, Công tắc và Dây dẫn nhé!" 
                : <span className="text-action">Mạch đã đủ linh kiện rồi. Hãy thử ấn 'Đóng mạch' để xem điều gì xảy ra!</span>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
