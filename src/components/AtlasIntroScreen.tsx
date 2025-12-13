import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MojoIntroScreenProps {
  onContinue: () => void;
}

const MOJO_MESSAGES = [
  "You're not weak.",
  "Your system has learned to chase intensity.",
  "That's understandable — and reversible.",
];

const MOJO_EXPLANATION = [
  {
    title: "Impulse loops",
    text: "Your brain has created automatic pathways that bypass conscious choice. This isn't weakness — it's how learning works.",
  },
  {
    title: "Modern environments",
    text: "You're navigating a world designed to capture attention. The pull you feel is engineered.",
  },
  {
    title: "Why suppression fails",
    text: "Fighting impulses directly often strengthens them. Awareness and delay work better than force.",
  },
];

export function AtlasIntroScreen({ onContinue }: MojoIntroScreenProps) {
  const [stage, setStage] = useState<'intro' | 'explain'>('intro');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleIntroProgress = () => {
    if (messageIndex < MOJO_MESSAGES.length - 1) {
      setMessageIndex(messageIndex + 1);
    } else {
      setStage('explain');
      setTimeout(() => setShowExplanations(true), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-pulse opacity-35" />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Mojo avatar - Orb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 dopa-orb" />
          <div>
            <p className="text-sm font-medium text-foreground">Mojo</p>
            <p className="text-xs text-muted-foreground">Your Guide</p>
          </div>
        </motion.div>

        {/* Intro messages */}
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="space-y-4 mb-12">
                {MOJO_MESSAGES.slice(0, messageIndex + 1).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="dopa-card"
                  >
                    <p className="text-xl text-foreground">{msg}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="edge"
                size="lg"
                onClick={handleIntroProgress}
                className="w-full"
              >
                {messageIndex < MOJO_MESSAGES.length - 1 ? 'Continue' : 'Learn More'}
              </Button>
            </motion.div>
          )}

          {stage === 'explain' && (
            <motion.div
              key="explain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 space-y-4 mb-8">
                {showExplanations && MOJO_EXPLANATION.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.2 }}
                    className="dopa-card"
                  >
                    <p className="text-sm text-primary font-medium mb-2">{item.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="edge"
                  size="lg"
                  onClick={onContinue}
                  className="w-full"
                >
                  Continue with Mojo
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}