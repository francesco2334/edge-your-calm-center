import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { StreakRing } from './StreakRing';
import { PullSheet } from './PullSheet';
import { SwipeFeed } from './SwipeFeed';
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
  onOpenQuickStop?: () => void;
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
  onOpenQuickStop,
}: HomeScreenProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [showPullSheet, setShowPullSheet] = useState(false);
  const [todaysPull, setTodaysPull] = useState<string | null>(null);

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
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Ambient background - luxury feel */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10">
        {/* UTILITY - Minimal Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 py-4 h-12"
        >
          {/* Left: Mojo state - subtle */}
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-5 h-5">
              <MojoOrb state={mojoState} size="sm" />
            </div>
            <span className="text-[11px] text-muted-foreground capitalize tracking-wide font-medium">
              {mojoState}
            </span>
          </div>
          
          {/* Center: App name - quiet */}
          <span className="text-[12px] font-semibold text-muted-foreground/50 tracking-[0.2em] uppercase">
            DopaMINE
          </span>
          
          {/* Right: Charge pill + Settings */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenExchange}
              className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5 hover:bg-primary/15 active:scale-95 transition-all"
            >
              <span className="text-[13px]">⚡</span>
              <span className="text-[12px] font-bold text-primary">{chargeBalance}</span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-95 transition-all"
              aria-label={isAuthenticated ? 'Settings' : 'Sign in'}
            >
              {isAuthenticated && user?.email ? (
                <span className="text-[11px] font-bold text-foreground">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </motion.header>

        {/* HERO BLOCK - Level 1: 38% of screen, THE main character */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center pt-6 pb-8"
          style={{ minHeight: '38vh' }}
        >
          {/* Tappable Mojo + Streak Ring - The single hero element */}
          <button 
            onClick={onOpenMojoChat}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenQuickStop?.();
            }}
            className="focus:outline-none active:scale-[0.97] transition-transform"
            aria-label="Chat with Mojo"
          >
            <StreakRing streak={streak} claimed={streakClaimedToday} size={196}>
              <MojoOrb state={mojoState} selectedPull={todaysPull} size="lg" />
            </StreakRing>
          </button>
          
          {/* Day count - Large, bold, immediately under hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-7 text-center"
          >
            <p className="text-[40px] font-bold text-foreground tracking-tight leading-none">
              {streak > 0 ? `Day ${streak}` : 'Day 0'}
            </p>
            <p className="text-[15px] text-muted-foreground/60 mt-2 font-medium">
              {todaysPull 
                ? `Today's pull: ${todaysPull === 'none' ? 'Clear' : todaysPull}`
                : "Today's pull: not logged"
              }
            </p>
          </motion.div>
        </motion.div>

        {/* PRIMARY ACTION - Level 2: One clear CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-5 mb-6"
        >
          {!todaysPull ? (
            <button
              onClick={() => setShowPullSheet(true)}
              className="w-full h-[54px] rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[16px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Log today's pull
            </button>
          ) : (
            <button
              onClick={onOpenExchange}
              className="w-full h-[54px] rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[16px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Start an Exchange
            </button>
          )}
          
          {/* Secondary link - tiny, unobtrusive */}
          <button
            onClick={onOpenQuickStop}
            className="w-full mt-3 text-[13px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors font-medium"
          >
            Quick Stop (20s) →
          </button>
        </motion.div>

        {/* SWIPE FEED - Level 3: TikTok style vertical cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2"
        >
          <SwipeFeed 
            cards={feedCards} 
            onCardAction={handleCardAction}
          />
        </motion.div>
      </div>

      {/* Pull Sheet - iOS bottom sheet */}
      <PullSheet
        isOpen={showPullSheet}
        onClose={() => setShowPullSheet(false)}
        onSelectPull={handlePullSelect}
      />
    </div>
  );
}