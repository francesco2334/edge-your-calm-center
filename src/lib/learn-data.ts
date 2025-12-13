// Topics/categories for Learn feed
export interface LearnTopic {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const LEARN_TOPICS: LearnTopic[] = [
  { id: 'dopamine', label: 'Dopamine', icon: '⚡', color: 'from-violet-500 to-purple-600' },
  { id: 'psychology', label: 'Psychology', icon: '🧠', color: 'from-pink-500 to-rose-600' },
  { id: 'habits', label: 'Habits', icon: '🔁', color: 'from-blue-500 to-indigo-600' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'from-cyan-500 to-teal-600' },
  { id: 'health', label: 'Health & Fitness', icon: '💪', color: 'from-green-500 to-emerald-600' },
  { id: 'productivity', label: 'Productivity', icon: '⏰', color: 'from-amber-500 to-orange-600' },
  { id: 'self-improvement', label: 'Self Improvement', icon: '🚀', color: 'from-rose-500 to-red-600' },
  { id: 'money', label: 'Money', icon: '💰', color: 'from-yellow-500 to-amber-600' },
  { id: 'technology', label: 'Technology', icon: '💻', color: 'from-slate-500 to-gray-600' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: 'from-red-500 to-pink-600' },
  { id: 'creativity', label: 'Creativity', icon: '🎨', color: 'from-fuchsia-500 to-purple-600' },
  { id: 'philosophy', label: 'Philosophy', icon: '💭', color: 'from-indigo-500 to-blue-600' },
];

// Card data for Learn feed
export interface LearnCard {
  id: string;
  topicId: string;
  title: string;
  content: string;
  fact?: string;
  tryThis?: string;
  imageUrl: string;
  gradient: string;
}

// Comprehensive card data with images
export const LEARN_CARDS: LearnCard[] = [
  // Dopamine
  {
    id: 'dopa-1',
    topicId: 'dopamine',
    title: "Dopamine isn't pleasure.",
    content: "It's anticipation. Your brain fires harder BEFORE the reward than during it. This is why cravings feel so intense but fulfillment fades fast.",
    fact: "Dopamine spikes 400% higher in anticipation than during consumption.",
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop",
    gradient: "from-violet-900/90 via-purple-900/80 to-background",
  },
  {
    id: 'dopa-2',
    topicId: 'dopamine',
    title: "Variable rewards hijack your brain.",
    content: "Unpredictable payoffs create the strongest dopamine loops. That's why scrolling is so hard to stop — you never know what's next.",
    fact: "Social media uses the same mechanism as slot machines.",
    tryThis: "Notice when you're scrolling 'just to see' — that's the loop.",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    gradient: "from-amber-900/90 via-orange-900/80 to-background",
  },
  {
    id: 'dopa-3',
    topicId: 'dopamine',
    title: "Your baseline matters more than spikes.",
    content: "High-stim activities spike dopamine then crash it below baseline. Low-stim activities raise your baseline without the crash.",
    fact: "It takes 2-4 hours to return to baseline after a big dopamine spike.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    gradient: "from-blue-900/90 via-indigo-900/80 to-background",
  },
  
  // Psychology
  {
    id: 'psych-1',
    topicId: 'psychology',
    title: "Your prefrontal cortex is your brake.",
    content: "It's the part of your brain that says 'wait' before you act. Every time you delay an impulse, you literally strengthen this muscle.",
    fact: "The prefrontal cortex isn't fully developed until age 25.",
    imageUrl: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=600&fit=crop",
    gradient: "from-pink-900/90 via-rose-900/80 to-background",
  },
  {
    id: 'psych-2',
    topicId: 'psychology',
    title: "Naming emotions cuts their power.",
    content: "When you label what you feel, your amygdala calms down. This is called 'affect labeling' — awareness creates distance from the feeling.",
    fact: "Labeling reduces amygdala activity by up to 50%.",
    tryThis: "Next time you feel an urge, say: 'I notice I'm feeling...'",
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop",
    gradient: "from-rose-900/90 via-pink-900/80 to-background",
  },
  {
    id: 'psych-3',
    topicId: 'psychology',
    title: "Your brain rewires itself.",
    content: "Every time you resist an urge, you strengthen new neural pathways. This is neuroplasticity — your brain literally changes shape based on behavior.",
    fact: "New neural pathways can form in as little as 21 days.",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    gradient: "from-emerald-900/90 via-green-900/80 to-background",
  },
  
  // Habits
  {
    id: 'habit-1',
    topicId: 'habits',
    title: "Every habit has a trigger.",
    content: "Cue → Routine → Reward. Breaking habits means interrupting this loop. Most triggers are context-based: location, time, or emotion.",
    fact: "Most habits are triggered by context, not willpower.",
    tryThis: "Track what happens RIGHT BEFORE your urges for 3 days.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop",
    gradient: "from-blue-900/90 via-indigo-900/80 to-background",
  },
  {
    id: 'habit-2',
    topicId: 'habits',
    title: "The 21-day myth is wrong.",
    content: "Habit formation actually takes 18-254 days depending on complexity. The average is 66 days. Be patient with yourself.",
    fact: "Simple habits form faster than complex ones.",
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop",
    gradient: "from-teal-900/90 via-cyan-900/80 to-background",
  },
  {
    id: 'habit-3',
    topicId: 'habits',
    title: "Implementation intentions work.",
    content: "Saying 'I will [behavior] at [time] in [location]' makes you 2-3x more likely to follow through. Specificity beats motivation.",
    fact: "Vague plans lead to vague results.",
    tryThis: "Write: 'When I feel [urge], I will [new behavior].'",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=600&fit=crop",
    gradient: "from-yellow-900/90 via-amber-900/80 to-background",
  },
  
  // Science
  {
    id: 'sci-1',
    topicId: 'science',
    title: "Urges peak at 90 seconds.",
    content: "Most cravings naturally fade after this time. If you can ride the wave for just 90 seconds, intensity drops dramatically.",
    fact: "Urge intensity drops 50% after just 10 seconds of delay.",
    tryThis: "Next urge: set a 90-second timer and just observe.",
    imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&h=600&fit=crop",
    gradient: "from-teal-900/90 via-cyan-900/80 to-background",
  },
  {
    id: 'sci-2',
    topicId: 'science',
    title: "Sleep restores dopamine.",
    content: "Your dopamine receptors need rest to reset. One bad night of sleep = significantly reduced impulse control the next day.",
    fact: "7-9 hours restores dopamine receptor function overnight.",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=600&fit=crop",
    gradient: "from-indigo-900/90 via-blue-900/80 to-background",
  },
  {
    id: 'sci-3',
    topicId: 'science',
    title: "Your brain overestimates rewards.",
    content: "The anticipation is always better than the reality. When you track predictions vs. actual experience, cravings weaken.",
    fact: "Accurate predictions reduce addictive dopamine spikes.",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    gradient: "from-amber-900/90 via-yellow-900/80 to-background",
  },
  
  // Health & Fitness
  {
    id: 'health-1',
    topicId: 'health',
    title: "Exercise naturally elevates dopamine.",
    content: "Physical activity raises your baseline dopamine without the crash. It's one of the healthiest ways to feel good.",
    fact: "30 minutes of exercise raises dopamine by 30% for 2+ hours.",
    tryThis: "Even a 10-minute walk can shift your state.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    gradient: "from-green-900/90 via-emerald-900/80 to-background",
  },
  {
    id: 'health-2',
    topicId: 'health',
    title: "Cold exposure builds willpower.",
    content: "Deliberately choosing discomfort trains your brain to override impulses. Cold showers are a daily willpower workout.",
    fact: "Cold water increases dopamine by 250% for several hours.",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop",
    gradient: "from-cyan-900/90 via-blue-900/80 to-background",
  },
  {
    id: 'health-3',
    topicId: 'health',
    title: "Slow breathing calms your nervous system.",
    content: "Your vagus nerve connects breath to brain. When you slow your breathing, your heart rate drops and cravings follow.",
    fact: "90 seconds of slow breathing can reset your nervous system.",
    tryThis: "Breathe in for 4, hold for 4, out for 8.",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    gradient: "from-teal-900/90 via-emerald-900/80 to-background",
  },
  
  // Productivity
  {
    id: 'prod-1',
    topicId: 'productivity',
    title: "Your attention is being mined.",
    content: "Apps are designed by the world's best engineers to capture and hold your focus. This isn't a fair fight — but awareness helps.",
    fact: "The average person touches their phone 2,617 times per day.",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    gradient: "from-red-900/90 via-orange-900/80 to-background",
  },
  {
    id: 'prod-2',
    topicId: 'productivity',
    title: "Multitasking is a myth.",
    content: "Your brain doesn't multitask — it rapidly switches. Each switch costs time and energy. Deep focus beats scattered attention.",
    fact: "Task switching can reduce productivity by up to 40%.",
    tryThis: "Try single-tasking for just one hour today.",
    imageUrl: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=600&fit=crop",
    gradient: "from-orange-900/90 via-amber-900/80 to-background",
  },
  {
    id: 'prod-3',
    topicId: 'productivity',
    title: "Boredom is productive.",
    content: "When you're bored, your brain enters 'default mode' — the state where creativity and problem-solving happen.",
    fact: "Our best ideas often come during unfocused time.",
    imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop",
    gradient: "from-slate-900/90 via-gray-900/80 to-background",
  },
  
  // Self Improvement
  {
    id: 'self-1',
    topicId: 'self-improvement',
    title: "Small wins compound.",
    content: "Don't aim for massive change. Tiny daily improvements of 1% lead to being 37x better in a year.",
    fact: "Consistency beats intensity for lasting change.",
    tryThis: "What's ONE tiny thing you can do today?",
    imageUrl: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&h=600&fit=crop",
    gradient: "from-rose-900/90 via-red-900/80 to-background",
  },
  {
    id: 'self-2',
    topicId: 'self-improvement',
    title: "Identity beats goals.",
    content: "Instead of 'I want to quit X', try 'I'm not someone who does X.' Identity-based change is more powerful than outcome-based.",
    fact: "Beliefs shape behavior more than willpower.",
    imageUrl: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&h=600&fit=crop",
    gradient: "from-purple-900/90 via-violet-900/80 to-background",
  },
  
  // Money
  {
    id: 'money-1',
    topicId: 'money',
    title: "Hedonic adaptation applies to money too.",
    content: "The happiness boost from more money fades quickly. After basic needs are met, experiences beat possessions.",
    fact: "Above ~$75K/year, more money doesn't increase daily happiness.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
    gradient: "from-yellow-900/90 via-amber-900/80 to-background",
  },
  {
    id: 'money-2',
    topicId: 'money',
    title: "Time > Money for happiness.",
    content: "People who value time over money report higher life satisfaction. You can always make more money, never more time.",
    fact: "Buying time (outsourcing chores) increases happiness.",
    imageUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=600&fit=crop",
    gradient: "from-green-900/90 via-emerald-900/80 to-background",
  },
  
  // Technology
  {
    id: 'tech-1',
    topicId: 'technology',
    title: "Notifications are designed to hook you.",
    content: "Every red badge, every buzz is engineered to trigger a dopamine response. Turn off non-essential notifications.",
    fact: "The average person receives 46 push notifications per day.",
    tryThis: "Turn off all non-essential notifications for 24 hours.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
    gradient: "from-slate-900/90 via-gray-900/80 to-background",
  },
  {
    id: 'tech-2',
    topicId: 'technology',
    title: "Infinite scroll is intentional.",
    content: "There's no natural stopping point because that's how they keep you scrolling. Add friction: set time limits.",
    fact: "People scroll an average of 300 feet per day on their phones.",
    imageUrl: "https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&h=600&fit=crop",
    gradient: "from-blue-900/90 via-indigo-900/80 to-background",
  },
  
  // Relationships
  {
    id: 'rel-1',
    topicId: 'relationships',
    title: "Connection is a basic need.",
    content: "Loneliness activates the same brain regions as physical pain. Real relationships — not parasocial ones — are essential.",
    fact: "Strong relationships are the #1 predictor of happiness.",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    gradient: "from-red-900/90 via-pink-900/80 to-background",
  },
  {
    id: 'rel-2',
    topicId: 'relationships',
    title: "Screens replace face time.",
    content: "Hours spent on devices often subtract from in-person connection. The brain knows the difference.",
    fact: "Face-to-face interaction releases oxytocin; screens don't.",
    tryThis: "Replace 30 mins of screen time with a call or hangout.",
    imageUrl: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&h=600&fit=crop",
    gradient: "from-pink-900/90 via-rose-900/80 to-background",
  },
  
  // Creativity
  {
    id: 'create-1',
    topicId: 'creativity',
    title: "Consumption kills creation.",
    content: "When you're constantly consuming (scrolling, watching), you have no mental space to create. Creation is where meaning lives.",
    fact: "Boredom is the birthplace of creativity.",
    tryThis: "Spend 20 minutes creating something today.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    gradient: "from-fuchsia-900/90 via-purple-900/80 to-background",
  },
  {
    id: 'create-2',
    topicId: 'creativity',
    title: "Flow state is the goal.",
    content: "Deep engagement in challenging work produces 'flow' — a state of effortless focus and fulfillment. Scrolling can't produce this.",
    fact: "Flow activates dopamine without the crash.",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
    gradient: "from-violet-900/90 via-indigo-900/80 to-background",
  },
  
  // Philosophy
  {
    id: 'phil-1',
    topicId: 'philosophy',
    title: "Pleasure ≠ Happiness.",
    content: "Ancient philosophers knew: pleasure is fleeting, meaning is lasting. Dopamine hits feel good but don't add up to a good life.",
    fact: "Aristotle called this 'eudaimonia' — flourishing through purpose.",
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop",
    gradient: "from-indigo-900/90 via-blue-900/80 to-background",
  },
  {
    id: 'phil-2',
    topicId: 'philosophy',
    title: "You're not your thoughts.",
    content: "Mindfulness teaches: thoughts and urges arise, but you choose whether to follow them. You are the observer, not the thought.",
    fact: "This is the foundation of cognitive behavioral therapy.",
    tryThis: "Watch your next urge like you're watching clouds pass.",
    imageUrl: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&fit=crop",
    gradient: "from-purple-900/90 via-violet-900/80 to-background",
  },
];

// Utility functions
export function getCardsByTopics(topicIds: string[]): LearnCard[] {
  if (topicIds.length === 0) return LEARN_CARDS;
  return LEARN_CARDS.filter(card => topicIds.includes(card.topicId));
}

export function shuffleCards(cards: LearnCard[]): LearnCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getTopicById(id: string): LearnTopic | undefined {
  return LEARN_TOPICS.find(t => t.id === id);
}

// Local storage keys
export const LEARN_STORAGE_KEYS = {
  selectedTopics: 'learn-selected-topics',
  hasSeenIntro: 'learn-has-seen-intro',
  likedCards: 'learn-liked-cards',
  hiddenCards: 'learn-hidden-cards',
} as const;
