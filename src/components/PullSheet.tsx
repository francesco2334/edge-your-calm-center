import { motion, AnimatePresence } from 'framer-motion';

interface PullSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPull: (pullId: string) => void;
}

const PULL_OPTIONS = [
  { id: 'scrolling', label: 'Scrolling', icon: '📱' },
  { id: 'porn', label: 'Porn', icon: '🔞' },
  { id: 'trading', label: 'Trading', icon: '📈' },
  { id: 'gambling', label: 'Gambling', icon: '🎰' },
  { id: 'spending', label: 'Spending', icon: '💳' },
  { id: 'avoidance', label: 'Avoidance', icon: '🙈' },
  { id: 'other', label: 'Other', icon: '❓' },
];

export function PullSheet({ isOpen, onClose, onSelectPull }: PullSheetProps) {
  const handleSelect = (pullId: string) => {
    onSelectPull(pullId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/30 overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            
            <div className="px-6 pb-8 safe-area-bottom">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                What pulled you today?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Be honest. This helps Mojo understand your patterns.
              </p>
              
              {/* Pull options grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PULL_OPTIONS.map((option, i) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelect(option.id)}
                    className="p-4 rounded-2xl bg-dopa-surface border border-border/30 hover:border-primary/40 hover:bg-muted/50 transition-all text-left"
                  >
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                  </motion.button>
                ))}
              </div>
              
              {/* No pull option */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => handleSelect('none')}
                className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                <span className="text-sm font-medium text-emerald-400">
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
