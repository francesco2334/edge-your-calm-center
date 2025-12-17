import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, User, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AuthGateScreenProps {
  onContinue: () => void;
  onSignedIn: () => void;
}

export function AuthGateScreen({ onContinue, onSignedIn }: AuthGateScreenProps) {
  const { signInWithApple } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleAppleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const { error } = await signInWithApple();
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signed in successfully',
          description: 'Your progress will be synced across devices',
        });
        onSignedIn();
      }
    } catch (err) {
      toast({
        title: 'Sign in failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden safe-area-inset">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12 safe-top safe-bottom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30"
          >
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Save Your Progress
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            Sign in to sync your journey across all your devices
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {[
            { icon: '🔄', text: 'Sync across all your devices' },
            { icon: '☁️', text: 'Never lose your streak or tokens' },
            { icon: '🔒', text: 'Secure and private' },
          ].map((benefit, i) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30"
            >
              <span className="text-xl">{benefit.icon}</span>
              <span className="text-foreground text-sm">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Sign in with Apple - Primary */}
          <Button
            onClick={handleAppleSignIn}
            disabled={isSigningIn}
            className="w-full h-14 rounded-2xl bg-foreground text-background font-semibold text-base flex items-center justify-center gap-3 hover:bg-foreground/90"
          >
            <Apple className="w-5 h-5" />
            {isSigningIn ? 'Signing in...' : 'Sign in with Apple'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Continue as Guest */}
          <button
            onClick={handleContinueAsGuest}
            className="w-full py-4 rounded-2xl border border-border/50 text-foreground font-medium flex items-center justify-center gap-3 hover:bg-muted/30 transition-colors"
          >
            <User className="w-5 h-5 text-muted-foreground" />
            Continue as Guest
          </button>

          {/* Guest warning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80">
              <strong className="text-amber-500">Guest warning:</strong> Your progress will be saved on this device only. 
              If you uninstall the app or switch devices, your data may be lost.
            </p>
          </motion.div>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}
