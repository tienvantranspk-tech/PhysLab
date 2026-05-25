import React from 'react';

export default function MiniQuiz({ quizAnswer, setQuizAnswer }) {
  const options = [
    { id: 0, text: '💡 Đèn sẽ sáng mạnh hơn', emoji: '✨' },
    { id: 1, text: '🔌 Đèn tắt vì mạch bị hở', emoji: '✅' },
    { id: 2, text: '⚡ Dòng điện chạy nhanh hơn', emoji: '🚀' }
  ];

  return (
    <div className="px-6 mt-2 mb-8">
      <h3 className="font-extrabold text-slate-800 text-xl mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span> Thử thách nhanh
      </h3>
      <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-100">
        <p className="font-bold text-slate-700 mb-5 text-base leading-relaxed">
          Điều gì sẽ xảy ra khi bạn <span className="text-danger">Mở công tắc</span> (ngắt mạch)?
        </p>
        <div className="flex flex-col gap-3">
          {options.map((opt) => {
            const isCorrect = opt.id === 1;
            const isSelected = quizAnswer === opt.id;
            
            let btnClass = "chunky-btn w-full border-2 border-slate-200 bg-white text-slate-600 font-bold p-4 rounded-2xl text-left border-b-4 hover:bg-slate-50 flex items-center justify-between";
            if (isSelected) {
              if (isCorrect) {
                btnClass = "chunky-btn w-full border-2 border-success bg-green-50 text-success font-extrabold p-4 rounded-2xl text-left border-b-4 flex items-center justify-between transition-colors";
              } else {
                btnClass = "chunky-btn w-full border-2 border-danger bg-red-50 text-danger font-extrabold p-4 rounded-2xl text-left border-b-4 flex items-center justify-between animate-shake";
              }
            }

            return (
              <button 
                key={opt.id} 
                onClick={() => setQuizAnswer(opt.id)}
                className={btnClass}
              >
                <span>{opt.text}</span>
                {isSelected && isCorrect && <span className="text-xl">👏</span>}
                {isSelected && !isCorrect && <span className="text-xl">❌</span>}
              </button>
            )
          })}
        </div>
        
        {/* Feedback message */}
        {quizAnswer !== null && (
          <div className={`mt-4 p-3 rounded-xl font-bold text-sm text-center ${quizAnswer === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {quizAnswer === 1 
              ? 'Chính xác! Khi công tắc mở, dòng điện không thể chạy qua.' 
              : 'Chưa đúng rồi! Dòng điện cần một vòng khép kín để chạy cơ.'}
          </div>
        )}
      </div>
    </div>
  );
}
