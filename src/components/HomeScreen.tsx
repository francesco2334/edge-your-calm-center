import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Zap } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { StreakRing } from './StreakRing';
import { PullSheet } from './PullSheet';
import { SwipeFeed } from './SwipeFeed';
import { TrialBadge } from './TrialBadge';
import { generateFeedCards } from '@/lib/feed-data';
import { useAuth } from '@/hooks/useAuth';
import type { FeedCardData } from '@/lib/feed-data';

interface HomeScreenProps {
  credits: number;
  points: number;
  streak: number;
  hasLoggedToday: boolean;
  trialDaysRemaining?: number;
  currentTrigger?: string | null;
  onOpenReset: () => void;
  onOpenMojoChat?: () => void;
  onOpenQuickStop?: () => void;
  onPullSelect: (pullId: string) => void;
  onRelapseLogged?: () => void;
}

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

export function HomeScreen({
  credits,
  points,
  streak,
  hasLoggedToday,
  trialDaysRemaining,
  currentTrigger,
  onOpenReset,
  onOpenMojoChat,
  onOpenQuickStop,
  onPullSelect,
  onRelapseLogged,
}: HomeScreenProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showPullSheet, setShowPullSheet] = useState(false);

  // Generate feed cards
  const feedCards = useMemo(() => 
    generateFeedCards(streak, credits, hasLoggedToday).slice(0, 5),
    [streak, credits, hasLoggedToday]
  );

  // Mojo state
  const mojoState: MojoState = useMemo(() => {
    if (currentTrigger === 'none') return 'steady';
    if (currentTrigger) return 'under-load';
    return 'calm';
  }, [currentTrigger]);

  const handlePullSelect = (pullId: string) => {
    onPullSelect(pullId);
    setShowPullSheet(false);
    
    // Trigger relapse handler for high-risk pulls
    if (pullId === 'porn' || pullId === 'gambling') {
      onRelapseLogged?.();
    }
  };

  const handleCardAction = (card: FeedCardData) => {
    if (card.action?.screen === 'exchange') {
      onOpenReset();
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 py-4 h-12"
        >
          {/* Left: Mojo state */}
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-5 h-5">
              <MojoOrb state={mojoState} size="sm" />
            </div>
            <span className="text-[11px] text-muted-foreground capitalize tracking-wide font-medium">
              {mojoState}
            </span>
          </div>
          
          {/* Center: App name - reframed */}
          <span className="text-[12px] font-semibold text-muted-foreground/50 tracking-[0.2em] uppercase">
            MOJO
          </span>
          
          {/* Right: Trial badge + Credits + Settings */}
          <div className="flex items-center gap-2">
            {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
              <TrialBadge daysRemaining={trialDaysRemaining} />
            )}
            
            {/* Credits counter - supporting UI, not primary */}
            <div className="px-2.5 py-1 rounded-full bg-muted/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[12px] font-medium text-foreground/70">{credits}</span>
            </div>
            
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

        {/* HERO BLOCK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center pt-6 pb-8"
          style={{ minHeight: '38vh' }}
        >
          {/* Mojo + Streak Ring */}
          <button 
            onClick={onOpenMojoChat}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenQuickStop?.();
            }}
            className="focus:outline-none active:scale-[0.97] transition-transform"
            aria-label="Chat with Mojo"
          >
            <StreakRing streak={streak} claimed={hasLoggedToday} size={196}>
              <MojoOrb state={mojoState} selectedPull={currentTrigger} size="lg" />
            </StreakRing>
          </button>
          
          {/* Day count */}
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
              {currentTrigger 
                ? `Today's pull: ${currentTrigger === 'none' ? 'Clear' : currentTrigger}`
                : "Today's pull: not logged"
              }
            </p>
          </motion.div>

          {/* Mojo CTA - secondary */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onOpenMojoChat}
            className="mt-4 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Ask Mojo for help
          </motion.button>
        </motion.div>

        {/* PRIMARY ACTION - Reset is now the main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-5 mb-6"
        >
          <button
            onClick={onOpenReset}
            className="w-full h-[58px] rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[17px] shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
          >
            <span className="text-xl">🔄</span>
            Start a Reset
          </button>
          
          {/* Secondary: Log the pull */}
          {!hasLoggedToday ? (
            <button
              onClick={() => setShowPullSheet(true)}
              className="w-full mt-3 py-3 rounded-xl bg-muted/30 border border-border/20 text-foreground/80 font-medium text-[14px] hover:bg-muted/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">📝</span>
              Log today's pull (+3 credits)
            </button>
          ) : (
            <p className="text-center text-sm text-muted-foreground/50 mt-4">
              ✓ Pull logged today
            </p>
          )}
        </motion.div>

        {/* SWIPE FEED */}
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

      {/* Pull Sheet */}
      <PullSheet
        isOpen={showPullSheet}
        onClose={() => setShowPullSheet(false)}
        onSelectPull={handlePullSelect}
      />
    </div>
  );
}
