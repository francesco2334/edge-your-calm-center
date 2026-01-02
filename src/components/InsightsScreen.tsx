import { motion } from 'framer-motion';
import { InsightsGraph } from './InsightsGraph';
import { ChargeCounter } from './ChargeCounter';
import { ProgressGraph, WeeklyReflection, MonthlySummary, MonthlyNotes, TrophyCase, JourneyTimeline, DailyActivityGraph, UrgeControlIndex, PredictionInsight, ProductivityNudge } from './insights';
import { SmartEdgeProfile } from './insights/SmartEdgeProfile';
import { WeeklyNarrativeSummary } from './insights/WeeklyNarrativeSummary';
import { ExitPhilosophy } from './ExitPhilosophy';
import type { AssessmentAnswer } from '@/lib/edge-data';
import type { MonthlyScore, Trophy, WeeklyReflection as WeeklyReflectionType, MonthlyNote, MonthlySummary as MonthlySummaryType } from '@/lib/progress-data';
import { getMonthKey } from '@/lib/progress-data';
import { useSmartInsights } from '@/hooks/useSmartInsights';
import type { TokenTransaction, EconomyStats } from '@/hooks/useTokenEconomy';

interface InsightsScreenProps {
  answers: AssessmentAnswer[];
  tokens: number;
  points: number;
  streak: number;
  stats: EconomyStats;
  tokenTransactions: TokenTransaction[];
  onBack: () => void;
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

export function InsightsScreen({ 
  answers, 
  tokens,
  points,
  stats,
  streak,
  tokenTransactions,
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
}: InsightsScreenProps) {
  const currentMonth = getMonthKey();
  const currentMonthData = monthlyScores.find(s => s.month === currentMonth);
  
  // Convert token transactions to ChargeTransaction format for compatibility
  const chargeTransactions = tokenTransactions.map(t => ({
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

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden pb-24">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-pulse opacity-15" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <ChargeCounter balance={tokens} size="sm" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
          <p className="text-muted-foreground">
            Your progress over time
          </p>
        </motion.div>

        {/* Exit Philosophy - Ethical framing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <ExitPhilosophy transactions={chargeTransactions} streak={streak} />
        </motion.div>

        {/* Weekly Narrative - Stories, not charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="mb-6"
        >
          <WeeklyNarrativeSummary />
        </motion.div>

        {/* Urge Control Index - Key metric */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mb-6"
        >
          <UrgeControlIndex
            predictionAccuracy={100 - (behaviorPatterns.intensity_seeking || 50)}
            averageHoldTime={stats.gamesCompleted * 15}
            tokensEarned={stats.totalTokensEarned || 0}
            tokensSpent={stats.totalTokensSpent || 0}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="dopa-card text-center py-4">
            <p className="text-3xl font-bold text-amber-500">{tokens}</p>
            <p className="text-xs text-muted-foreground mt-1">Tokens (Permission)</p>
          </div>
          <div className="dopa-card text-center py-4">
            <p className="text-3xl font-bold text-blue-500">{points}</p>
            <p className="text-xs text-muted-foreground mt-1">Points (Activity)</p>
          </div>
        </motion.div>

        {/* Token Economy Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          <div className="dopa-card text-center py-3 px-2">
            <p className="text-xl font-bold text-primary">{stats.dailyLogsCount}</p>
            <p className="text-[10px] text-muted-foreground">Days Logged</p>
          </div>
          <div className="dopa-card text-center py-3 px-2">
            <p className="text-xl font-bold text-emerald-400">{stats.learnCardsRead}</p>
            <p className="text-[10px] text-muted-foreground">Cards Read</p>
          </div>
          <div className="dopa-card text-center py-3 px-2">
            <p className="text-xl font-bold text-accent">{stats.gamesCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Games Won</p>
          </div>
          <div className="dopa-card text-center py-3 px-2">
            <p className="text-xl font-bold text-amber-400">{stats.totalTokensSpent}</p>
            <p className="text-[10px] text-muted-foreground">Time Bought</p>
          </div>
        </motion.div>

        {/* Daily Activity Graph - This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dopa-card mb-6"
        >
          <DailyActivityGraph transactions={chargeTransactions} />
        </motion.div>

        {/* Progress Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="dopa-card mb-6"
        >
          <ProgressGraph scores={monthlyScores} />
        </motion.div>

        {/* This Month Stats */}
        {currentMonthData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-4 gap-2 mb-6"
          >
            <div className="dopa-card text-center py-3 px-2">
              <p className="text-xl font-bold text-primary">{currentMonthData.activities}</p>
              <p className="text-[10px] text-muted-foreground">Activities</p>
            </div>
            <div className="dopa-card text-center py-3 px-2">
              <p className="text-xl font-bold text-emerald-400">{currentMonthData.learnCards}</p>
              <p className="text-[10px] text-muted-foreground">Cards Read</p>
            </div>
            <div className="dopa-card text-center py-3 px-2">
              <p className="text-xl font-bold text-accent">{currentMonthData.toolsUsed}</p>
              <p className="text-[10px] text-muted-foreground">Tools Used</p>
            </div>
            <div className="dopa-card text-center py-3 px-2">
              <p className="text-xl font-bold text-amber-400">{currentMonthData.streakDays}</p>
              <p className="text-[10px] text-muted-foreground">Streak Days</p>
            </div>
          </motion.div>
        )}

        {/* Monthly Improvements & Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.32 }}
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
          transition={{ delay: 0.35 }}
          className="dopa-card mb-6"
        >
          <TrophyCase totalDaysActive={totalDaysActive} earnedTrophies={trophies} />
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <SmartEdgeProfile 
            behaviorPatterns={behaviorPatterns}
            focusAreas={focusAreas}
            mojoThemes={mojoThemes}
            isLoading={insightsLoading}
          />
        </motion.div>

        {/* Assessment Insights - Fallback if no smart data */}
        {answers.length > 0 && Object.values(behaviorPatterns).every(v => v === 50) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground mb-3">Initial Edge Profile</p>
            <InsightsGraph answers={answers} />
          </motion.div>
        )}

        {/* Context note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "Progress is measured by activity, not perfection."
        </motion.p>
      </div>
    </div>
  );
}
