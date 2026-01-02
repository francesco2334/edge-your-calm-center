import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Heart } from 'lucide-react';
import type { ChargeTransaction } from '@/lib/charge-data';

interface ExitPhilosophyProps {
  transactions: ChargeTransaction[];
  streak: number;
}

export function ExitPhilosophy({ transactions, streak }: ExitPhilosophyProps) {
  // Calculate usage trend over last 2 weeks
  const usageTrend = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    
    const thisWeek = transactions.filter(t => 
      new Date(t.timestamp).getTime() > weekAgo
    ).length;
    
    const lastWeek = transactions.filter(t => {
      const time = new Date(t.timestamp).getTime();
      return time > twoWeeksAgo && time <= weekAgo;
    }).length;
    
    if (lastWeek === 0) return null;
    
    const percentChange = ((thisWeek - lastWeek) / lastWeek) * 100;
    return {
      thisWeek,
      lastWeek,
      percentChange,
      isLess: percentChange < -10,
    };
  }, [transactions]);

  const showLighterUsage = usageTrend?.isLess || (streak >= 14 && transactions.length > 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dopa-card bg-muted/20"
    >
      {/* Core philosophy statement */}
      <div className="flex items-start gap-3 mb-4">
        <Heart className="w-5 h-5 text-primary/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[15px] text-foreground/80 font-medium leading-relaxed">
            Train independence. Track progress while it lasts.
          </p>
          <p className="text-[13px] text-muted-foreground/60 mt-1">
            Dopamine helps you weaken compulsive urges over time — not rely on tools forever.
          </p>
        </div>
      </div>

      {/* Lighter usage indicator */}
      {showLighterUsage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 pt-4 border-t border-border/10"
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingDown className="w-4 h-4" />
            <p className="text-[14px] font-medium">
              You're starting to regulate without us.
            </p>
          </div>
          {usageTrend?.isLess && (
            <p className="text-[12px] text-muted-foreground/50 mt-1 ml-6">
              {Math.abs(Math.round(usageTrend.percentChange))}% less app usage this week
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}