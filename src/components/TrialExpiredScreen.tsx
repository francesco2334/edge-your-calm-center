import { motion } from 'framer-motion';
import { Clock, Sparkles, RotateCcw } from 'lucide-react';

interface TrialExpiredScreenProps {
  onSubscribe: () => void;
  onResetTrial?: () => void;
}

export function TrialExpiredScreen({ onSubscribe, onResetTrial }: TrialExpiredScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-calm" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your Trial Has Ended
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xs">
            We hope you enjoyed exploring DopaMINE. Subscribe to continue your journey.
          </p>

          <button
            onClick={onSubscribe}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mx-auto mb-4"
          >
            <Sparkles className="w-5 h-5" />
            Continue with Premium
          </button>

          {onResetTrial && (
            <button
              onClick={onResetTrial}
              className="w-full max-w-xs py-3 rounded-xl bg-muted/50 text-muted-foreground font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Trial (Dev)
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
