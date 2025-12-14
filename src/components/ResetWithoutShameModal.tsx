import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ResetWithoutShameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBreathing: () => void;
  onMojo: () => void;
  context?: 'game-loss' | 'streak-break' | 'relapse';
}

const CONTEXT_MESSAGES = {
  'game-loss': {
    title: 'Nothing broke.',
    subtitle: 'A game is just practice. You showed up.',
  },
  'streak-break': {
    title: 'No progress was lost.',
    subtitle: 'Every day is a new chance to choose differently.',
  },
  'relapse': {
    title: 'This doesn\'t define you.',
    subtitle: 'One moment doesn\'t erase everything you\'ve built.',
  },
};

export function ResetWithoutShameModal({
  isOpen,
  onClose,
  onBreathing,
  onMojo,
  context = 'relapse',
}: ResetWithoutShameModalProps) {
  const messages = CONTEXT_MESSAGES[context];

  const handleBreathing = () => {
    onClose();
    onBreathing();
  };

  const handleMojo = () => {
    onClose();
    onMojo();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-card rounded-[28px] border border-border/20 p-6 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Message */}
              <div className="text-center mb-8 mt-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-[26px] font-bold text-foreground mb-2">
                    {messages.title}
                  </h2>
                  <p className="text-[16px] text-muted-foreground/80 font-medium">
                    {messages.subtitle}
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[15px] text-muted-foreground/60 mt-6"
                >
                  What do you want to do next?
                </motion.p>
              </div>

              {/* Three calm options */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <button
                  onClick={handleBreathing}
                  className="w-full p-4 rounded-[16px] bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/15 active:scale-[0.98] transition-all flex items-center gap-3"
                >
                  <span className="text-[24px]">🫁</span>
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-foreground">Breathe</p>
                    <p className="text-[12px] text-muted-foreground">Sync for 60 seconds</p>
                  </div>
                </button>

                <button
                  onClick={handleMojo}
                  className="w-full p-4 rounded-[16px] bg-accent/10 border border-accent/20 hover:bg-accent/15 active:scale-[0.98] transition-all flex items-center gap-3"
                >
                  <span className="text-[24px]">💬</span>
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-foreground">Write 1 sentence</p>
                    <p className="text-[12px] text-muted-foreground">Tell Mojo how you feel</p>
                  </div>
                </button>

                <button
                  onClick={onClose}
                  className="w-full p-4 rounded-[16px] bg-muted/30 border border-border/15 hover:bg-muted/50 active:scale-[0.98] transition-all flex items-center gap-3"
                >
                  <span className="text-[24px]">🚪</span>
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-foreground">Close the app</p>
                    <p className="text-[12px] text-muted-foreground">Come back when ready</p>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}