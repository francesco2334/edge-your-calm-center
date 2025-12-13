import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PaywallScreenProps {
  onSubscribe: () => void;
  onSkip: () => void;
}

export function PaywallScreen({ onSubscribe, onSkip }: PaywallScreenProps) {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-pulse opacity-30" />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {!showPricing ? (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md mx-auto"
            >
              {/* Orb */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-16 h-16 mx-auto dopa-orb mb-10"
              />

              {/* Hard truth */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6"
              >
                Your attention is being{' '}
                <span className="text-gradient-accent">heavily mined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground leading-relaxed mb-8"
              >
                You can keep letting systems decide for you —
                <br />
                or you can start taking control today.
              </motion.p>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-16 h-px bg-border mx-auto mb-8"
              />

              {/* Not passive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="dopa-card mb-10"
              >
                <p className="text-foreground font-medium mb-2">
                  Dopa<span className="text-primary">MINE</span> isn't passive.
                </p>
                <p className="text-muted-foreground text-sm">
                  It only works if you actually use it.
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="edge"
                  size="lg"
                  onClick={() => setShowPricing(true)}
                  className="w-full"
                >
                  Show me
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md mx-auto"
            >
              {/* Price */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
                  Full Access
                </p>
                <p className="text-5xl md:text-6xl font-bold text-foreground">
                  £9.99
                  <span className="text-lg text-muted-foreground font-normal">/month</span>
                </p>
              </motion.div>

              {/* What's included */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="dopa-card mb-8 text-left"
              >
                <p className="text-sm text-muted-foreground mb-4">Everything unlocked:</p>
                <div className="space-y-3">
                  {[
                    'Unlimited Mirrors',
                    'The Exchange (earn & spend tokens)',
                    'Mojo — your personal guide',
                    'All regulation tools',
                    'Progress insights & tracking',
                    'All modes (Focus, Reset, Flow)',
                  ].map((feature, i) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs">✓</span>
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* The honest line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground italic mb-8"
              >
                This is where people usually close the app.
              </motion.p>

              {/* Final message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-foreground font-medium mb-8"
              >
                If you're in, you're in.
                <br />
                <span className="text-muted-foreground font-normal">If not, nothing changes.</span>
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <Button
                  variant="edge"
                  size="lg"
                  onClick={onSubscribe}
                  className="w-full"
                >
                  I'm in
                </Button>
                
                <button
                  onClick={onSkip}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Not today
                </button>
              </motion.div>

              {/* No tricks */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-muted-foreground mt-6"
              >
                Cancel anytime. No questions. No tricks.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}