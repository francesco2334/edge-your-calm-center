export interface TokenTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface ExchangeRate {
  id: string;
  label: string;
  icon: string;
  earnMinutes: number;
  tokensAllowed: number; // Changed from tokensEarned - agency framing
  description: string;
}

export interface SpendOption {
  id: string;
  label: string;
  icon: string;
  tokenCost: number;
  minutes: number;
  description: string;
}

export const PERMISSION_OPTIONS: ExchangeRate[] = [
  { id: 'focus-10', label: '10 min Focus', icon: '🎯', earnMinutes: 10, tokensAllowed: 1, description: 'Complete a focus session' },
  { id: 'focus-25', label: '25 min Focus', icon: '⚡', earnMinutes: 25, tokensAllowed: 3, description: 'Deep work block' },
  { id: 'anchor-task', label: 'Anchor Task', icon: '⚓', earnMinutes: 0, tokensAllowed: 2, description: 'Complete a priority task' },
  { id: 'early-exit', label: 'Exit Loop Early', icon: '🚪', earnMinutes: 0, tokensAllowed: 1, description: 'Leave before hook' },
  { id: 'delay-impulse', label: 'Delay Impulse', icon: '⏸️', earnMinutes: 0, tokensAllowed: 1, description: 'Pause before acting' },
];

// Backward compatibility alias
export const EARN_OPTIONS = PERMISSION_OPTIONS;

export const SPEND_OPTIONS: SpendOption[] = [
  { id: 'scroll-10', label: '10 min Scroll', icon: '📱', tokenCost: 1, minutes: 10, description: 'TikTok, Instagram, etc.' },
  { id: 'scroll-30', label: '30 min Scroll', icon: '📲', tokenCost: 3, minutes: 30, description: 'Extended session' },
  { id: 'free-hour', label: '1hr Free Flow', icon: '🌊', tokenCost: 5, minutes: 60, description: 'No limits for an hour' },
  { id: 'gaming', label: '30 min Gaming', icon: '🎮', tokenCost: 2, minutes: 30, description: 'Game time' },
];

export interface CategoryScore {
  category: 'intensity' | 'impulse' | 'avoidance' | 'risk' | 'recovery';
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  insight: string;
}

export const CATEGORY_LABELS: Record<string, { label: string; lowInsight: string; highInsight: string }> = {
  intensity: {
    label: 'Intensity Seeking',
    lowInsight: 'You can find calm without extreme stimulation.',
    highInsight: 'Your system craves high-intensity input to feel normal.',
  },
  impulse: {
    label: 'Impulse Control',
    lowInsight: 'You have strong control over automatic reactions.',
    highInsight: 'Automatic responses often bypass conscious choice.',
  },
  avoidance: {
    label: 'Avoidance Patterns',
    lowInsight: 'You engage with important tasks consistently.',
    highInsight: 'Content consumption is displacing meaningful action.',
  },
  risk: {
    label: 'Risk Chasing',
    lowInsight: 'Your risk tolerance aligns with your values.',
    highInsight: 'The thrill of risk is pulling you beyond comfort.',
  },
  recovery: {
    label: 'Recovery Speed',
    lowInsight: 'You recover well from stimulation overload.',
    highInsight: 'Your system stays activated even when depleted.',
  },
};