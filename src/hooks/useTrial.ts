import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TRIAL_STORAGE_KEY = 'dopa_trial_start';
const TRIAL_DAYS = 7;

interface TrialState {
  isActive: boolean;
  daysRemaining: number;
  startDate: string | null;
  hasAccepted: boolean;
}

export function useTrial(userId?: string | null) {
  const [trialState, setTrialState] = useState<TrialState>({
    isActive: false,
    daysRemaining: TRIAL_DAYS,
    startDate: null,
    hasAccepted: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate trial state from start date
  const calculateTrialState = useCallback((storedStart: string | null): TrialState => {
    if (!storedStart) {
      return {
        isActive: false,
        daysRemaining: TRIAL_DAYS,
        startDate: null,
        hasAccepted: false,
      };
    }

    const startDate = new Date(storedStart);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);
    const isActive = daysRemaining > 0;

    return {
      isActive,
      daysRemaining,
      startDate: storedStart,
      hasAccepted: true,
    };
  }, []);

  // Load trial state
  useEffect(() => {
    async function loadTrialState() {
      let storedStart: string | null = null;

      if (userId) {
        // Try to load from database
        const { data: progress } = await supabase
          .from('user_progress')
          .select('trial_start')
          .eq('user_id', userId)
          .single();

        if (progress?.trial_start) {
          storedStart = progress.trial_start;
        }
      }

      // Fallback to localStorage
      if (!storedStart) {
        storedStart = localStorage.getItem(TRIAL_STORAGE_KEY);
      }

      setTrialState(calculateTrialState(storedStart));
      setIsLoaded(true);
    }

    loadTrialState();
  }, [userId, calculateTrialState]);

  const startTrial = useCallback(async () => {
    const now = new Date().toISOString();
    localStorage.setItem(TRIAL_STORAGE_KEY, now);

    if (userId) {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          trial_start: now,
        }, { onConflict: 'user_id' });
    }
    
    setTrialState({
      isActive: true,
      daysRemaining: TRIAL_DAYS,
      startDate: now,
      hasAccepted: true,
    });
  }, [userId]);

  const cancelTrial = useCallback(async () => {
    localStorage.removeItem(TRIAL_STORAGE_KEY);

    if (userId) {
      await supabase
        .from('user_progress')
        .update({ trial_start: null })
        .eq('user_id', userId);
    }
    
    setTrialState({
      isActive: false,
      daysRemaining: 0,
      startDate: null,
      hasAccepted: false,
    });
  }, [userId]);

  return {
    ...trialState,
    isLoaded,
    startTrial,
    cancelTrial,
  };
}
