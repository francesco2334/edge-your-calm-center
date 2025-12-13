export interface EducationSlide {
  id: string;
  category: 'dopamine' | 'brain' | 'habits' | 'recovery' | 'science';
  title: string;
  content: string;
  fact?: string;
  icon: string;
  color: string;
}

export const EDUCATION_SLIDES: EducationSlide[] = [
  // Dopamine
  {
    id: 'dopa-1',
    category: 'dopamine',
    title: 'What is Dopamine?',
    content: 'Dopamine isn\'t pleasure — it\'s anticipation. It drives you toward rewards, not the reward itself.',
    fact: 'Dopamine spikes 400% higher before a reward than during it.',
    icon: '⚡',
    color: 'from-violet-500/20 to-purple-600/20',
  },
  {
    id: 'dopa-2',
    category: 'dopamine',
    title: 'The Dopamine Baseline',
    content: 'Your brain has a baseline dopamine level. High-stim activities spike it, then crash it below baseline.',
    fact: 'It takes 2-4 hours to return to baseline after a dopamine spike.',
    icon: '📊',
    color: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    id: 'dopa-3',
    category: 'dopamine',
    title: 'Variable Rewards',
    content: 'Unpredictable rewards create the strongest dopamine responses. That\'s why scrolling is addictive.',
    fact: 'Social media uses "intermittent reinforcement" — the same mechanism slot machines use.',
    icon: '🎰',
    color: 'from-amber-500/20 to-orange-600/20',
  },
  
  // Brain
  {
    id: 'brain-1',
    category: 'brain',
    title: 'Your Prefrontal Cortex',
    content: 'The prefrontal cortex is your brain\'s brake system. It helps you pause before acting on impulses.',
    fact: 'The prefrontal cortex isn\'t fully developed until age 25.',
    icon: '🧠',
    color: 'from-pink-500/20 to-rose-600/20',
  },
  {
    id: 'brain-2',
    category: 'brain',
    title: 'Neuroplasticity',
    content: 'Your brain rewires itself based on repeated behaviors. Every time you resist an urge, you strengthen that pathway.',
    fact: 'New neural pathways can form in as little as 21 days of consistent practice.',
    icon: '🔄',
    color: 'from-emerald-500/20 to-green-600/20',
  },
  {
    id: 'brain-3',
    category: 'brain',
    title: 'The Amygdala',
    content: 'The amygdala triggers fight-or-flight responses. Naming your emotions reduces its activity by 50%.',
    fact: 'This is why "Name the Pull" works — labeling = distancing.',
    icon: '🎯',
    color: 'from-red-500/20 to-orange-600/20',
  },
  
  // Habits
  {
    id: 'habit-1',
    category: 'habits',
    title: 'The Habit Loop',
    content: 'Every habit has a cue, routine, and reward. Breaking habits means interrupting this loop.',
    fact: 'Most habits are triggered by context (location, time, emotion), not willpower.',
    icon: '🔁',
    color: 'from-indigo-500/20 to-blue-600/20',
  },
  {
    id: 'habit-2',
    category: 'habits',
    title: 'Delay Tolerance',
    content: 'The ability to wait is trainable. Each time you delay an impulse, you\'re building this muscle.',
    fact: 'A 10-second pause can reduce impulse intensity by up to 50%.',
    icon: '⏱️',
    color: 'from-teal-500/20 to-cyan-600/20',
  },
  {
    id: 'habit-3',
    category: 'habits',
    title: 'Intention Setting',
    content: 'Planning before acting activates different brain regions than impulsive behavior.',
    fact: 'People who set intentions are 91% more likely to follow through.',
    icon: '📝',
    color: 'from-yellow-500/20 to-amber-600/20',
  },
  
  // Recovery
  {
    id: 'recovery-1',
    category: 'recovery',
    title: 'Dopamine Fasting',
    content: 'Low-stimulation periods help reset your reward sensitivity. It\'s not about quitting — it\'s about recalibrating.',
    fact: 'Even 2 hours of low-stim activity can improve focus for 24+ hours.',
    icon: '🧘',
    color: 'from-slate-500/20 to-gray-600/20',
  },
  {
    id: 'recovery-2',
    category: 'recovery',
    title: 'Sleep & Dopamine',
    content: 'Sleep deprivation reduces dopamine receptor sensitivity. One bad night = reduced impulse control.',
    fact: '7-9 hours of sleep restores dopamine receptor function overnight.',
    icon: '😴',
    color: 'from-purple-500/20 to-indigo-600/20',
  },
  {
    id: 'recovery-3',
    category: 'recovery',
    title: 'Exercise Effect',
    content: 'Physical activity naturally elevates dopamine baseline without the crash.',
    fact: '30 minutes of exercise raises dopamine by 30% for 2+ hours.',
    icon: '🏃',
    color: 'from-green-500/20 to-emerald-600/20',
  },
  
  // Science
  {
    id: 'science-1',
    category: 'science',
    title: 'Reward Prediction Error',
    content: 'Dopamine fires when reality exceeds expectations. This is why "Prediction vs Reality" retrains your brain.',
    fact: 'Accurate predictions reduce dopamine spikes from addictive behaviors.',
    icon: '🔬',
    color: 'from-cyan-500/20 to-blue-600/20',
  },
  {
    id: 'science-2',
    category: 'science',
    title: 'The Coolidge Effect',
    content: 'Novel stimuli trigger larger dopamine responses than familiar ones. Endless scrolling exploits this.',
    fact: 'Your brain treats each new post as a potential reward opportunity.',
    icon: '🆕',
    color: 'from-orange-500/20 to-red-600/20',
  },
  {
    id: 'science-3',
    category: 'science',
    title: 'Effort-Reward Coupling',
    content: 'Healthy dopamine responds to effort. High-stim breaks this connection.',
    fact: 'Rebuilding effort-reward links takes 2-4 weeks of consistent practice.',
    icon: '💪',
    color: 'from-rose-500/20 to-pink-600/20',
  },
];

export const EDUCATION_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌟' },
  { id: 'dopamine', label: 'Dopamine', icon: '⚡' },
  { id: 'brain', label: 'Brain', icon: '🧠' },
  { id: 'habits', label: 'Habits', icon: '🔁' },
  { id: 'recovery', label: 'Recovery', icon: '🧘' },
  { id: 'science', label: 'Science', icon: '🔬' },
];
