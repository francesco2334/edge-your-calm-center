// Game difficulty settings
export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export const DIFFICULTY_CONFIG: Record<GameDifficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    emoji: '🌱',
    description: 'Relaxed pace, forgiving',
    color: 'text-emerald-400',
  },
  medium: {
    label: 'Medium',
    emoji: '🔥',
    description: 'Balanced challenge',
    color: 'text-amber-400',
  },
  hard: {
    label: 'Hard',
    emoji: '💀',
    description: 'Maximum intensity',
    color: 'text-red-400',
  },
};

// Storage key for preferred difficulty
const DIFFICULTY_STORAGE_KEY = 'mojo_game_difficulty';

export const getStoredDifficulty = (): GameDifficulty => {
  try {
    const stored = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    if (stored && ['easy', 'medium', 'hard'].includes(stored)) {
      return stored as GameDifficulty;
    }
  } catch {
    // Silently fail
  }
  return 'medium';
};

export const setStoredDifficulty = (difficulty: GameDifficulty): void => {
  try {
    localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
  } catch {
    // Silently fail
  }
};

// Difficulty multipliers for various game parameters
export const getDifficultyMultipliers = (difficulty: GameDifficulty) => {
  switch (difficulty) {
    case 'easy':
      return {
        speed: 0.6,
        targetSize: 1.4,
        tolerance: 1.5,
        duration: 0.8,
        spawnRate: 0.7,
        lives: 1.5,
      };
    case 'medium':
      return {
        speed: 1.0,
        targetSize: 1.0,
        tolerance: 1.0,
        duration: 1.0,
        spawnRate: 1.0,
        lives: 1.0,
      };
    case 'hard':
      return {
        speed: 1.5,
        targetSize: 0.7,
        tolerance: 0.6,
        duration: 1.3,
        spawnRate: 1.4,
        lives: 0.7,
      };
  }
};
