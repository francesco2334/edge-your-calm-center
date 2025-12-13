import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface GameStartScreenProps {
  name: string;
  instruction: string;
  whyItWorks: string;
  icon: string;
  onStart: () => void;
  onCancel: () => void;
}

export function GameStartScreen({
  name,
  instruction,
  whyItWorks,
  icon,
  onStart,
  onCancel,
}: GameStartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-5">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-[13px] text-muted-foreground/60">Get ready</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Large icon */}
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-7xl mb-6"
        >
          {icon}
        </motion.span>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[32px] font-bold text-foreground mb-4"
        >
          {name}
        </motion.h1>

        {/* Instruction */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[17px] text-foreground/80 leading-relaxed mb-8 max-w-xs"
        >
          {instruction}
        </motion.p>

        {/* Why it works - subtle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-muted/30 border border-border/20 max-w-xs"
        >
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">Why this works:</span> {whyItWorks}
          </p>
        </motion.div>
      </div>

      {/* Start button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-5 safe-area-bottom"
      >
        <button
          onClick={onStart}
          className="w-full py-4 rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[17px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          Start
        </button>
      </motion.div>
    </motion.div>
  );
}
