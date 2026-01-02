import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface LearnBridgeProps {
  concept: string;
  context: string; // What the user just did
}

const BRIDGE_CONCEPTS: Record<string, { title: string; connection: string }> = {
  'standoff': {
    title: 'Friction is your friend.',
    connection: 'You practiced this just now.',
  },
  'surfing': {
    title: 'Urges peak and pass.',
    connection: 'You just rode that wave.',
  },
  'bluff': {
    title: 'Dopamine oversells.',
    connection: 'You caught your brain exaggerating.',
  },
  'sync': {
    title: 'Slow breath = slow mind.',
    connection: 'Your nervous system just reset.',
  },
  'nameIt': {
    title: 'Naming tames.',
    connection: 'You reduced that feeling by 50%.',
  },
};

export function LearnBridge({ concept, context }: LearnBridgeProps) {
  const bridgeData = BRIDGE_CONCEPTS[concept];
  
  if (!bridgeData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="dopa-card bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-500/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-blue-400" />
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Related idea:</p>
          <p className="text-sm font-medium text-foreground">
            "{bridgeData.title}"
          </p>
          <p className="text-xs text-primary mt-1">
            {bridgeData.connection}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
