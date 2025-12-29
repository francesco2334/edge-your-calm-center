import { useState, useEffect, useCallback, useRef } from 'react';

export type MojoMood = 'calm' | 'playful' | 'tired' | 'focused' | 'overwhelmed' | 'low-energy' | 'content';
export type MojoEmote = 'wave' | 'dance' | 'spin' | 'blush' | 'sleepy' | 'excited' | 'dizzy' | 'love' | 'giggle' | 'yawn' | null;

interface MojoMoodState {
  mood: MojoMood;
  emote: MojoEmote;
  isAnimating: boolean;
  lastInteraction: number;
  idleCounter: number;
}

const MOOD_STORAGE_KEY = 'mojo-mood-state';
const IDLE_TRIGGER_MS = 8000; // 8 seconds before idle animation
const MOOD_TRANSITION_DELAY = 3000; // 3 seconds after emote to affect mood

// Map emotes to mood effects
const emoteMoodEffects: Record<NonNullable<MojoEmote>, { mood: MojoMood; duration: number }> = {
  wave: { mood: 'playful', duration: 60000 },
  dance: { mood: 'playful', duration: 90000 },
  spin: { mood: 'playful', duration: 45000 },
  blush: { mood: 'content', duration: 60000 },
  sleepy: { mood: 'tired', duration: 120000 },
  excited: { mood: 'playful', duration: 90000 },
  dizzy: { mood: 'overwhelmed', duration: 30000 },
  love: { mood: 'content', duration: 90000 },
  giggle: { mood: 'playful', duration: 60000 },
  yawn: { mood: 'tired', duration: 90000 },
};

// Animation durations with 3-phase structure (anticipation + main + recovery)
export const emoteAnimationDurations: Record<NonNullable<MojoEmote>, number> = {
  wave: 1900,      // 0.3s anticipation + 1.2s wave + 0.4s settle
  dance: 2400,     // 0.3s prep + 1.7s dance + 0.4s settle  
  spin: 1800,      // 0.3s wind up + 1.1s spin + 0.4s settle
  blush: 1600,     // 0.3s build + 0.9s blush + 0.4s fade
  sleepy: 2800,    // 0.4s drift + 2.0s sleep state + 0.4s settle
  excited: 2000,   // 0.3s build + 1.3s bounce + 0.4s settle
  dizzy: 3200,     // 0.3s start + 2.5s wobble + 0.4s recover
  love: 2200,      // 0.3s swell + 1.5s hearts + 0.4s settle
  giggle: 1800,    // 0.3s inhale + 1.1s giggle + 0.4s settle
  yawn: 2600,      // 0.4s open + 1.8s yawn + 0.4s close
};

const idleAnimations: MojoEmote[] = ['wave', 'blush', 'giggle'];

export function useMojoMood() {
  const [state, setState] = useState<MojoMoodState>(() => {
    try {
      const saved = localStorage.getItem(MOOD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if mood has expired (reset after 4 hours)
        if (Date.now() - parsed.lastInteraction < 4 * 60 * 60 * 1000) {
          return {
            ...parsed,
            emote: null,
            isAnimating: false,
            idleCounter: 0,
          };
        }
      }
    } catch {}
    return {
      mood: 'calm',
      emote: null,
      isAnimating: false,
      lastInteraction: Date.now(),
      idleCounter: 0,
    };
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moodTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persist mood state
  useEffect(() => {
    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify({
      mood: state.mood,
      lastInteraction: state.lastInteraction,
    }));
  }, [state.mood, state.lastInteraction]);

  // Idle animation trigger
  useEffect(() => {
    if (state.isAnimating) return;

    idleIntervalRef.current = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - state.lastInteraction;
      
      if (timeSinceLastInteraction > IDLE_TRIGGER_MS && !state.isAnimating && Math.random() > 0.6) {
        // Trigger a random idle animation
        const randomIdle = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
        triggerEmote(randomIdle, true);
      }
    }, IDLE_TRIGGER_MS);

    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, [state.lastInteraction, state.isAnimating]);

  // Trigger an emote with animation lock
  const triggerEmote = useCallback((emote: MojoEmote, isIdle = false) => {
    // If already animating, ignore the request
    if (state.isAnimating || !emote) return false;

    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (moodTimeoutRef.current) {
      clearTimeout(moodTimeoutRef.current);
    }

    const duration = emoteAnimationDurations[emote];

    // Start animation
    setState(prev => ({
      ...prev,
      emote,
      isAnimating: true,
      lastInteraction: isIdle ? prev.lastInteraction : Date.now(),
    }));

    // Schedule animation end - MUST complete fully
    animationTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        emote: null,
        isAnimating: false,
      }));
    }, duration);

    // Schedule mood change after animation if not idle
    if (!isIdle) {
      moodTimeoutRef.current = setTimeout(() => {
        const moodEffect = emoteMoodEffects[emote];
        setState(prev => ({
          ...prev,
          mood: moodEffect.mood,
        }));

        // Reset mood after duration
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            mood: 'calm',
          }));
        }, moodEffect.duration);
      }, MOOD_TRANSITION_DELAY);
    }

    return true;
  }, [state.isAnimating]);

  // Set mood directly
  const setMood = useCallback((mood: MojoMood, duration?: number) => {
    setState(prev => ({
      ...prev,
      mood,
      lastInteraction: Date.now(),
    }));

    if (duration) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          mood: 'calm',
        }));
      }, duration);
    }
  }, []);

  // Record an interaction (updates last interaction time)
  const recordInteraction = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastInteraction: Date.now(),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    };
  }, []);

  // Contextual comments based on mood
  const getMojoComment = useCallback((): string | null => {
    if (state.isAnimating) return null;
    
    const timeSinceInteraction = Date.now() - state.lastInteraction;
    
    // Only show comments occasionally
    if (Math.random() > 0.3) return null;
    
    if (timeSinceInteraction > 30000) {
      return "You've been here a while. Need a break?";
    }
    
    switch (state.mood) {
      case 'tired':
        return "Feeling sleepy together... 💤";
      case 'playful':
        return "This is fun! 🎉";
      case 'content':
        return "I like hanging out with you.";
      case 'overwhelmed':
        return "Whoa... give me a sec...";
      default:
        return null;
    }
  }, [state.mood, state.isAnimating, state.lastInteraction]);

  return {
    mood: state.mood,
    emote: state.emote,
    isAnimating: state.isAnimating,
    triggerEmote,
    setMood,
    recordInteraction,
    getMojoComment,
    canTriggerEmote: !state.isAnimating,
  };
}
