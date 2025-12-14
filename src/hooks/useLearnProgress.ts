import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'learn_progress';
const CARDS_PER_TOKEN = 5;

interface LearnProgress {
  cardsReadToday: number;
  lastReadDate: string;
  streak: number;
  dailyGoal: number;
  totalCardsRead: number;
  cardsTowardsNextToken: number;
  tokensEarned: number;
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
        cardsTowardsNextToken: parsed.cardsTowardsNextToken || 0,
        tokensEarned: parsed.tokensEarned || 0,
      };
    }
    return {
      ...parsed,
      cardsTowardsNextToken: parsed.cardsTowardsNextToken || 0,
      tokensEarned: parsed.tokensEarned || 0,
    };
  }
  
  return {
    cardsReadToday: 0,
    lastReadDate: new Date().toDateString(),
    streak: 0,
    dailyGoal: 5,
    totalCardsRead: 0,
    cardsTowardsNextToken: 0,
    tokensEarned: 0,
  };
};

export function useLearnProgress() {
  const [progress, setProgress] = useState<LearnProgress>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const recordCardRead = useCallback((): { earnedToken: boolean } => {
    let earnedToken = false;
    
    setProgress(prev => {
      const today = new Date().toDateString();
      const newCardsReadToday = prev.cardsReadToday + 1;
      const hitGoalNow = newCardsReadToday === prev.dailyGoal && prev.cardsReadToday < prev.dailyGoal;
      
      // Track progress towards next token
      const newCardsTowardsToken = prev.cardsTowardsNextToken + 1;
      
      // Check if earned a token
      if (newCardsTowardsToken >= CARDS_PER_TOKEN) {
        earnedToken = true;
        toast.success('🪙 +1 Token allowed', {
          description: `${CARDS_PER_TOKEN} cards read — permission granted`,
        });
        
        return {
          ...prev,
          cardsReadToday: newCardsReadToday,
          lastReadDate: today,
          streak: hitGoalNow ? prev.streak + 1 : prev.streak,
          totalCardsRead: prev.totalCardsRead + 1,
          cardsTowardsNextToken: 0,
          tokensEarned: prev.tokensEarned + 1,
        };
      }
      
      return {
        ...prev,
        cardsReadToday: newCardsReadToday,
        lastReadDate: today,
        streak: hitGoalNow ? prev.streak + 1 : prev.streak,
        totalCardsRead: prev.totalCardsRead + 1,
        cardsTowardsNextToken: newCardsTowardsToken,
      };
    });
    
    return { earnedToken };
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    setProgress(prev => ({ ...prev, dailyGoal: goal }));
  }, []);

  const goalProgress = Math.min(progress.cardsReadToday / progress.dailyGoal, 1);
  const goalMet = progress.cardsReadToday >= progress.dailyGoal;
  const tokenProgress = progress.cardsTowardsNextToken / CARDS_PER_TOKEN;

  return {
    ...progress,
    goalProgress,
    goalMet,
    tokenProgress,
    cardsPerToken: CARDS_PER_TOKEN,
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
