import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ArrowLeft } from 'lucide-react';

interface TimeSessionProps {
  session: {
    activity: string;
    minutesAllocated: number;
    startedAt: Date;
    expiresAt: Date;
    tokensSpent: number;
  } | null;
  onEndSession: () => void;
  onExitEarly: () => number;
}

export function TimeSessionBanner({ session, onEndSession, onExitEarly }: TimeSessionProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Update timer every second
  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const remaining = Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Time's up - trigger notification
        onEndSession();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, onEndSession]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Send notification when time expires
  useEffect(() => {
    if (timeRemaining === 0 && session) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Your time is up', {
          body: 'You can stop here — or come back and consciously earn more.',
          icon: '/favicon.ico',
        });
      }
    }
  }, [timeRemaining, session]);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleExitEarly = useCallback(() => {
    const refund = onExitEarly();
    setShowExitConfirm(false);
  }, [onExitEarly]);

  if (!session) return null;

  const progress = 1 - (timeRemaining / (session.minutesAllocated * 60 * 1000));

  return (
    <>
      {/* Floating banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/30 shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{session.activity}</p>
                <p className="text-xs text-muted-foreground">
                  {session.tokensSpent} token{session.tokensSpent > 1 ? 's' : ''} spent
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Exit early button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit early for refund →
          </button>
        </div>
      </motion.div>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitConfirm(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card rounded-2xl border border-border/30 shadow-xl z-[60] p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">Exit early?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You'll get a partial refund based on unused time.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-muted/50 text-foreground font-medium hover:bg-muted/70 transition-colors"
                >
                  Keep going
                </button>
                <button
                  onClick={handleExitEarly}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Exit & refund
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Time expired modal
export function TimeExpiredModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl border border-border/30 shadow-xl p-8 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Your time is up</h2>
          
          <p className="text-muted-foreground mb-8">
            You can stop here — or come back and consciously earn more.
          </p>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
