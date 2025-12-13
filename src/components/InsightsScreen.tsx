import { motion } from 'framer-motion';
import { InsightsGraph } from './InsightsGraph';
import { TokenCounter } from './TokenCounter';
import type { AssessmentAnswer } from '@/lib/edge-data';

interface InsightsScreenProps {
  answers: AssessmentAnswer[];
  tokenBalance: number;
  onBack: () => void;
}

export function InsightsScreen({ answers, tokenBalance, onBack }: InsightsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-pulse opacity-20" />

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
          <TokenCounter balance={tokenBalance} size="sm" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Where the pull shows up — and where you're strong.
          </p>
        </motion.div>

        {/* Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InsightsGraph answers={answers} />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Low load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--dopa-warm))' }} />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(35, 80%, 55%)' }} />
            <span>High load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0, 65%, 55%)' }} />
            <span>Overloaded</span>
          </div>
        </motion.div>

        {/* Context note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "This is a snapshot, not a sentence. It changes with awareness."
        </motion.p>
      </div>
    </div>
  );
}