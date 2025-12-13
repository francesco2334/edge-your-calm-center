import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Timer, TrendingUp, Sparkles } from 'lucide-react';
import { MojoOrb } from '../MojoOrb';

interface BreathingSyncProps {
  onComplete: () => void;
  onCancel: () => void;
}

const BREATH_CYCLE = {
  inhale: 4,
  hold: 2,
  exhale: 6,
};

const TOTAL_DURATION = 90; // seconds

const NEURO_FACTS = [
  { icon: Brain, fact: "Neuroplasticity is real.", detail: "Your brain rewires based on repeated behaviors. Every resistance builds new pathways." },
  { icon: Zap, fact: "Dopamine isn't about pleasure.", detail: "It's about anticipation. The urge is stronger than the reward." },
  { icon: Timer, fact: "Urges peak at 90 seconds.", detail: "Most cravings fade naturally if you wait. You're training delay tolerance right now." },
  { icon: Target, fact: "Attention is a muscle.", detail: "Each time you redirect focus, you strengthen prefrontal control." },
  { icon: TrendingUp, fact: "21 days rewires habits.", detail: "Consistent daily practice creates automatic neural pathways." },
  { icon: Sparkles, fact: "Your baseline is shifting.", detail: "Reduced stimulation lets dopamine receptors upregulate naturally." },
  { icon: Brain, fact: "Slow breathing calms you.", detail: "Deep breaths activate your vagus nerve and reduce stress hormones." },
  { icon: Zap, fact: "Boredom is healing.", detail: "Feeling understimulated means your brain is recalibrating." },
  { icon: Timer, fact: "Sleep repairs circuits.", detail: "Deep sleep consolidates new neural pathways overnight." },
  { icon: Target, fact: "Naming reduces intensity.", detail: "Labeling emotions calms your amygdala by 50%." },
  { icon: TrendingUp, fact: "Small wins compound.", detail: "Each successful pause releases dopamine for self-control." },
  { icon: Sparkles, fact: "You're building immunity.", detail: "Repeated exposure without acting trains tolerance." },
];

export function BreathingSync({ onComplete, onCancel }: BreathingSyncProps) {
  const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_DURATION);
  const [cycleTime, setCycleTime] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  const startBreathing = () => {
    setFactIndex(Math.floor(Math.random() * NEURO_FACTS.length));
    setPhase('active');
  };

  useEffect(() => {
    if (phase !== 'active') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });

      setCycleTime((prev) => {
        const next = prev + 1;
        const cycleLength = BREATH_CYCLE.inhale + BREATH_CYCLE.hold + BREATH_CYCLE.exhale;
        const position = next % cycleLength;

        if (position < BREATH_CYCLE.inhale) {
          setBreathPhase('inhale');
        } else if (position < BREATH_CYCLE.inhale + BREATH_CYCLE.hold) {
          setBreathPhase('hold');
        } else {
          setBreathPhase('exhale');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Rotate facts every 10 seconds during active phase
  useEffect(() => {
    if (phase !== 'active') return;

    const factTimer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % NEURO_FACTS.length);
    }, 10000);

    return () => clearInterval(factTimer);
  }, [phase]);

  const breathScale = breathPhase === 'inhale' ? 1.15 : breathPhase === 'exhale' ? 0.9 : 1;

  if (phase === 'intro') {
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
              Breathing Sync
            </h1>
            <p className="text-muted-foreground text-sm">
              90 seconds. Slow your system down.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-12"
          >
            <MojoOrb state="calm" size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="dopa-card mb-8"
          >
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-light text-foreground">{BREATH_CYCLE.inhale}s</p>
                <p className="text-xs text-muted-foreground">Breathe in</p>
              </div>
              <div>
                <p className="text-2xl font-light text-foreground">{BREATH_CYCLE.hold}s</p>
                <p className="text-xs text-muted-foreground">Hold</p>
              </div>
              <div>
                <p className="text-2xl font-light text-foreground">{BREATH_CYCLE.exhale}s</p>
                <p className="text-xs text-muted-foreground">Breathe out</p>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={startBreathing}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
          >
            Begin
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Slow breathing activates your vagus nerve and reduces craving intensity.
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'active') {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const currentFact = NEURO_FACTS[factIndex];
    const FactIcon = currentFact.icon;

    return (
      <div className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          {/* Breathing orb */}
          <motion.div
            animate={{ scale: breathScale }}
            transition={{ duration: breathPhase === 'inhale' ? BREATH_CYCLE.inhale : breathPhase === 'exhale' ? BREATH_CYCLE.exhale : 0.3, ease: 'easeInOut' }}
            className="mb-6"
          >
            <MojoOrb state="regulating" size="lg" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={breathPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-medium text-foreground mb-2"
            >
              {breathPhase === 'inhale' && 'Breathe in'}
              {breathPhase === 'hold' && 'Hold'}
              {breathPhase === 'exhale' && 'Breathe out'}
            </motion.p>
          </AnimatePresence>

          <p className="text-muted-foreground text-sm mb-6 tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')} remaining
          </p>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-border/30 rounded-full mx-auto overflow-hidden mb-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((TOTAL_DURATION - timeRemaining) / TOTAL_DURATION) * 100}%` }}
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
          System reset
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm mb-8"
        >
          Your nervous system is calmer now.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onComplete}
          className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
        >
          Collect Charge
        </motion.button>
      </div>
    </div>
  );
}
