import { useState, useEffect, useCallback } from 'react';

const TRIAL_DURATION_DAYS = 7;
const TRIAL_STORAGE_KEY = 'dopamine_trial';

interface TrialState {
  startedAt: string | null;
  isActive: boolean;
}

export function useTrial() {
  const [trialState, setTrialState] = useState<TrialState>({
    startedAt: null,
    isActive: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and refresh trial state from storage
  useEffect(() => {
    const loadTrialState = () => {
      const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const startedAt = parsed.startedAt;
          const isActive = checkTrialActive(startedAt);
          setTrialState({ startedAt, isActive });
        } catch {
          setTrialState({ startedAt: null, isActive: false });
        }
      }
      setIsLoaded(true);
    };

    loadTrialState();

    // Re-check when app returns to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadTrialState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Check if trial is still active
  const checkTrialActive = (startedAt: string | null): boolean => {
    if (!startedAt) return false;
    
    const startDate = new Date(startedAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysPassed < TRIAL_DURATION_DAYS;
  };

  // Calculate days remaining
  const getDaysRemaining = (): number => {
    if (!trialState.startedAt) return 0;
    
    const startDate = new Date(trialState.startedAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, TRIAL_DURATION_DAYS - daysPassed);
  };

  // Start the trial
  const startTrial = useCallback(() => {
    const startedAt = new Date().toISOString();
    const newState = { startedAt, isActive: true };
    
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(newState));
    setTrialState(newState);
    
    return true;
  }, []);

  // Check if trial has been started (even if expired)
  const hasTrialStarted = trialState.startedAt !== null;
  
  // Check if trial is expired
  const isTrialExpired = hasTrialStarted && !trialState.isActive;

  return {
    isLoaded,
    hasTrialStarted,
    isTrialActive: trialState.isActive,
    isTrialExpired,
    trialStartedAt: trialState.startedAt,
    daysRemaining: getDaysRemaining(),
    startTrial,
  };
}
