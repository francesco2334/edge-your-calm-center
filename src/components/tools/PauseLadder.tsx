import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Timer, TrendingUp, Sparkles } from 'lucide-react';
import { MojoOrb } from '../MojoOrb';

const NEURO_FACTS = [
  { icon: Brain, fact: "Neuroplasticity is real.", detail: "Your brain rewires based on repeated behaviors. Every resistance builds new pathways." },
  { icon: Zap, fact: "Dopamine isn't about pleasure.", detail: "It's about anticipation. The urge is stronger than the reward." },
  { icon: Timer, fact: "Urges peak at 90 seconds.", detail: "Most cravings fade naturally if you wait. You're training delay tolerance right now." },
  { icon: Target, fact: "Attention is a muscle.", detail: "Each time you redirect focus, you strengthen prefrontal control." },
  { icon: TrendingUp, fact: "21 days rewires habits.", detail: "Consistent daily practice creates automatic neural pathways." },
  { icon: Sparkles, fact: "Your baseline is shifting.", detail: "Reduced stimulation lets dopamine receptors upregulate naturally." },
  { icon: Brain, fact: "The pause is the practice.", detail: "Every moment between urge and action strengthens your cortex." },
  { icon: Zap, fact: "Boredom is healing.", detail: "Feeling understimulated means your brain is recalibrating." },
  { icon: Timer, fact: "Sleep repairs circuits.", detail: "Deep sleep consolidates new neural pathways overnight." },
  { icon: Target, fact: "Naming reduces intensity.", detail: "Labeling emotions calms your amygdala by 50%." },
  { icon: TrendingUp, fact: "Small wins compound.", detail: "Each successful pause releases dopamine for self-control." },
  { icon: Sparkles, fact: "You're building immunity.", detail: "Repeated exposure without acting trains tolerance." },
];

interface PauseLadderProps {
  onComplete: (durationSeconds: number) => void;
  onCancel: () => void;
}

const PAUSE_LEVELS = [
  { seconds: 10, label: '10 seconds', charge: 1 },
  { seconds: 20, label: '20 seconds', charge: 1 },
  { seconds: 40, label: '40 seconds', charge: 2 },
  { seconds: 60, label: '60 seconds', charge: 3 },
];

export function PauseLadder({ onComplete, onCancel }: PauseLadderProps) {
  const [phase, setPhase] = useState<'select' | 'active' | 'complete'>('select');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [personalBest, setPersonalBest] = useState(20);
  const [factIndex, setFactIndex] = useState(0);

  const startPause = useCallback((seconds: number) => {
    setSelectedLevel(seconds);
    setTimeRemaining(seconds);
    setFactIndex(Math.floor(Math.random() * NEURO_FACTS.length));
    setPhase('active');
  }, []);

  useEffect(() => {
    if (phase !== 'active' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  // Rotate facts every 10 seconds during active phase
  useEffect(() => {
    if (phase !== 'active') return;

    const factTimer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % NEURO_FACTS.length);
    }, 10000);

    return () => clearInterval(factTimer);
  }, [phase]);

  const handleComplete = () => {
    if (selectedLevel) {
      onComplete(selectedLevel);
    }
  };

  if (phase === 'select') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onCancel}
            className="mb-6 text-muted-foreground text-sm"
          >
            ← Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              The Pause Ladder
            </h1>
            <p className="text-muted-foreground text-sm">
              Train your delay tolerance. Start where you are.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <MojoOrb state="calm" size="md" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-3 rounded-xl bg-dopa-surface border border-border/30 text-center"
          >
            <span className="text-xs text-muted-foreground">Personal best: </span>
            <span className="text-sm text-foreground">{personalBest}s</span>
          </motion.div>

          <div className="space-y-3">
            {PAUSE_LEVELS.map((level, i) => (
              <motion.button
                key={level.seconds}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => startPause(level.seconds)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                  level.seconds <= personalBest
                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                    : 'bg-dopa-surface border-border/30 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{level.label}</p>
                    <p className="text-xs text-muted-foreground">
                      +{level.charge} Charge on completion
                    </p>
                  </div>
                  {level.seconds <= personalBest && (
                    <span className="text-xs text-primary">Achieved</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Impulse intensity drops sharply after 10–60 seconds.
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'active') {
    const progress = selectedLevel ? ((selectedLevel - timeRemaining) / selectedLevel) * 100 : 0;
    const currentFact = NEURO_FACTS[factIndex];
    const FactIcon = currentFact.icon;

    return (
      <div className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <MojoOrb state="regulating" size="lg" />
          </motion.div>

          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-light text-foreground mb-2 tabular-nums"
          >
            {timeRemaining}
          </motion.div>

          <p className="text-muted-foreground text-sm mb-6">
            Stay with this moment
          </p>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-border/30 rounded-full mx-auto overflow-hidden mb-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Rotating Neuro Facts */}
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-muted/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FactIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {currentFact.fact}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentFact.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onCancel}
            className="mt-10 text-muted-foreground text-xs underline"
          >
            Exit early
          </motion.button>
        </div>
      </div>
    );
  }

  // Complete phase
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <MojoOrb state="steady" size="lg" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-foreground mb-2"
        >
          {selectedLevel}s completed
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm mb-8"
        >
          Your delay tolerance is trainable.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleComplete}
          className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
        >
          Collect Charge
        </motion.button>
      </div>
    </div>
  );
}
