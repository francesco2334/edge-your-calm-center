import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MonthlyScore } from '@/lib/progress-data';

interface ProgressGraphProps {
  scores: MonthlyScore[];
}

export function ProgressGraph({ scores }: ProgressGraphProps) {
  const maxScore = Math.max(...scores.map(s => s.score), 100);
  const currentScore = scores[scores.length - 1]?.score ?? 0;
  const prevScore = scores[scores.length - 2]?.score ?? 0;
  const trend = currentScore > prevScore + 20 ? 'up' : currentScore < prevScore - 20 ? 'down' : 'stable';

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-amber-400" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTrendLabel = () => {
    const diff = currentScore - prevScore;
    if (diff > 20) return `+${diff} pts`;
    if (diff < -20) return `${diff} pts`;
    return 'Steady';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Monthly Progress</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">{currentScore}</span>
            <span className="text-sm text-muted-foreground">pts</span>
            <div className="flex items-center gap-1 ml-2">
              {getTrendIcon()}
              <span className="text-sm text-muted-foreground">{getTrendLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="relative h-40">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-t border-border/30" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end justify-between gap-2 px-1">
          {scores.map((score, i) => {
            const height = maxScore > 0 ? (score.score / maxScore) * 100 : 0;
            const isCurrentMonth = i === scores.length - 1;
            
            return (
              <div key={score.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  className={`w-full max-w-[40px] rounded-t-lg ${
                    isCurrentMonth 
                      ? 'bg-gradient-to-t from-primary to-accent' 
                      : 'bg-muted'
                  }`}
                  style={{
                    boxShadow: isCurrentMonth 
                      ? '0 0 20px hsl(var(--primary) / 0.4)' 
                      : 'none',
                  }}
                />
                <span className={`text-xs ${
                  isCurrentMonth ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {score.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Trend line overlay */}
        <svg 
          className="absolute inset-0 w-full h-[calc(100%-24px)] pointer-events-none"
          preserveAspectRatio="none"
        >
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={scores.map((score, i) => {
              const x = (i / (scores.length - 1)) * 100 + '%';
              const y = maxScore > 0 ? 100 - (score.score / maxScore) * 100 : 100;
              return `${(i + 0.5) * (100 / scores.length)}%,${y}%`;
            }).join(' ')}
            style={{
              filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))',
            }}
          />
        </svg>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {scores.reduce((sum, s) => sum + s.activities, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Activities</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {scores.reduce((sum, s) => sum + s.reflectionsCount, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Reflections</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {Math.max(...scores.map(s => s.streakDays), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>
    </div>
  );
}
