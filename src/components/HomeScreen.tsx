import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Coins } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { StreakRing } from './StreakRing';
import { PullSheet } from './PullSheet';
import { SwipeFeed } from './SwipeFeed';
import { TrialBadge } from './TrialBadge';
import { generateFeedCards } from '@/lib/feed-data';
import { useAuth } from '@/hooks/useAuth';
import { useMojoCosmeticsOptional } from '@/contexts/MojoCosmeticsContext';
import type { FeedCardData } from '@/lib/feed-data';

interface HomeScreenProps {
  tokens: number;
  points: number;
  streak: number;
  hasLoggedToday: boolean;
  trialDaysRemaining?: number;
  currentTrigger?: string | null;
  onOpenExchange: () => void;
  onOpenMojoChat?: () => void;
  onOpenQuickStop?: () => void;
  onOpenCustomize?: () => void;
  onPullSelect: (pullId: string) => void;
  onRelapseLogged?: () => void;
}

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

export function HomeScreen({
  tokens,
  points,
  streak,
  hasLoggedToday,
  trialDaysRemaining,
  currentTrigger,
  onOpenExchange,
  onOpenMojoChat,
  onOpenQuickStop,
  onOpenCustomize,
  onPullSelect,
  onRelapseLogged,
}: HomeScreenProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const cosmeticsContext = useMojoCosmeticsOptional();
  const [showPullSheet, setShowPullSheet] = useState(false);

  // Generate feed cards
  const feedCards = useMemo(() => 
    generateFeedCards(streak, tokens, hasLoggedToday).slice(0, 5),
    [streak, tokens, hasLoggedToday]
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
      onOpenExchange();
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
          className="grid grid-cols-3 items-center px-5 py-4 h-12"
        >
          {/* Left: Mojo state */}
          <div className="flex items-center gap-2 opacity-40 justify-start">
            <div className="w-5 h-5">
              <MojoOrb state={mojoState} size="sm" cosmetics={cosmeticsContext?.equippedCosmetics} />
            </div>
            <span className="text-[11px] text-muted-foreground capitalize tracking-wide font-medium">
              {mojoState}
            </span>
          </div>
          
          {/* Center: App name */}
          <span className="text-[12px] font-semibold text-muted-foreground/50 tracking-[0.2em] uppercase text-center">
            DopaMINE
          </span>
          
          {/* Right: Trial badge + Token pill + Settings */}
          <div className="flex items-center gap-2 justify-end">
            {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
              <TrialBadge daysRemaining={trialDaysRemaining} />
            )}
            
            {/* Token counter - primary currency display */}
            <button 
              onClick={onOpenExchange}
              className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center gap-1.5 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[12px] font-bold text-amber-500">{tokens}</span>
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

        {/* HERO BLOCK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center w-full pt-6 pb-8"
          style={{ minHeight: '38vh' }}
        >
          {/* Mojo + Streak Ring - Centered */}
          <div className="w-full flex flex-col items-center justify-center relative">
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
                <MojoOrb state={mojoState} selectedPull={currentTrigger} size="lg" cosmetics={cosmeticsContext?.equippedCosmetics} />
              </StreakRing>
            </button>
            
            {/* Customize Mojo button */}
            <button
              onClick={onOpenCustomize}
              className="mt-3 px-3 py-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full hover:bg-muted/50 transition-colors"
            >
              ✨ Customize Mojo
            </button>
          </div>
          
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

          {/* Mojo CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onOpenMojoChat}
            className="mt-4 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Talk to Mojo
          </motion.button>
        </motion.div>

        {/* PRIMARY ACTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-5 mb-6"
        >
          {!hasLoggedToday ? (
            <button
              onClick={() => setShowPullSheet(true)}
              className="w-full h-[54px] rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[16px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Log today's pull (+3 tokens)
            </button>
          ) : (
            <button
              onClick={onOpenExchange}
              className="w-full h-[54px] rounded-[18px] bg-gradient-neon text-primary-foreground font-semibold text-[16px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Spend tokens ({tokens} available)
            </button>
          )}
          
          {/* Secondary link */}
          <button
            onClick={onOpenQuickStop}
            className="w-full mt-3 text-[13px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors font-medium"
          >
            Quick Stop (20s) →
          </button>
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
