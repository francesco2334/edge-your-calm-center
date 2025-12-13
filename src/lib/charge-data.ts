export interface ChargeTransaction {
  id: string;
  type: 'earn' | 'allocate' | 'bonus';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface AllocationSession {
  id: string;
  activity: string;
  chargeAllocated: number;
  suggestedMinutes: number;
  startedAt: Date;
  outcome?: 'stayed' | 'over' | 'early';
  completedAt?: Date;
}

export interface StabilityRun {
  startDate: Date;
  currentDays: number;
  plannedSessions: number;
  earlyExits: number;
  averageDelay: number;
}

export const EARN_OPTIONS = [
  { id: 'focus-10', label: '10 min Focus', icon: '🎯', charge: 1, description: 'Complete a focus session' },
  { id: 'focus-25', label: '25 min Deep Work', icon: '⚡', charge: 3, description: 'Deep work block' },
  { id: 'mojo-task', label: 'Mojo Task', icon: '🌀', charge: 2, description: 'Complete a regulation task' },
  { id: 'early-exit', label: 'Exit Loop Early', icon: '🚪', charge: 1, description: 'Leave before the hook' },
  { id: 'delay-impulse', label: 'Delay Impulse', icon: '⏸️', charge: 1, description: 'Pause before acting' },
];

export const ALLOCATION_OPTIONS = [
  { id: 'scroll', label: 'Scrolling', icon: '📱', chargePerUnit: 1, minutesPerUnit: 10, description: 'TikTok, Instagram, etc.' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', chargePerUnit: 1, minutesPerUnit: 15, description: 'Video games' },
  { id: 'trading', label: 'Trading', icon: '📈', chargePerUnit: 2, minutesPerUnit: 15, description: 'Markets & crypto' },
  { id: 'free-flow', label: 'Free Flow', icon: '🌊', chargePerUnit: 3, minutesPerUnit: 30, description: 'No specific limits' },
];

export const OUTCOME_BONUSES = {
  stayed: { charge: 1, label: 'Stayed within plan', message: 'You kept your word to yourself.' },
  over: { charge: 0, label: 'Went over', message: 'No penalty. Just data.' },
  early: { charge: 2, label: 'Exited early', message: 'That takes real control.' },
};

export interface PersonalStats {
  plannedSessions: number;
  earlyExits: number;
  stayedWithin: number;
  wentOver: number;
  averageDelaySeconds: number;
  longestStabilityRun: number;
  currentStabilityRun: number;
}

export const DEFAULT_STATS: PersonalStats = {
  plannedSessions: 0,
  earlyExits: 0,
  stayedWithin: 0,
  wentOver: 0,
  averageDelaySeconds: 0,
  longestStabilityRun: 0,
  currentStabilityRun: 0,
};
