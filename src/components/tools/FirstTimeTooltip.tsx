import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FirstTimeTooltipProps {
  storageKey: string;
  message: string;
  delay?: number;
}

export function FirstTimeTooltip({ storageKey, message, delay = 1000 }: FirstTimeTooltipProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem(storageKey);
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);
  
  const dismiss = () => {
    setShow(false);
    localStorage.setItem(storageKey, 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bottom-28 left-4 right-4 z-50"
        >
          <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={dismiss}
                className="p-1 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
