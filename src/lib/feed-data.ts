export type FeedCardType = 
  | 'pull-checkin' 
  | 'science' 
  | 'challenge' 
  | 'insight' 
  | 'exchange';

export interface FeedCardData {
  id: string;
  type: FeedCardType;
  title: string;
  subtitle?: string;
  content?: string;
  fact?: string;
  action?: {
    label: string;
    tool?: 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction';
    screen?: 'exchange' | 'insights';
  };
  gradient: string;
  icon?: string;
}

// Science cards - randomized brain facts
export const SCIENCE_CARDS: Omit<FeedCardData, 'id'>[] = [
  {
    type: 'science',
    title: 'Your brain overestimates cravings.',
    content: 'The "pull" peaks fast, then drops. Delay works because the prediction collapses.',
    fact: 'Urge intensity drops 50% after just 10 seconds of waiting.',
    action: { label: 'Run The Standoff', tool: 'pause' },
    gradient: 'from-violet-900/80 via-purple-900/60 to-background',
    icon: '🧠',
  },
  {
    type: 'science',
    title: 'Dopamine isn\'t pleasure.',
    content: 'It\'s anticipation. Your brain fires harder before the reward than during it.',
    fact: 'Dopamine spikes 400% higher in anticipation than during consumption.',
    action: { label: 'Test Your Predictions', tool: 'prediction' },
    gradient: 'from-blue-900/80 via-indigo-900/60 to-background',
    icon: '⚡',
  },
  {
    type: 'science',
    title: 'Naming emotions cuts their power.',
    content: 'When you label what you feel, your amygdala calms. Awareness creates distance.',
    fact: 'Affect labeling reduces amygdala activity by up to 50%.',
    action: { label: 'Name the Pull', tool: 'name' },
    gradient: 'from-rose-900/80 via-pink-900/60 to-background',
    icon: '📍',
  },
  {
    type: 'science',
    title: 'Slow breathing rewires impulse.',
    content: 'Your vagus nerve connects breath to brain. Slow it down, and cravings follow.',
    fact: '90 seconds of controlled breathing can reset your nervous system.',
    action: { label: 'Sync Your Breath', tool: 'breathing' },
    gradient: 'from-teal-900/80 via-cyan-900/60 to-background',
    icon: '🫁',
  },
  {
    type: 'science',
    title: 'Variable rewards hijack attention.',
    content: 'Unpredictable payoffs create the strongest dopamine loops. That\'s why scrolling is addictive.',
    fact: 'Social media uses the same mechanism as slot machines.',
    action: { label: 'Test Reaction Speed', tool: 'reaction' },
    gradient: 'from-amber-900/80 via-orange-900/60 to-background',
    icon: '🎰',
  },
  {
    type: 'science',
    title: 'Your prefrontal cortex is your brake.',
    content: 'It helps you pause before acting. Every delay strengthens this muscle.',
    fact: 'The prefrontal cortex isn\'t fully developed until age 25.',
    action: { label: 'Train Your Brake', tool: 'pause' },
    gradient: 'from-emerald-900/80 via-green-900/60 to-background',
    icon: '🧠',
  },
  {
    type: 'science',
    title: 'Neuroplasticity is real.',
    content: 'Your brain rewires based on repeated behaviors. Every resistance builds new pathways.',
    fact: 'New neural pathways can form in as little as 21 days.',
    action: { label: 'Start Building', tool: 'pause' },
    gradient: 'from-fuchsia-900/80 via-purple-900/60 to-background',
    icon: '🔄',
  },
  {
    type: 'science',
    title: 'Sleep restores dopamine sensitivity.',
    content: 'One bad night = reduced impulse control. Your receptors need rest to reset.',
    fact: '7-9 hours of sleep restores dopamine receptor function overnight.',
    action: { label: 'Check Your Insights', screen: 'insights' },
    gradient: 'from-indigo-900/80 via-blue-900/60 to-background',
    icon: '😴',
  },
  {
    type: 'science',
    title: 'Effort-reward coupling is broken.',
    content: 'High-stim destroys the link between effort and satisfaction. You can rebuild it.',
    fact: 'Rebuilding effort-reward links takes 2-4 weeks of consistent practice.',
    action: { label: 'Earn Charge', screen: 'exchange' },
    gradient: 'from-rose-900/80 via-red-900/60 to-background',
    icon: '💪',
  },
];

