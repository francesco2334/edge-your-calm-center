import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'learn_progress';

interface LearnProgress {
  cardsReadToday: number;
  lastReadDate: string;
  streak: number;
  dailyGoal: number;
  totalCardsRead: number;
}

const getInitialProgress = (): LearnProgress => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Reset daily count if it's a new day
    if (parsed.lastReadDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = parsed.lastReadDate === yesterday.toDateString();
      
      return {
        ...parsed,
        cardsReadToday: 0,
        lastReadDate: today,
        streak: wasYesterday ? parsed.streak : 0,
      };
    }
    return parsed;
  }
  
  return {
    cardsReadToday: 0,
    lastReadDate: new Date().toDateString(),
    streak: 0,
    dailyGoal: 5,
    totalCardsRead: 0,
  };
};

export function useLearnProgress() {
  const [progress, setProgress] = useState<LearnProgress>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const recordCardRead = useCallback(() => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const newCardsReadToday = prev.cardsReadToday + 1;
      const hitGoalNow = newCardsReadToday === prev.dailyGoal && prev.cardsReadToday < prev.dailyGoal;
      
      return {
        ...prev,
        cardsReadToday: newCardsReadToday,
        lastReadDate: today,
        streak: hitGoalNow ? prev.streak + 1 : prev.streak,
        totalCardsRead: prev.totalCardsRead + 1,
      };
    });
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    setProgress(prev => ({ ...prev, dailyGoal: goal }));
  }, []);

  const goalProgress = Math.min(progress.cardsReadToday / progress.dailyGoal, 1);
  const goalMet = progress.cardsReadToday >= progress.dailyGoal;

  return {
    ...progress,
    goalProgress,
    goalMet,
    recordCardRead,
    setDailyGoal,
  };
}

// Utility to calculate reading time
export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}
