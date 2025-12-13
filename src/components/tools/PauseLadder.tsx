import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';

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
  const [personalBest, setPersonalBest] = useState(20); // Mock - would come from stats

  const startPause = useCallback((seconds: number) => {
    setSelectedLevel(seconds);
    setTimeRemaining(seconds);
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

  const handleComplete = () => {
    if (selectedLevel) {
      onComplete(selectedLevel);
    }
  };

  if (phase === 'select') {
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

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <MojoOrb state="regulating" size="lg" />
          </motion.div>

          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-light text-foreground mb-4 tabular-nums"
          >
            {timeRemaining}
          </motion.div>

          <p className="text-muted-foreground text-sm mb-8">
            Stay with this moment
          </p>

          {/* Simple progress bar */}
          <div className="w-48 h-1 bg-border/30 rounded-full mx-auto overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onCancel}
            className="mt-12 text-muted-foreground text-xs underline"
          >
            Exit early
          </motion.button>
        </div>
      </div>
    );
  }

  // Complete phase
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
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
