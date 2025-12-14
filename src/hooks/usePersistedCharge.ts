import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { ChargeTransaction, AllocationSession, PersonalStats } from '@/lib/charge-data';
import { OUTCOME_BONUSES } from '@/lib/charge-data';
import type { ReactionLeaderboard, ReactionRecord } from '@/lib/reaction-data';

const DAILY_STREAK_CHARGE = 20;
const EARLY_EXIT_PENALTY = 5;

const DEFAULT_STATS: PersonalStats = {
  plannedSessions: 0,
  earlyExits: 0,
  stayedWithin: 0,
  wentOver: 0,
  averageDelaySeconds: 0,
  longestStabilityRun: 0,
  currentStabilityRun: 0,
};

const DEFAULT_LEADERBOARD: ReactionLeaderboard = {
  personalBest: 999,
  averageTime: 0,
  totalAttempts: 0,
  history: [],
  percentile: 50,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Local storage fallback functions
function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export function usePersistedCharge(userId: string | null, initialBalance = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<ChargeTransaction[]>([]);
  const [activeSession, setActiveSession] = useState<AllocationSession | null>(null);
  const [streak, setStreak] = useState(0);
  const [streakClaimedToday, setStreakClaimedToday] = useState(false);
  const [reactionLeaderboard, setReactionLeaderboard] = useState<ReactionLeaderboard>(DEFAULT_LEADERBOARD);
  const [stats, setStats] = useState<PersonalStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from database or localStorage
  useEffect(() => {
    async function loadData() {
      if (userId) {
        // Try to load from database
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (progress) {
          setBalance(progress.balance);
          setStreak(progress.streak);
          setStreakClaimedToday(progress.streak_claimed_today);
          setStats(progress.stats as unknown as PersonalStats || DEFAULT_STATS);
          setReactionLeaderboard(progress.reaction_leaderboard as unknown as ReactionLeaderboard || DEFAULT_LEADERBOARD);
          
          // Check if it's a new day
          const today = getTodayString();
          if (progress.last_active_date !== today) {
            setStreakClaimedToday(false);
          }
        }

        // Load transactions
        const { data: txns } = await supabase
          .from('charge_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (txns) {
          setTransactions(txns.map(t => ({
            id: t.id,
            type: t.type as 'earn' | 'allocate' | 'bonus',
            amount: t.amount,
            reason: t.reason,
            timestamp: new Date(t.created_at),
          })));
        }
      } else {
        // Load from localStorage for non-authenticated users
        setBalance(getStoredData('dopa_balance', initialBalance));
        setStreak(getStoredData('dopa_streak', 0));
        setStats(getStoredData('dopa_stats', DEFAULT_STATS));
        setReactionLeaderboard(getStoredData('dopa_leaderboard', DEFAULT_LEADERBOARD));
        setTransactions(getStoredData('dopa_transactions', []));
        
        const lastDate = localStorage.getItem('dopa_last_active_date');
        setStreakClaimedToday(lastDate === getTodayString());
      }
      setIsLoaded(true);
    }

    loadData();
  }, [userId, initialBalance]);

  // Debounced save to database
  const saveToDatabase = useCallback(async () => {
    if (!userId || !isLoaded) return;

    // Check if record exists first
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          balance,
          streak,
          streak_claimed_today: streakClaimedToday,
          last_active_date: getTodayString(),
          stats: JSON.parse(JSON.stringify(stats)) as Json,
          reaction_leaderboard: JSON.parse(JSON.stringify(reactionLeaderboard)) as Json,
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          balance,
          streak,
          streak_claimed_today: streakClaimedToday,
          last_active_date: getTodayString(),
          stats: JSON.parse(JSON.stringify(stats)) as Json,
          reaction_leaderboard: JSON.parse(JSON.stringify(reactionLeaderboard)) as Json,
        }]);
    }
  }, [userId, balance, streak, streakClaimedToday, stats, reactionLeaderboard, isLoaded]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (userId) {
        saveToDatabase();
      } else {
        // Save to localStorage for non-authenticated users
        setStoredData('dopa_balance', balance);
        setStoredData('dopa_streak', streak);
        setStoredData('dopa_stats', stats);
        setStoredData('dopa_leaderboard', reactionLeaderboard);
        setStoredData('dopa_transactions', transactions.slice(0, 50));
        localStorage.setItem('dopa_last_active_date', getTodayString());
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [balance, streak, stats, reactionLeaderboard, transactions, userId, saveToDatabase, isLoaded]);

  const addTransaction = useCallback(async (
    type: 'earn' | 'allocate' | 'bonus',
    amount: number,
    reason: string
  ) => {
    const newTx: ChargeTransaction = {
      id: `${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date(),
    };

    setTransactions(prev => [newTx, ...prev].slice(0, 100));

    if (userId) {
      await supabase.from('charge_transactions').insert({
        user_id: userId,
        type,
        amount,
        reason,
      });
    }
  }, [userId]);

  const claimDailyStreak = useCallback(() => {
    if (streakClaimedToday) return false;
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    setStreakClaimedToday(true);
    setBalance(prev => prev + DAILY_STREAK_CHARGE);
    addTransaction('bonus', DAILY_STREAK_CHARGE, `Day ${newStreak} streak bonus`);
    
    return true;
  }, [streak, streakClaimedToday, addTransaction]);

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
    addTransaction('earn', amount, reason);
  }, [addTransaction]);

  const allocateCharge = useCallback((amount: number, activity: string, suggestedMinutes: number): boolean => {
    if (balance < amount) return false;
    
    setBalance(prev => prev - amount);
    addTransaction('allocate', amount, `Allocated for ${activity}`);
    
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
  }, [balance, addTransaction]);

  const completeSession = useCallback((outcome: 'stayed' | 'over' | 'early') => {
    if (!activeSession) return;

    const bonus = OUTCOME_BONUSES[outcome];
    
    if (bonus.charge > 0) {
      setBalance(prev => prev + bonus.charge);
      addTransaction('bonus', bonus.charge, bonus.label);
    }

    setStats(prev => ({
      ...prev,
      earlyExits: outcome === 'early' ? prev.earlyExits + 1 : prev.earlyExits,
      stayedWithin: outcome === 'stayed' ? prev.stayedWithin + 1 : prev.stayedWithin,
      wentOver: outcome === 'over' ? prev.wentOver + 1 : prev.wentOver,
    }));

    setActiveSession(null);
  }, [activeSession, addTransaction]);

  const recordEarlyExit = useCallback((toolName: string) => {
    setBalance(prev => Math.max(0, prev - EARLY_EXIT_PENALTY));
    addTransaction('allocate', EARLY_EXIT_PENALTY, `Early exit: ${toolName}`);
    setStats(prev => ({
      ...prev,
      earlyExits: prev.earlyExits + 1,
    }));
  }, [addTransaction]);

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return {
    balance,
    transactions,
    activeSession,
    stats,
    streak,
    streakClaimedToday,
    reactionLeaderboard,
    isLoaded,
    earnCharge,
    allocateCharge,
    completeSession,
    canAfford,
    claimDailyStreak,
    recordReactionTime,
    recordEarlyExit,
  };
}
