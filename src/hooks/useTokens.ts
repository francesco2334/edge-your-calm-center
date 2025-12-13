import { useState, useCallback } from 'react';
import type { TokenTransaction } from '@/lib/token-data';

export function useTokens(initialBalance = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);

  const earnTokens = useCallback((amount: number, reason: string) => {
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

  const spendTokens = useCallback((amount: number, reason: string): boolean => {
    if (balance < amount) return false;
    
    setBalance(prev => prev - amount);
    setTransactions(prev => [
      {
        id: `${Date.now()}`,
        type: 'spend',
        amount,
        reason,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    return true;
  }, [balance]);

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return {
    balance,
    transactions,
    earnTokens,
    spendTokens,
    canAfford,
  };
}