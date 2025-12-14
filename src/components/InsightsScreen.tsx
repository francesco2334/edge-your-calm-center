import { motion } from 'framer-motion';
import { InsightsGraph } from './InsightsGraph';
import { ChargeCounter } from './ChargeCounter';
import { ProgressGraph, WeeklyReflection, MonthlySummary, TrophyCase } from './insights';
import type { AssessmentAnswer } from '@/lib/edge-data';
import type { PersonalStats } from '@/lib/charge-data';
import type { MonthlyScore, Trophy, WeeklyReflection as WeeklyReflectionType } from '@/lib/progress-data';
import { getMonthKey } from '@/lib/progress-data';

interface InsightsScreenProps {
  answers: AssessmentAnswer[];
  chargeBalance: number;
  stats: PersonalStats;
  onBack: () => void;
  // Progress Engine props
  monthlyScores: MonthlyScore[];
  trophies: Trophy[];
  hasWeeklyReflection: boolean;
  hasMonthlySummary: boolean;
  onWeeklyReflection: (prompts: WeeklyReflectionType['prompts']) => void;
  onMonthlySummary: (content: string) => void;
}

export function InsightsScreen({ 
  answers, 
  chargeBalance, 
  stats, 
  onBack,
  monthlyScores,
  trophies,
  hasWeeklyReflection,
  hasMonthlySummary,
  onWeeklyReflection,
  onMonthlySummary,
}: InsightsScreenProps) {
  const currentMonth = getMonthKey();
  const currentMonthTrophies = trophies.filter(t => t.month === currentMonth);

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
          <ChargeCounter balance={chargeBalance} size="sm" />
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

        {/* Progress Graph - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="dopa-card mb-6"
        >
          <ProgressGraph scores={monthlyScores} />
        </motion.div>

        {/* Weekly Reflection - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <WeeklyReflection 
            hasReflected={hasWeeklyReflection}
            onSubmit={onWeeklyReflection}
          />
        </motion.div>

        {/* Monthly Summary - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <MonthlySummary
            month={currentMonth}
            hasSummary={hasMonthlySummary}
            onSubmit={onMonthlySummary}
          />
        </motion.div>

        {/* Trophy Case - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dopa-card mb-6"
        >
          <TrophyCase earnedTrophies={currentMonthTrophies} month={currentMonth} />
        </motion.div>

        {/* Control Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="dopa-card text-center">
            <p className="text-2xl font-bold text-primary">{stats.plannedSessions}</p>
            <p className="text-xs text-muted-foreground">Planned</p>
          </div>
          <div className="dopa-card text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.earlyExits}</p>
            <p className="text-xs text-muted-foreground">Early Exits</p>
          </div>
          <div className="dopa-card text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.currentStabilityRun}</p>
            <p className="text-xs text-muted-foreground">Run</p>
          </div>
        </motion.div>

        {/* Personal Progress */}
        {stats.plannedSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dopa-card mb-6"
          >
            <p className="text-sm text-muted-foreground mb-3">Control Metrics</p>
            <div className="space-y-3">
              {stats.stayedWithin > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Stayed within plan</span>
                  <span className="text-sm font-medium text-emerald-400">{stats.stayedWithin}x</span>
                </div>
              )}
              {stats.earlyExits > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Exited early</span>
                  <span className="text-sm font-medium text-primary">{stats.earlyExits}x</span>
                </div>
              )}
              {stats.wentOver > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Went over</span>
                  <span className="text-sm font-medium text-muted-foreground">{stats.wentOver}x</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Assessment Insights */}
        {answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <p className="text-sm text-muted-foreground mb-3">Edge Profile</p>
            <InsightsGraph answers={answers} />
          </motion.div>
        )}

        {/* Context note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "Progress is measured by activity, not perfection."
        </motion.p>
      </div>
    </div>
  );
}
