import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'dopa_onboarding_completed';
const AUTH_GATE_KEY = 'dopa_auth_gate_seen';

interface OnboardingState {
  onboardingCompleted: boolean;
  authGateSeen: boolean;
  isLoaded: boolean;
}

export function useOnboarding(userId?: string | null) {
  const [state, setState] = useState<OnboardingState>({
    onboardingCompleted: false,
    authGateSeen: false,
    isLoaded: false,
  });

  // Load onboarding state
  useEffect(() => {
    async function loadState() {
      let onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';
      let authGateSeen = localStorage.getItem(AUTH_GATE_KEY) === 'true';

      // If user is signed in, also check database
      if (userId) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('trial_start')
          .eq('user_id', userId)
          .single();

        // If they have trial_start in DB, they've completed onboarding
        if (progress?.trial_start) {
          onboardingCompleted = true;
          authGateSeen = true;
          // Sync to localStorage
          localStorage.setItem(ONBOARDING_KEY, 'true');
          localStorage.setItem(AUTH_GATE_KEY, 'true');
        }
      }

      setState({
        onboardingCompleted,
        authGateSeen,
        isLoaded: true,
      });
    }

    loadState();
  }, [userId]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setState(prev => ({ ...prev, onboardingCompleted: true }));
  }, []);

  const completeAuthGate = useCallback(() => {
    localStorage.setItem(AUTH_GATE_KEY, 'true');
    setState(prev => ({ ...prev, authGateSeen: true }));
  }, []);

  const resetOnboarding = useCallback(async () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(AUTH_GATE_KEY);
    
    if (userId) {
      await supabase
        .from('user_progress')
        .update({ trial_start: null })
        .eq('user_id', userId);
    }

    setState({
      onboardingCompleted: false,
      authGateSeen: false,
      isLoaded: true,
    });
  }, [userId]);

  return {
    ...state,
    completeOnboarding,
    completeAuthGate,
    resetOnboarding,
  };
}
