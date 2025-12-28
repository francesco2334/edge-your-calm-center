import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, ChevronDown } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';

interface BodyScanProps {
  onComplete: (areasChecked: number) => void;
  onCancel: () => void;
}

const BODY_AREAS = [
  { id: 'head', name: 'Head & Face', prompt: 'Notice any tension in your forehead, jaw, or around your eyes.' },
  { id: 'neck', name: 'Neck & Shoulders', prompt: 'Feel where you hold stress. Let your shoulders drop.' },
  { id: 'chest', name: 'Chest & Heart', prompt: 'Notice your breath. Is it shallow or deep?' },
  { id: 'stomach', name: 'Stomach & Core', prompt: 'Butterflies? Tightness? Just observe without judgment.' },
  { id: 'hands', name: 'Hands & Arms', prompt: 'Are your hands clenched? Let them soften.' },
  { id: 'legs', name: 'Legs & Feet', prompt: 'Feel your connection to the ground. You are here.' },
];

const HOLD_DURATION = 5; // seconds per area

export const BodyScan = forwardRef<HTMLDivElement, BodyScanProps>(
  function BodyScan({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
    const [areaProgress, setAreaProgress] = useState(0);
    const [checkedAreas, setCheckedAreas] = useState<Set<string>>(new Set());

    const startScan = () => {
      setPhase('active');
      haptics.selectionChanged();
    };

    // Timer for each area
    useEffect(() => {
      if (phase !== 'active') return;

      const timer = setInterval(() => {
        setAreaProgress((prev) => {
          if (prev >= HOLD_DURATION) {
            // Mark area as checked
            const currentArea = BODY_AREAS[currentAreaIndex];
            setCheckedAreas((checked) => new Set([...checked, currentArea.id]));
            haptics.selectionChanged();

            // Move to next area or complete
            if (currentAreaIndex >= BODY_AREAS.length - 1) {
              setPhase('complete');
              haptics.notifySuccess();
              return 0;
            } else {
              setCurrentAreaIndex((i) => i + 1);
              return 0;
            }
          }
          return prev + 0.1;
        });
      }, 100);

      return () => clearInterval(timer);
    }, [phase, currentAreaIndex]);

    const getBodyPosition = () => {
      // Returns Y position percentage for the scan line based on current area
      const positions = [10, 25, 40, 55, 70, 85]; // head to feet
      return positions[currentAreaIndex] || 50;
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
                Body Scan
              </h1>
              <p className="text-muted-foreground text-sm">
                Ground yourself. Notice without judging.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-12"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 flex items-center justify-center">
                <User className="w-16 h-16 text-emerald-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="dopa-card mb-8"
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                We'll move through 6 body areas. Hold focus on each for 5 seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {BODY_AREAS.map((area) => (
                  <span 
                    key={area.id}
                    className="px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startScan}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Begin Scan
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Body awareness interrupts the urge-action loop by engaging the present moment.
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'active') {
      const currentArea = BODY_AREAS[currentAreaIndex];
      const progress = areaProgress / HOLD_DURATION;

      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            {/* Body visualization */}
            <div className="relative w-32 mb-8">
              <div className="w-32 h-64 rounded-3xl bg-muted/20 border border-border/30 relative overflow-hidden">
                {/* Scan line */}
                <motion.div
                  animate={{ top: `${getBodyPosition()}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-8 -translate-y-1/2"
                >
                  <div className="h-full bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                </motion.div>
                
                {/* Checked area indicators */}
                {BODY_AREAS.map((area, i) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: checkedAreas.has(area.id) ? 1 : 0 }}
                    className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400"
                    style={{ top: `${[10, 25, 40, 55, 70, 85][i]}%` }}
                  />
                ))}
              </div>
              
              {/* Body icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <User className="w-20 h-48 text-foreground/10" />
              </div>
            </div>

            {/* Current area info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentArea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-6"
              >
                <p className="text-xl font-medium text-foreground mb-2">
                  {currentArea.name}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {currentArea.prompt}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress for current area */}
            <div className="w-48 mb-4">
              <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Area counter */}
            <p className="text-muted-foreground text-sm mb-8 tabular-nums">
              {currentAreaIndex + 1} of {BODY_AREAS.length} areas
            </p>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-muted-foreground/50"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onCancel}
              className="mt-8 text-muted-foreground text-xs underline"
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
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/40 via-green-500/30 to-teal-500/40 flex items-center justify-center mx-auto border border-emerald-400/30">
              <Check className="w-14 h-14 text-emerald-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-foreground mb-2"
          >
            Scan complete
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mb-2"
          >
            You're grounded in your body now.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs text-muted-foreground/70 mb-4"
          >
            {checkedAreas.size} areas scanned
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
            onClick={() => onComplete(checkedAreas.size)}
            className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
          >
            Collect Token
          </motion.button>
        </div>
      </div>
    );
  }
);
