import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProductivityNudgeProps {
  logsThisWeek: number;
}

export function ProductivityNudge({ logsThisWeek }: ProductivityNudgeProps) {
  // Only show if user has logged at least once but less than daily
  if (logsThisWeek === 0 || logsThisWeek >= 21) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dopa-card bg-muted/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        
        <div>
          <p className="text-sm text-foreground">
            You logged <span className="font-semibold text-primary">{logsThisWeek}</span> value-aligned {logsThisWeek === 1 ? 'action' : 'actions'} this week.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            That's enough. Consistency beats intensity.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
