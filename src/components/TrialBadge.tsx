import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TrialBadgeProps {
  daysRemaining: number;
}

export function TrialBadge({ daysRemaining }: TrialBadgeProps) {
  if (daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
        ${isUrgent 
          ? 'bg-destructive/15 text-destructive border border-destructive/20' 
          : 'bg-primary/10 text-primary border border-primary/20'
        }
      `}
    >
      <Clock className="w-3 h-3" />
      <span>{daysRemaining}d left</span>
    </motion.div>
  );
}
