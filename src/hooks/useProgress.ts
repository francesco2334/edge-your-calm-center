import { useState, useCallback, useEffect } from 'react';
import {
  ActivityEvent,
  WeeklyReflection,
  MonthlySummary,
  MonthlyNote,
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
  const [monthlyNotes, setMonthlyNotes] = useState<MonthlyNote[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);
  const [totalDaysActive, setTotalDaysActive] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(PROGRESS_STORAGE_KEYS.activities);
      const storedReflections = localStorage.getItem(PROGRESS_STORAGE_KEYS.weeklyReflections);
      const storedSummaries = localStorage.getItem(PROGRESS_STORAGE_KEYS.monthlySummaries);
      const storedTrophies = localStorage.getItem(PROGRESS_STORAGE_KEYS.trophies);
      const storedDaysActive = localStorage.getItem('dopa_total_days_active');

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
      if (storedDaysActive) {
        setTotalDaysActive(parseInt(storedDaysActive, 10) || 0);
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

  useEffect(() => {
    localStorage.setItem('dopa_total_days_active', String(totalDaysActive));
  }, [totalDaysActive]);

  // Calculate monthly scores whenever activities change
  useEffect(() => {
    const months = getLast6Months();
    const scores: MonthlyScore[] = months.map((month) => {
      const monthActivities = activities.filter(a => 
        getMonthKey(new Date(a.timestamp)) === month
      );
      const score = monthActivities.reduce((sum, a) => sum + a.points, 0);
      const reflections = weeklyReflections.filter(r => r.weekStart.startsWith(month)).length;
      const streakDays = monthActivities.filter(a => a.type === 'streak').length;
      const learnCards = monthActivities.filter(a => a.type === 'learn').length;
      const toolsUsed = monthActivities.filter(a => a.type === 'tool_used').length;

      return {
        month,
        score,
        activities: monthActivities.length,
        reflectionsCount: reflections,
        streakDays,
        learnCards,
        toolsUsed,
        label: getMonthLabel(month),
      };
    });
    setMonthlyScores(scores);
  }, [activities, weeklyReflections]);

  // Check and award trophies based on total days active
  const checkTrophyProgress = useCallback((days: number) => {
    const trophyTypes = Object.keys(TROPHY_DEFINITIONS) as Array<keyof typeof TROPHY_DEFINITIONS>;
    const newTrophies: Trophy[] = [];

    trophyTypes.forEach(type => {
      const definition = TROPHY_DEFINITIONS[type];
      const hasEarned = trophies.some(t => t.type === type);
      
      if (!hasEarned && days >= definition.threshold) {
        newTrophies.push({
          id: `${Date.now()}-${type}`,
          type,
          name: definition.name,
          icon: definition.icon,
          description: definition.description,
          earnedAt: new Date(),
          daysRequired: definition.threshold,
        });
      }
    });

    if (newTrophies.length > 0) {
      setTrophies(prev => [...prev, ...newTrophies]);
    }

    return newTrophies;
  }, [trophies]);

  // Increment daily activity count (call once per day when user is active)
  const recordDailyActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDay = localStorage.getItem('dopa_last_active_day');
    
    if (lastActiveDay !== today) {
      localStorage.setItem('dopa_last_active_day', today);
      const newDaysActive = totalDaysActive + 1;
      setTotalDaysActive(newDaysActive);
      checkTrophyProgress(newDaysActive);
      return true;
    }
    return false;
  }, [totalDaysActive, checkTrophyProgress]);

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
    setActivities(prev => [event, ...prev]);
    
    // Also record daily activity for trophy progress
    recordDailyActivity();
    
    return points;
  }, [recordDailyActivity]);

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
    
    return summary;
  }, [monthlyScores, recordActivity]);

  // Get current month data
  const getCurrentMonthData = useCallback(() => {
    const currentMonth = getMonthKey();
    return monthlyScores.find(s => s.month === currentMonth);
  }, [monthlyScores]);

  // Get weekly reflections for current month
  const getReflectionsThisMonth = useCallback(() => {
    const currentMonth = getMonthKey();
    return weeklyReflections.filter(r => r.weekStart.startsWith(currentMonth));
  }, [weeklyReflections]);

  // Get monthly note for a specific month
  const getMonthlyNote = useCallback((month?: string) => {
    const targetMonth = month ?? getMonthKey();
    return monthlyNotes.find(n => n.month === targetMonth);
  }, [monthlyNotes]);

  // Save or update monthly note (improvements + comments)
  const saveMonthlyNote = useCallback((improvements: string, notes: string, month?: string) => {
    const targetMonth = month ?? getMonthKey();
    const existingIndex = monthlyNotes.findIndex(n => n.month === targetMonth);
    
    if (existingIndex >= 0) {
      // Update existing
      setMonthlyNotes(prev => prev.map((n, i) => 
        i === existingIndex 
          ? { ...n, improvements, notes, updatedAt: new Date() }
          : n
      ));
    } else {
      // Create new
      const newNote: MonthlyNote = {
        id: `${Date.now()}`,
        month: targetMonth,
        improvements,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMonthlyNotes(prev => [newNote, ...prev]);
      recordActivity('reflection', 'Monthly note added', ACTIVITY_POINTS.monthly_note);
    }
  }, [monthlyNotes, recordActivity]);

  // Save monthly notes to localStorage
  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEYS.monthlyNotes, JSON.stringify(monthlyNotes));
  }, [monthlyNotes]);

  // Load monthly notes from localStorage
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(PROGRESS_STORAGE_KEYS.monthlyNotes);
      if (storedNotes) {
        setMonthlyNotes(JSON.parse(storedNotes).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
        })));
      }
    } catch (e) {
      console.error('Failed to load monthly notes:', e);
    }
  }, []);

  return {
    // Data
    activities,
    weeklyReflections,
    monthlySummaries,
    monthlyNotes,
    trophies,
    monthlyScores,
    totalDaysActive,
    
    // Actions
    recordActivity,
    recordDailyActivity,
    submitWeeklyReflection,
    submitMonthlySummary,
    saveMonthlyNote,
    
    // Helpers
    hasWeeklyReflection,
    hasMonthlySummary,
    getCurrentMonthData,
    getReflectionsThisMonth,
    getMonthlyNote,
  };
}
