import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MojoOrb } from './MojoOrb';
import { ChargeCounter } from './ChargeCounter';
import { StreakRing } from './StreakRing';
import { PullSheet } from './PullSheet';
import { FeedCard } from './FeedCard';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import { generateFeedCards } from '@/lib/feed-data';
import type { FeedCardData } from '@/lib/feed-data';
import type { PersonalStats } from '@/lib/charge-data';
import type { ReactionLeaderboard } from '@/lib/reaction-data';

interface HomeScreenProps {
  chargeBalance: number;
  stats: PersonalStats;
  streak: number;
  streakClaimedToday: boolean;
  reactionLeaderboard: ReactionLeaderboard;
  onOpenExchange: () => void;
  onEarnCharge: (amount: number, reason: string) => void;
  onClaimStreak: () => boolean;
  onRecordReaction: (ms: number) => void;
}

type ActiveTool = 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction' | null;
type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

export function HomeScreen({
  chargeBalance,
  stats,
  streak,
  streakClaimedToday,
  reactionLeaderboard,
  onOpenExchange,
  onEarnCharge,
  onClaimStreak,
  onRecordReaction,
}: HomeScreenProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [showPullSheet, setShowPullSheet] = useState(false);
  const [todaysPull, setTodaysPull] = useState<string | null>(null);
  const [feedIndex, setFeedIndex] = useState(0);

  // Generate feed cards
  const feedCards = useMemo(() => 
    generateFeedCards(streak, chargeBalance, streakClaimedToday).slice(0, 5),
    [streak, chargeBalance, streakClaimedToday]
  );

  // Mojo state
  const mojoState: MojoState = useMemo(() => {
    if (activeTool) return 'regulating';
    if (todaysPull === 'none') return 'steady';
    if (todaysPull) return 'under-load';
    return 'calm';
  }, [activeTool, todaysPull]);

  const handlePullSelect = (pullId: string) => {
    setTodaysPull(pullId);
    if (!streakClaimedToday) {
      onClaimStreak();
    }
  };

  const handleCardAction = (card: FeedCardData) => {
    if (card.action?.tool) {
      setActiveTool(card.action.tool);
    } else if (card.action?.screen === 'exchange') {
      onOpenExchange();
    }
  };

  const handleToolComplete = (charge: number, reason: string) => {
    onEarnCharge(charge, reason);
    setActiveTool(null);
  };

  const handleReactionComplete = (ms: number) => {
    onRecordReaction(ms);
    onEarnCharge(1, `Reaction: ${ms}ms`);
    setActiveTool(null);
  };

  // Render active tool fullscreen
  if (activeTool === 'pause') {
    return (
      <PauseLadder 
        onComplete={(s) => handleToolComplete(s >= 40 ? 2 : 1, `Standoff: ${s}s`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }
  if (activeTool === 'name') {
    return (
      <NameThePull 
        onComplete={(f) => handleToolComplete(1, `Named: ${f}`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }
  if (activeTool === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(p, r) => handleToolComplete(1, `Bluff: ${p}→${r}`)}
        onCancel={() => setActiveTool(null)}
      />
    );
  }
  if (activeTool === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleToolComplete(2, 'Sync complete')}
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
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute inset-0 bg-gradient-pulse opacity-30" />

      <div className="relative z-10">
        {/* Header - Small, Clean, Premium */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-2">
            <MojoOrb state={mojoState} size="sm" />
            <span className="text-xs text-muted-foreground">
              Mojo: <span className="text-foreground capitalize">{mojoState}</span>
            </span>
          </div>
          
          <span className="text-sm font-semibold text-foreground tracking-tight">
            DopaMINE
          </span>
          
          <button onClick={onOpenExchange}>
            <ChargeCounter balance={chargeBalance} size="sm" />
          </button>
        </motion.header>

        {/* Hero: Big Mojo Orb + Streak Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <StreakRing streak={streak} claimed={streakClaimedToday} size={180}>
            <MojoOrb state={mojoState} size="lg" />
          </StreakRing>
          
          {/* Streak text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-3xl font-bold text-foreground">
              {streak > 0 ? `Day ${streak}` : 'Day 0'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {todaysPull 
                ? `Today's pull: ${todaysPull === 'none' ? 'Clear' : todaysPull}`
                : 'Log your pull to continue'
              }
            </p>
          </motion.div>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 mb-8"
        >
          {!todaysPull ? (
            <button
              onClick={() => setShowPullSheet(true)}
              className="w-full py-4 rounded-2xl bg-gradient-neon text-primary-foreground font-semibold text-lg shadow-neon dopa-glow-button"
            >
              Log the Pull
            </button>
          ) : (
            <button
              onClick={onOpenExchange}
              className="w-full py-4 rounded-2xl bg-gradient-neon text-primary-foreground font-semibold text-lg shadow-neon dopa-glow-button"
            >
              Start Focus Exchange
            </button>
          )}
        </motion.div>

        {/* Feed Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 mb-4"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Today's Feed
          </p>
        </motion.div>

        {/* Horizontal Feed Cards (swipeable) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-4 px-6 pb-4">
            {feedCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex-shrink-0 w-72 h-80 rounded-2xl overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="text-2xl mb-2">{card.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-1 leading-tight">
                    {card.title}
                  </h3>
                  {card.content && (
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                      {card.content}
                    </p>
                  )}
                  {card.action && (
                    <button
                      onClick={() => handleCardAction(card)}
                      className="py-2.5 px-4 rounded-xl bg-primary/90 text-primary-foreground text-sm font-medium hover:bg-primary transition-colors"
                    >
                      {card.action.label}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pull Sheet */}
      <PullSheet
        isOpen={showPullSheet}
        onClose={() => setShowPullSheet(false)}
        onSelectPull={handlePullSelect}
      />
    </div>
  );
}
