import { useState, useRef, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';
import { REAL_WORLD_COMPARISONS, getReactionTier, getPercentile, type ReactionLeaderboard } from '@/lib/reaction-data';

interface ReactionTrackerProps {
  onComplete: (reactionTimeMs: number) => void;
  onCancel: () => void;
  leaderboard: ReactionLeaderboard;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
}

export const ReactionTracker = forwardRef<HTMLDivElement, ReactionTrackerProps>(
  function ReactionTracker({ onComplete, onCancel, leaderboard }, ref) {
    const [phase, setPhase] = useState<'intro' | 'waiting' | 'react' | 'result'>('intro');
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [tapsInRound, setTapsInRound] = useState(0);
    const [roundPoints, setRoundPoints] = useState(0);
    const [showFlicker, setShowFlicker] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [flickerCount, setFlickerCount] = useState(0);
    const [totalReactionTime, setTotalReactionTime] = useState(0);
    const startTimeRef = useRef<number>(0);
    const flickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const roundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const FLICKERS_PER_ROUND = 5;

    const spawnExplosion = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      let clientX: number, clientY: number;
      
      if ('touches' in e) {
        clientX = e.touches[0]?.clientX || rect.left + rect.width / 2;
        clientY = e.touches[0]?.clientY || rect.top + rect.height / 2;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: clientX,
        y: clientY,
        angle: (i / 12) * 360,
        velocity: 80 + Math.random() * 60,
      }));
      
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 600);
    }, []);

    const startRound = useCallback(() => {
      setPhase('waiting');
      setFlickerCount(0);
      setTapsInRound(0);
      setTotalReactionTime(0);
      setRoundPoints(0);
      scheduleNextFlicker();
    }, []);

    const scheduleNextFlicker = useCallback(() => {
      const delay = 1500 + Math.random() * 2500; // 1.5-4 seconds
      flickerTimeoutRef.current = setTimeout(() => {
        startTimeRef.current = Date.now();
        setShowFlicker(true);
        setPhase('react');
        
        // Flicker visible for 300-700ms (randomized)
        const flickerDuration = 300 + Math.random() * 400;
        roundTimeoutRef.current = setTimeout(() => {
          setShowFlicker(false);
          // If still in react phase, user missed it
          setFlickerCount((prev) => {
            const next = prev + 1;
            if (next >= FLICKERS_PER_ROUND) {
              endRound();
            } else {
              setPhase('waiting');
              scheduleNextFlicker();
            }
            return next;
          });
        }, flickerDuration);
      }, delay);
    }, []);

    const handleReaction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (phase !== 'react' || !showFlicker) return;
      
      const time = Date.now() - startTimeRef.current;
      
      // Clear the flicker timeout since user tapped
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
      }
      
      // Explosion effect
      spawnExplosion(e);
      
      // Update stats
      setReactionTime(time);
      setTotalReactionTime((prev) => prev + time);
      setTapsInRound((prev) => prev + 1);
      setShowFlicker(false);
      
      // Check if round complete
      setFlickerCount((prev) => {
        const next = prev + 1;
        if (next >= FLICKERS_PER_ROUND) {
          endRound();
        } else {
          setPhase('waiting');
          scheduleNextFlicker();
        }
        return next;
      });
    }, [phase, showFlicker, spawnExplosion]);

    const endRound = useCallback(() => {
      if (flickerTimeoutRef.current) clearTimeout(flickerTimeoutRef.current);
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      
      // Calculate points: each tap = 0.33, every 3 taps = 1 full point
      const earnedPoints = Math.floor(tapsInRound / 3) + (tapsInRound % 3) * 0.33;
      setRoundPoints(Math.round(earnedPoints * 100) / 100);
      setPhase('result');
    }, [tapsInRound]);

    const handleComplete = useCallback(() => {
      const avgTime = tapsInRound > 0 ? Math.round(totalReactionTime / tapsInRound) : 999;
      onComplete(avgTime);
    }, [tapsInRound, totalReactionTime, onComplete]);

    // Cleanup on unmount
    const cleanup = useCallback(() => {
      if (flickerTimeoutRef.current) clearTimeout(flickerTimeoutRef.current);
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
    }, []);

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
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => { cleanup(); onCancel(); }}
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
                Catch the Flicker
              </h1>
              <p className="text-muted-foreground text-sm">
                Tap when you see the ring flash
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <MojoOrb state="calm" size="lg" />
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

            {/* Scoring explanation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="dopa-card mb-6"
            >
              <p className="text-sm text-muted-foreground mb-2">How scoring works:</p>
              <div className="text-xs text-muted-foreground/70 space-y-1">
                <p>• {FLICKERS_PER_ROUND} flickers per round</p>
                <p>• Each successful tap = 0.33 points</p>
                <p>• Every 3 taps = 1 full point</p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={startRound}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Start Test
            </motion.button>
          </div>
        </div>
      );
    }

    if (phase === 'waiting' || phase === 'react') {
      return (
        <div
          ref={ref}
          onClick={handleReaction}
          className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden cursor-pointer"
        >
          <div className={`absolute inset-0 transition-colors duration-100 ${showFlicker ? 'bg-primary/20' : 'bg-background'}`} />
          
          <div className="relative z-10 text-center">
            {/* Flicker ring around Mojo */}
            <div className="relative mb-8">
              <AnimatePresence>
                {showFlicker && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.3, opacity: 0 }}
                    className="absolute -inset-6 rounded-full border-4 border-primary"
                    style={{
                      boxShadow: '0 0 30px hsl(var(--primary) / 0.6), inset 0 0 20px hsl(var(--primary) / 0.3)',
                    }}
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                animate={{ scale: showFlicker ? 1.1 : 1 }}
                transition={{ duration: 0.1 }}
              >
                <MojoOrb state={showFlicker ? 'under-load' : 'calm'} size="lg" />
              </motion.div>
            </div>

            {/* Status text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-medium transition-colors ${showFlicker ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {showFlicker ? 'TAP NOW!' : 'Wait for it...'}
            </motion.p>

            {/* Progress indicator */}
            <p className="text-xs text-muted-foreground/60 mt-4">
              {flickerCount + 1} / {FLICKERS_PER_ROUND}
            </p>

            {/* Taps counter */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[13px] text-muted-foreground">Taps:</span>
              <span className="text-[15px] font-medium text-foreground">{tapsInRound}</span>
              <span className="text-[11px] text-muted-foreground/60">
                ({Math.floor(tapsInRound / 3)} pts + {tapsInRound % 3}/3)
              </span>
            </div>
          </div>

          {/* Explosion particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: particle.x,
                  y: particle.y,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: particle.x + Math.cos((particle.angle * Math.PI) / 180) * particle.velocity,
                  y: particle.y + Math.sin((particle.angle * Math.PI) / 180) * particle.velocity,
                  scale: 0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="fixed w-3 h-3 rounded-full bg-primary pointer-events-none z-50"
                style={{ left: 0, top: 0 }}
              />
            ))}
          </AnimatePresence>

          {/* Cancel button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              cleanup();
              onCancel();
            }}
            className="absolute bottom-24 text-muted-foreground/60 text-xs underline"
          >
            Exit
          </button>
        </div>
      );
    }

    // Result phase
    const avgTime = tapsInRound > 0 ? Math.round(totalReactionTime / tapsInRound) : 999;
    const isNewBest = avgTime < leaderboard.personalBest;
    const tier = getReactionTier(avgTime);
    const percentile = getPercentile(avgTime);
    const comparison = getClosestComparison(avgTime);

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <MojoOrb state="steady" size="lg" />
          </motion.div>

          {/* Taps result */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <p className="text-5xl font-bold text-foreground mb-1">
              {tapsInRound}/{FLICKERS_PER_ROUND}
            </p>
            <p className="text-muted-foreground text-sm">flickers caught</p>
          </motion.div>

          {/* Points earned */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 inline-block"
          >
            <span className="text-primary font-medium">+{Math.floor(tapsInRound / 3)} points earned</span>
          </motion.div>

          {/* Avg reaction time */}
          {tapsInRound > 0 && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm mb-1"
              >
                Average reaction: <span className="text-foreground font-medium">{avgTime}ms</span>
              </motion.p>

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
                    Faster than {percentile}%
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
                  New personal best!
                </motion.p>
              )}

              {/* Real world comparison */}
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
                </div>
              </motion.div>
            </>
          )}

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
);
