import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PersonalStats, ChargeTransaction } from '@/lib/charge-data';

export interface BehaviorPatterns {
  intensity_seeking: number;
  impulse_control: number;
  avoidance_patterns: number;
  risk_chasing: number;
  recovery_speed: number;
}

export interface FocusArea {
  title: string;
  description: string;
}

interface SmartInsights {
  behaviorPatterns: BehaviorPatterns;
  focusAreas: FocusArea[];
  mojoThemes: string[];
  isLoading: boolean;
}

const DEFAULT_PATTERNS: BehaviorPatterns = {
  intensity_seeking: 50,
  impulse_control: 50,
  avoidance_patterns: 50,
  risk_chasing: 50,
  recovery_speed: 50,
};

export function useSmartInsights(
  userId: string | null,
  stats: PersonalStats,
  transactions: ChargeTransaction[]
): SmartInsights & { refreshInsights: () => Promise<void> } {
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPatterns>(DEFAULT_PATTERNS);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [mojoThemes, setMojoThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load insights from database - only run when userId changes
  useEffect(() => {
    let cancelled = false;
    
    async function loadInsights() {
      if (!userId) {
        // Calculate locally for non-authenticated users
        const patterns = calculateLocalPatterns(stats, transactions);
        if (!cancelled) {
          setBehaviorPatterns(patterns);
          setFocusAreas(generateLocalFocusAreas(patterns));
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('behavior_patterns, focus_areas, mojo_themes')
          .eq('user_id', userId)
          .single();

        if (!cancelled && progress) {
          if (progress.behavior_patterns) {
            setBehaviorPatterns(progress.behavior_patterns as unknown as BehaviorPatterns);
          }
          if (progress.focus_areas) {
            setFocusAreas(progress.focus_areas as unknown as FocusArea[]);
          }
          if (progress.mojo_themes) {
            setMojoThemes(progress.mojo_themes as unknown as string[]);
          }
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInsights();
    
    return () => {
      cancelled = true;
    };
  }, [userId]); // Only depend on userId to prevent infinite loops

  const refreshInsights = useCallback(async () => {
    if (!userId) {
      const patterns = calculateLocalPatterns(stats, transactions);
      setBehaviorPatterns(patterns);
      setFocusAreas(generateLocalFocusAreas(patterns));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-insights', {
        body: { stats, transactions: transactions.slice(0, 50) },
      });

      if (error) throw error;

      if (data) {
        if (data.behavior_patterns) setBehaviorPatterns(data.behavior_patterns);
        if (data.focus_areas) setFocusAreas(data.focus_areas);
        if (data.mojo_themes) setMojoThemes(data.mojo_themes);
      }
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, stats, transactions]);

  return {
    behaviorPatterns,
    focusAreas,
    mojoThemes,
    isLoading,
    refreshInsights,
  };
}

function calculateLocalPatterns(stats: PersonalStats, transactions: ChargeTransaction[]): BehaviorPatterns {
  const patterns: BehaviorPatterns = { ...DEFAULT_PATTERNS };
  const totalSessions = stats.plannedSessions || 0;

  if (totalSessions > 0) {
    const overRatio = (stats.wentOver || 0) / totalSessions;
    patterns.intensity_seeking = Math.min(95, Math.round(50 + overRatio * 50));

    const controlRatio = ((stats.earlyExits || 0) + (stats.stayedWithin || 0)) / totalSessions;
    patterns.impulse_control = Math.min(95, Math.round(controlRatio * 100));

    const riskRatio = 1 - ((stats.earlyExits || 0) / totalSessions);
    patterns.risk_chasing = Math.min(95, Math.round(riskRatio * 100));
  }

  const stabilityRatio = (stats.currentStabilityRun || 0) / Math.max(1, stats.longestStabilityRun || 1);
  patterns.avoidance_patterns = Math.min(95, Math.round(100 - stabilityRatio * 50));

  const recentAllocations = transactions.filter(t => t.type === 'allocate').slice(0, 10);
  const recentBonuses = transactions.filter(t => t.type === 'bonus').slice(0, 10);
  if (recentAllocations.length + recentBonuses.length > 0) {
    const recoveryRatio = recentBonuses.length / (recentAllocations.length + recentBonuses.length);
    patterns.recovery_speed = Math.min(95, Math.round(recoveryRatio * 100));
  }

  return patterns;
}

function generateLocalFocusAreas(patterns: BehaviorPatterns): FocusArea[] {
  const areas: FocusArea[] = [];

  if (patterns.intensity_seeking > 60) {
    areas.push({
      title: 'High Intensity Seeking',
      description: 'Your system craves high-intensity input to feel normal.',
    });
  }

  if (patterns.impulse_control < 60) {
    areas.push({
      title: 'Impulse Management',
      description: 'Automatic responses often bypass conscious choice.',
    });
  }

  if (patterns.avoidance_patterns > 60) {
    areas.push({
      title: 'Avoidance Tendency',
      description: 'Content consumption may be displacing meaningful action.',
    });
  }

  if (patterns.risk_chasing > 70) {
    areas.push({
      title: 'Risk Threshold',
      description: 'The thrill of risk is pulling you beyond comfort.',
    });
  }

  if (patterns.recovery_speed < 50) {
    areas.push({
      title: 'Recovery Building',
      description: 'Focus on building consistent recovery patterns.',
    });
  }

  if (areas.length === 0) {
    areas.push({
      title: 'Balanced Profile',
      description: 'Your patterns show good self-regulation awareness.',
    });
  }

  return areas.slice(0, 4);
}
