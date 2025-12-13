import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Brain, Zap, Timer, Target, TrendingUp, Sparkles, ChevronUp, Share2, Heart } from 'lucide-react';

// Educational facts - TikTok style bite-sized knowledge
const EDUCATION_FACTS = [
  {
    id: '1',
    category: 'Dopamine',
    title: 'Dopamine isn\'t pleasure.',
    content: 'It\'s anticipation. Your brain fires harder BEFORE the reward than during it. This is why cravings feel so intense but fulfillment fades fast.',
    stat: 'Dopamine spikes 400% higher in anticipation than during consumption.',
    icon: '⚡',
    gradient: 'from-violet-900 via-purple-900 to-background',
    color: 'text-violet-400',
  },
  {
    id: '2',
    category: 'Brain Science',
    title: 'Your prefrontal cortex is your brake.',
    content: 'It\'s the part of your brain that says "wait" before you act. Every time you delay an impulse, you literally strengthen this muscle.',
    stat: 'The prefrontal cortex isn\'t fully developed until age 25.',
    icon: '🧠',
    gradient: 'from-pink-900 via-rose-900 to-background',
    color: 'text-pink-400',
  },
  {
    id: '3',
    category: 'Habit Science',
    title: 'Variable rewards are addictive.',
    content: 'Unpredictable payoffs create the strongest dopamine loops. That\'s why scrolling is so hard to stop — you never know what\'s next.',
    stat: 'Social media uses the same mechanism as slot machines.',
    icon: '🎰',
    gradient: 'from-amber-900 via-orange-900 to-background',
    color: 'text-amber-400',
  },
  {
    id: '4',
    category: 'Recovery',
    title: 'Urges peak at 90 seconds.',
    content: 'Most cravings naturally fade after this time. If you can ride the wave for just 90 seconds, intensity drops dramatically.',
    stat: 'Urge intensity drops 50% after just 10 seconds of delay.',
    icon: '⏱️',
    gradient: 'from-teal-900 via-cyan-900 to-background',
    color: 'text-teal-400',
  },
  {
    id: '5',
    category: 'Neuroplasticity',
    title: 'Your brain rewires itself.',
    content: 'Every time you resist an urge, you strengthen new neural pathways. This is neuroplasticity — your brain literally changes shape based on behavior.',
    stat: 'New neural pathways can form in as little as 21 days.',
    icon: '🔄',
    gradient: 'from-emerald-900 via-green-900 to-background',
    color: 'text-emerald-400',
  },
  {
    id: '6',
    category: 'Emotion Science',
    title: 'Naming emotions cuts their power.',
    content: 'When you label what you feel, your amygdala calms down. This is called "affect labeling" — awareness creates distance from the feeling.',
    stat: 'Labeling reduces amygdala activity by up to 50%.',
    icon: '📍',
    gradient: 'from-rose-900 via-pink-900 to-background',
    color: 'text-rose-400',
  },
  {
    id: '7',
    category: 'Sleep Science',
    title: 'Sleep restores dopamine.',
    content: 'Your dopamine receptors need rest to reset. One bad night of sleep = significantly reduced impulse control the next day.',
    stat: '7-9 hours restores dopamine receptor function overnight.',
    icon: '😴',
    gradient: 'from-indigo-900 via-blue-900 to-background',
    color: 'text-indigo-400',
  },
  {
    id: '8',
    category: 'Attention',
    title: 'Your attention is being mined.',
    content: 'Apps are designed by the world\'s best engineers to capture and hold your focus. This isn\'t a fair fight — but awareness helps.',
    stat: 'The average person touches their phone 2,617 times per day.',
    icon: '📱',
    gradient: 'from-red-900 via-orange-900 to-background',
    color: 'text-red-400',
  },
  {
    id: '9',
    category: 'Habit Loop',
    title: 'Every habit has a trigger.',
    content: 'Cue → Routine → Reward. Breaking habits means interrupting this loop. Most triggers are context-based: location, time, or emotion.',
    stat: 'Most habits are triggered by context, not willpower.',
    icon: '🔁',
    gradient: 'from-blue-900 via-indigo-900 to-background',
    color: 'text-blue-400',
  },
  {
    id: '10',
    category: 'Breathing',
    title: 'Slow breathing calms your nervous system.',
    content: 'Your vagus nerve connects breath to brain. When you slow your breathing, your heart rate drops and cravings follow.',
    stat: '90 seconds of slow breathing can reset your nervous system.',
    icon: '🫁',
    gradient: 'from-teal-900 via-emerald-900 to-background',
    color: 'text-teal-400',
  },
  {
    id: '11',
    category: 'Prediction Error',
    title: 'Your brain overestimates rewards.',
    content: 'The anticipation is always better than the reality. When you track predictions vs. actual experience, cravings weaken.',
    stat: 'Accurate predictions reduce addictive dopamine spikes.',
    icon: '🎯',
    gradient: 'from-amber-900 via-yellow-900 to-background',
    color: 'text-amber-400',
  },
  {
    id: '12',
    category: 'Exercise',
    title: 'Exercise naturally elevates dopamine.',
    content: 'Physical activity raises your baseline dopamine without the crash. It\'s one of the healthiest ways to feel good.',
    stat: '30 minutes of exercise raises dopamine by 30% for 2+ hours.',
    icon: '🏃',
    gradient: 'from-green-900 via-emerald-900 to-background',
    color: 'text-green-400',
  },
];

