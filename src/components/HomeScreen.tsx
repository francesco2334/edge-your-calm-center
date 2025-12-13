import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { ChargeCounter } from './ChargeCounter';
import { StreakRing } from './StreakRing';
import { PullSheet } from './PullSheet';
import { FeedCard } from './FeedCard';
import { NeuroFacts } from './NeuroFacts';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import { generateFeedCards } from '@/lib/feed-data';
import { useAuth } from '@/hooks/useAuth';
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
  onOpenMojoChat?: () => void;
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
  onOpenMojoChat,
}: HomeScreenProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
      <div className="absolute inset-0 bg-gradient-pulse opacity-20" />

      <div className="relative z-10">
        {/* Header - Subtle, disappears mentally */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 py-3"
        >
          <div className="flex items-center gap-1.5 opacity-60">
            <MojoOrb state={mojoState} size="sm" />
            <span className="text-[11px] text-muted-foreground capitalize">{mojoState}</span>
          </div>
          
          <span className="text-xs font-medium text-muted-foreground/70 tracking-wide">
            DopaMINE
          </span>
          
          <div className="flex items-center gap-3">
            <button onClick={onOpenExchange}>
              <ChargeCounter balance={chargeBalance} size="sm" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label={isAuthenticated ? 'Settings' : 'Sign in'}
            >
              {isAuthenticated && user?.email ? (
                <span className="text-xs font-medium text-foreground">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </motion.header>

        {/* Hero: Big Mojo Orb + Streak Ring - THE MAIN CHARACTER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex flex-col items-center justify-center pt-6 pb-10"
        >
          <button 
            onClick={onOpenMojoChat}
            className="focus:outline-none"
            aria-label="Chat with Mojo"
          >
            <StreakRing streak={streak} claimed={streakClaimedToday} size={220}>
              <MojoOrb state={mojoState} size="lg" />
            </StreakRing>
          </button>
          <p className="text-xs text-muted-foreground/60 mt-2">Tap Mojo to chat</p>
          
          {/* Streak text - integrated with hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {streak > 0 ? `Day ${streak}` : 'Day 0'}
            </p>
            <p className="text-sm text-muted-foreground/80 mt-2">
              {todaysPull 
                ? `Today's pull: ${todaysPull === 'none' ? 'Clear' : todaysPull}`
                : 'Log your pull to continue'
              }
            </p>
          </motion.div>
        </motion.div>

        {/* Primary CTA - Smaller, closer to hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-8 mb-10"
        >
          {!todaysPull ? (
            <button
              onClick={() => setShowPullSheet(true)}
              className="w-full py-3 rounded-xl bg-gradient-neon text-primary-foreground font-medium text-base shadow-lg shadow-primary/20"
            >
              Log today's pull
            </button>
          ) : (
            <button
              onClick={onOpenExchange}
              className="w-full py-3 rounded-xl bg-gradient-neon text-primary-foreground font-medium text-base shadow-lg shadow-primary/20"
            >
              Start Focus Exchange
            </button>
          )}
        </motion.div>

        {/* Neuroplasticity Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="px-6 mb-8"
        >
          <NeuroFacts />
        </motion.div>

        {/* Feed Section - Taller cards, 1.2 visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-5 px-6 pb-6">
            {feedCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex-shrink-0 w-[85vw] max-w-[320px] h-[420px] rounded-3xl overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-3xl mb-3">{card.icon}</span>
                  <h3 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                    {card.title}
                  </h3>
                  {card.content && (
                    <p className="text-sm text-foreground/70 mb-5 line-clamp-3 leading-relaxed">
                      {card.content}
                    </p>
                  )}
                  {card.action && (
                    <button
                      onClick={() => handleCardAction(card)}
                      className="py-3 px-5 rounded-xl bg-foreground/10 backdrop-blur-sm border border-foreground/10 text-foreground text-sm font-medium hover:bg-foreground/20 transition-colors"
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
