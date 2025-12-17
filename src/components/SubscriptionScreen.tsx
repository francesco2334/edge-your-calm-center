import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, RotateCcw, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, PRODUCT_IDS } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionScreenProps {
  onSubscribed: () => void;
  onSkip: () => void;
}

export function SubscriptionScreen({ onSubscribed, onSkip }: SubscriptionScreenProps) {
  const { toast } = useToast();
  const { startTrial, purchase, restorePurchases, isPurchasing } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleStartTrial = async () => {
    // Start the free trial (this would trigger StoreKit in native)
    const result = await purchase(PRODUCT_IDS.TRIAL);
    
    if (result.success) {
      startTrial();
      toast({
        title: 'Trial started!',
        description: '7 days of full access. Enjoy!'
      });
      onSubscribed();
    } else if (result.error) {
      // If purchase failed but we're in dev/web, start trial anyway
      if (result.error.includes('native iOS app')) {
        startTrial();
        toast({
          title: 'Trial started!',
          description: '7 days of full access.'
        });
        onSubscribed();
      } else {
        toast({
          title: 'Could not start trial',
          description: result.error,
          variant: 'destructive'
        });
      }
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    const result = await restorePurchases();
    
    if (result.restored) {
      toast({
        title: 'Purchases restored!',
        description: 'Welcome back!'
      });
      onSubscribed();
    } else if (result.success && !result.restored) {
      toast({
        title: 'No purchases found',
        description: 'Start a new subscription to continue'
      });
    } else if (result.error) {
      toast({
        title: 'Restore failed',
        description: result.error,
        variant: 'destructive'
      });
    }
    setIsRestoring(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden safe-area-inset">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12 safe-top safe-bottom">
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
            7 days of full access. Cancel anytime.
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
          className="space-y-3 mb-8"
        >
          {[
            'Unlimited access to all tools',
            'Track your progress over time',
            'AI-powered guidance with Mojo',
            'Daily streaks & rewards',
            'Cloud sync (signed in users)',
          ].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground text-sm">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6"
        >
          <Shield className="w-4 h-4" />
          <span>No payment required to start</span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={handleStartTrial}
            disabled={isPurchasing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isPurchasing ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Start 7-Day Free Trial'
            )}
          </button>

          {/* Restore purchases */}
          <button
            onClick={handleRestore}
            disabled={isRestoring || isPurchasing}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          {/* Skip option */}
          <button
            onClick={onSkip}
            disabled={isPurchasing}
            className="w-full py-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            No thanks, continue with limited access
          </button>

          <p className="text-center text-xs text-muted-foreground mt-2">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  );
}