interface LearnFeedProps {
  onClose?: () => void;
}

export function LearnFeed({ onClose }: LearnFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [likes, setLikes] = useState<Set<string>>(new Set());

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -threshold || velocity < -500) {
      if (currentIndex < EDUCATION_FACTS.length - 1) {
        setDirection('up');
        setCurrentIndex(prev => prev + 1);
      }
    } else if (offset > threshold || velocity > 500) {
      if (currentIndex > 0) {
        setDirection('down');
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex]);

  const toggleLike = (id: string) => {
    setLikes(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(id)) {
        newLikes.delete(id);
      } else {
        newLikes.add(id);
      }
      return newLikes;
    });
  };

  const currentFact = EDUCATION_FACTS[currentIndex];

  const variants = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 z-20">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / EDUCATION_FACTS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card container - full screen */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.15 },
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Full screen gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentFact.gradient}`} />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end pb-24 px-6">
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-3xl">{currentFact.icon}</span>
              <span className={`text-sm font-medium uppercase tracking-wider ${currentFact.color}`}>
                {currentFact.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[28px] font-bold text-foreground mb-4 leading-tight"
            >
              {currentFact.title}
            </motion.h1>

            {/* Content */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[17px] text-foreground/80 leading-relaxed mb-6"
            >
              {currentFact.content}
            </motion.p>

            {/* Stat box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-sm"
            >
              <p className="text-[13px] text-muted-foreground mb-1">The science:</p>
              <p className="text-[15px] text-foreground font-medium">{currentFact.stat}</p>
            </motion.div>
          </div>

          {/* Side actions - TikTok style */}
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
            <button
              onClick={() => toggleLike(currentFact.id)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full ${likes.has(currentFact.id) ? 'bg-rose-500' : 'bg-foreground/10'} flex items-center justify-center transition-colors`}>
                <Heart className={`w-6 h-6 ${likes.has(currentFact.id) ? 'text-white fill-white' : 'text-foreground'}`} />
              </div>
              <span className="text-xs text-foreground/60">Save</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xs text-foreground/60">Share</span>
            </button>
          </div>

          {/* Swipe hint */}
          {currentIndex < EDUCATION_FACTS.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronUp className="w-6 h-6 text-foreground/50" />
              </motion.div>
              <span className="text-xs text-foreground/40">Swipe up</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Counter */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-foreground/10 backdrop-blur-sm">
        <span className="text-sm text-foreground/70 tabular-nums">
          {currentIndex + 1} / {EDUCATION_FACTS.length}
        </span>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-foreground text-xl">×</span>
        </button>
      )}
    </div>
  );
}
