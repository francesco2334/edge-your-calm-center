import { useState } from 'react';
import { motion } from 'framer-motion';
import { MIRRORS } from '@/lib/edge-data';
import { TokenCounter } from './TokenCounter';

interface HomeScreenProps {
  selectedMirrors: string[];
  onSelectMirror: (mirrorId: string) => void;
  tokenBalance: number;
  onOpenExchange: () => void;
  onOpenInsights: () => void;
}

const PULL_OPTIONS = [
  { id: 'scrolling', label: 'Scrolling' },
  { id: 'trading', label: 'Trading' },
  { id: 'porn', label: 'Porn' },
  { id: 'avoidance', label: 'Avoidance' },
  { id: 'spending', label: 'Spending' },
  { id: 'other', label: 'Other' },
  { id: 'none', label: 'No strong pull today', isPositive: true },
];

export function HomeScreen({ 
  selectedMirrors, 
  onSelectMirror, 
  tokenBalance,
  onOpenExchange,
  onOpenInsights,
}: HomeScreenProps) {
  const [todaysPull, setTodaysPull] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);

  const handlePullSelect = (pullId: string) => {
    setTodaysPull(pullId);
    setShowTools(true);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 dopa-orb" />
            <div>
              <p className="text-sm font-medium text-foreground">Good evening</p>
              <p className="text-xs text-muted-foreground">Mojo is here</p>
            </div>
          </div>
          <button onClick={onOpenExchange}>
            <TokenCounter balance={tokenBalance} size="sm" />
          </button>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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
          transition={{ delay: 0.1 }}
          className="dopa-card mb-6"
        >
          <p className="text-sm text-muted-foreground mb-2">Daily Check-in</p>
          <h2 className="text-2xl font-semibold text-foreground">
            What pulled you today?
          </h2>
        </motion.div>

        {/* Pull options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {PULL_OPTIONS.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => handlePullSelect(option.id)}
              className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                todaysPull === option.id
                  ? 'bg-primary/15 border-primary/50'
                  : 'bg-dopa-surface border-border/30 hover:bg-muted'
              } ${option.isPositive ? 'col-span-3' : ''}`}
            >
              <span className={`text-sm font-medium ${
                todaysPull === option.id ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tools section */}
        {showTools && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground mb-4">Quick Tools</p>
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

        {/* Your Mirrors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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