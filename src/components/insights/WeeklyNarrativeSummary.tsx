import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalContext, type EmotionalState } from '@/hooks/useEmotionalContext';

// Map emotional states to narrative descriptors
const EMOTIONAL_NARRATIVES: Record<EmotionalState, { feeling: string; context: string }> = {
  craving: { feeling: 'seeking stimulation', context: 'when the urge felt strongest' },
  relapse: { feeling: 'after slipping', context: 'seeking compassion' },
  boredom: { feeling: 'bored, not distressed', context: 'looking for novelty' },
  overstimulated: { feeling: 'overstimulated', context: 'needing to decompress' },
  anxious: { feeling: 'stressed or anxious', context: 'late at night or during transitions' },
  motivated: { feeling: 'motivated', context: 'ready to build better habits' },
  calm: { feeling: 'calm and grounded', context: 'in a stable place' },
  neutral: { feeling: 'curious', context: 'exploring the app' },
};

export function WeeklyNarrativeSummary() {
  const { history } = useEmotionalContext();
  
  // Analyze last 7 days of emotional history
  const narrative = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const weeklyHistory = history.filter(h => 
      new Date(h.timestamp).getTime() > weekAgo
    );
    
    if (weeklyHistory.length === 0) {
      return null;
    }
    
    // Count state frequencies
    const stateCounts: Record<string, number> = {};
    weeklyHistory.forEach(h => {
      stateCounts[h.state] = (stateCounts[h.state] || 0) + 1;
    });
    
    // Find dominant state
    const sortedStates = Object.entries(stateCounts)
      .sort(([, a], [, b]) => b - a);
    
    const dominantState = sortedStates[0]?.[0] as EmotionalState;
    const secondaryState = sortedStates[1]?.[0] as EmotionalState;
    
    // Analyze timing patterns
    const hourCounts: Record<string, number> = {};
    weeklyHistory.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      const timeBlock = hour < 6 ? 'late night' 
        : hour < 12 ? 'morning' 
        : hour < 18 ? 'afternoon' 
        : 'evening';
      hourCounts[timeBlock] = (hourCounts[timeBlock] || 0) + 1;
    });
    
    const peakTime = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'throughout the day';
    
    return {
      dominantState,
      secondaryState,
      dominantNarrative: EMOTIONAL_NARRATIVES[dominantState],
      peakTime,
      totalCheckins: weeklyHistory.length,
    };
  }, [history]);
  
  if (!narrative) {
    return (
      <div className="dopa-card">
        <h3 className="text-[15px] font-semibold text-foreground mb-2">Your Week</h3>
        <p className="text-[14px] text-muted-foreground/70">
          Keep logging to see your weekly pattern.
        </p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dopa-card"
    >
      <h3 className="text-[15px] font-semibold text-foreground mb-4">Your Week</h3>
      
      {/* Main narrative */}
      <p className="text-[16px] text-foreground/90 leading-relaxed mb-4">
        "This week, you tended to come here when you felt{' '}
        <span className="text-primary font-medium">{narrative.dominantNarrative.feeling}</span>
        {narrative.peakTime !== 'throughout the day' && (
          <>, mostly in the <span className="text-accent font-medium">{narrative.peakTime}</span></>
        )}
        ."
      </p>
      
      {/* Secondary insight */}
      {narrative.secondaryState && narrative.secondaryState !== 'neutral' && (
        <p className="text-[14px] text-muted-foreground/70">
          Sometimes also: {EMOTIONAL_NARRATIVES[narrative.secondaryState].feeling}.
        </p>
      )}
      
      {/* No advice, no optimization - just reflection */}
      <div className="mt-4 pt-4 border-t border-border/10">
        <p className="text-[12px] text-muted-foreground/50 italic">
          No judgments. Just patterns.
        </p>
      </div>
    </motion.div>
  );
}