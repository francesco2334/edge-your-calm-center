import { useState, useEffect, useCallback } from 'react';

const TRIAL_STORAGE_KEY = 'dopa_trial_start';
const TRIAL_DAYS = 7;

interface TrialState {
  isActive: boolean;
  daysRemaining: number;
  startDate: string | null;
  hasAccepted: boolean;
}

export function useTrial() {
  const [trialState, setTrialState] = useState<TrialState>({
    isActive: false,
    daysRemaining: TRIAL_DAYS,
    startDate: null,
    hasAccepted: false,
  });

  // Load trial state from localStorage
  useEffect(() => {
    const storedStart = localStorage.getItem(TRIAL_STORAGE_KEY);
    
    if (storedStart) {
      const startDate = new Date(storedStart);
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);
      const isActive = daysRemaining > 0;

      setTrialState({
        isActive,
        daysRemaining,
        startDate: storedStart,
        hasAccepted: true,
      });
    }
  }, []);

  const startTrial = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(TRIAL_STORAGE_KEY, now);
    
    setTrialState({
      isActive: true,
      daysRemaining: TRIAL_DAYS,
      startDate: now,
      hasAccepted: true,
    });
  }, []);

  const cancelTrial = useCallback(() => {
    localStorage.removeItem(TRIAL_STORAGE_KEY);
    
    setTrialState({
      isActive: false,
      daysRemaining: 0,
      startDate: null,
      hasAccepted: false,
    });
  }, []);

  return {
    ...trialState,
    startTrial,
    cancelTrial,
  };
}
