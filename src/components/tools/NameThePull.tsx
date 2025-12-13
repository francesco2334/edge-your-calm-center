import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';

interface NameThePullProps {
  onComplete: (feeling: string) => void;
  onCancel: () => void;
}

const FEELINGS = [
  { id: 'bored', label: 'Bored', desc: 'Nothing to do, seeking stimulation' },
  { id: 'stressed', label: 'Stressed', desc: 'Tension, pressure, overwhelm' },
  { id: 'lonely', label: 'Lonely', desc: 'Disconnected, craving connection' },
  { id: 'avoiding', label: 'Avoiding', desc: 'Running from something harder' },
  { id: 'restless', label: 'Restless', desc: 'Physically or mentally agitated' },
  { id: 'empty', label: 'Empty', desc: 'Low energy, seeking a boost' },
];

export const NameThePull = forwardRef<HTMLDivElement, NameThePullProps>(
  function NameThePull({ onComplete, onCancel }, ref) {
    const [selected, setSelected] = useState<string | null>(null);
    const [phase, setPhase] = useState<'select' | 'reflect' | 'complete'>('select');

    const handleSelect = (id: string) => {
      setSelected(id);
      setPhase('reflect');
    };

    const handleComplete = () => {
      setPhase('complete');
      setTimeout(() => {
        if (selected) onComplete(selected);
      }, 1500);
    };

    if (phase === 'select') {
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
                Name the Pull
              </h1>
              <p className="text-muted-foreground text-sm">
                Naming creates distance. What's underneath?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <MojoOrb state="under-load" size="md" />
            </motion.div>

            <div className="space-y-3">
              {FEELINGS.map((feeling, i) => (
                <motion.button
                  key={feeling.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  onClick={() => handleSelect(feeling.id)}
                  className="w-full p-4 rounded-xl text-left transition-all duration-200 border bg-dopa-surface border-border/30 hover:border-primary/30"
                >
                  <p className="text-foreground font-medium">{feeling.label}</p>
                  <p className="text-xs text-muted-foreground">{feeling.desc}</p>
                </motion.button>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Affect labelling reduces impulse strength.
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'reflect') {
      const selectedFeeling = FEELINGS.find((f) => f.id === selected);

      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 text-center max-w-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <MojoOrb state="regulating" size="lg" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-2"
            >
              You named it:
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-semibold text-foreground mb-6"
            >
              {selectedFeeling?.label}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mb-12"
            >
              The urge doesn't disappear.
              <br />
              But now there's space between you and it.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleComplete}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Continue
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
            <MojoOrb state="steady" size="lg" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-foreground text-lg"
          >
            +1 Charge
          </motion.p>
        </div>
      </div>
    );
  }
);