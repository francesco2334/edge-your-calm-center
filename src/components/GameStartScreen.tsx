import { forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { 
  GameDifficulty, 
  DIFFICULTY_CONFIG, 
  getStoredDifficulty, 
  setStoredDifficulty 
} from '@/lib/game-difficulty';

interface GameStartScreenProps {
  name: string;
  instruction: string;
  whyItWorks: string;
  icon: string;
  onStart: (difficulty: GameDifficulty) => void;
  onCancel: () => void;
}

export const GameStartScreen = forwardRef<HTMLDivElement, GameStartScreenProps>(
  function GameStartScreen({
    name,
    instruction,
    whyItWorks,
    icon,
    onStart,
    onCancel,
  }, ref) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(getStoredDifficulty);
    const [autoStartPaused, setAutoStartPaused] = useState(false);

    useEffect(() => {
      if (autoStartPaused) return;
      
      const timer = setTimeout(() => {
        setStoredDifficulty(selectedDifficulty);
        onStart(selectedDifficulty);
      }, 4000);

      return () => clearTimeout(timer);
    }, [onStart, selectedDifficulty, autoStartPaused]);

    const handleDifficultyChange = (difficulty: GameDifficulty) => {
      setStoredDifficulty(difficulty);
      onStart(difficulty);
    };

    const handleStart = () => {
      setStoredDifficulty(selectedDifficulty);
      onStart(selectedDifficulty);
    };

    return (
      <motion.div
        ref={ref}
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
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center overflow-y-auto">
          {/* Large icon */}
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-7xl mb-4"
          >
            {icon}
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[32px] font-bold text-foreground mb-3"
          >
            {name}
          </motion.h1>

          {/* Instruction */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[17px] text-foreground/80 leading-relaxed mb-6 max-w-xs"
          >
            {instruction}
          </motion.p>

          {/* Difficulty selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="w-full max-w-xs mb-6"
          >
            <p className="text-[12px] text-muted-foreground/60 uppercase tracking-wide mb-3 font-medium">
              Difficulty
            </p>
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_CONFIG) as GameDifficulty[]).map((diff) => {
                const config = DIFFICULTY_CONFIG[diff];
                const isSelected = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`flex-1 py-3 px-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10'
                        : 'bg-muted/30 border-border/20 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-xl block mb-1">{config.emoji}</span>
                    <span className={`text-[13px] font-semibold block ${isSelected ? config.color : 'text-muted-foreground'}`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2">
              {DIFFICULTY_CONFIG[selectedDifficulty].description}
            </p>
          </motion.div>

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
            onClick={handleStart}
            className="w-full py-4 rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[17px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            Start
          </button>
        </motion.div>
      </motion.div>
    );
  }
);
