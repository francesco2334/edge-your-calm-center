import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusTimerProps {
  minutes: number;
  tokensReward: number;
  label: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function FocusTimer({ minutes, tokensReward, label, onComplete, onCancel }: FocusTimerProps) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (isPaused || isComplete) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isComplete]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-pulse opacity-20" />

      {/* Close button */}
      {!isComplete && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground text-sm mb-2"
        >
          {label}
        </motion.p>

        {/* Timer ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="relative w-64 h-64 mb-8"
        >
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              opacity="0.3"
            />
            {/* Progress ring */}
            <motion.circle
              cx="128"
              cy="128"
              r="110"
              fill="none"
              stroke={isComplete ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progress)}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">Complete!</p>
                </motion.div>
              ) : (
                <motion.div key="timer" className="flex flex-col items-center">
                  <span className="text-5xl font-bold text-foreground font-mono">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">remaining</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-lg text-muted-foreground mb-2">
                You earned <span className="text-primary font-bold">+{tokensReward}</span> tokens!
              </p>
              <Button
                onClick={handleComplete}
                className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-glow"
              >
                Claim Reward
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="timer-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-muted-foreground text-sm max-w-xs">
                Stay focused. When the timer ends, you'll earn{' '}
                <span className="text-primary font-semibold">{tokensReward} tokens</span>.
              </p>
              
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
