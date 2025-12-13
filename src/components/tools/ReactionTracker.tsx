import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';

interface ReactionTrackerProps {
  onComplete: (reactionTimeMs: number) => void;
  onCancel: () => void;
}

export function ReactionTracker({ onComplete, onCancel }: ReactionTrackerProps) {
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'react' | 'result'>('intro');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [personalBest, setPersonalBest] = useState(850); // Mock - would come from stats
  const [averageTime, setAverageTime] = useState(1200); // Mock average
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setPhase('waiting');
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      startTimeRef.current = Date.now();
      setPhase('react');
    }, delay);
  };

  const handleReaction = () => {
    if (phase === 'react') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setPhase('result');
    }
  };

  const handleComplete = () => {
    if (reactionTime !== null) {
      onComplete(reactionTime);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
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
              Reaction Time
            </h1>
            <p className="text-muted-foreground text-sm">
              How quickly do you notice urges?
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
            className="dopa-card mb-6"
          >
            <div className="flex justify-around text-center">
              <div>
                <p className="text-xl font-medium text-foreground">{personalBest}ms</p>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </div>
              <div>
                <p className="text-xl font-medium text-muted-foreground">{averageTime}ms</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="dopa-card mb-8"
          >
            <p className="text-foreground text-sm mb-2">How it works:</p>
            <ol className="text-muted-foreground text-sm space-y-2">
              <li>1. Wait for Mojo to change</li>
              <li>2. Tap as fast as you can</li>
              <li>3. Track your awareness speed</li>
            </ol>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={startTest}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
          >
            Start
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Faster awareness = stronger prefrontal control.
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <MojoOrb state="calm" size="lg" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-lg"
          >
            Wait for it...
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'react') {
    return (
      <button
        onClick={handleReaction}
        className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 bg-primary/10" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-8"
          >
            <MojoOrb state="under-load" size="lg" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-foreground text-2xl font-semibold"
          >
            TAP NOW
          </motion.p>
        </div>
      </button>
    );
  }

  // Result phase
  const isNewBest = reactionTime !== null && reactionTime < personalBest;
  const improvement = reactionTime !== null ? averageTime - reactionTime : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      
      <div className="relative z-10 text-center max-w-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <MojoOrb state="steady" size="lg" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm mb-2"
        >
          Your reaction time:
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-light text-foreground mb-2 tabular-nums"
        >
          {reactionTime}ms
        </motion.h2>

        {isNewBest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-emerald-400 text-sm font-medium mb-4"
          >
            New personal best!
          </motion.p>
        )}

        {!isNewBest && improvement > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary text-sm mb-4"
          >
            {improvement}ms faster than average
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-sm mb-12"
        >
          This speed translates to real-world impulse awareness.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleComplete}
          className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
