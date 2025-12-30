import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Brain, Zap, RefreshCw } from 'lucide-react';
import type { BehaviorPatterns, FocusArea } from '@/hooks/useSmartInsights';

interface SmartEdgeProfileProps {
  behaviorPatterns: BehaviorPatterns;
  focusAreas: FocusArea[];
  mojoThemes: string[];
  isLoading?: boolean;
}

export const SmartEdgeProfile = forwardRef<HTMLDivElement, SmartEdgeProfileProps>(({ 
  behaviorPatterns, 
  focusAreas, 
  mojoThemes,
  isLoading 
}, ref) => {
  const patternLabels: Record<keyof BehaviorPatterns, { label: string; icon: typeof Zap }> = {
    intensity_seeking: { label: 'Intensity Seeking', icon: Zap },
    impulse_control: { label: 'Impulse Control', icon: Brain },
    avoidance_patterns: { label: 'Avoidance Patterns', icon: RefreshCw },
    risk_chasing: { label: 'Risk Chasing', icon: TrendingUp },
    recovery_speed: { label: 'Recovery Speed', icon: Target },
  };

  const getPatternColor = (value: number, inverted = false) => {
    const adjustedValue = inverted ? 100 - value : value;
    if (adjustedValue >= 70) return 'bg-emerald-400';
    if (adjustedValue >= 50) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  if (isLoading) {
    return (
      <div className="dopa-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              <div className="h-2 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      <p className="text-sm text-muted-foreground">Edge Profile</p>
      
      {/* Behavior Pattern Bars */}
      <div className="dopa-card space-y-4">
        {(Object.entries(behaviorPatterns) as [keyof BehaviorPatterns, number][]).map(([key, value]) => {
          const { label, icon: Icon } = patternLabels[key];
          // For impulse_control and recovery_speed, higher is better
          const isPositive = key === 'impulse_control' || key === 'recovery_speed';
          
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {label}
                </span>
                <span className="text-muted-foreground font-medium">{value}%</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${getPatternColor(value, !isPositive)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <div className="dopa-card">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Focus Areas</span>
          </div>
          <div className="space-y-3">
            {focusAreas.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{area.title}</p>
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mojo Conversation Themes */}
      {mojoThemes.length > 0 && (
        <div className="dopa-card">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Topics You've Discussed</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mojoThemes.map((theme, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent"
              >
                {theme}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.values(behaviorPatterns).every(v => v === 50) && focusAreas.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Use the app more to build your personalized profile
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Your patterns will update based on your activity
          </p>
        </div>
      )}
    </div>
  );
});

SmartEdgeProfile.displayName = 'SmartEdgeProfile';
