import { motion } from 'framer-motion';
import { Clock, Sparkles, Brain, Target, TrendingUp, Check } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { Link } from 'react-router-dom';

interface TrialExpiredScreenProps {
  onSubscribe: () => void;
  onRestore: () => void;
  isRestoring?: boolean;
}

const PREMIUM_FEATURES = [
  { icon: Brain, label: 'Unlimited Mojo AI conversations' },
  { icon: Target, label: 'All impulse control tools' },
  { icon: TrendingUp, label: 'Advanced insights & analytics' },
  { icon: Sparkles, label: 'Personalized coaching' },
];

export function TrialExpiredScreen({ 
  onSubscribe, 
  onRestore,
  isRestoring = false 
}: TrialExpiredScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex items-center justify-end p-4 pt-safe-top">
        <button
          onClick={onRestore}
          disabled={isRestoring}
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {isRestoring ? 'Restoring...' : 'Restore Purchases'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-safe-bottom">
        {/* Mojo with clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6"
        >
          <MojoOrb state="calm" size="lg" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your Free Trial Has Ended
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Subscribe to continue building healthier habits with Mojo by your side
          </p>
        </motion.div>

        {/* Features reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm mb-8"
        >
          <div className="bg-muted/30 rounded-2xl border border-border/30 p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Keep access to
            </p>
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

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mb-6"
        >
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border-2 border-primary p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Premium Monthly</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-4xl font-bold text-foreground">£7.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <button
            onClick={onSubscribe}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-colors mb-4"
          >
            Subscribe Now
          </button>
        </motion.div>

        {/* Legal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm space-y-3"
        >
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Payment charged to Apple ID. Auto-renews unless cancelled 24h before period ends. 
            Manage in Settings → Apple ID → Subscriptions.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/terms" className="text-xs text-primary hover:underline">
              Terms
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/privacy" className="text-xs text-primary hover:underline">
              Privacy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
