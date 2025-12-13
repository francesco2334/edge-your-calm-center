import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MIRRORS } from '@/lib/edge-data';
import { TokenCounter } from './TokenCounter';
import { MojoOrb } from './MojoOrb';

interface HomeScreenProps {
  selectedMirrors: string[];
  onSelectMirror: (mirrorId: string) => void;
  tokenBalance: number;
  onOpenExchange: () => void;
  onOpenInsights: () => void;
}

const PULL_OPTIONS = [
  { id: 'scrolling', label: 'Scrolling', weight: 5 },
  { id: 'trading', label: 'Trading', weight: 3 },
  { id: 'porn', label: 'Porn', weight: 4 },
  { id: 'avoidance', label: 'Avoidance', weight: 2 },
  { id: 'spending', label: 'Spending', weight: 2 },
  { id: 'other', label: 'Other', weight: 1 },
];

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

const MOJO_STATE_LABELS: Record<MojoState, { label: string; color: string }> = {
  'calm': { label: 'Calm', color: 'text-emerald-400' },
  'regulating': { label: 'Regulating', color: 'text-amber-400' },
  'under-load': { label: 'Under Load', color: 'text-orange-400' },
  'steady': { label: 'Steady', color: 'text-primary' },
};

export function HomeScreen({ 
  selectedMirrors, 
  onSelectMirror, 
  tokenBalance,
  onOpenExchange,
  onOpenInsights,
}: HomeScreenProps) {
  const [todaysPull, setTodaysPull] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [pullHistory] = useState<Record<string, number>>({
    scrolling: 12,
    porn: 8,
    trading: 5,
    avoidance: 3,
    spending: 2,
    other: 1,
  });

  // Sort pull options by frequency (most common first)
  const sortedPullOptions = useMemo(() => {
    return [...PULL_OPTIONS].sort((a, b) => {
      const aCount = pullHistory[a.id] || 0;
      const bCount = pullHistory[b.id] || 0;
      return bCount - aCount;
    });
  }, [pullHistory]);

  // Calculate Mojo state based on current context
  const mojoState: MojoState = useMemo(() => {
    if (!todaysPull) return 'calm';
    if (todaysPull === 'none') return 'steady';
    if (showTools) return 'regulating';
    return 'under-load';
  }, [todaysPull, showTools]);

  const handlePullSelect = (pullId: string) => {
    setTodaysPull(pullId);
    if (pullId !== 'none') {
      setShowTools(true);
    } else {
      setShowTools(false);
    }
  };

  const focusMinutes = tokenBalance * 10;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />

      <div className="relative z-10">
        {/* Header with Mojo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <MojoOrb 
              state={mojoState} 
              selectedPull={todaysPull}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Good evening</p>
              <p className={`text-xs ${MOJO_STATE_LABELS[mojoState].color}`}>
                Mojo: {MOJO_STATE_LABELS[mojoState].label}
              </p>
            </div>
          </div>
          <button onClick={onOpenExchange}>
            <TokenCounter balance={tokenBalance} size="sm" />
          </button>
        </motion.div>

        {/* Balance indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 p-3 rounded-xl bg-gradient-glow border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today's balance</span>
            <span className="text-sm font-medium text-primary">
              ⚡ {focusMinutes} Focus Minutes
            </span>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <button
            onClick={onOpenExchange}
            className="flex-1 p-4 rounded-xl bg-gradient-glow border border-primary/30 text-center hover:border-primary/50 transition-all"
          >
            <span className="text-lg">⚡</span>
            <p className="text-xs text-muted-foreground mt-1">Exchange</p>
          </button>
          <button
            onClick={onOpenInsights}
            className="flex-1 p-4 rounded-xl bg-dopa-surface border border-border/30 text-center hover:border-primary/30 transition-all"
          >
            <span className="text-lg">📊</span>
            <p className="text-xs text-muted-foreground mt-1">Insights</p>
          </button>
        </motion.div>

        {/* Daily prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="dopa-card mb-6"
        >
          <p className="text-sm text-muted-foreground mb-2">Daily Check-in</p>
          <h2 className="text-2xl font-semibold text-foreground">
            What pulled you today?
          </h2>
        </motion.div>

        {/* Pull options - dynamically sorted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-4"
        >
          {sortedPullOptions.map((option, i) => {
            const frequency = pullHistory[option.id] || 0;
            const isFrequent = frequency > 5;
            
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isFrequent ? 1 : 0.7, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => handlePullSelect(option.id)}
                className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                  todaysPull === option.id
                    ? 'bg-primary/15 border-primary/50'
                    : 'bg-dopa-surface border-border/30 hover:bg-muted hover:opacity-100'
                }`}
              >
                <span className={`text-sm font-medium ${
                  todaysPull === option.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* No strong pull option */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handlePullSelect('none')}
          className={`w-full p-4 rounded-xl text-center transition-all duration-200 border mb-8 ${
            todaysPull === 'none'
              ? 'bg-emerald-500/15 border-emerald-500/50'
              : 'bg-dopa-surface border-border/30 hover:bg-muted'
          }`}
        >
          <span className={`text-sm font-medium ${
            todaysPull === 'none' ? 'text-emerald-400' : 'text-muted-foreground'
          }`}>
            No strong pull today
          </span>
        </motion.button>

        {/* Tools section - renamed to "Slow the Pull" */}
        <AnimatePresence>
          {showTools && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm text-muted-foreground mb-4">Slow the Pull</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '⏸️', label: 'Pause Tool', desc: '10-60 sec delay' },
                  { icon: '📍', label: 'Name the Pull', desc: 'Identify it' },
                  { icon: '🫁', label: 'Body Reset', desc: 'Breathing' },
                  { icon: '↘️', label: 'Intensity Drop', desc: 'Lower the load' },
                ].map((tool, i) => (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="dopa-card cursor-pointer hover:border-primary/30 transition-all"
                  >
                    <span className="text-2xl mb-2 block">{tool.icon}</span>
                    <p className="text-sm font-medium text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Your Mirrors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-4">Your Mirrors</p>
          <div className="flex flex-wrap gap-2">
            {MIRRORS.slice(0, 4).map((mirror) => (
              <button
                key={mirror.id}
                onClick={() => onSelectMirror(mirror.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  selectedMirrors.includes(mirror.id)
                    ? 'bg-primary/15 border-primary/50 text-foreground'
                    : 'bg-dopa-surface border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {mirror.icon} {mirror.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom nav hint */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </div>
  );
}
