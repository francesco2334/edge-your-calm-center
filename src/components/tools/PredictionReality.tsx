import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';
import { MojoCompanion } from '../MojoCompanion';

interface PredictionRealityProps {
  onComplete: (prediction: number, reality: number) => void;
  onCancel: () => void;
}

const SCALE_OPTIONS = [
  { value: 1, label: 'Barely' },
  { value: 2, label: 'Mildly' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];

export const PredictionReality = forwardRef<HTMLDivElement, PredictionRealityProps>(
  function PredictionReality({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'predict' | 'activity' | 'reality' | 'result'>('predict');
    const [prediction, setPrediction] = useState<number | null>(null);
    const [reality, setReality] = useState<number | null>(null);

    const handlePrediction = (value: number) => {
      setPrediction(value);
      setPhase('activity');
    };

    const handleStartActivity = () => {
      setPhase('reality');
    };

    const handleReality = (value: number) => {
      setReality(value);
      setPhase('result');
    };

    const handleComplete = () => {
      if (prediction !== null && reality !== null) {
        onComplete(prediction, reality);
      }
    };

    if (phase === 'predict') {
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
                Prediction vs Reality
              </h1>
              <p className="text-muted-foreground text-sm">
                Calibrate your reward expectations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <MojoCompanion mood="thinking" size="md" message="How good will it feel?" showMessage />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="dopa-card mb-6"
            >
              <p className="text-foreground text-lg text-center mb-2">
                Before you do it:
              </p>
              <p className="text-muted-foreground text-sm text-center">
                How good do you think this will feel?
              </p>
            </motion.div>

            <div className="space-y-3">
              {SCALE_OPTIONS.map((option, i) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  onClick={() => handlePrediction(option.value)}
                  className="w-full p-4 rounded-xl text-left transition-all duration-200 border bg-dopa-surface border-border/30 hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-sm">{option.value}/5</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'activity') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 text-center max-w-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <MojoCompanion mood="encouraging" size="lg" message="Go try it out!" showMessage />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-2"
            >
              You predicted:
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-semibold text-foreground mb-8"
            >
              {SCALE_OPTIONS.find(o => o.value === prediction)?.label}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mb-12"
            >
              Go do the thing.
              <br />
              Come back when you're done.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleStartActivity}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              I'm done
            </motion.button>
          </div>
        </div>
      );
    }

    if (phase === 'reality') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Now be honest
              </h1>
              <p className="text-muted-foreground text-sm">
                How good did it actually feel?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <MojoCompanion mood="thinking" size="md" message="Be honest..." showMessage />
            </motion.div>

            <div className="space-y-3">
              {SCALE_OPTIONS.map((option, i) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  onClick={() => handleReality(option.value)}
                  className="w-full p-4 rounded-xl text-left transition-all duration-200 border bg-dopa-surface border-border/30 hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-sm">{option.value}/5</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Result phase
    const gap = prediction !== null && reality !== null ? prediction - reality : 0;
    const gapMessage = gap > 0 
      ? "Your brain oversold the reward. That's useful data."
      : gap < 0 
      ? "It was better than expected. Notice when that happens."
      : "Your prediction was accurate. Good calibration.";

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <MojoCompanion 
              mood={gap === 0 ? 'celebrating' : gap > 0 ? 'encouraging' : 'cheering'} 
              size="lg" 
              message={gap === 0 ? "Perfect!" : gap > 0 ? "Interesting..." : "Nice surprise!"}
              showMessage
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Predicted</p>
                <p className="text-2xl font-semibold text-foreground">{prediction}/5</p>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Actual</p>
                <p className="text-2xl font-semibold text-foreground">{reality}/5</p>
              </div>
            </div>

            {gap !== 0 && (
              <p className={`text-sm font-medium ${gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {gap > 0 ? `Overestimated by ${gap}` : `Underestimated by ${Math.abs(gap)}`}
              </p>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm mb-12"
          >
            {gapMessage}
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
);