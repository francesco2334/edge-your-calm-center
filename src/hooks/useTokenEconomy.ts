import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

/**
 * CLEAN TOKEN/POINTS ECONOMY SYSTEM
 * 
 * Two separate currencies that NEVER interact:
 * 
 * 🟣 TOKENS = Permission currency
 *    - Used to buy time (1 token = 10 minutes)
 *    - Can be spent (deducted when purchasing time)
 *    - Can go negative
 *    - NEVER removed for failure
 * 
 * 🔵 POINTS = Activity score
 *    - NOT spendable
 *    - Only for stats/streaks/trophies
 *    - Can be deducted for game failure
 *    - NEVER affects tokens
 */

// Constants
const DAILY_LOG_TOKENS = 3;        // Free daily allowance when logging pull
const LEARN_CARDS_PER_TOKEN = 5;   // Every 5 learn cards = +1 token
const GAME_COMPLETION_TOKEN = 1;   // Completing any game = +1 token
const PRODUCTIVITY_LOG_TOKEN = 1;  // Productivity log = +1 token (once per day)
const MINUTES_PER_TOKEN = 5;       // 2 tokens = 10 minutes (1 token = 5 minutes)

// Game point values (points only, not tokens)
const GAME_POINTS = {
  standoff: { complete: 20, fail: -5 },
  bluff: { complete: 15, fail: -3 },
  reaction: { complete: 10, fail: -2 },
  sync: { complete: 25, fail: -5 },
  nameIt: { complete: 15, fail: -3 },
} as const;

