import { motion } from 'framer-motion';
import { Leaf, AlertCircle } from 'lucide-react';

interface DailyPullGateProps {
  onLogPull: () => void;
}

export function DailyPullGate({ onLogPull }: DailyPullGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-background" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-400/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-500/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-3"
        >
          Log Today's Pull First
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          Before you play, take a moment to check in with yourself. 
          What's pulling at you today? This helps you build awareness.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onLogPull}
          className="w-full py-4 rounded-full bg-amber-500 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.98] transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Leaf className="w-5 h-5" />
          Log My Pull
        </motion.button>

        {/* Why text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground/60 mt-6"
        >
          Awareness before action. This is how we build new patterns.
        </motion.p>
      </div>
    </motion.div>
  );
}
