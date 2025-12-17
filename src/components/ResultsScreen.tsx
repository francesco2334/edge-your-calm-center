import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { type DopaState, DOPA_STATES, type AssessmentAnswer, calculateDopaState } from '@/lib/edge-data';

interface ResultsScreenProps {
  answers: AssessmentAnswer[];
  onContinue: () => void;
}

export function ResultsScreen({ answers, onContinue }: ResultsScreenProps) {
  const dopaState = calculateDopaState(answers);
  const stateInfo = DOPA_STATES[dopaState];

  // Calculate score percentage for ring
  const totalScore = answers.reduce((sum, a) => sum + a.value, 0);
  const maxScore = answers.length * 4;
  const percentage = (totalScore / maxScore) * 100;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden safe-area-inset">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-30" />

      {/* Spacer */}
      <div className="flex-1 min-h-[20px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md w-full mx-auto"
      >
        {/* Header */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm uppercase tracking-widest text-muted-foreground mb-6"
        >
          Your <span className="text-primary">DopaMINE</span> State
        </motion.p>

        {/* Progress Ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-40 h-40 mx-auto mb-6"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={stateInfo.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 12px ${stateInfo.color})`,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-bold"
              style={{ color: stateInfo.color }}
            >
              {stateInfo.title}
            </motion.span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="dopa-card mb-4"
        >
          <p className="text-foreground leading-relaxed text-sm">
            {stateInfo.description}
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground mb-6 italic"
        >
          "This doesn't say anything about who you are.
          <br />
          It only reflects how much pull your system is under right now."
        </motion.p>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1 min-h-[20px]" />

      {/* CTA - Fixed at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="relative z-10 max-w-md mx-auto w-full"
      >
        <Button
          variant="edge"
          size="lg"
          onClick={onContinue}
          className="w-full"
        >
          Meet Mojo
        </Button>
      </motion.div>
    </div>
  );
}
