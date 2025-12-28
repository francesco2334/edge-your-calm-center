/**
 * CREDITS ECONOMY DATA
 * 
 * Credits = Permission currency (renamed from "tokens")
 * - Used to allocate time for activities
 * - Earned through positive actions
 * - Never punitive - failures don't remove credits
 */

export interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface SpendOption {
  id: string;
  label: string;
  icon: string;
  creditCost: number;
  minutes: number;
  description: string;
}

export const SPEND_OPTIONS: SpendOption[] = [
  { id: 'scroll-10', label: '10 min Scroll', icon: '📱', creditCost: 1, minutes: 10, description: 'Social media break' },
  { id: 'scroll-30', label: '30 min Scroll', icon: '📲', creditCost: 3, minutes: 30, description: 'Extended session' },
  { id: 'gaming-30', label: '30 min Gaming', icon: '🎮', creditCost: 3, minutes: 30, description: 'Video games' },
  { id: 'free-60', label: '1hr Free Flow', icon: '🌊', creditCost: 6, minutes: 60, description: 'No limits for an hour' },
];

/**
 * Identity-based action categories for "Act" phase
 * Replaces generic productivity categories
 */
export interface ActionCategory {
  id: string;
  label: string;
  icon: string;
  examples: string[];
  identity: string; // Who the user becomes by doing this
}

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'body',
    label: 'Body',
    icon: '🏃',
    examples: ['Move', 'Shower', 'Walk', 'Stretch', 'Exercise'],
    identity: 'Someone who moves their body daily',
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: '🎯',
    examples: ['Deep work', 'Cleanup', 'Admin', 'Learning', 'Creating'],
    identity: 'Someone who does focused work',
  },
  {
    id: 'connection',
    label: 'Connection',
    icon: '💬',
    examples: ['Message someone', 'Call a friend', 'Social exposure', 'Help someone'],
    identity: 'Someone who stays connected',
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: '🧹',
    examples: ['Tidy desk', 'Make bed', 'Organize space', 'Clean up'],
    identity: 'Someone who maintains their space',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    icon: '🌙',
    examples: ['Sleep hygiene', 'Journaling', 'Meditation', 'Rest'],
    identity: 'Someone who prioritizes recovery',
  },
];

/**
 * Flow spine stages
 * Trigger → Interrupt → Replace → Reflect → Progress
 */
export type FlowStage = 'log' | 'reset' | 'act' | 'learn' | 'progress';

export const FLOW_STAGES: { id: FlowStage; label: string; icon: string; description: string }[] = [
  { id: 'log', label: 'Log', icon: '📝', description: 'Log what pulled you' },
  { id: 'reset', label: 'Reset', icon: '🔄', description: 'Interrupt the urge' },
  { id: 'act', label: 'Act', icon: '⚡', description: 'Do 1 real-world action' },
  { id: 'learn', label: 'Learn', icon: '💡', description: 'Understand patterns' },
  { id: 'progress', label: 'Progress', icon: '📊', description: 'Track your journey' },
];

/**
 * Control/focus metrics for insights (replacing games won, tokens, etc.)
 */
export interface ControlMetrics {
  urgesHandled: number;
  averageUrgeDuration: number; // in seconds
  lateNightEventsReduced: number; // percentage
  focusMinutesRegained: number;
  streakDays: number;
  resetsCompleted: number;
}
