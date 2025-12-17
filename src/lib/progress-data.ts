// Progress Engine - Activity-Driven Progress Tracking

export interface ActivityEvent {
  id: string;
  type: 'check_in' | 'learn' | 'reflection' | 'tool_used' | 'streak' | 'session' | 'game' | 'mojo_chat' | 'app_open';
  points: number;
  timestamp: Date;
  details?: string;
}

export interface WeeklyReflection {
  id: string;
  weekStart: string; // ISO date string of week start (Monday)
  content: string;
  createdAt: Date;
  prompts: {
    wentWell?: string;
    didDifferently?: string;
    proudOf?: string;
  };
}

export interface MonthlySummary {
  id: string;
  month: string; // Format: "2024-01"
  content: string;
  createdAt: Date;
  score: number;
  trend: 'up' | 'down' | 'stable';
  improvements?: string; // What they improved this month
  notes?: string; // Additional comments
}

export interface MonthlyNote {
  id: string;
  month: string;
  improvements: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyScore {
  month: string;
  score: number;
  activities: number;
  reflectionsCount: number;
  streakDays: number;
  learnCards: number;
  toolsUsed: number;
  label: string; // "Jan", "Feb", etc.
}

export interface Trophy {
  id: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
  daysRequired: number;
}

// Trophy system: 6 trophies unlocked over 1 year (each 60 days of daily activity)
export const TROPHY_DEFINITIONS = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    description: '60 days of daily activity',
    threshold: 60,
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    description: '120 days of daily activity',
    threshold: 120,
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    description: '180 days of daily activity',
    threshold: 180,
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    description: '240 days of daily activity',
    threshold: 240,
  },
  diamond: {
    name: 'Diamond',
    icon: '💠',
    description: '300 days of daily activity',
    threshold: 300,
  },
  master: {
    name: 'Master',
    icon: '👑',
    description: '365 days of daily activity',
    threshold: 365,
  },
};

export const ACTIVITY_POINTS = {
  check_in: 10,
  app_open: 5,
  learn_card: 2,
  learn_save: 5,
  weekly_reflection: 25,
  monthly_summary: 50,
  tool_used: 15,
  streak_day: 5,
  session_complete: 20,
  session_early_exit: 30,
  game_played: 10,
  game_completed: 20,
  mojo_chat: 8,
  monthly_note: 15,
};

export const REFLECTION_PROMPTS = {
  weekly: [
    { key: 'wentWell', label: 'What went well?', placeholder: 'Something that worked for me this week...' },
    { key: 'didDifferently', label: 'What did you do differently?', placeholder: 'A change I made or tried...' },
    { key: 'proudOf', label: 'What are you proud of?', placeholder: 'Something I accomplished...' },
  ],
  monthly: {
    prompt: 'Looking back on this month — what moved the needle for you?',
    placeholder: 'What habits helped, what changed, what you want to carry forward...',
  },
  improvements: {
    prompt: 'What have you improved this month?',
    placeholder: 'Skills, habits, mindset shifts, behaviors...',
  },
  notes: {
    prompt: 'Any additional notes or thoughts?',
    placeholder: 'Challenges, insights, plans for next month...',
  },
};

export const PROGRESS_STORAGE_KEYS = {
  activities: 'dopa_activities',
  weeklyReflections: 'dopa_weekly_reflections',
  monthlySummaries: 'dopa_monthly_summaries',
  monthlyNotes: 'dopa_monthly_notes',
  trophies: 'dopa_trophies',
  monthlyScores: 'dopa_monthly_scores',
  lastAppOpen: 'dopa_last_app_open',
};

// Utility functions
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function getMonthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7); // "2024-01"
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function calculateMonthlyScore(activities: ActivityEvent[], month: string): number {
  const monthActivities = activities.filter(a => 
    getMonthKey(new Date(a.timestamp)) === month
  );
  return monthActivities.reduce((sum, a) => sum + a.points, 0);
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getMonthKey(d));
  }
  return months;
}

export function getScoreTrend(currentScore: number, previousScore: number): 'up' | 'down' | 'stable' {
  const diff = currentScore - previousScore;
  if (diff > 20) return 'up';
  if (diff < -20) return 'down';
  return 'stable';
}
