import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';

interface UrgeControlIndexProps {
  predictionAccuracy: number; // 0-100, higher = more accurate predictions
  averageHoldTime: number; // seconds
  tokensEarned: number;
  tokensSpent: number;
  previousWeekScore?: number;
}

export function UrgeControlIndex({
  predictionAccuracy,
  averageHoldTime,
  tokensEarned,
  tokensSpent,
  previousWeekScore,
}: UrgeControlIndexProps) {
  // Calculate Urge Control Index (0-100)
  const { score, trend, trendLabel } = useMemo(() => {
    // Prediction accuracy contributes 40%
    const predictionScore = predictionAccuracy * 0.4;
    
    // Hold time contributes 35% (normalize: 30s = 50%, 60s = 100%)
    const holdNormalized = Math.min(100, (averageHoldTime / 60) * 100);
    const holdScore = holdNormalized * 0.35;
    
    // Token balance (earned vs spent) contributes 25%
    const totalTokens = tokensEarned + tokensSpent;
    const balanceRatio = totalTokens > 0 ? tokensEarned / totalTokens : 0.5;
    const balanceScore = balanceRatio * 100 * 0.25;
    
    const calculatedScore = Math.round(predictionScore + holdScore + balanceScore);
    
    // Calculate trend
    let calculatedTrend: 'up' | 'down' | 'stable' = 'stable';
    let calculatedTrendLabel = 'Maintaining your baseline';
    
    if (previousWeekScore !== undefined) {
      const diff = calculatedScore - previousWeekScore;
      if (diff > 5) {
        calculatedTrend = 'up';
        calculatedTrendLabel = "You're reacting less automatically than last week.";
      } else if (diff < -5) {
        calculatedTrend = 'down';
        calculatedTrendLabel = 'Some old patterns resurfacing. Stay aware.';
      } else {
        calculatedTrend = 'stable';
        calculatedTrendLabel = 'Holding steady — consistency matters.';
      }
    }
    
    return {
      score: calculatedScore,
      trend: calculatedTrend,
      trendLabel: calculatedTrendLabel,
    };
  }, [predictionAccuracy, averageHoldTime, tokensEarned, tokensSpent, previousWeekScore]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-amber-400' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dopa-card bg-gradient-to-br from-primary/10 via-transparent to-transparent"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Urge Control Index
            </h3>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Slipping' : 'Stable'}
              </span>
            </div>
          </div>
          
          {/* Score display */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-primary' : 'bg-amber-400'
              }`}
            />
          </div>
          
          {/* Trend explanation */}
          <p className="text-xs text-muted-foreground">
            {trendLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
