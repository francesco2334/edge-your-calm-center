import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Timer, Moon, Target, Flame } from 'lucide-react';
import { InsightsGraph } from './InsightsGraph';
import { ChargeCounter } from './ChargeCounter';
import { ProgressGraph, WeeklyReflection, MonthlySummary, MonthlyNotes, TrophyCase, JourneyTimeline, DailyActivityGraph } from './insights';
import { SmartEdgeProfile } from './insights/SmartEdgeProfile';
import { WeeklyNarrativeSummary } from './insights/WeeklyNarrativeSummary';
import { ExitPhilosophy } from './ExitPhilosophy';
import type { AssessmentAnswer } from '@/lib/edge-data';
import type { MonthlyScore, Trophy, WeeklyReflection as WeeklyReflectionType, MonthlyNote, MonthlySummary as MonthlySummaryType } from '@/lib/progress-data';
import { getMonthKey } from '@/lib/progress-data';
import { useSmartInsights } from '@/hooks/useSmartInsights';
import type { TokenTransaction, EconomyStats } from '@/hooks/useTokenEconomy';
import type { ControlMetrics } from '@/lib/credit-data';

interface ProgressScreenProps {
  answers: AssessmentAnswer[];
  credits: number;
  points: number;
  streak: number;
  stats: EconomyStats;
  creditTransactions: TokenTransaction[];
  onBack?: () => void;
  userId?: string | null;
  // Progress Engine props
  monthlyScores: MonthlyScore[];
  trophies: Trophy[];
  totalDaysActive: number;
  hasWeeklyReflection: boolean;
  hasMonthlySummary: boolean;
  monthlyNote?: MonthlyNote;
  monthlyNotes: MonthlyNote[];
  monthlySummaries: MonthlySummaryType[];
  onWeeklyReflection: (prompts: WeeklyReflectionType['prompts']) => void;
  onMonthlySummary: (content: string) => void;
  onSaveMonthlyNote: (improvements: string, notes: string) => void;
}

export function ProgressScreen({ 
  answers, 
  credits,
  points,
  stats,
  streak,
  creditTransactions,
  onBack,
  userId,
  monthlyScores,
  monthlyNotes,
  monthlySummaries,
  trophies,
  totalDaysActive,
  hasWeeklyReflection,
  hasMonthlySummary,
  monthlyNote,
  onWeeklyReflection,
  onMonthlySummary,
  onSaveMonthlyNote,
}: ProgressScreenProps) {
  const currentMonth = getMonthKey();
  const currentMonthData = monthlyScores.find(s => s.month === currentMonth);
  
  // Convert credit transactions to ChargeTransaction format for compatibility
  const chargeTransactions = creditTransactions.map(t => ({
    id: t.id,
    type: t.type === 'spend' ? 'allocate' as const : 'earn' as const,
    amount: t.amount,
    reason: t.reason,
    timestamp: t.timestamp,
  }));
  
  // Adapt stats for smart insights (legacy format)
  const legacyStats = {
    plannedSessions: stats.gamesCompleted + stats.gamesFailed,
    earlyExits: stats.gamesFailed,
    stayedWithin: stats.gamesCompleted,
    wentOver: 0,
    averageDelaySeconds: 0,
    longestStabilityRun: 0,
    currentStabilityRun: stats.dailyLogsCount,
  };
  
  // Smart insights from user activity
  const { behaviorPatterns, focusAreas, mojoThemes, isLoading: insightsLoading } = useSmartInsights(
    userId ?? null,
    legacyStats,
    chargeTransactions
  );

  // Calculate control metrics (new focus-based KPIs)
  const controlMetrics: ControlMetrics = {
    urgesHandled: stats.gamesCompleted + stats.dailyLogsCount,
    averageUrgeDuration: 45, // TODO: Calculate from actual data
    lateNightEventsReduced: 0, // TODO: Calculate from patterns
    focusMinutesRegained: stats.gamesCompleted * 15, // Rough estimate
    streakDays: streak,
    resetsCompleted: stats.gamesCompleted,
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-pulse opacity-15" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
            <Flame className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-500">{streak} day streak</span>
          </div>
        </motion.div>

        {/* Exit Philosophy - Ethical framing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <ExitPhilosophy transactions={chargeTransactions} streak={streak} />
        </motion.div>

        {/* Control Metrics - New buyer-relevant KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Your Control Metrics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="dopa-card text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">{controlMetrics.urgesHandled}</p>
              </div>
              <p className="text-xs text-muted-foreground">Urges Handled</p>
            </div>
            <div className="dopa-card text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">{controlMetrics.focusMinutesRegained}</p>
              </div>
              <p className="text-xs text-muted-foreground">Focus Min Regained</p>
            </div>
            <div className="dopa-card text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-2xl font-bold text-foreground">{controlMetrics.resetsCompleted}</p>
              </div>
              <p className="text-xs text-muted-foreground">Resets Completed</p>
            </div>
            <div className="dopa-card text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">{controlMetrics.streakDays}</p>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Narrative - Stories, not charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <WeeklyNarrativeSummary />
        </motion.div>

        {/* Credits & Points - Supporting info, not headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="dopa-card text-center py-4">
            <p className="text-3xl font-bold text-amber-500">{credits}</p>
            <p className="text-xs text-muted-foreground mt-1">Credits Available</p>
          </div>
          <div className="dopa-card text-center py-4">
            <p className="text-3xl font-bold text-blue-500">{points}</p>
            <p className="text-xs text-muted-foreground mt-1">Activity Points</p>
          </div>
        </motion.div>

        {/* Daily Activity Graph - This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dopa-card mb-6"
        >
          <DailyActivityGraph transactions={chargeTransactions} />
        </motion.div>

        {/* Progress Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="dopa-card mb-6"
        >
          <ProgressGraph scores={monthlyScores} />
        </motion.div>

        {/* Monthly Improvements & Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <MonthlyNotes
            month={currentMonth}
            existingNote={monthlyNote}
            onSave={onSaveMonthlyNote}
          />
        </motion.div>

        {/* Weekly Reflection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-4"
        >
          <WeeklyReflection 
            hasReflected={hasWeeklyReflection}
            onSubmit={onWeeklyReflection}
          />
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <MonthlySummary
            month={currentMonth}
            hasSummary={hasMonthlySummary}
            onSubmit={onMonthlySummary}
          />
        </motion.div>

        {/* Trophy Case - Based on total days active */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="dopa-card mb-6"
        >
          <TrophyCase totalDaysActive={totalDaysActive} earnedTrophies={trophies} />
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <JourneyTimeline
            monthlyNotes={monthlyNotes}
            monthlySummaries={monthlySummaries}
            monthlyScores={monthlyScores}
          />
        </motion.div>

        {/* Smart Edge Profile - Uses real behavioral data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="mb-6"
        >
          <SmartEdgeProfile 
            behaviorPatterns={behaviorPatterns}
            focusAreas={focusAreas}
            mojoThemes={mojoThemes}
            isLoading={insightsLoading}
          />
        </motion.div>

        {/* Context note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "The goal is to need this app less."
        </motion.p>
      </div>
    </div>
  );
}
