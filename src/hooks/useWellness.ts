import { useState, useEffect, useCallback } from 'react';

export interface WellnessData {
  water: number;
  waterLocked: boolean;
  meals: number;
  mealsLocked: boolean;
  exercise: number;
  exerciseLocked: boolean;
  lastUpdated: string; // ISO date string for daily reset
}

const WELLNESS_STORAGE_KEY = 'dopa_daily_wellness';

const getDefaultWellness = (): WellnessData => ({
  water: 0,
  waterLocked: false,
  meals: 0,
  mealsLocked: false,
  exercise: 0,
  exerciseLocked: false,
  lastUpdated: new Date().toISOString().split('T')[0],
});

const getTodayDate = () => new Date().toISOString().split('T')[0];

export function useWellness(onPointsEarned?: (points: number) => void) {
  const [wellness, setWellness] = useState<WellnessData>(getDefaultWellness);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage and check for daily reset
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WELLNESS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WellnessData;
        const today = getTodayDate();
        
        // If it's a new day, reset all wellness data
        if (parsed.lastUpdated !== today) {
          const reset = getDefaultWellness();
          setWellness(reset);
          localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(reset));
        } else {
          setWellness(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load wellness data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever wellness changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellness));
    }
  }, [wellness, isLoaded]);

  const updateWellness = useCallback((updates: Partial<WellnessData>) => {
    setWellness(prev => ({
      ...prev,
      ...updates,
      lastUpdated: getTodayDate(),
    }));
  }, []);

  // Lock handlers that also award points
  const lockWater = useCallback((earnedPoints: number) => {
    updateWellness({ waterLocked: true });
    onPointsEarned?.(earnedPoints);
  }, [updateWellness, onPointsEarned]);

  const lockMeals = useCallback((earnedPoints: number) => {
    updateWellness({ mealsLocked: true });
    onPointsEarned?.(earnedPoints);
  }, [updateWellness, onPointsEarned]);

  const lockExercise = useCallback((earnedPoints: number) => {
    updateWellness({ exerciseLocked: true });
    onPointsEarned?.(earnedPoints);
  }, [updateWellness, onPointsEarned]);

  return {
    wellness,
    isLoaded,
    updateWellness,
    lockWater,
    lockMeals,
    lockExercise,
  };
}
