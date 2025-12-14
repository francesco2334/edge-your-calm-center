import { motion } from 'framer-motion';
import { Check, Shield, Zap } from 'lucide-react';

interface TrialScreenProps {
  onAccept: () => void;
  daysRemaining?: number;
}

export function TrialScreen({ onAccept, daysRemaining = 7 }: TrialScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Start Your Free Trial
          </h1>
          <p className="text-muted-foreground">
            {daysRemaining} days of full access. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            For those who <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold">WANT</span> change
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          {[
            'Unlimited access to all tools',
            'Track your progress over time',
            'AI-powered guidance with Mojo',
            'Daily streaks & rewards',
            'No payment required to start',
          ].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-8"
        >
          <Shield className="w-4 h-4" />
          <span>No credit card required</span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={onAccept}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  );
}
