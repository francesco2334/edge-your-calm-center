import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalContext, type EmotionalState } from '@/hooks/useEmotionalContext';

interface PullSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPull: (pullId: string) => void;
}

const PULL_OPTIONS = [
  { id: 'scrolling', label: 'Scrolling', icon: '📱', emotionalState: 'craving' as EmotionalState },
  { id: 'porn', label: 'Porn', icon: '🔞', emotionalState: 'craving' as EmotionalState },
  { id: 'trading', label: 'Trading', icon: '📈', emotionalState: 'anxious' as EmotionalState },
  { id: 'gambling', label: 'Gambling', icon: '🎰', emotionalState: 'craving' as EmotionalState },
  { id: 'spending', label: 'Spending', icon: '💳', emotionalState: 'craving' as EmotionalState },
  { id: 'avoidance', label: 'Avoidance', icon: '🙈', emotionalState: 'boredom' as EmotionalState },
  { id: 'other', label: 'Other', icon: '❓', emotionalState: 'neutral' as EmotionalState },
];

export function PullSheet({ isOpen, onClose, onSelectPull }: PullSheetProps) {
  const { logState } = useEmotionalContext();

  const handleSelect = (pullId: string, emotionalState?: EmotionalState) => {
    // Log emotional state based on pull type
    if (emotionalState && emotionalState !== 'neutral') {
      logState(emotionalState);
    } else if (pullId === 'none') {
      logState('calm');
    }
    onSelectPull(pullId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/75 backdrop-blur-lg z-50"
          />
          
          {/* iOS-style Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 420 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[32px] border-t border-border/15 overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center py-4">
              <div className="w-12 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            
            <div className="px-6 pb-10 safe-area-bottom">
              {/* Title - Large, clear */}
              <h2 className="text-[24px] font-bold text-foreground mb-1.5">
                What pulled you today?
              </h2>
              <p className="text-[15px] text-muted-foreground/70 mb-7 font-medium">
                Be honest. This helps Mojo understand your patterns.
              </p>
              
              {/* Pull options - 2 column grid with large touch targets */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                  {PULL_OPTIONS.map((option, i) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.035 }}
                      onClick={() => handleSelect(option.id, option.emotionalState)}
                      className="p-4 rounded-[18px] bg-muted/35 border border-border/15 hover:border-primary/25 hover:bg-muted/50 active:scale-[0.97] transition-all text-left"
                    >
                      <span className="text-[32px] mb-2.5 block">{option.icon}</span>
                      <span className="text-[15px] font-semibold text-foreground">{option.label}</span>
                    </motion.button>
                  ))}
              </div>
              
              {/* No pull option - Full width, positive */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleSelect('none')}
                className="w-full p-4 rounded-[18px] bg-emerald-500/12 border border-emerald-500/20 hover:bg-emerald-500/18 active:scale-[0.98] transition-all"
              >
                <span className="text-[15px] font-semibold text-emerald-400">
                  ✨ No strong pull today
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}