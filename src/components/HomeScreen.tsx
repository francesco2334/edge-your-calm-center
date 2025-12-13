import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MIRRORS } from '@/lib/edge-data';
import { ChargeCounter } from './ChargeCounter';
import { MojoOrb } from './MojoOrb';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import type { PersonalStats } from '@/lib/charge-data';
import type { ReactionLeaderboard } from '@/lib/reaction-data';

interface HomeScreenProps {
  selectedMirrors: string[];
  onSelectMirror: (mirrorId: string) => void;
  chargeBalance: number;
  stats: PersonalStats;
  streak: number;
  streakClaimedToday: boolean;
  reactionLeaderboard: ReactionLeaderboard;
  onOpenExchange: () => void;
  onOpenInsights: () => void;
  onOpenFeed: () => void;
  onEarnCharge: (amount: number, reason: string) => void;
  onClaimStreak: () => boolean;
  onRecordReaction: (ms: number) => void;
}

type ActiveTool = 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction' | null;

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
  chargeBalance,
  stats,
  streak,
  streakClaimedToday,
  reactionLeaderboard,
  onOpenExchange,
  onOpenInsights,
  onOpenFeed,
  onEarnCharge,
  onClaimStreak,
  onRecordReaction,
}: HomeScreenProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
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

  // Tool handlers
  const handleToolComplete = (chargeAmount: number, reason: string) => {
    onEarnCharge(chargeAmount, reason);
    setActiveTool(null);
  };

  const handleReactionComplete = (ms: number) => {
    onRecordReaction(ms);
    onEarnCharge(1, `Reaction time: ${ms}ms`);
    setActiveTool(null);
  };

  // Render active tool
  if (activeTool === 'pause') {
    return (
      <PauseLadder 
        onComplete={(seconds) => handleToolComplete(seconds >= 40 ? 2 : 1, `Pause Ladder: ${seconds}s`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }

  if (activeTool === 'name') {
    return (
      <NameThePull 
        onComplete={(feeling) => handleToolComplete(1, `Named the pull: ${feeling}`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }

  if (activeTool === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(pred, real) => handleToolComplete(1, `Prediction vs Reality: ${pred} → ${real}`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }

  if (activeTool === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleToolComplete(2, 'Breathing Sync completed')}
        onCancel={() => setActiveTool(null)}
      />
    );
  }

  if (activeTool === 'reaction') {
    return (
      <ReactionTracker 
        onComplete={handleReactionComplete}
        onCancel={() => setActiveTool(null)}
        leaderboard={reactionLeaderboard}
      />
    );
  }

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
            <ChargeCounter balance={chargeBalance} size="sm" />
          </button>
        </motion.div>

        {/* Daily Streak - Claim button */}
        {!streakClaimedToday && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={onClaimStreak}
            className="w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Daily Check-in</p>
                  <p className="text-xs text-muted-foreground">
                    {streak > 0 ? `${streak} day streak` : 'Start your streak'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-amber-400">+20 Charge</span>
            </div>
          </motion.button>
        )}

        {/* Active Streak indicator */}
        {streakClaimedToday && streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-400">Daily Streak</span>
              <span className="text-sm font-medium text-amber-400">
                🔥 {streak} day{streak !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}

        {/* Stability Run indicator */}
        {stats.currentStabilityRun > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400">Stability Run</span>
              <span className="text-sm font-medium text-emerald-400">
                ✨ {stats.currentStabilityRun} session{stats.currentStabilityRun !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}

        {/* Balance indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-3 rounded-xl bg-gradient-glow border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Charge</span>
            <span className="text-sm font-medium text-primary">
              ⚡ {chargeBalance} Charge
            </span>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <button
            onClick={onOpenExchange}
            className="p-4 rounded-xl bg-gradient-glow border border-primary/30 text-center hover:border-primary/50 transition-all"
          >
            <span className="text-lg">⚡</span>
            <p className="text-xs text-muted-foreground mt-1">Exchange</p>
          </button>
          <button
            onClick={onOpenFeed}
            className="p-4 rounded-xl bg-dopa-surface border border-border/30 text-center hover:border-primary/30 transition-all"
          >
            <span className="text-lg">📚</span>
            <p className="text-xs text-muted-foreground mt-1">Learn</p>
          </button>
          <button
            onClick={onOpenInsights}
            className="p-4 rounded-xl bg-dopa-surface border border-border/30 text-center hover:border-primary/30 transition-all"
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
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.25 }}
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
                transition={{ delay: 0.25 + i * 0.05 }}
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
          transition={{ delay: 0.45 }}
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

        {/* Tools section - "Slow the Pull" */}
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
                  { id: 'pause', icon: '⏸️', label: 'Pause Ladder', desc: '10-60 sec delay' },
                  { id: 'name', icon: '📍', label: 'Name the Pull', desc: 'Identify it' },
                  { id: 'breathing', icon: '🫁', label: 'Breathing Sync', desc: '90 sec reset' },
                  { id: 'prediction', icon: '🎯', label: 'Predict vs Real', desc: 'Calibrate reward' },
                  { id: 'reaction', icon: '⚡', label: 'Reaction Time', desc: 'Track awareness' },
                ].map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    onClick={() => setActiveTool(tool.id as ActiveTool)}
                    className="dopa-card cursor-pointer hover:border-primary/30 transition-all text-left"
                  >
                    <span className="text-2xl mb-2 block">{tool.icon}</span>
                    <p className="text-sm font-medium text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </motion.button>
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
