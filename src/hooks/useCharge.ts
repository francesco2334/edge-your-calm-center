import { useState, useCallback, useEffect } from 'react';
import type { ChargeTransaction, AllocationSession, PersonalStats } from '@/lib/charge-data';
import { OUTCOME_BONUSES } from '@/lib/charge-data';
import type { ReactionLeaderboard, ReactionRecord } from '@/lib/reaction-data';

const DAILY_STREAK_CHARGE = 20;
const EARLY_EXIT_PENALTY = 5;

function getStoredDate(): string | null {
  return localStorage.getItem('dopa_last_active_date');
}

function setStoredDate(date: string) {
  localStorage.setItem('dopa_last_active_date', date);
}

function getStoredStreak(): number {
  return parseInt(localStorage.getItem('dopa_streak') || '0', 10);
}

function setStoredStreak(streak: number) {
  localStorage.setItem('dopa_streak', String(streak));
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useCharge(initialBalance = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<ChargeTransaction[]>([]);
  const [activeSession, setActiveSession] = useState<AllocationSession | null>(null);
  const [streak, setStreak] = useState(0);
  const [streakClaimedToday, setStreakClaimedToday] = useState(false);
  const [reactionLeaderboard, setReactionLeaderboard] = useState<ReactionLeaderboard>({
    personalBest: 999,
    averageTime: 0,
    totalAttempts: 0,
    history: [],
    percentile: 50,
  });
  const [stats, setStats] = useState<PersonalStats>({
    plannedSessions: 0,
    earlyExits: 0,
    stayedWithin: 0,
    wentOver: 0,
    averageDelaySeconds: 0,
    longestStabilityRun: 0,
    currentStabilityRun: 0,
  });

  // Initialize streak from localStorage
  useEffect(() => {
    const lastDate = getStoredDate();
    const today = getTodayString();
    const storedStreak = getStoredStreak();
    
    if (lastDate === today) {
      // Already checked in today
      setStreak(storedStreak);
      setStreakClaimedToday(true);
    } else if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - streak continues
        setStreak(storedStreak);
      } else {
        // Missed days - reset streak
        setStreak(0);
        setStoredStreak(0);
      }
    }
  }, []);

  const claimDailyStreak = useCallback(() => {
    const today = getTodayString();
    if (streakClaimedToday) return false;
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    setStoredStreak(newStreak);
    setStoredDate(today);
    setStreakClaimedToday(true);
    
    // Award charge
    setBalance(prev => prev + DAILY_STREAK_CHARGE);
    setTransactions(prev => [
      {
        id: `${Date.now()}`,
        type: 'bonus',
        amount: DAILY_STREAK_CHARGE,
        reason: `Day ${newStreak} streak bonus`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    
    return true;
  }, [streak, streakClaimedToday]);

  const recordReactionTime = useCallback((timeMs: number) => {
    const newRecord: ReactionRecord = {
      id: `${Date.now()}`,
      time: timeMs,
      timestamp: new Date(),
    };
    
    setReactionLeaderboard(prev => {
      const newHistory = [newRecord, ...prev.history].slice(0, 20);
      const totalTime = newHistory.reduce((sum, r) => sum + r.time, 0);
      const avgTime = Math.round(totalTime / newHistory.length);
      const newBest = Math.min(prev.personalBest, timeMs);
      
      // Calculate percentile based on best time
      const median = 284;
      const std = 50;
      const zScore = (median - newBest) / std;
      const percentile = Math.max(1, Math.min(99, Math.round(50 + zScore * 34)));
      
      return {
        personalBest: newBest,
        averageTime: avgTime,
        totalAttempts: prev.totalAttempts + 1,
        history: newHistory,
        percentile,
      };
    });
  }, []);

  const earnCharge = useCallback((amount: number, reason: string) => {
    setBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: `${Date.now()}`,
        type: 'earn',
        amount,
        reason,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, []);

  const allocateCharge = useCallback((amount: number, activity: string, suggestedMinutes: number): boolean => {
    if (balance < amount) return false;
    
    setBalance(prev => prev - amount);
    setTransactions(prev => [
      {
        id: `${Date.now()}`,
        type: 'allocate',
        amount,
        reason: `Allocated for ${activity}`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    
    setActiveSession({
      id: `${Date.now()}`,
      activity,
      chargeAllocated: amount,
      suggestedMinutes,
      startedAt: new Date(),
    });

    setStats(prev => ({
      ...prev,
      plannedSessions: prev.plannedSessions + 1,
      currentStabilityRun: prev.currentStabilityRun + 1,
      longestStabilityRun: Math.max(prev.longestStabilityRun, prev.currentStabilityRun + 1),
    }));
    
    return true;
  }, [balance]);

  const completeSession = useCallback((outcome: 'stayed' | 'over' | 'early') => {
    if (!activeSession) return;

    const bonus = OUTCOME_BONUSES[outcome];
    
    if (bonus.charge > 0) {
      setBalance(prev => prev + bonus.charge);
      setTransactions(prev => [
        {
          id: `${Date.now()}`,
          type: 'bonus',
          amount: bonus.charge,
          reason: bonus.label,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    }

    setStats(prev => ({
      ...prev,
      earlyExits: outcome === 'early' ? prev.earlyExits + 1 : prev.earlyExits,
      stayedWithin: outcome === 'stayed' ? prev.stayedWithin + 1 : prev.stayedWithin,
      wentOver: outcome === 'over' ? prev.wentOver + 1 : prev.wentOver,
    }));

    setActiveSession(null);
  }, [activeSession]);

  const recordEarlyExit = useCallback((toolName: string) => {
    setBalance(prev => Math.max(0, prev - EARLY_EXIT_PENALTY));
    setTransactions(prev => [
      {
        id: `${Date.now()}`,
        type: 'allocate',
        amount: EARLY_EXIT_PENALTY,
        reason: `Early exit: ${toolName}`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    setStats(prev => ({
      ...prev,
      earlyExits: prev.earlyExits + 1,
    }));
  }, []);

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return {
    balance,
    transactions,
    activeSession,
    stats,
    streak,
    streakClaimedToday,
    reactionLeaderboard,
    earnCharge,
    allocateCharge,
    completeSession,
    canAfford,
    claimDailyStreak,
    recordReactionTime,
    recordEarlyExit,
  };
}
