import { useState, useRef, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';
import { REAL_WORLD_COMPARISONS, getReactionTier, getPercentile, type ReactionLeaderboard } from '@/lib/reaction-data';
import { haptics } from '@/hooks/useHaptics';

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

interface FlickerTarget {
  id: number;
  x: number;
  y: number;
}

export const ReactionTracker = forwardRef<HTMLDivElement, ReactionTrackerProps>(
  function ReactionTracker({ onComplete, onCancel, leaderboard }, ref) {
    const [phase, setPhase] = useState<'intro' | 'waiting' | 'react' | 'result'>('intro');
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [tapsInRound, setTapsInRound] = useState(0);
    const [roundPoints, setRoundPoints] = useState(0);
    const [flickerTargets, setFlickerTargets] = useState<FlickerTarget[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [flickerCount, setFlickerCount] = useState(0);
    const [totalReactionTime, setTotalReactionTime] = useState(0);
    const [tapsThisFlicker, setTapsThisFlicker] = useState(0);
    const startTimeRef = useRef<number>(0);
    const flickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const roundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const FLICKERS_PER_ROUND = 5;
    const FLICKER_SIZE = 80; // Size of tappable target

    const spawnExplosion = useCallback((x: number, y: number) => {
      const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i + Math.random() * 1000,
        x,
        y,
        angle: (i / 12) * 360,
        velocity: 80 + Math.random() * 60,
      }));
      
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 600);
    }, []);

    const getRandomPosition = useCallback(() => {
      const padding = 60;
      const maxX = window.innerWidth - FLICKER_SIZE - padding;
      const maxY = window.innerHeight - FLICKER_SIZE - padding - 100; // Account for bottom nav
      
      return {
        x: padding + Math.random() * maxX,
        y: padding + Math.random() * maxY,
      };
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
      const delay = 800 + Math.random() * 1500; // 0.8-2.3 seconds
      flickerTimeoutRef.current = setTimeout(() => {
        startTimeRef.current = Date.now();
        setTapsThisFlicker(0);
        
        // Spawn 1-3 flickers at random positions
        const numFlickers = 1 + Math.floor(Math.random() * 2);
        const newTargets: FlickerTarget[] = Array.from({ length: numFlickers }, (_, i) => ({
          id: Date.now() + i,
          ...getRandomPosition(),
        }));
        
        setFlickerTargets(newTargets);
        setPhase('react');
        
        // Flickers visible for 800-1500ms (longer to allow multiple taps)
        const flickerDuration = 800 + Math.random() * 700;
        roundTimeoutRef.current = setTimeout(() => {
          setFlickerTargets([]);
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
    }, [getRandomPosition]);

    const handleFlickerTap = useCallback((targetId: number, x: number, y: number) => {
      if (phase !== 'react') return;
      
      const time = Date.now() - startTimeRef.current;
      
      // Explosion effect + haptic
      spawnExplosion(x + FLICKER_SIZE / 2, y + FLICKER_SIZE / 2);
      haptics.tapMedium();
      
      // Update stats
      setReactionTime(time);
      setTotalReactionTime((prev) => prev + time);
      setTapsInRound((prev) => prev + 1);
      setTapsThisFlicker((prev) => prev + 1);
      
      // Remove the tapped target
      setFlickerTargets(prev => prev.filter(t => t.id !== targetId));
    }, [phase, spawnExplosion]);

    const endRound = useCallback(() => {
      if (flickerTimeoutRef.current) clearTimeout(flickerTimeoutRef.current);
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      
      // Calculate points: each tap = 0.33, every 3 taps = 1 full point
      const earnedPoints = Math.floor(tapsInRound / 3) + (tapsInRound % 3) * 0.33;
      setRoundPoints(Math.round(earnedPoints * 100) / 100);
      setPhase('result');
      haptics.notifySuccess();
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

    const hasFlickers = flickerTargets.length > 0;

    if (phase === 'waiting' || phase === 'react') {
      return (
        <div
          ref={ref}
          className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden"
        >
          <div className={`absolute inset-0 transition-colors duration-100 ${hasFlickers ? 'bg-primary/10' : 'bg-background'}`} />
          
          {/* Random position flicker targets */}
          <AnimatePresence>
            {flickerTargets.map((target) => (
              <motion.button
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => handleFlickerTap(target.id, target.x, target.y)}
                className="fixed z-30 rounded-full bg-primary flex items-center justify-center"
                style={{
                  left: target.x,
                  top: target.y,
                  width: FLICKER_SIZE,
                  height: FLICKER_SIZE,
                  boxShadow: '0 0 40px hsl(var(--primary) / 0.8), 0 0 80px hsl(var(--primary) / 0.4)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="w-4 h-4 rounded-full bg-primary-foreground"
                />
              </motion.button>
            ))}
          </AnimatePresence>
          
          <div className="relative z-10 text-center">
            {/* Mojo stays in center as reference */}
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: hasFlickers ? 0.9 : 1, opacity: hasFlickers ? 0.5 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <MojoOrb state={hasFlickers ? 'under-load' : 'calm'} size="lg" />
              </motion.div>
            </div>

            {/* Status text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-medium transition-colors ${hasFlickers ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {hasFlickers ? 'TAP THE ORBS!' : 'Wait for it...'}
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
            className="absolute bottom-24 text-muted-foreground/60 text-xs underline z-20"
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
              {tapsInRound}
            </p>
            <p className="text-muted-foreground text-sm">targets tapped</p>
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
