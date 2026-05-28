import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Default state to prevent crashes if context is accessed outside the provider (e.g. HMR or service worker sync delay)
const defaultState = {
  xp: 0,
  streak: 0,
  hearts: 5,
  gems: 0,
  grade: 7,
  level: 1,
  nextLevelXp: 100,
  currentLevelXp: 0,
  levelProgress: 0,
  unlockedLessons: ['elec_01', 'mech_01', 'thermo_01', 'emag_01', 'optic_01', 'wave_01', 'modern_01'],
  completedLessons: [],
  unlockedBadges: [],
  username: 'Học Sinh',
  avatarEmoji: '🧑‍🔬',
  soundEnabled: true,
  hapticEnabled: true,
  setSoundEnabled: () => {},
  setHapticEnabled: () => {},
  setGrade: () => {},
  addXp: () => {},
  completeLesson: () => {},
  loseHeart: () => {},
  addGems: () => {},
  spendGems: () => {},
  unlockBadge: () => {},
  resetProgress: () => {},
};

const UserContext = createContext(defaultState);

export const useUser = () => useContext(UserContext);

// Level formula: Level = floor(sqrt(totalXP / 100))
const calcLevel = (xp) => Math.max(1, Math.floor(Math.sqrt(xp / 100)));

// XP needed for next level
const xpForLevel = (level) => Math.pow(level, 2) * 100;

// Load from localStorage
const loadState = (key, fallback) => {
  try {
    const stored = localStorage.getItem(`physlab_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Save to localStorage
const saveState = (key, value) => {
  try {
    localStorage.setItem(`physlab_${key}`, JSON.stringify(value));
  } catch {}
};

export const UserProvider = ({ children }) => {
  // Core stats
  const [xp, setXp] = useState(() => loadState('xp', 450));
  const [streak, setStreak] = useState(() => loadState('streak', 12));
  const [hearts, setHearts] = useState(() => loadState('hearts', 5));
  const [gems, setGems] = useState(() => loadState('gems', 120));
  const [grade, setGrade] = useState(() => loadState('grade', 7));

  // Progress
  const [unlockedLessons, setUnlockedLessons] = useState(
    () => loadState('unlockedLessons', ['elec_01', 'elec_02', 'elec_03', 'mech_01', 'thermo_01', 'emag_01', 'optic_01', 'wave_01', 'modern_01'])
  );
  const [completedLessons, setCompletedLessons] = useState(
    () => loadState('completedLessons', ['elec_01', 'elec_02'])
  );
  const [unlockedBadges, setUnlockedBadges] = useState(
    () => loadState('unlockedBadges', ['first_lesson'])
  );

  // Profile
  const [username, setUsername] = useState(() => loadState('username', 'Học Sinh'));
  const [avatarEmoji, setAvatarEmoji] = useState(() => loadState('avatarEmoji', '🧑‍🔬'));

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(() => loadState('soundEnabled', true));
  const [hapticEnabled, setHapticEnabled] = useState(() => loadState('hapticEnabled', true));

  // Computed values
  const level = calcLevel(xp);
  const nextLevelXp = xpForLevel(level + 1);
  const currentLevelXp = xpForLevel(level);
  const levelProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Persist all state changes
  useEffect(() => { saveState('xp', xp); }, [xp]);
  useEffect(() => { saveState('streak', streak); }, [streak]);
  useEffect(() => { saveState('hearts', hearts); }, [hearts]);
  useEffect(() => { saveState('gems', gems); }, [gems]);
  useEffect(() => { saveState('grade', grade); }, [grade]);
  useEffect(() => { saveState('unlockedLessons', unlockedLessons); }, [unlockedLessons]);
  useEffect(() => { saveState('completedLessons', completedLessons); }, [completedLessons]);
  useEffect(() => { saveState('unlockedBadges', unlockedBadges); }, [unlockedBadges]);
  useEffect(() => { saveState('username', username); }, [username]);
  useEffect(() => { saveState('avatarEmoji', avatarEmoji); }, [avatarEmoji]);
  useEffect(() => { saveState('soundEnabled', soundEnabled); }, [soundEnabled]);
  useEffect(() => { saveState('hapticEnabled', hapticEnabled); }, [hapticEnabled]);

  // Actions
  const addXp = useCallback((amount) => {
    setXp(prev => prev + amount);
  }, []);

  const completeLesson = useCallback((lessonId, nextLessonId) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });
    if (nextLessonId) {
      setUnlockedLessons(prev => {
        if (prev.includes(nextLessonId)) return prev;
        return [...prev, nextLessonId];
      });
    }
  }, []);

  const loseHeart = useCallback(() => {
    setHearts(prev => Math.max(0, prev - 1));
  }, []);

  const addGems = useCallback((amount) => {
    setGems(prev => prev + amount);
  }, []);

  const spendGems = useCallback((amount) => {
    setGems(prev => Math.max(0, prev - amount));
  }, []);

  const unlockBadge = useCallback((badgeId) => {
    setUnlockedBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      return [...prev, badgeId];
    });
  }, []);

  const resetProgress = useCallback(() => {
    setXp(0);
    setStreak(0);
    setHearts(5);
    setGems(0);
    setCompletedLessons([]);
    setUnlockedLessons(['elec_01', 'mech_01', 'thermo_01', 'emag_01', 'optic_01', 'wave_01', 'modern_01']);
    setUnlockedBadges([]);
  }, []);

  const value = {
    // Stats
    xp, streak, hearts, gems, grade, level, nextLevelXp, currentLevelXp, levelProgress,
    // Progress
    unlockedLessons, completedLessons, unlockedBadges,
    // Profile
    username, avatarEmoji, setUsername, setAvatarEmoji,
    // Settings
    soundEnabled, hapticEnabled, setSoundEnabled, setHapticEnabled, setGrade,
    // Actions
    addXp, completeLesson, loseHeart, addGems, spendGems, unlockBadge, resetProgress,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
