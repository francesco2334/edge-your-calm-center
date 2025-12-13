// Real-world reaction time benchmarks (in milliseconds)
export const REACTION_BENCHMARKS = {
  elite: { max: 200, label: 'Elite', description: 'Professional gamer level' },
  excellent: { max: 250, label: 'Excellent', description: 'Above average awareness' },
  good: { max: 300, label: 'Good', description: 'Healthy response time' },
  average: { max: 350, label: 'Average', description: 'Normal human reaction' },
  belowAverage: { max: 450, label: 'Below Average', description: 'Room for improvement' },
  slow: { max: Infinity, label: 'Developing', description: 'Keep practicing' },
} as const;

export const REAL_WORLD_COMPARISONS = [
  { label: 'F1 Driver', time: 150, icon: '🏎️' },
  { label: 'Pro Gamer', time: 180, icon: '🎮' },
  { label: 'Fighter Pilot', time: 200, icon: '✈️' },
  { label: 'Tennis Pro', time: 230, icon: '🎾' },
  { label: 'Average Human', time: 284, icon: '🧍' },
  { label: 'Untrained Adult', time: 350, icon: '😴' },
];

export function getReactionTier(ms: number): typeof REACTION_BENCHMARKS[keyof typeof REACTION_BENCHMARKS] {
  if (ms <= REACTION_BENCHMARKS.elite.max) return REACTION_BENCHMARKS.elite;
  if (ms <= REACTION_BENCHMARKS.excellent.max) return REACTION_BENCHMARKS.excellent;
  if (ms <= REACTION_BENCHMARKS.good.max) return REACTION_BENCHMARKS.good;
  if (ms <= REACTION_BENCHMARKS.average.max) return REACTION_BENCHMARKS.average;
  if (ms <= REACTION_BENCHMARKS.belowAverage.max) return REACTION_BENCHMARKS.belowAverage;
  return REACTION_BENCHMARKS.slow;
}

export function getPercentile(ms: number): number {
  // Based on human reaction time distribution (median ~284ms, std ~50ms)
  const median = 284;
  const std = 50;
  const zScore = (median - ms) / std;
  // Approximate percentile from z-score
  const percentile = 50 + (zScore * 34);
  return Math.max(1, Math.min(99, Math.round(percentile)));
}

export interface ReactionRecord {
  id: string;
  time: number;
  timestamp: Date;
}

export interface ReactionLeaderboard {
  personalBest: number;
  averageTime: number;
  totalAttempts: number;
  history: ReactionRecord[];
  percentile: number;
}
