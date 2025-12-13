export type EdgeState = 'stable' | 'pulled' | 'overloaded' | 'hijacked';

export interface AssessmentQuestion {
  id: number;
  text: string;
  category: 'intensity' | 'impulse' | 'avoidance' | 'risk' | 'recovery';
}

export interface AssessmentAnswer {
  questionId: number;
  value: number; // 0-4 scale
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, text: "I reach for stimulation without deciding to.", category: 'impulse' },
  { id: 2, text: "I feel restless when nothing is happening.", category: 'intensity' },
  { id: 3, text: "I delay important things by consuming content.", category: 'avoidance' },
  { id: 4, text: "I chase highs even when I know the downside.", category: 'risk' },
  { id: 5, text: "I act first and regret later.", category: 'impulse' },
  { id: 6, text: "I feel mentally fried but still stimulated.", category: 'recovery' },
  { id: 7, text: "I scroll longer than I plan to.", category: 'avoidance' },
  { id: 8, text: "I struggle to stop once I start.", category: 'impulse' },
  { id: 9, text: "I feel calm only after intense input.", category: 'intensity' },
  { id: 10, text: "I avoid starting things that matter.", category: 'avoidance' },
  { id: 11, text: "I need more intensity to feel the same effect.", category: 'intensity' },
  { id: 12, text: "I feel pulled toward my phone automatically.", category: 'impulse' },
  { id: 13, text: "I take risks that don't match my values.", category: 'risk' },
  { id: 14, text: "I feel drained but still reach for more.", category: 'recovery' },
  { id: 15, text: "I know I should stop but continue anyway.", category: 'impulse' },
];

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Almost Always' },
];

export const EDGE_STATES: Record<EdgeState, { title: string; description: string; color: string }> = {
  stable: {
    title: 'Stable',
    description: 'Your system is regulated. You have good control over impulses and can choose your responses.',
    color: 'hsl(var(--primary))',
  },
  pulled: {
    title: 'Pulled',
    description: 'You experience frequent impulse pressure. The pull is noticeable but manageable with awareness.',
    color: 'hsl(var(--edge-warm))',
  },
  overloaded: {
    title: 'Overloaded',
    description: 'Your system is under significant load. Control is reduced and stimulation feels constant.',
    color: 'hsl(25, 80%, 55%)',
  },
  hijacked: {
    title: 'Hijacked',
    description: 'Impulse loops are dominating behavior. Your automatic responses are running the show.',
    color: 'hsl(0, 65%, 50%)',
  },
};

export function calculateEdgeState(answers: AssessmentAnswer[]): EdgeState {
  const totalScore = answers.reduce((sum, a) => sum + a.value, 0);
  const maxScore = answers.length * 4;
  const percentage = (totalScore / maxScore) * 100;

  if (percentage <= 25) return 'stable';
  if (percentage <= 50) return 'pulled';
  if (percentage <= 75) return 'overloaded';
  return 'hijacked';
}

export const MIRRORS = [
  { id: 'scrolling', label: 'Doomscrolling / Feeds', icon: '📱' },
  { id: 'crypto', label: 'Crypto / Trading', icon: '📈' },
  { id: 'gambling', label: 'Gambling', icon: '🎰' },
  { id: 'porn', label: 'Porn / Sexual Compulsions', icon: '🔞' },
  { id: 'spending', label: 'Impulse Spending', icon: '💳' },
  { id: 'avoidance', label: 'Bed Rotting / Avoidance', icon: '🛏️' },
  { id: 'binge', label: 'Binge Content', icon: '📺' },
  { id: 'thrill', label: 'Risk & Thrill Seeking', icon: '⚡' },
];
