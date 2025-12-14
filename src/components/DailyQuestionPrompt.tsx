import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';

interface DailyQuestionPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyQuestionPrompt({ isOpen, onClose }: DailyQuestionPromptProps) {
  const { currentQuestion, submitAnswer, skipToday } = useDailyQuestion();
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      submitAnswer(answer);
      setAnswer('');
      onClose();
    }
  };

  const handleSkip = () => {
    skipToday();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] border-t border-border/20 p-6 safe-area-bottom"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Skip"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <p className="text-[12px] text-muted-foreground/60 uppercase tracking-wider mb-2">
                Daily reflection
              </p>
              <h2 className="text-[22px] font-bold text-foreground leading-tight">
                {currentQuestion}
              </h2>
            </motion.div>

            {/* Answer input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Optional. Write as little or as much as you want..."
                className="w-full h-24 p-4 rounded-[16px] bg-muted/30 border border-border/20 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/30 transition-colors text-[15px]"
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-[14px] bg-muted/30 border border-border/15 text-[15px] font-medium text-muted-foreground hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                Skip for today
              </button>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="flex-1 py-3 rounded-[14px] bg-primary text-primary-foreground text-[15px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Save
              </button>
            </motion.div>

            {/* Note */}
            <p className="text-[12px] text-muted-foreground/40 text-center mt-4">
              No scoring. No streaks. Just reflection.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}