// Challenge cards - quick missions
export const CHALLENGE_CARDS: Omit<FeedCardData, 'id'>[] = [
  {
    type: 'challenge',
    title: 'The Standoff',
    subtitle: 'Hold the urge. Don\'t act.',
    content: 'Can you wait 60 seconds without giving in? Most people can\'t make it past 20.',
    action: { label: 'Accept Challenge', tool: 'pause' },
    gradient: 'from-purple-900/90 via-violet-900/70 to-background',
    icon: '⏸️',
  },
  {
    type: 'challenge',
    title: 'The Bluff',
    subtitle: 'Catch your brain lying.',
    content: 'Predict how good something will feel. Then check reality. The gap reveals the truth.',
    action: { label: 'Call the Bluff', tool: 'prediction' },
    gradient: 'from-amber-900/90 via-orange-900/70 to-background',
    icon: '🎯',
  },
  {
    type: 'challenge',
    title: 'Catch the Flicker',
    subtitle: 'Test your awareness.',
    content: 'How fast can you notice an urge? Earlier awareness = stronger control.',
    action: { label: 'Test Reflexes', tool: 'reaction' },
    gradient: 'from-cyan-900/90 via-blue-900/70 to-background',
    icon: '⚡',
  },
  {
    type: 'challenge',
    title: 'Sync Reset',
    subtitle: '90 seconds to calm.',
    content: 'Match your breath to Mojo. Your nervous system will follow.',
    action: { label: 'Begin Sync', tool: 'breathing' },
    gradient: 'from-teal-900/90 via-emerald-900/70 to-background',
    icon: '🫁',
  },
  {
    type: 'challenge',
    title: 'Name It',
    subtitle: 'Label the feeling.',
    content: 'What\'s really pulling you? Boredom? Stress? Avoidance? Name it to tame it.',
    action: { label: 'Identify Pull', tool: 'name' },
    gradient: 'from-pink-900/90 via-rose-900/70 to-background',
    icon: '📍',
  },
];

// Insight cards - progress moments
export const INSIGHT_CARDS: Omit<FeedCardData, 'id'>[] = [
  {
    type: 'insight',
    title: 'Your pull is shifting.',
    content: 'Check your patterns. See what\'s changing.',
    action: { label: 'View Insights', screen: 'insights' },
    gradient: 'from-emerald-900/80 via-green-900/60 to-background',
    icon: '📊',
  },
  {
    type: 'insight',
    title: 'Charge available.',
    content: 'You\'ve earned control. Exchange it for time.',
    action: { label: 'Open Exchange', screen: 'exchange' },
    gradient: 'from-violet-900/80 via-purple-900/60 to-background',
    icon: '⚡',
  },
];

// Generate a randomized feed mix
export function generateFeedCards(
  streak: number,
  chargeBalance: number,
  streakClaimedToday: boolean
): FeedCardData[] {
  const cards: FeedCardData[] = [];
  let cardId = 0;

  // Always start with pull check-in if not claimed
  if (!streakClaimedToday) {
    cards.push({
      id: `feed-${cardId++}`,
      type: 'pull-checkin',
      title: 'Daily Check-in',
      subtitle: streak > 0 ? `${streak} day streak` : 'Start your streak',
      content: 'What pulled you today?',
      action: { label: '+20 Charge' },
      gradient: 'from-amber-900/80 via-orange-900/60 to-background',
      icon: '🔥',
    });
  }

  // Shuffle and pick science cards
  const shuffledScience = [...SCIENCE_CARDS].sort(() => Math.random() - 0.5);
  shuffledScience.slice(0, 4).forEach((card) => {
    cards.push({ ...card, id: `feed-${cardId++}` });
  });

  // Add challenges
  const shuffledChallenges = [...CHALLENGE_CARDS].sort(() => Math.random() - 0.5);
  shuffledChallenges.slice(0, 3).forEach((card) => {
    cards.push({ ...card, id: `feed-${cardId++}` });
  });

  // Add insights if balance is high
  if (chargeBalance >= 5) {
    cards.push({ ...INSIGHT_CARDS[1], id: `feed-${cardId++}` });
  }
  cards.push({ ...INSIGHT_CARDS[0], id: `feed-${cardId++}` });

  // Shuffle all but keep pull check-in first
  const hasCheckin = cards[0]?.type === 'pull-checkin';
  const toShuffle = hasCheckin ? cards.slice(1) : cards;
  const shuffled = toShuffle.sort(() => Math.random() - 0.5);
  
  return hasCheckin ? [cards[0], ...shuffled] : shuffled;
}
