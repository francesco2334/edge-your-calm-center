import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingDown } from 'lucide-react';

interface PredictionInsightProps {
  usageCount: number; // Number of times Prediction vs Reality has been used
  averageGap: number; // Average prediction - reality gap (positive = overestimated)
  gapTrend?: number; // Percentage change in gap over time (negative = improving)
}

export function PredictionInsight({ usageCount, averageGap, gapTrend }: PredictionInsightProps) {
  const [dismissed, setDismissed] = useState(false);
  
  // Only show after 3+ uses
  if (usageCount < 3 || dismissed) return null;
  
  const showStrongerMessage = usageCount >= 10 && gapTrend !== undefined && gapTrend < 0;
  
  const gapPercentage = Math.abs(Math.round(averageGap * 20)); // Convert 0-5 scale to percentage
  const improvementPercentage = gapTrend ? Math.abs(Math.round(gapTrend)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="dopa-card bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-amber-400" />
        </div>
        
        <div className="flex-1">
          {showStrongerMessage ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-foreground">
                  Your prediction gap has reduced by {improvementPercentage}%.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This means your brain is relearning what's actually rewarding.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground mb-1">
                Your predictions were {gapPercentage}% higher than reality this week.
              </p>
              <p className="text-xs text-muted-foreground">
                When this gap shrinks, cravings weaken.
              </p>
            </>
          )}
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground/50 hover:text-muted-foreground text-xs"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