export interface TokenTransaction {
  id: string;
  type: 'daily-log' | 'learn' | 'game' | 'spend' | 'refund';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface PointTransaction {
  id: string;
  type: 'game-complete' | 'game-fail' | 'activity';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface ActiveTimeSession {
  id: string;
  activity: string;
  tokensSpent: number;
  minutesAllocated: number;
  startedAt: Date;
  expiresAt: Date;
}

export interface EconomyStats {
  totalTokensEarned: number;
  totalTokensSpent: number;
  totalPoints: number;
  gamesCompleted: number;
  gamesFailed: number;
  learnCardsRead: number;
  dailyLogsCount: number;
}

interface EconomyState {
  tokens: number;
  points: number;
  streak: number;
  lastDailyLogDate: string | null;
  productivityLogsToday: number; // 0-3 logs per day
  lastProductivityDate: string | null;
  learnCardsTowardsToken: number;
  stats: EconomyStats;
  activeSession: ActiveTimeSession | null;
}

const MAX_PRODUCTIVITY_LOGS_PER_DAY = 3;

const DEFAULT_STATE: EconomyState = {
  tokens: 0,
  points: 0,
  streak: 0,
  lastDailyLogDate: null,
  productivityLogsToday: 0,
  lastProductivityDate: null,
  learnCardsTowardsToken: 0,
  stats: {
    totalTokensEarned: 0,
    totalTokensSpent: 0,
    totalPoints: 0,
    gamesCompleted: 0,
    gamesFailed: 0,
    learnCardsRead: 0,
    dailyLogsCount: 0,
  },
  activeSession: null,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

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

export function useTokenEconomy(userId: string | null) {
  const [state, setState] = useState<EconomyState>(DEFAULT_STATE);
  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      if (userId) {
        // Load from database
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (progress) {
          setState(prev => ({
            ...prev,
            tokens: progress.balance,
            streak: progress.streak,
            lastDailyLogDate: progress.last_active_date,
            stats: (progress.stats as unknown as EconomyStats) || DEFAULT_STATE.stats,
          }));
        }

        // Load transactions
        const { data: txns } = await supabase
          .from('charge_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txns) {
          setTokenTransactions(txns.map(t => ({
            id: t.id,
            type: t.type as TokenTransaction['type'],
            amount: t.amount,
            reason: t.reason,
            timestamp: new Date(t.created_at),
          })));
        }
      } else {
        // Load from localStorage
        setState(getStoredData('dopa_economy', DEFAULT_STATE));
        setTokenTransactions(getStoredData('dopa_token_txns', []));
        setPointTransactions(getStoredData('dopa_point_txns', []));
      }
      setIsLoaded(true);
    }

    loadData();
  }, [userId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (userId) {
        // Save to database
        const { data: existing } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', userId)
          .single();

        const updateData = {
          balance: state.tokens,
          streak: state.streak,
          last_active_date: state.lastDailyLogDate || getTodayString(),
          stats: JSON.parse(JSON.stringify(state.stats)) as Json,
        };

        if (existing) {
          await supabase
            .from('user_progress')
            .update(updateData)
            .eq('user_id', userId);
        } else {
          await supabase
            .from('user_progress')
            .insert([{ user_id: userId, ...updateData }]);
        }
      } else {
        // Save to localStorage
        setStoredData('dopa_economy', state);
        setStoredData('dopa_token_txns', tokenTransactions.slice(0, 50));
        setStoredData('dopa_point_txns', pointTransactions.slice(0, 50));
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, tokenTransactions, pointTransactions, userId, isLoaded]);

  // Add token transaction
  const addTokenTransaction = useCallback(async (
    type: TokenTransaction['type'],
    amount: number,
    reason: string
  ) => {
    const newTx: TokenTransaction = {
      id: `${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date(),
    };

    setTokenTransactions(prev => [newTx, ...prev].slice(0, 50));

    if (userId) {
      await supabase.from('charge_transactions').insert({
        user_id: userId,
        type,
        amount,
        reason,
      });
    }
  }, [userId]);

  // Add point transaction
  const addPointTransaction = useCallback((
    type: PointTransaction['type'],
    amount: number,
    reason: string
  ) => {
    const newTx: PointTransaction = {
      id: `${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date(),
    };

    setPointTransactions(prev => [newTx, ...prev].slice(0, 50));
  }, []);

  /**
   * DAILY LOG: Award +3 tokens once per calendar day
   * This is the PRIMARY way users get free tokens
   */
  const logDailyPull = useCallback((pullId: string): boolean => {
    const today = getTodayString();
    
    if (state.lastDailyLogDate === today) {
      // Already logged today - no token award, but still valid action
      return false;
    }

    // Award daily tokens
    setState(prev => ({
      ...prev,
      tokens: prev.tokens + DAILY_LOG_TOKENS,
      streak: prev.streak + 1,
      lastDailyLogDate: today,
      stats: {
        ...prev.stats,
        totalTokensEarned: prev.stats.totalTokensEarned + DAILY_LOG_TOKENS,
        dailyLogsCount: prev.stats.dailyLogsCount + 1,
      },
    }));

    addTokenTransaction('daily-log', DAILY_LOG_TOKENS, `Daily log: ${pullId}`);
    
    toast.success(`+${DAILY_LOG_TOKENS} Tokens`, {
      description: 'Daily allowance granted',
    });

    return true;
  }, [state.lastDailyLogDate, addTokenTransaction]);

  /**
   * LEARN FEED: Every 5 completed cards = +1 token
   * Cards must be fully viewed, not skipped
   */
  const recordLearnCard = useCallback((): { earnedToken: boolean } => {
    let earnedToken = false;

    setState(prev => {
      const newCardsCount = prev.learnCardsTowardsToken + 1;
      
      if (newCardsCount >= LEARN_CARDS_PER_TOKEN) {
        // Earned a token!
        earnedToken = true;
        
        toast.success('+1 Token', {
          description: `${LEARN_CARDS_PER_TOKEN} cards read`,
        });

        return {
          ...prev,
          tokens: prev.tokens + 1,
          learnCardsTowardsToken: 0,
          stats: {
            ...prev.stats,
            totalTokensEarned: prev.stats.totalTokensEarned + 1,
            learnCardsRead: prev.stats.learnCardsRead + 1,
          },
        };
      }

      return {
        ...prev,
        learnCardsTowardsToken: newCardsCount,
        stats: {
          ...prev.stats,
          learnCardsRead: prev.stats.learnCardsRead + 1,
        },
      };
    });

    if (earnedToken) {
      addTokenTransaction('learn', 1, 'Learn feed: 5 cards completed');
    }

    return { earnedToken };
  }, [addTokenTransaction]);

  /**
   * GAME COMPLETION: +1 token + points
   * Only awarded when game is FULLY completed
   */
  const recordGameComplete = useCallback((gameId: keyof typeof GAME_POINTS, details: string) => {
    const pointValue = GAME_POINTS[gameId]?.complete || 10;

    setState(prev => ({
      ...prev,
      tokens: prev.tokens + GAME_COMPLETION_TOKEN,
      points: prev.points + pointValue,
      stats: {
        ...prev.stats,
        totalTokensEarned: prev.stats.totalTokensEarned + GAME_COMPLETION_TOKEN,
        totalPoints: prev.stats.totalPoints + pointValue,
        gamesCompleted: prev.stats.gamesCompleted + 1,
      },
    }));

    addTokenTransaction('game', GAME_COMPLETION_TOKEN, `Game complete: ${details}`);
    addPointTransaction('game-complete', pointValue, details);

    toast.success('+1 Token', {
      description: `+${pointValue} points`,
    });
  }, [addTokenTransaction, addPointTransaction]);

  /**
   * GAME FAILURE/EXIT: Points deduction ONLY, never tokens
   * This is critical - tokens are NEVER removed for failure
   */
  const recordGameFail = useCallback((gameId: keyof typeof GAME_POINTS, reason: string) => {
    const pointPenalty = GAME_POINTS[gameId]?.fail || -3;

    setState(prev => ({
      ...prev,
      points: Math.max(0, prev.points + pointPenalty), // Points can't go negative
      stats: {
        ...prev.stats,
        totalPoints: Math.max(0, prev.stats.totalPoints + pointPenalty),
        gamesFailed: prev.stats.gamesFailed + 1,
      },
    }));

    addPointTransaction('game-fail', pointPenalty, reason);

    // No toast for failure - silent penalty
  }, [addPointTransaction]);

  /**
   * SPEND TOKENS: Purchase time
   * 1 token = 10 minutes
   * Tokens deducted immediately, timer starts
   * Background timer runs and notifies when time expires
   * STACKING: If session is active, adds time to existing session
   */
  const spendTokens = useCallback(async (tokens: number, activity: string): Promise<ActiveTimeSession | null> => {
    const additionalMinutes = tokens * MINUTES_PER_TOKEN;
    const now = new Date();

    let session: ActiveTimeSession;

    // Check if there's an active session to extend
    if (state.activeSession && new Date(state.activeSession.expiresAt) > now) {
      // STACK: Extend existing session
      const currentExpiry = new Date(state.activeSession.expiresAt);
      const newExpiresAt = new Date(currentExpiry.getTime() + additionalMinutes * 60 * 1000);
      
      session = {
        ...state.activeSession,
        tokensSpent: state.activeSession.tokensSpent + tokens,
        minutesAllocated: state.activeSession.minutesAllocated + additionalMinutes,
        expiresAt: newExpiresAt,
      };

      toast.success(`+${additionalMinutes} minutes added`, {
        description: `Total: ${session.minutesAllocated} min`,
      });
    } else {
      // NEW SESSION
      const expiresAt = new Date(now.getTime() + additionalMinutes * 60 * 1000);
      
      session = {
        id: `${Date.now()}`,
        activity,
        tokensSpent: tokens,
        minutesAllocated: additionalMinutes,
        startedAt: now,
        expiresAt,
      };

      toast.success(`${additionalMinutes} minutes unlocked`, {
        description: activity,
      });
    }

    setState(prev => ({
      ...prev,
      tokens: prev.tokens - tokens, // Can go negative
      activeSession: session,
      stats: {
        ...prev.stats,
        totalTokensSpent: prev.stats.totalTokensSpent + tokens,
      },
    }));

    addTokenTransaction('spend', -tokens, `${additionalMinutes} min ${activity}`);

    // Schedule time-expired notification
    try {
      await supabase.functions.invoke('schedule-notification', {
        body: {
          type: 'time-expired',
          userId: userId || 'anonymous',
          scheduledFor: session.expiresAt.toISOString(),
          activity,
        },
      });
    } catch (error) {
      console.log('Notification scheduling failed (non-critical):', error);
    }

    return session;
  }, [state.activeSession, addTokenTransaction, userId]);

  /**
   * END SESSION: Session completed (time expired)
   * No token changes
   */
  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeSession: null,
    }));
  }, []);

  /**
   * EXIT SESSION: User exits early
   * NO REFUNDS - once tokens are spent, they're gone
   * This enforces intentional spending
   */
  const exitSessionEarly = useCallback(() => {
    if (!state.activeSession) return;

    const { activity } = state.activeSession;

    setState(prev => ({
      ...prev,
      activeSession: null,
    }));

    toast.info('Session ended', {
      description: `No refunds - ${activity}`,
    });
  }, [state.activeSession]);

  /**
   * PRODUCTIVITY LOG: +1 token per log, up to 3 per day
   * Self-reported real-world action
   * Honesty-based, no verification
   */
  const logProductivity = useCallback((category: string, description?: string): boolean => {
    const today = getTodayString();
    
    // Reset count if new day
    const logsToday = state.lastProductivityDate === today ? state.productivityLogsToday : 0;
    
    if (logsToday >= MAX_PRODUCTIVITY_LOGS_PER_DAY) {
      // Already logged max productivity today
      return false;
    }

    setState(prev => ({
      ...prev,
      tokens: prev.tokens + PRODUCTIVITY_LOG_TOKEN,
      productivityLogsToday: logsToday + 1,
      lastProductivityDate: today,
      stats: {
        ...prev.stats,
        totalTokensEarned: prev.stats.totalTokensEarned + PRODUCTIVITY_LOG_TOKEN,
      },
    }));

    const reason = description 
      ? `Productivity: ${category} - ${description}` 
      : `Productivity: ${category}`;
    
    addTokenTransaction('game', PRODUCTIVITY_LOG_TOKEN, reason);

    toast.success('+1 Token', {
      description: `Productivity logged (${logsToday + 1}/${MAX_PRODUCTIVITY_LOGS_PER_DAY})`,
    });

    return true;
  }, [state.lastProductivityDate, state.productivityLogsToday, addTokenTransaction]);

  // Utility: Check if daily log was done today
  const hasLoggedToday = state.lastDailyLogDate === getTodayString();
  
  // Utility: Get productivity logs remaining today
  const today = getTodayString();
  const productivityLogsToday = state.lastProductivityDate === today ? state.productivityLogsToday : 0;
  const productivityLogsRemaining = MAX_PRODUCTIVITY_LOGS_PER_DAY - productivityLogsToday;

  // Utility: Check session expiry
  const isSessionExpired = useCallback(() => {
    if (!state.activeSession) return false;
    return new Date() > new Date(state.activeSession.expiresAt);
  }, [state.activeSession]);

  // Utility: Get remaining session time in minutes
  const getSessionTimeRemaining = useCallback(() => {
    if (!state.activeSession) return 0;
    const remaining = (new Date(state.activeSession.expiresAt).getTime() - Date.now()) / (1000 * 60);
    return Math.max(0, Math.round(remaining));
  }, [state.activeSession]);

  return {
    // State
    tokens: state.tokens,
    points: state.points,
    streak: state.streak,
    stats: state.stats,
    activeSession: state.activeSession,
    learnCardsTowardsToken: state.learnCardsTowardsToken,
    hasLoggedToday,
    productivityLogsToday,
    productivityLogsRemaining,
    isLoaded,

    // Token transactions
    tokenTransactions,
    pointTransactions,

    // Actions
    logDailyPull,
    logProductivity,
    recordLearnCard,
    recordGameComplete,
    recordGameFail,
    spendTokens,
    endSession,
    exitSessionEarly,
    
    // Dev/Debug
    grantPoints: (amount: number) => {
      setState(prev => ({
        ...prev,
        points: prev.points + amount,
        stats: { ...prev.stats, totalPoints: prev.stats.totalPoints + amount },
      }));
    },
    
    // Spend points (for cosmetics, etc.)
    spendPoints: (amount: number): boolean => {
      if (state.points < amount) return false;
      setState(prev => ({
        ...prev,
        points: prev.points - amount,
      }));
      return true;
    },

    // Utilities
    isSessionExpired,
    getSessionTimeRemaining,
    canAfford: (amount: number) => state.tokens >= amount,

    // Constants (for UI)
    DAILY_LOG_TOKENS,
    LEARN_CARDS_PER_TOKEN,
    MINUTES_PER_TOKEN,
    GAME_POINTS,
  };
}
