import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import SimulationArea from '../components/SimulationArea';
import ControlPanel from '../components/ControlPanel';
import ExplanationCard from '../components/ExplanationCard';
import MiniQuiz from '../components/MiniQuiz';
import RewardModal from '../components/RewardModal';
import { useUser } from '../context/UserContext';
import useSoundEffects from '../hooks/useSoundEffects';

export default function SimulationScreen() {
  const navigate = useNavigate();
  const { addXp, completeLesson } = useUser();
  const { playPop, playSnap, playSuccess, playError, playLevelUp } = useSoundEffects();
  
  const [components, setComponents] = useState({
    battery: false,
    bulb: false,
    switch: false,
    wire: false
  });
  const [voltage, setVoltage] = useState(3.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showReward, setShowReward] = useState(false);

  const isCircuitComplete = components.battery && components.bulb && components.switch && components.wire;
  const isLightOn = isPlaying && isCircuitComplete;
  
  const partsPlaced = Object.values(components).filter(Boolean).length;
  const progress = Math.min(100, Math.floor((partsPlaced / 4) * 50) + (isLightOn ? 30 : 0) + (quizAnswer === 1 ? 20 : 0));

  const toggleComponent = (comp) => {
    if (!components[comp]) playSnap();
    else playPop();
    setComponents(prev => ({...prev, [comp]: !prev[comp]}));
    setIsPlaying(false);
  };

  const resetSimulation = () => {
    playPop();
    setComponents({ battery: false, bulb: false, switch: false, wire: false });
    setVoltage(3.0);
    setIsPlaying(false);
    setQuizAnswer(null);
  };

  const handlePlay = () => {
    if (!isPlaying && isCircuitComplete) {
      playSuccess();
    } else {
      playPop();
    }
    setIsPlaying(!isPlaying);
  };

  const handleQuizAnswer = (id) => {
    setQuizAnswer(id);
    if (id === 1) {
      playSuccess();
      setTimeout(() => {
        playLevelUp();
        setShowReward(true);
      }, 1500);
    } else {
      playError();
    }
  };

  const handleRewardClose = () => {
    addXp(50);
    completeLesson('lesson_2', 'lesson_3');
    setShowReward(false);
    navigate('/');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-center items-center min-h-screen bg-slate-800 lg:p-6"
    >
      <RewardModal isOpen={showReward} onClose={handleRewardClose} xpGained={50} />
      
      <div className="w-full max-w-5xl bg-slate-50 lg:rounded-3xl shadow-2xl relative flex flex-col h-screen lg:h-[90vh] overflow-hidden">
        
        <Header lives={3} progress={progress} onClose={handleClose} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <div className="lg:w-3/5 flex flex-col border-b-2 lg:border-b-0 lg:border-r-2 border-slate-200 bg-sky-50 shrink-0 lg:shrink h-[55vh] lg:h-auto overflow-hidden relative">
            <div className="px-6 py-4 bg-white shrink-0 border-b-2 border-slate-100 relative z-10">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mạch điện đơn giản</h1>
              <p className="text-slate-500 font-semibold text-sm mt-1">Hoàn thành thử thách để nhận điểm!</p>
            </div>

            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
              <SimulationArea 
                components={components} 
                toggleComponent={toggleComponent}
                isPlaying={isPlaying}
                isCircuitComplete={isCircuitComplete}
                isLightOn={isLightOn}
              />
            </div>
          </div>

          <div className="lg:w-2/5 flex flex-col bg-slate-50 overflow-y-auto custom-scrollbar flex-1 pb-8">
            <ControlPanel 
              voltage={voltage}
              setVoltage={setVoltage}
              isPlaying={isPlaying}
              handlePlay={handlePlay}
              resetSimulation={resetSimulation}
            />

            <ExplanationCard 
              isLightOn={isLightOn}
              isCircuitComplete={isCircuitComplete}
            />

            <MiniQuiz 
              quizAnswer={quizAnswer}
              setQuizAnswer={handleQuizAnswer}
            />
          </div>

        </div>
      </div>
    </motion.div>
  );
}
