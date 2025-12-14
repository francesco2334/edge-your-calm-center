import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'emotional_context';

export type EmotionalState = 
  | 'craving'
  | 'relapse' 
  | 'boredom'
  | 'overstimulated'
  | 'anxious'
  | 'motivated'
  | 'calm'
  | 'neutral';

interface EmotionalContext {
  currentState: EmotionalState;
  lastUpdated: string;
  history: Array<{
    state: EmotionalState;
    timestamp: string;
  }>;
}

// Map emotional states to relevant Learn topics
export const EMOTIONAL_TOPIC_MAP: Record<EmotionalState, string[]> = {
  craving: ['dopamine', 'habits', 'psychology'],
  relapse: ['psychology', 'self-improvement', 'philosophy'],
  boredom: ['creativity', 'productivity', 'philosophy'],
  overstimulated: ['health', 'science', 'habits'],
  anxious: ['health', 'psychology', 'philosophy'],
  motivated: ['productivity', 'self-improvement', 'habits'],
  calm: ['philosophy', 'creativity', 'science'],
  neutral: [], // No priority - show all
};

// Map emotional states to specific card recommendations
export const EMOTIONAL_CONTENT_PRIORITY: Record<EmotionalState, string[]> = {
  craving: [
    'Variable rewards',
    'Urges peak',
    'baseline',
    'tolerance',
    'anticipation',
    'trigger',
    'loop',
  ],
  relapse: [
    'Self-compassion',
    'Failure is data',
    'Growth mindset',
    'Never miss twice',
    'small wins',
    'obstacle',
  ],
  boredom: [
    'Boredom is productive',
    'Flow state',
    'meaning',
    'novelty',
    'creativity',
    'default mode',
  ],
  overstimulated: [
    'nervous system',
    'stillness',
    'breathing',
    'sleep',
    'nature',
    'dopamine fasting',
    'baseline',
  ],
  anxious: [
    'Naming emotions',
    'breathing',
    'present',
    'control',
    'worry',
    'grounding',
  ],
  motivated: [
    'Deep work',
    'atomic habits',
    'compound',
    'keystone',
    'momentum',
    'deliberate practice',
  ],
  calm: [
    'philosophy',
    'gratitude',
    'present',
    'meaning',
    'flow',
  ],
  neutral: [],
};

const getInitialContext = (): EmotionalContext => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    currentState: 'neutral',
    lastUpdated: new Date().toISOString(),
    history: [],
  };
};

export function useEmotionalContext() {
  const [context, setContext] = useState<EmotionalContext>(getInitialContext);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [context]);

  const logState = useCallback((state: EmotionalState) => {
    setContext(prev => ({
      currentState: state,
      lastUpdated: new Date().toISOString(),
      history: [
        { state, timestamp: new Date().toISOString() },
        ...prev.history.slice(0, 29), // Keep last 30
      ],
    }));
  }, []);

  const getPriorityTopics = useCallback((): string[] => {
    return EMOTIONAL_TOPIC_MAP[context.currentState] || [];
  }, [context.currentState]);

  const getContentKeywords = useCallback((): string[] => {
    return EMOTIONAL_CONTENT_PRIORITY[context.currentState] || [];
  }, [context.currentState]);

  // Check if state was logged recently (within 4 hours)
  const isStateRecent = useCallback((): boolean => {
    if (!context.lastUpdated) return false;
    const hoursSince = (Date.now() - new Date(context.lastUpdated).getTime()) / (1000 * 60 * 60);
    return hoursSince < 4;
  }, [context.lastUpdated]);

  return {
    currentState: context.currentState,
    lastUpdated: context.lastUpdated,
    history: context.history,
    logState,
    getPriorityTopics,
    getContentKeywords,
    isStateRecent,
  };
}

// Helper to match cards to emotional state
export function scoreCardRelevance(
  cardContent: string,
  cardTopicId: string,
  emotionalState: EmotionalState
): number {
  let score = 0;
  
  // Topic match
  const priorityTopics = EMOTIONAL_TOPIC_MAP[emotionalState];
  if (priorityTopics.includes(cardTopicId)) {
    score += 10;
  }
  
  // Keyword match
  const keywords = EMOTIONAL_CONTENT_PRIORITY[emotionalState];
  const lowerContent = cardContent.toLowerCase();
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }
  
  return score;
}
