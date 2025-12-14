import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EarnConfirmModalProps {
  isOpen: boolean;
  option: {
    id: string;
    label: string;
    icon: string;
    tokensEarned: number;
    description: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_PROMPTS: Record<string, { title: string; question: string; confirmText: string }> = {
  'anchor-task': {
    title: 'Anchor Task Complete',
    question: 'Did you complete an important priority task instead of scrolling?',
    confirmText: 'Yes, I did it',
  },
  'early-exit': {
    title: 'Exit Loop Early',
    question: 'Did you catch yourself about to open a dopamine app and stop before the hook?',
    confirmText: 'Yes, I stopped myself',
  },
  'delay-impulse': {
    title: 'Delay Impulse',
    question: 'Did you pause and wait at least 10 seconds before acting on an impulse?',
    confirmText: 'Yes, I paused',
  },
};

export function EarnConfirmModal({ isOpen, option, onConfirm, onCancel }: EarnConfirmModalProps) {
  const prompt = CONFIRM_PROMPTS[option.id] || {
    title: option.label,
    question: `Did you complete: ${option.description}?`,
    confirmText: 'Yes, confirm',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{option.icon}</span>
                <h3 className="text-lg font-semibold text-foreground">{prompt.title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question */}
            <p className="text-muted-foreground mb-6">{prompt.question}</p>

            {/* Reward preview */}
            <div className="bg-primary/10 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reward</span>
              <span className="text-xl font-bold text-primary">+{option.tokensEarned} ⚡</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                <Check className="w-4 h-4" />
                {prompt.confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
