import { motion } from 'framer-motion';
import { X, Check, Sparkles, Brain, Target, TrendingUp } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { Link } from 'react-router-dom';

interface PaywallScreenProps {
  onClose?: () => void;
  onSubscribe: () => void;
  onRestore: () => void;
  isRestoring?: boolean;
  isTrialGate?: boolean; // When true, this is the initial trial gate (no close button)
}

const PREMIUM_FEATURES = [
  { icon: Brain, label: 'Unlimited Mojo AI conversations' },
  { icon: Target, label: 'All impulse control tools unlocked' },
  { icon: TrendingUp, label: 'Advanced insights & analytics' },
  { icon: Sparkles, label: 'Personalized coaching strategies' },
];

export function PaywallScreen({ 
  onClose, 
  onSubscribe, 
  onRestore,
  isRestoring = false,
  isTrialGate = false 
}: PaywallScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col safe-area-inset"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top">
        {isTrialGate ? (
          <div className="w-10" /> // Spacer when no close button
        ) : (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={onRestore}
          disabled={isRestoring}
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {isRestoring ? 'Restoring...' : 'Restore'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe-bottom">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <MojoOrb state="steady" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Unlock Your Full Potential
          </h1>
          <p className="text-muted-foreground">
            Get unlimited access to all premium features
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-muted/30 rounded-2xl border border-border/30 p-5 space-y-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border-2 border-primary p-5">
            {/* Best Value Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                7-DAY FREE TRIAL
              </span>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground mb-1">Premium Monthly</p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-foreground">£7.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                after 7-day free trial
              </p>
            </div>

            {/* What's included */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" />
                <span>Cancel anytime during trial</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <button
            onClick={onSubscribe}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-colors"
          >
            Start Free Trial
          </button>
        </motion.div>

        {/* Apple-Required Legal Disclosures */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 pb-8"
        >
          {/* Auto-Renewal Terms */}
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/80">Subscription Terms:</strong> Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.
            </p>
          </div>

          {/* Trial Terms */}
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/80">Free Trial:</strong> If offered, any unused portion of a free trial period will be forfeited when you purchase a subscription. The trial converts to a paid subscription unless cancelled at least 24 hours before the trial ends.
            </p>
          </div>

          {/* How to Cancel */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-foreground/80 leading-relaxed">
              <strong>How to Cancel:</strong> Open the Settings app → Tap your name → Subscriptions → Select DopaMINE → Tap Cancel Subscription. You must cancel at least 24 hours before your trial or subscription renews to avoid being charged.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/terms" className="text-xs text-primary hover:underline">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/privacy" className="text-xs text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
