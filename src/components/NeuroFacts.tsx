import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Timer, TrendingUp, Sparkles } from 'lucide-react';

const NEURO_FACTS = [
  {
    icon: Brain,
    fact: "Neuroplasticity is real.",
    detail: "Your brain rewires based on repeated behaviors. Every resistance builds new pathways."
  },
  {
    icon: Zap,
    fact: "Dopamine isn't about pleasure.",
    detail: "It's about anticipation. The urge is stronger than the reward—your brain learns this."
  },
  {
    icon: Timer,
    fact: "Urges peak at 90 seconds.",
    detail: "Most cravings fade naturally if you wait. You're training delay tolerance right now."
  },
  {
    icon: Target,
    fact: "Attention is a muscle.",
    detail: "Each time you redirect focus, you strengthen prefrontal control over impulse."
  },
  {
    icon: TrendingUp,
    fact: "21 days rewires habits.",
    detail: "Consistent daily practice creates automatic neural pathways that require less effort."
  },
  {
    icon: Sparkles,
    fact: "Your baseline is shifting.",
    detail: "Reduced high-stimulation input lets dopamine receptors upregulate naturally."
  },
  {
    icon: Brain,
    fact: "The pause is the practice.",
    detail: "Every moment between urge and action is strengthening your anterior cingulate cortex."
  },
  {
    icon: Zap,
    fact: "Boredom is healing.",
    detail: "Feeling understimulated means your brain is recalibrating to normal dopamine levels."
  },
  {
    icon: Timer,
    fact: "Sleep repairs circuits.",
    detail: "Deep sleep consolidates new neural pathways—your regulation skills strengthen overnight."
  },
  {
    icon: Target,
    fact: "Naming reduces intensity.",
    detail: "Labeling emotions activates your prefrontal cortex and calms your amygdala by 50%."
  },
  {
    icon: TrendingUp,
    fact: "Small wins compound.",
    detail: "Each successful pause releases dopamine for self-control, not just consumption."
  },
  {
    icon: Sparkles,
    fact: "You're building immunity.",
    detail: "Repeated exposure to urges without acting trains your brain to tolerate discomfort."
  }
];

export function NeuroFacts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % NEURO_FACTS.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const current = NEURO_FACTS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-muted/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                {current.fact}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {current.detail}
              </p>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {NEURO_FACTS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
