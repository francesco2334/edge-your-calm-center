import { useState, useCallback, useEffect } from 'react';
import {
  ActivityEvent,
  WeeklyReflection,
  MonthlySummary,
  Trophy,
  MonthlyScore,
  ACTIVITY_POINTS,
  TROPHY_DEFINITIONS,
  PROGRESS_STORAGE_KEYS,
  getWeekStart,
  getMonthKey,
  getMonthLabel,
  getLast6Months,
  getScoreTrend,
} from '@/lib/progress-data';

export function useProgress() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(PROGRESS_STORAGE_KEYS.activities);
      const storedReflections = localStorage.getItem(PROGRESS_STORAGE_KEYS.weeklyReflections);
      const storedSummaries = localStorage.getItem(PROGRESS_STORAGE_KEYS.monthlySummaries);
      const storedTrophies = localStorage.getItem(PROGRESS_STORAGE_KEYS.trophies);

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })));
      }
      if (storedReflections) {
        setWeeklyReflections(JSON.parse(storedReflections).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        })));
      }
      if (storedSummaries) {
        setMonthlySummaries(JSON.parse(storedSummaries).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        })));
      }
      if (storedTrophies) {
        setTrophies(JSON.parse(storedTrophies).map((t: any) => ({
          ...t,
          earnedAt: new Date(t.earnedAt),
        })));
      }
    } catch (e) {
      console.error('Failed to load progress data:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEYS.activities, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEYS.weeklyReflections, JSON.stringify(weeklyReflections));
  }, [weeklyReflections]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEYS.monthlySummaries, JSON.stringify(monthlySummaries));
  }, [monthlySummaries]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEYS.trophies, JSON.stringify(trophies));
  }, [trophies]);

  // Calculate monthly scores whenever activities change
  useEffect(() => {
    const months = getLast6Months();
    const scores: MonthlyScore[] = months.map((month, idx) => {
      const monthActivities = activities.filter(a => 
        getMonthKey(new Date(a.timestamp)) === month
      );
      const score = monthActivities.reduce((sum, a) => sum + a.points, 0);
      const reflections = weeklyReflections.filter(r => r.weekStart.startsWith(month)).length;
      const streakDays = monthActivities.filter(a => a.type === 'streak').length;

      return {
        month,
        score,
        activities: monthActivities.length,
        reflectionsCount: reflections,
        streakDays,
        label: getMonthLabel(month),
      };
    });
    setMonthlyScores(scores);
  }, [activities, weeklyReflections]);

  // Record activity
  const recordActivity = useCallback((
    type: ActivityEvent['type'],
    details?: string,
    customPoints?: number
  ) => {
    const points = customPoints ?? ACTIVITY_POINTS[type] ?? 10;
    const event: ActivityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      points,
      timestamp: new Date(),
      details,
    };
    setActivities(prev => {
      const updated = [event, ...prev];
      
      // Check for Learner trophy on Learn activities
      if (type === 'learn') {
        const currentMonth = getMonthKey();
        const learnCount = updated.filter(a => 
          a.type === 'learn' && getMonthKey(new Date(a.timestamp)) === currentMonth
        ).length;
        
        if (learnCount >= TROPHY_DEFINITIONS.learner.threshold) {
          const hasLearnerTrophy = trophies.some(t => t.type === 'learner' && t.month === currentMonth);
          if (!hasLearnerTrophy) {
            setTrophies(prevTrophies => [{
              id: `${Date.now()}-learner`,
              type: 'learner',
              name: TROPHY_DEFINITIONS.learner.name,
              icon: TROPHY_DEFINITIONS.learner.icon,
              description: TROPHY_DEFINITIONS.learner.description,
              earnedAt: new Date(),
              month: currentMonth,
            }, ...prevTrophies]);
          }
        }
      }
      
      return updated;
    });
    return points;
  }, [trophies]);

  // Check if weekly reflection exists for current week
  const hasWeeklyReflection = useCallback(() => {
    const currentWeek = getWeekStart();
    return weeklyReflections.some(r => r.weekStart === currentWeek);
  }, [weeklyReflections]);

  // Submit weekly reflection
  const submitWeeklyReflection = useCallback((prompts: WeeklyReflection['prompts']) => {
    const weekStart = getWeekStart();
    const content = Object.values(prompts).filter(Boolean).join('\n\n');
    
    const reflection: WeeklyReflection = {
      id: `${Date.now()}`,
      weekStart,
      content,
      createdAt: new Date(),
      prompts,
    };

    setWeeklyReflections(prev => [reflection, ...prev]);
    recordActivity('reflection', 'Weekly reflection completed', ACTIVITY_POINTS.weekly_reflection);
    
    return reflection;
  }, [recordActivity]);

  // Check if monthly summary exists
  const hasMonthlySummary = useCallback((month?: string) => {
    const targetMonth = month ?? getMonthKey();
    return monthlySummaries.some(s => s.month === targetMonth);
  }, [monthlySummaries]);

  // Submit monthly summary
  const submitMonthlySummary = useCallback((content: string, month?: string) => {
    const targetMonth = month ?? getMonthKey();
    const currentScore = monthlyScores.find(s => s.month === targetMonth)?.score ?? 0;
    const prevScore = monthlyScores.find(s => {
      const [y, m] = targetMonth.split('-').map(Number);
      const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
      return s.month === prevMonth;
    })?.score ?? 0;

    const summary: MonthlySummary = {
      id: `${Date.now()}`,
      month: targetMonth,
      content,
      createdAt: new Date(),
      score: currentScore,
      trend: getScoreTrend(currentScore, prevScore),
    };

    setMonthlySummaries(prev => [summary, ...prev]);
    recordActivity('reflection', 'Monthly summary completed', ACTIVITY_POINTS.monthly_summary);
    
    // Check for trophies
    checkAndAwardTrophies(targetMonth);
    
    return summary;
  }, [monthlyScores, recordActivity]);

  // Check and award trophies
  const checkAndAwardTrophies = useCallback((month: string) => {
    const newTrophies: Trophy[] = [];
    const monthData = monthlyScores.find(s => s.month === month);
    const existingTrophiesForMonth = trophies.filter(t => t.month === month);

    // Consistency trophy
    if (
      monthData && 
      monthData.activities >= TROPHY_DEFINITIONS.consistency.threshold &&
      !existingTrophiesForMonth.some(t => t.type === 'consistency')
    ) {
      newTrophies.push({
        id: `${Date.now()}-consistency`,
        type: 'consistency',
        name: TROPHY_DEFINITIONS.consistency.name,
        icon: TROPHY_DEFINITIONS.consistency.icon,
        description: TROPHY_DEFINITIONS.consistency.description,
        earnedAt: new Date(),
        month,
      });
    }

    // Reflection trophy
    if (
      monthData &&
      monthData.reflectionsCount >= TROPHY_DEFINITIONS.reflection.threshold &&
      !existingTrophiesForMonth.some(t => t.type === 'reflection')
    ) {
      newTrophies.push({
        id: `${Date.now()}-reflection`,
        type: 'reflection',
        name: TROPHY_DEFINITIONS.reflection.name,
        icon: TROPHY_DEFINITIONS.reflection.icon,
        description: TROPHY_DEFINITIONS.reflection.description,
        earnedAt: new Date(),
        month,
      });
    }

    // Growth trophy (best month so far)
    const allScores = monthlyScores.map(s => s.score);
    const maxPrevScore = Math.max(...allScores.slice(0, -1), 0);
    if (
      monthData &&
      monthData.score > maxPrevScore &&
      monthData.score > 100 &&
      !existingTrophiesForMonth.some(t => t.type === 'growth')
    ) {
      newTrophies.push({
        id: `${Date.now()}-growth`,
        type: 'growth',
        name: TROPHY_DEFINITIONS.growth.name,
        icon: TROPHY_DEFINITIONS.growth.icon,
        description: TROPHY_DEFINITIONS.growth.description,
        earnedAt: new Date(),
        month,
      });
    }

    // Learner trophy (engaged with Learn content)
    const learnActivities = activities.filter(a => 
      a.type === 'learn' && getMonthKey(new Date(a.timestamp)) === month
    );
    if (
      learnActivities.length >= TROPHY_DEFINITIONS.learner.threshold &&
      !existingTrophiesForMonth.some(t => t.type === 'learner')
    ) {
      newTrophies.push({
        id: `${Date.now()}-learner`,
        type: 'learner',
        name: TROPHY_DEFINITIONS.learner.name,
        icon: TROPHY_DEFINITIONS.learner.icon,
        description: TROPHY_DEFINITIONS.learner.description,
        earnedAt: new Date(),
        month,
      });
    }

    if (newTrophies.length > 0) {
      setTrophies(prev => [...newTrophies, ...prev]);
    }

    return newTrophies;
  }, [monthlyScores, trophies]);

  // Get current month data
  const getCurrentMonthData = useCallback(() => {
    const currentMonth = getMonthKey();
    return monthlyScores.find(s => s.month === currentMonth);
  }, [monthlyScores]);

  // Get trophies for month
  const getTrophiesForMonth = useCallback((month?: string) => {
    const targetMonth = month ?? getMonthKey();
    return trophies.filter(t => t.month === targetMonth);
  }, [trophies]);

  // Get weekly reflections for current month
  const getReflectionsThisMonth = useCallback(() => {
    const currentMonth = getMonthKey();
    return weeklyReflections.filter(r => r.weekStart.startsWith(currentMonth));
  }, [weeklyReflections]);

  return {
    // Data
    activities,
    weeklyReflections,
    monthlySummaries,
    trophies,
    monthlyScores,
    
    // Actions
    recordActivity,
    submitWeeklyReflection,
    submitMonthlySummary,
    
    // Helpers
    hasWeeklyReflection,
    hasMonthlySummary,
    getCurrentMonthData,
    getTrophiesForMonth,
    getReflectionsThisMonth,
  };
}
