import { useState, useCallback } from 'react';
import type { ChargeTransaction, AllocationSession, PersonalStats, DEFAULT_STATS } from '@/lib/charge-data';
import { OUTCOME_BONUSES } from '@/lib/charge-data';

export function useCharge(initialBalance = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<ChargeTransaction[]>([]);
  const [activeSession, setActiveSession] = useState<AllocationSession | null>(null);
  const [stats, setStats] = useState<PersonalStats>({
    plannedSessions: 0,
    earlyExits: 0,
    stayedWithin: 0,
    wentOver: 0,
    averageDelaySeconds: 0,
    longestStabilityRun: 0,
    currentStabilityRun: 0,
  });

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

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return {
    balance,
    transactions,
    activeSession,
    stats,
    earnCharge,
    allocateCharge,
    completeSession,
    canAfford,
  };
}
