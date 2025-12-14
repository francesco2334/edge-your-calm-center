import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Gamepad2, MessageCircle } from 'lucide-react';

interface TriggerRoutingProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: string | null;
  onLearnCard: () => void;
  onGame: (gameId: string) => void;
  onMojo: () => void;
}

// Trigger-specific content routing
const TRIGGER_ROUTING: Record<string, {
  learnCard: { title: string; description: string };
  game: { id: string; name: string; description: string };
  mojoPrompt: string;
}> = {
  gambling: {
    learnCard: {
      title: 'Near-misses hijack dopamine',
      description: 'Why your brain treats almost-winning like winning',
    },
    game: {
      id: 'breathing',
      name: 'Sync',
      description: '60s grounding reset',
    },
    mojoPrompt: 'Talk about gambling urges',
  },
  scrolling: {
    learnCard: {
      title: 'Boredom feels urgent but isn\'t',
      description: 'Why your brain mistakes stillness for danger',
    },
    game: {
      id: 'pause',
      name: 'The Standoff',
      description: 'Practice holding the urge',
    },
    mojoPrompt: 'Talk about compulsive scrolling',
  },
  porn: {
    learnCard: {
      title: 'Novelty vs intimacy',
      description: 'How superstimuli reshape expectations',
    },
    game: {
      id: 'name',
      name: 'Name It',
      description: 'Identify the feeling underneath',
    },
    mojoPrompt: 'Talk about urges without judgment',
  },
  trading: {
    learnCard: {
      title: 'Risk-seeking under stress',
      description: 'Why losses make us take bigger gambles',
    },
    game: {
      id: 'prediction',
      name: 'The Bluff',
      description: 'Catch your brain exaggerating',
    },
    mojoPrompt: 'Talk about trading anxiety',
  },
  spending: {
    learnCard: {
      title: 'Retail therapy is a myth',
      description: 'The hedonic treadmill of purchases',
    },
    game: {
      id: 'pause',
      name: 'The Standoff',
      description: 'Delay the impulse',
    },
    mojoPrompt: 'Talk about spending urges',
  },
  avoidance: {
    learnCard: {
      title: 'Avoidance feeds anxiety',
      description: 'Why dodging discomfort makes it worse',
    },
    game: {
      id: 'name',
      name: 'Name It',
      description: 'What are you avoiding?',
    },
    mojoPrompt: 'Talk about what you\'re avoiding',
  },
  other: {
    learnCard: {
      title: 'Understanding your triggers',
      description: 'Patterns reveal pathways to change',
    },
    game: {
      id: 'breathing',
      name: 'Sync',
      description: 'Center yourself first',
    },
    mojoPrompt: 'Talk about what pulled you',
  },
  none: {
    learnCard: {
      title: 'Clear days matter',
      description: 'Building momentum through small wins',
    },
    game: {
      id: 'reaction',
      name: 'Catch the Flicker',
      description: 'Sharpen your awareness',
    },
    mojoPrompt: 'Celebrate the clear day',
  },
};

export function TriggerRouting({ 
  isOpen, 
  onClose, 
  trigger, 
  onLearnCard, 
  onGame, 
  onMojo 
}: TriggerRoutingProps) {
  const routing = trigger ? TRIGGER_ROUTING[trigger] || TRIGGER_ROUTING.other : null;

  if (!routing) return null;

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[28px] border-t border-border/20"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="px-6 pb-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">What helps right now</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Based on: {trigger === 'none' ? 'Clear day' : trigger}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Options - 3 calm choices */}
              <div className="space-y-3">
                {/* Learn Card */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    onLearnCard();
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl bg-muted/30 border border-border/15 text-left hover:bg-muted/40 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{routing.learnCard.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{routing.learnCard.description}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Game */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => {
                    onGame(routing.game.id);
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl bg-muted/30 border border-border/15 text-left hover:bg-muted/40 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{routing.game.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{routing.game.description}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Mojo */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    onMojo();
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl bg-muted/30 border border-border/15 text-left hover:bg-muted/40 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Talk to Mojo</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{routing.mojoPrompt}</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Skip option */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onClose}
                className="w-full mt-4 py-3 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Skip for now
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { TRIGGER_ROUTING };
