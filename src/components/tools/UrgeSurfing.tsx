import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { MojoOrb } from '../MojoOrb';
import { haptics } from '@/hooks/useHaptics';

interface UrgeSurfingProps {
  onComplete: (peakIntensity: number) => void;
  onCancel: () => void;
}

const TOTAL_DURATION = 60; // seconds

const WAVE_STAGES = [
  { label: 'The wave is building...', instruction: 'Notice it. Don\'t fight it.' },
  { label: 'Approaching the peak...', instruction: 'Breathe. Stay present.' },
  { label: 'At the peak now', instruction: 'This is the hardest part. You\'re doing it.' },
  { label: 'The wave is cresting...', instruction: 'It\'s starting to pass.' },
  { label: 'Easing down...', instruction: 'The intensity is fading.' },
  { label: 'Almost there...', instruction: 'You rode the wave.' },
];

export const UrgeSurfing = forwardRef<HTMLDivElement, UrgeSurfingProps>(
  function UrgeSurfing({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [intensity, setIntensity] = useState(3); // 1-10
    const [peakIntensity, setPeakIntensity] = useState(3);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [wavePosition, setWavePosition] = useState(0); // 0-1, representing wave cycle

    const startSurfing = () => {
      setPhase('active');
      haptics.selectionChanged();
    };

    // Main timer
    useEffect(() => {
      if (phase !== 'active') return;

      const timer = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= TOTAL_DURATION) {
            setPhase('complete');
            haptics.notifySuccess();
            return TOTAL_DURATION;
          }
          return prev + 1;
        });

        // Wave position cycles through the duration
        setWavePosition((prev) => {
          const newPos = (prev + 1 / TOTAL_DURATION);
          return newPos > 1 ? 0 : newPos;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [phase]);

    const handleIntensityChange = (delta: number) => {
      setIntensity((prev) => {
        const newVal = Math.max(1, Math.min(10, prev + delta));
        if (newVal > peakIntensity) {
          setPeakIntensity(newVal);
        }
        haptics.selectionChanged();
        return newVal;
      });
    };

    const getStageIndex = () => {
      return Math.min(Math.floor(wavePosition * WAVE_STAGES.length), WAVE_STAGES.length - 1);
    };

    const getWaveHeight = () => {
      // Simulate wave: rises to middle, peaks, then falls
      const progress = wavePosition;
      if (progress < 0.4) {
        return progress / 0.4; // Rising
      } else if (progress < 0.5) {
        return 1; // Peak
      } else {
        return 1 - ((progress - 0.5) / 0.5); // Falling
      }
    };

    if (phase === 'intro') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
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
                Urge Surfing
              </h1>
              <p className="text-muted-foreground text-sm">
                Ride the wave. Urges crest, then pass.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-12"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-teal-500/30 flex items-center justify-center">
                <Waves className="w-16 h-16 text-cyan-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="dopa-card mb-8"
            >
              <p className="text-sm text-muted-foreground text-center">
                Track your urge intensity as it rises and falls. The goal isn't to make it disappear—it's to observe it passing.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startSurfing}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Start Surfing
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Urge surfing was developed by Dr. Alan Marlatt for addiction recovery.
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'active') {
      const timeRemaining = TOTAL_DURATION - timeElapsed;
      const stage = WAVE_STAGES[getStageIndex()];
      const waveHeight = getWaveHeight();

      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          {/* Animated wave background */}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500/10 via-blue-500/5 to-transparent"
            animate={{ 
              height: `${30 + waveHeight * 40}%`,
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            {/* Wave visualization */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: 0.9 + waveHeight * 0.2,
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-teal-500/40 flex items-center justify-center border border-cyan-400/30">
                <Waves className="w-14 h-14 text-cyan-400" />
              </div>
            </motion.div>

            {/* Stage label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={getStageIndex()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-6"
              >
                <p className="text-xl font-medium text-foreground mb-1">
                  {stage.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stage.instruction}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Intensity tracker */}
            <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30 w-full max-w-sm mb-6">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Current urge intensity
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleIntensityChange(-1)}
                  className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground tabular-nums">{intensity}</p>
                  <p className="text-xs text-muted-foreground mt-1">out of 10</p>
                </div>
                <button
                  onClick={() => handleIntensityChange(1)}
                  className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <ArrowUp className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Time remaining */}
            <p className="text-muted-foreground text-sm mb-4 tabular-nums">
              {timeRemaining}s remaining
            </p>

            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-border/30 rounded-full overflow-hidden mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(timeElapsed / TOTAL_DURATION) * 100}%` }}
                className="h-full bg-cyan-500 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onCancel}
              className="text-muted-foreground text-xs underline"
            >
              Exit early
            </motion.button>
          </div>
        </div>
      );
    }

    // Complete phase
    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-teal-500/40 flex items-center justify-center mx-auto border border-cyan-400/30">
              <Check className="w-14 h-14 text-cyan-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-foreground mb-2"
          >
            Wave surfed
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mb-2"
          >
            You rode it out without acting.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs text-muted-foreground/70 mb-4"
          >
            Peak intensity: {peakIntensity}/10
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 inline-block"
          >
            <span className="text-primary font-medium">+1 Token earned</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onComplete(peakIntensity)}
            className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
          >
            Collect Token
          </motion.button>
        </div>
      </div>
    );
  }
);
