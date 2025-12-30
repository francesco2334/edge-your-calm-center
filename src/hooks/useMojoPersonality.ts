import { useState, useEffect, useCallback, useRef } from 'react';
import { useMojoMood, MojoEmote } from './useMojoMood';

// Random phrases Mojo can say
const MOJO_PHRASES = {
  idle: [
    "Just vibing here ✨",
    "Hmm... what should we do?",
    "*stretches*",
    "La la la~",
    "You're doing great today!",
    "I believe in you 💪",
    "Take your time, I'm here",
    "*happy wiggle*",
    "Hey hey!",
    "What's on your mind?",
    "Life is good 🌟",
    "*bounces excitedly*",
    "You know what? You're awesome.",
    "Just checking in!",
    "*does a little spin*",
  ],
  greeting: [
    "Oh hey! You're back! 🎉",
    "There you are!",
    "Missed you!",
    "Hey friend!",
    "Yay, you're here!",
    "Welcome back! ✨",
  ],
  dancing: [
    "Can't stop, won't stop! 💃",
    "*busts a move*",
    "Dance party! 🕺",
    "Feel the rhythm!",
    "Wooo!",
    "*grooves*",
  ],
  happy: [
    "This is nice 🥰",
    "Feeling good!",
    "Today's gonna be great!",
    "Yay!",
    "So happy right now!",
    "*radiates joy*",
  ],
  playful: [
    "*pokes you*",
    "Tag, you're it!",
    "Catch me if you can!",
    "*giggles*",
    "Boop!",
    "Wheee!",
  ],
  sleepy: [
    "*yawns*",
    "Getting cozy...",
    "Mmm... comfy...",
    "Zzz...",
    "*nods off*",
  ],
  encouraging: [
    "One step at a time 💪",
    "You've got this!",
    "Progress, not perfection",
    "Every moment is a fresh start",
    "I'm proud of you",
    "Keep going!",
  ],
};

// Spontaneous actions Mojo can do
const SPONTANEOUS_EMOTES: MojoEmote[] = ['dance', 'wave', 'giggle', 'excited', 'blush', 'love', 'spin'];
const HAPPY_EMOTES: MojoEmote[] = ['dance', 'excited', 'celebrate', 'cheer', 'love'];

interface MojoPersonalityState {
  currentPhrase: string | null;
  isPhraseVisible: boolean;
  lastPhraseTime: number;
  isSpontaneousAction: boolean;
}

const PHRASE_DISPLAY_DURATION = 3500; // How long phrase stays visible
const MIN_PHRASE_INTERVAL = 12000; // Minimum time between phrases
const MAX_PHRASE_INTERVAL = 35000; // Maximum time between phrases
const SPONTANEOUS_ACTION_CHANCE = 0.4; // 40% chance of action
const PHRASE_CHANCE = 0.6; // 60% chance of phrase

