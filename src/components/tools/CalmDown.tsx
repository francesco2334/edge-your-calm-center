import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Sparkles } from 'lucide-react';

interface CalmDownProps {
  onComplete: (relaxationLevel: number) => void;
  onCancel: () => void;
}

const CALM_STEPS = [
  { 
    instruction: 'Close your eyes and take a deep breath',
    duration: 5,
    color: 'from-emerald-500/30',
    icon: '🌿'
  },
  { 
    instruction: 'Let your shoulders drop and relax',
    duration: 6,
    color: 'from-teal-500/30',
    icon: '🍃'
  },
  { 
    instruction: 'Unclench your jaw, soften your face',
    duration: 5,
    color: 'from-cyan-500/30',
    icon: '💧'
  },
  { 
    instruction: 'Feel the tension leaving your body',
    duration: 6,
    color: 'from-sky-500/30',
    icon: '🌸'
  },
  { 
    instruction: 'You are calm. You are in control.',
    duration: 5,
    color: 'from-violet-500/30',
    icon: '✨'
  },
];

export function CalmDown({ onComplete, onCancel }: CalmDownProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [relaxationLevel, setRelaxationLevel] = useState(5);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, [currentStep]);

  // Progress through steps
  useEffect(() => {
    if (isComplete) return;

    const step = CALM_STEPS[currentStep];
    const intervalMs = 100;
    const totalIntervals = (step.duration * 1000) / intervalMs;
    let count = 0;

    const interval = setInterval(() => {
      count++;
      setStepProgress((count / totalIntervals) * 100);

      if (count >= totalIntervals) {
        if (currentStep < CALM_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
          setStepProgress(0);
        } else {
          setIsComplete(true);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [currentStep, isComplete]);

  const handleComplete = useCallback(() => {
    onComplete(relaxationLevel);
  }, [onComplete, relaxationLevel]);

  const step = CALM_STEPS[currentStep];
  const overallProgress = ((currentStep + stepProgress / 100) / CALM_STEPS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${step.color} via-background to-background`}
        animate={{ 
          background: [
            `linear-gradient(135deg, ${step.color} 0%, transparent 50%, transparent 100%)`,
          ]
        }}
        transition={{ duration: 1 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central breathing orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full bg-gradient-radial from-primary/10 via-primary/5 to-transparent"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onCancel}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-border/20 z-10"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Step icon with glow */}
              <motion.div
                className="relative mb-8"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150" />
                <span className="relative text-7xl">{step.icon}</span>
              </motion.div>

              {/* Instruction */}
              <motion.p
                className="text-2xl font-medium text-foreground leading-relaxed mb-8"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {step.instruction}
              </motion.p>

              {/* Step indicator dots */}
              <div className="flex items-center gap-2 mb-6">
                {CALM_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < currentStep 
                        ? 'bg-primary w-2' 
                        : i === currentStep 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30'
                    }`}
                    animate={i === currentStep ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Step progress bar */}
              <div className="w-48 h-1 bg-muted-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary/60 rounded-full"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {/* Celebration burst */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.6, ease: 'backOut' }}
                className="relative mb-6"
              >
                <Sparkles className="w-16 h-16 text-primary" />
                <motion.div
                  className="absolute inset-0 blur-xl bg-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <h2 className="text-3xl font-bold text-foreground mb-2">
                You did it
              </h2>
              <p className="text-muted-foreground mb-8">
                Your calm is your superpower
              </p>

              {/* Relaxation rating */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  How relaxed do you feel now?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <motion.button
                      key={level}
                      onClick={() => setRelaxationLevel(level)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        level <= relaxationLevel
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleComplete}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Leaf className="w-5 h-5" />
                Claim Calm
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overall progress bar at bottom */}
      {!isComplete && (
        <div className="absolute bottom-20 left-8 right-8">
          <div className="w-full h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
