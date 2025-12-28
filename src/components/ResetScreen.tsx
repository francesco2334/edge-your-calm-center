import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Timer, Pause, Wind, Target, Brain } from 'lucide-react';
import { MojoOrb } from './MojoOrb';

interface ResetScreenProps {
  onStartReset: (type: 'quick' | 'sync' | 'name' | 'standoff') => void;
  onOpenMojo: () => void;
}

const RESET_OPTIONS = [
  {
    id: 'quick',
    label: '20s Reset',
    icon: Timer,
    duration: '20 seconds',
    description: 'Quick pause to break the loop',
    color: 'from-primary/20 to-primary/5',
    primary: true,
  },
  {
    id: 'sync',
    label: 'Breathing Sync',
    icon: Wind,
    duration: '2-3 minutes',
    description: '4-7-8 breathing to calm your system',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    id: 'name',
    label: 'Name the Pull',
    icon: Target,
    duration: '1 minute',
    description: 'Identify what\'s pulling you',
    color: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    id: 'standoff',
    label: 'Urge Standoff',
    icon: Pause,
    duration: '2-5 minutes',
    description: 'Wait it out with guidance',
    color: 'from-amber-500/20 to-amber-500/5',
  },
];

export function ResetScreen({ onStartReset, onOpenMojo }: ResetScreenProps) {
  const [selectedReset, setSelectedReset] = useState<string | null>(null);

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-20" />

      <div className="relative z-10 px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset</h1>
          <p className="text-muted-foreground">
            Interrupt the urge. Reclaim your attention.
          </p>
        </motion.div>

        {/* Mojo companion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={onOpenMojo}
            className="focus:outline-none active:scale-95 transition-transform"
          >
            <MojoOrb state="calm" size="md" />
          </button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute mt-24 text-sm text-muted-foreground"
          >
            Tap Mojo for a guided reset
          </motion.p>
        </motion.div>

        {/* Quick Reset - Primary CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onStartReset('quick')}
          className="w-full mb-6 p-6 rounded-2xl bg-gradient-neon border border-primary/30 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Play className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-primary-foreground">Start a Reset</h2>
              <p className="text-primary-foreground/70 text-sm">20 seconds to break the loop</p>
            </div>
          </div>
        </motion.button>

        {/* Other reset options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground font-medium mb-3">More reset tools</p>
          
          {RESET_OPTIONS.filter(o => !o.primary).map((option, i) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => onStartReset(option.id as any)}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${option.color} border border-border/20 hover:border-border/40 active:scale-[0.98] transition-all text-left`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-foreground/80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/60">{option.duration}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "The goal is to interrupt, not to resist forever."
        </motion.p>
      </div>
    </div>
  );
}