export function useMojoPersonality() {
  const mojoMood = useMojoMood();
  const [state, setState] = useState<MojoPersonalityState>({
    currentPhrase: null,
    isPhraseVisible: false,
    lastPhraseTime: Date.now(),
    isSpontaneousAction: false,
  });

  const phraseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const actionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasGreeted = useRef(false);

  // Get random item from array
  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Show a phrase
  const showPhrase = useCallback((phrase: string) => {
    // Clear any existing timeout
    if (phraseTimeoutRef.current) {
      clearTimeout(phraseTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      currentPhrase: phrase,
      isPhraseVisible: true,
      lastPhraseTime: Date.now(),
    }));

    // Hide after duration
    phraseTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isPhraseVisible: false,
      }));
    }, PHRASE_DISPLAY_DURATION);
  }, []);

  // Trigger spontaneous action with phrase
  const triggerSpontaneousAction = useCallback(() => {
    if (mojoMood.isAnimating || state.isSpontaneousAction) return;

    const timeSinceLast = Date.now() - state.lastPhraseTime;
    if (timeSinceLast < MIN_PHRASE_INTERVAL) return;

    // Decide what to do
    const roll = Math.random();
    
    if (roll < SPONTANEOUS_ACTION_CHANCE && mojoMood.canTriggerEmote) {
      // Do an emote with matching phrase
      const emote = getRandomItem(SPONTANEOUS_EMOTES);
      mojoMood.triggerEmote(emote, true);
      
      // Show matching phrase
      let phraseCategory: keyof typeof MOJO_PHRASES = 'idle';
      if (emote === 'dance') phraseCategory = 'dancing';
      else if (emote === 'excited' || emote === 'love' || emote === 'celebrate') phraseCategory = 'happy';
      else if (emote === 'giggle' || emote === 'wave') phraseCategory = 'playful';
      
      showPhrase(getRandomItem(MOJO_PHRASES[phraseCategory]));
      setState(prev => ({ ...prev, isSpontaneousAction: true }));
      
      // Reset spontaneous flag after animation
      setTimeout(() => {
        setState(prev => ({ ...prev, isSpontaneousAction: false }));
      }, 3000);
    } else if (roll < SPONTANEOUS_ACTION_CHANCE + PHRASE_CHANCE) {
      // Just show a phrase
      const category = Math.random() < 0.3 ? 'encouraging' : 'idle';
      showPhrase(getRandomItem(MOJO_PHRASES[category]));
    }
  }, [mojoMood, state.isSpontaneousAction, state.lastPhraseTime, showPhrase]);

  // Greet user on mount
  useEffect(() => {
    if (!hasGreeted.current) {
      const greetTimeout = setTimeout(() => {
        showPhrase(getRandomItem(MOJO_PHRASES.greeting));
        hasGreeted.current = true;
        
        // Do a wave after greeting
        setTimeout(() => {
          if (mojoMood.canTriggerEmote) {
            mojoMood.triggerEmote('wave', true);
          }
        }, 1500);
      }, 2000);
      
      return () => clearTimeout(greetTimeout);
    }
  }, [showPhrase, mojoMood]);

  // Periodic spontaneous actions
  useEffect(() => {
    const scheduleNextAction = () => {
      const interval = MIN_PHRASE_INTERVAL + Math.random() * (MAX_PHRASE_INTERVAL - MIN_PHRASE_INTERVAL);
      
      actionIntervalRef.current = setTimeout(() => {
        triggerSpontaneousAction();
        scheduleNextAction();
      }, interval);
    };

    scheduleNextAction();

    return () => {
      if (actionIntervalRef.current) {
        clearTimeout(actionIntervalRef.current);
      }
    };
  }, [triggerSpontaneousAction]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (phraseTimeoutRef.current) clearTimeout(phraseTimeoutRef.current);
      if (actionIntervalRef.current) clearTimeout(actionIntervalRef.current);
    };
  }, []);

  // Trigger happy burst
  const triggerHappyBurst = useCallback(() => {
    if (mojoMood.canTriggerEmote) {
      const emote = getRandomItem(HAPPY_EMOTES);
      mojoMood.triggerEmote(emote);
      showPhrase(getRandomItem(MOJO_PHRASES.happy));
    }
  }, [mojoMood, showPhrase]);

  // Trigger encouraging message
  const triggerEncouragement = useCallback(() => {
    showPhrase(getRandomItem(MOJO_PHRASES.encouraging));
    if (mojoMood.canTriggerEmote && Math.random() > 0.5) {
      mojoMood.triggerEmote('love', true);
    }
  }, [mojoMood, showPhrase]);

  // Trigger dance party
  const triggerDanceParty = useCallback(() => {
    if (mojoMood.canTriggerEmote) {
      mojoMood.triggerEmote('dance');
      showPhrase(getRandomItem(MOJO_PHRASES.dancing));
    }
  }, [mojoMood, showPhrase]);

  // Trigger random phrase manually
  const sayRandomPhrase = useCallback((category?: keyof typeof MOJO_PHRASES) => {
    const cat = category || (Object.keys(MOJO_PHRASES) as (keyof typeof MOJO_PHRASES)[])[
      Math.floor(Math.random() * Object.keys(MOJO_PHRASES).length)
    ];
    showPhrase(getRandomItem(MOJO_PHRASES[cat]));
  }, [showPhrase]);

  return {
    // Phrase state
    currentPhrase: state.currentPhrase,
    isPhraseVisible: state.isPhraseVisible,
    
    // Mood state (pass through)
    mood: mojoMood.mood,
    emote: mojoMood.emote,
    isAnimating: mojoMood.isAnimating,
    canTriggerEmote: mojoMood.canTriggerEmote,
    
    // Actions
    triggerEmote: mojoMood.triggerEmote,
    triggerWinReaction: mojoMood.triggerWinReaction,
    triggerLoseReaction: mojoMood.triggerLoseReaction,
    setMood: mojoMood.setMood,
    recordInteraction: mojoMood.recordInteraction,
    getMojoComment: mojoMood.getMojoComment,
    
    // New personality actions
    triggerHappyBurst,
    triggerEncouragement,
    triggerDanceParty,
    sayRandomPhrase,
  };
}

export type { MojoEmote };
export { MOJO_PHRASES };
