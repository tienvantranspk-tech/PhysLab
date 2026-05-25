import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [xp, setXp] = useState(450);
  const [streak, setStreak] = useState(12);
  const [unlockedLessons, setUnlockedLessons] = useState(['lesson_1', 'lesson_2', 'lesson_3']);
  const [completedLessons, setCompletedLessons] = useState(['lesson_1', 'lesson_2']);

  const addXp = (amount) => setXp(prev => prev + amount);
  
  const completeLesson = (lessonId, nextLessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
    if (nextLessonId && !unlockedLessons.includes(nextLessonId)) {
      setUnlockedLessons([...unlockedLessons, nextLessonId]);
    }
  };

  return (
    <UserContext.Provider value={{ xp, streak, unlockedLessons, completedLessons, addXp, completeLesson }}>
      {children}
    </UserContext.Provider>
  );
};
