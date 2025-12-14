import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ChargeTransaction } from '@/lib/charge-data';

interface DailyActivityGraphProps {
  transactions: ChargeTransaction[];
}

interface DayData {
  date: string;
  label: string;
  earned: number;
  deducted: number;
  net: number;
}

export function DailyActivityGraph({ transactions }: DailyActivityGraphProps) {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Aggregate transactions by day
  const dailyData: DayData[] = last7Days.map(dateStr => {
    const date = new Date(dateStr);
    const dayTransactions = transactions.filter(t => {
      const txDate = new Date(t.timestamp).toISOString().split('T')[0];
      return txDate === dateStr;
    });

    const earned = dayTransactions
      .filter(t => t.type === 'earn' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    const deducted = dayTransactions
      .filter(t => t.type === 'allocate')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: dateStr,
      label: dayLabels[date.getDay()],
      earned,
      deducted,
      net: earned - deducted,
    };
  });

  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d.earned, d.deducted)),
    10
  );

  const totalEarned = dailyData.reduce((sum, d) => sum + d.earned, 0);
  const totalDeducted = dailyData.reduce((sum, d) => sum + d.deducted, 0);
  const netChange = totalEarned - totalDeducted;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">
              {netChange >= 0 ? '+' : ''}{netChange}
            </span>
            <span className="text-sm text-muted-foreground">net</span>
            {netChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 ml-1" />
            ) : netChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-400 ml-1" />
            ) : null}
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground">Earned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-muted-foreground">Deducted</span>
          </div>
        </div>
      </div>

      {/* Bar Graph */}
      <div className="relative h-32">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {dailyData.map((day, i) => {
            const earnedHeight = maxValue > 0 ? (day.earned / maxValue) * 100 : 0;
            const deductedHeight = maxValue > 0 ? (day.deducted / maxValue) * 100 : 0;
            const isToday = i === dailyData.length - 1;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5 h-24">
                  {/* Earned bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(earnedHeight, day.earned > 0 ? 8 : 0)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`w-3 rounded-t-sm bg-emerald-400 ${
                      isToday ? 'opacity-100' : 'opacity-70'
                    }`}
                    style={{
                      boxShadow: day.earned > 0 ? '0 0 8px rgba(52, 211, 153, 0.4)' : 'none',
                    }}
                  />
                  {/* Deducted bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(deductedHeight, day.deducted > 0 ? 8 : 0)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                    className={`w-3 rounded-t-sm bg-rose-400 ${
                      isToday ? 'opacity-100' : 'opacity-70'
                    }`}
                    style={{
                      boxShadow: day.deducted > 0 ? '0 0 8px rgba(251, 113, 133, 0.4)' : 'none',
                    }}
                  />
                </div>
                <span className={`text-[10px] ${
                  isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="text-center p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <p className="text-lg font-semibold text-emerald-400">+{totalEarned}</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
          <p className="text-lg font-semibold text-rose-400">-{totalDeducted}</p>
          <p className="text-xs text-muted-foreground">Total Deducted</p>
        </div>
      </div>
    </div>
  );
}
