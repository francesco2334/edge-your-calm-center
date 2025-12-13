import { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Timer, TrendingUp, Sparkles, Star } from 'lucide-react';
import { MojoOrb } from '../MojoOrb';

const NEURO_FACTS = [
  { icon: Brain, fact: "Urges peak quickly, then drop.", detail: "Most cravings fade naturally if you wait. You're training delay tolerance right now." },
  { icon: Zap, fact: "Attention follows novelty, not value.", detail: "Your brain chases what's new, not what's important. Awareness changes this." },
  { icon: Timer, fact: "Waiting rewires reward prediction.", detail: "Every moment between urge and action strengthens your cortex." },
  { icon: Target, fact: "The prefrontal cortex is trainable.", detail: "Each time you redirect focus, you strengthen impulse control." },
  { icon: TrendingUp, fact: "Dopamine exaggerates anticipation.", detail: "The urge is stronger than the reward. This is proven." },
  { icon: Sparkles, fact: "Your baseline is shifting.", detail: "Reduced stimulation lets dopamine receptors upregulate naturally." },
  { icon: Brain, fact: "Boredom is healing.", detail: "Feeling understimulated means your brain is recalibrating." },
  { icon: Zap, fact: "Small wins compound.", detail: "Each successful pause releases dopamine for self-control." },
];

interface PauseLadderProps {
  onComplete: (durationSeconds: number) => void;
  onCancel: () => void;
}

interface AntiCheatTap {
  id: number;
  x: number;
  y: number;
  spawnedAt: number;
}

export const PauseLadder = forwardRef<HTMLDivElement, PauseLadderProps>(
  function PauseLadder({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'active' | 'complete' | 'failed'>('active');
    const [timeHeld, setTimeHeld] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const [antiCheatTap, setAntiCheatTap] = useState<AntiCheatTap | null>(null);
    const [tapCount, setTapCount] = useState(0);
    const [personalBest, setPersonalBest] = useState(() => {
      const saved = localStorage.getItem('standoff_pb');
      return saved ? parseInt(saved) : 0;
    });

    // Timer counts UP
    useEffect(() => {
      if (phase !== 'active') return;

      const timer = setInterval(() => {
        setTimeHeld((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }, [phase]);

    // Rotate facts every 8 seconds
    useEffect(() => {
      if (phase !== 'active') return;

      const factTimer = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % NEURO_FACTS.length);
      }, 8000);

      return () => clearInterval(factTimer);
    }, [phase]);

    // Anti-cheat: spawn tap target every 15-25 seconds
    useEffect(() => {
      if (phase !== 'active') return;

      const scheduleNextTap = () => {
        const delay = 15000 + Math.random() * 10000; // 15-25 seconds
        return setTimeout(() => {
          // Random position in center area
          const x = 20 + Math.random() * 60; // 20-80% of width
          const y = 30 + Math.random() * 40; // 30-70% of height
          
          const newTap: AntiCheatTap = {
            id: Date.now(),
            x,
            y,
            spawnedAt: Date.now(),
          };
          setAntiCheatTap(newTap);
          
          // If not tapped within 3 seconds, fail
          setTimeout(() => {
            setAntiCheatTap((current) => {
              if (current && current.id === newTap.id) {
                setPhase('failed');
                return null;
              }
              return current;
            });
          }, 3000);
        }, delay);
      };

      const timeoutId = scheduleNextTap();
      return () => clearTimeout(timeoutId);
    }, [phase, tapCount]);

    const handleAntiCheatTap = useCallback(() => {
      if (antiCheatTap) {
        setAntiCheatTap(null);
        setTapCount((prev) => prev + 1);
        // Light haptic feedback would go here
      }
    }, [antiCheatTap]);

    const handleComplete = useCallback(() => {
      // Save personal best
      if (timeHeld > personalBest) {
        localStorage.setItem('standoff_pb', timeHeld.toString());
        setPersonalBest(timeHeld);
      }
      onComplete(timeHeld);
    }, [timeHeld, personalBest, onComplete]);

    const handleExit = useCallback(() => {
      if (timeHeld >= 10) {
        // Save if at least 10 seconds
        if (timeHeld > personalBest) {
          localStorage.setItem('standoff_pb', timeHeld.toString());
        }
        handleComplete();
      } else {
        onCancel();
      }
    }, [timeHeld, personalBest, handleComplete, onCancel]);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
      return `00:${secs.toString().padStart(2, '0')}`;
    };

    if (phase === 'failed') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <MojoOrb state="under-load" size="lg" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-foreground mb-2"
            >
              Missed the check
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-2"
            >
              Time held: {formatTime(timeHeld)}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground/60 text-xs mb-8"
            >
              Stay present. Tap the stars to prove you're here.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => onComplete(timeHeld)}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              {timeHeld >= 10 ? 'Collect Charge' : 'Try Again'}
            </motion.button>
          </div>
        </div>
      );
    }

    if (phase === 'complete') {
      const isNewBest = timeHeld > personalBest;
      const charge = timeHeld >= 60 ? 3 : timeHeld >= 40 ? 2 : 1;

      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <MojoOrb state="steady" size="lg" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-foreground mb-2 tabular-nums"
            >
              {formatTime(timeHeld)}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-2"
            >
              held without giving in
            </motion.p>

            {isNewBest && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-emerald-400 text-sm font-medium mb-4"
              >
                New personal best!
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 inline-block"
            >
              <span className="text-primary font-medium">+{charge} Charge earned</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleComplete}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Collect Charge
            </motion.button>
          </div>
        </div>
      );
    }

    // Active phase
    const currentFact = NEURO_FACTS[factIndex];
    const FactIcon = currentFact.icon;

    return (
      <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          {/* Time held - large and prominent */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2 text-center"
          >
            <p className="text-[13px] text-muted-foreground mb-1">Time Held</p>
            <motion.p
              key={timeHeld}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-6xl font-light text-foreground tabular-nums"
            >
              {formatTime(timeHeld)}
            </motion.p>
          </motion.div>

          {/* Personal best indicator */}
          {personalBest > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] text-muted-foreground/60 mb-6"
            >
              Personal best: {formatTime(personalBest)}
            </motion.p>
          )}

          {/* Mojo orb */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <MojoOrb state="regulating" size="lg" />
          </motion.div>

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

          {/* Anti-cheat tap target */}
          <AnimatePresence>
            {antiCheatTap && (
              <motion.button
                key={antiCheatTap.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleAntiCheatTap}
                style={{
                  position: 'absolute',
                  left: `${antiCheatTap.x}%`,
                  top: `${antiCheatTap.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-20"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Exit button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleExit}
            className="mt-10 text-muted-foreground text-xs underline"
          >
            {timeHeld >= 10 ? 'Finish & collect' : 'Exit early'}
          </motion.button>
        </div>
      </div>
    );
  }
);
