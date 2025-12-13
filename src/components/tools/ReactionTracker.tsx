import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';
import { REAL_WORLD_COMPARISONS, getReactionTier, getPercentile, type ReactionLeaderboard } from '@/lib/reaction-data';

interface ReactionTrackerProps {
  onComplete: (reactionTimeMs: number) => void;
  onCancel: () => void;
  leaderboard: ReactionLeaderboard;
}

export function ReactionTracker({ onComplete, onCancel, leaderboard }: ReactionTrackerProps) {
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'react' | 'result'>('intro');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setPhase('waiting');
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

  // Find closest real-world comparison
  const getClosestComparison = (ms: number) => {
    let closest = REAL_WORLD_COMPARISONS[0];
    let minDiff = Math.abs(ms - closest.time);
    
    for (const comp of REAL_WORLD_COMPARISONS) {
      const diff = Math.abs(ms - comp.time);
      if (diff < minDiff) {
        minDiff = diff;
        closest = comp;
      }
    }
    return closest;
  };

  if (phase === 'intro') {
    const tier = getReactionTier(leaderboard.personalBest);
    
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
            className="text-center mb-6"
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
            className="flex justify-center mb-6"
          >
            <MojoOrb state="calm" size="md" />
          </motion.div>

          {/* Personal stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="dopa-card mb-4"
          >
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {leaderboard.personalBest < 999 ? `${leaderboard.personalBest}ms` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-muted-foreground">
                  {leaderboard.averageTime > 0 ? `${leaderboard.averageTime}ms` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Your average</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-primary">{leaderboard.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Attempts</p>
              </div>
            </div>
          </motion.div>

          {/* Tier badge */}
          {leaderboard.personalBest < 999 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-center mb-4"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm text-primary font-medium">{tier.label}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  Top {100 - leaderboard.percentile}%
                </span>
              </span>
            </motion.div>
          )}

          {/* Leaderboard - Real world comparisons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="dopa-card mb-6"
          >
            <p className="text-sm text-muted-foreground mb-3">Real World Comparison</p>
            <div className="space-y-2">
              {REAL_WORLD_COMPARISONS.map((comp, i) => {
                const isBetterThanThis = leaderboard.personalBest < 999 && leaderboard.personalBest <= comp.time;
                return (
                  <motion.div
                    key={comp.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      isBetterThanThis ? 'bg-primary/10 border border-primary/20' : 'bg-dopa-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{comp.icon}</span>
                      <span className={`text-sm ${isBetterThanThis ? 'text-primary' : 'text-foreground'}`}>
                        {comp.label}
                      </span>
                    </div>
                    <span className={`text-sm tabular-nums ${isBetterThanThis ? 'text-primary' : 'text-muted-foreground'}`}>
                      {comp.time}ms
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={startTest}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
          >
            Start Test
          </motion.button>
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
  const isNewBest = reactionTime !== null && reactionTime < leaderboard.personalBest;
  const tier = getReactionTier(reactionTime || 999);
  const percentile = getPercentile(reactionTime || 999);
  const comparison = reactionTime ? getClosestComparison(reactionTime) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      
      <div className="relative z-10 text-center max-w-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
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

        {/* Tier badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm text-primary font-medium">{tier.label}</span>
            <span className="text-xs text-muted-foreground ml-2">
              Faster than {percentile}% of people
            </span>
          </span>
        </motion.div>

        {isNewBest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-emerald-400 text-sm font-medium mb-2"
          >
            🎉 New personal best!
          </motion.p>
        )}

        {/* Real world comparison */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="dopa-card mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Similar to:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{comparison.icon}</span>
              <span className="text-foreground font-medium">{comparison.label}</span>
              <span className="text-muted-foreground text-sm">({comparison.time}ms)</span>
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-sm mb-8"
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
