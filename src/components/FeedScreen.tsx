import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FeedCard } from './FeedCard';
import { MojoOrb } from './MojoOrb';
import { ChargeCounter } from './ChargeCounter';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import { generateFeedCards } from '@/lib/feed-data';
import type { FeedCardData } from '@/lib/feed-data';
import type { PersonalStats } from '@/lib/charge-data';
import type { ReactionLeaderboard } from '@/lib/reaction-data';

interface FeedScreenProps {
  chargeBalance: number;
  stats: PersonalStats;
  streak: number;
  streakClaimedToday: boolean;
  reactionLeaderboard: ReactionLeaderboard;
  onOpenExchange: () => void;
  onOpenInsights: () => void;
  onBack: () => void;
  onEarnCharge: (amount: number, reason: string) => void;
  onClaimStreak: () => boolean;
  onRecordReaction: (ms: number) => void;
}

type ActiveTool = 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction' | null;
type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

const SWIPE_THRESHOLD = 50;
const CARD_HEIGHT_VH = 100;

export function FeedScreen({
  chargeBalance,
  stats,
  streak,
  streakClaimedToday,
  reactionLeaderboard,
  onOpenExchange,
  onOpenInsights,
  onBack,
  onEarnCharge,
  onClaimStreak,
  onRecordReaction,
}: FeedScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate feed cards
  const feedCards = useMemo(() => 
    generateFeedCards(streak, chargeBalance, streakClaimedToday),
    [streak, chargeBalance, streakClaimedToday]
  );

  const y = useMotionValue(0);
  const cardOpacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  // Calculate Mojo state based on context
  const mojoState: MojoState = useMemo(() => {
    if (activeTool) return 'regulating';
    const currentCard = feedCards[currentIndex];
    if (currentCard?.type === 'challenge') return 'under-load';
    if (currentCard?.type === 'insight') return 'steady';
    return 'calm';
  }, [activeTool, currentIndex, feedCards]);

  const goToCard = useCallback((index: number) => {
    if (index < 0 || index >= feedCards.length || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [feedCards.length, isTransitioning]);

  const handlePanEnd = useCallback((_: any, info: PanInfo) => {
    const { velocity, offset } = info;
    
    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -200) {
      // Swiped up - next card
      goToCard(currentIndex + 1);
    } else if (offset.y > SWIPE_THRESHOLD || velocity.y > 200) {
      // Swiped down - previous card
      goToCard(currentIndex - 1);
    }
    y.set(0);
  }, [currentIndex, goToCard, y]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToCard(currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToCard(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToCard, activeTool]);

  // Handle card action
  const handleCardAction = useCallback((card: FeedCardData) => {
    if (card.action?.tool) {
      setActiveTool(card.action.tool);
    } else if (card.action?.screen === 'exchange') {
      onOpenExchange();
    } else if (card.action?.screen === 'insights') {
      onOpenInsights();
    }
  }, [onOpenExchange, onOpenInsights]);

  // Tool completion handlers
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

  const currentCard = feedCards[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-background relative"
    >
      {/* Fixed header with Mojo */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors mr-2">
            ← Back
          </button>
          <MojoOrb state={mojoState} size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground">Learn</p>
            <p className="text-xs text-muted-foreground">
              {streak > 0 && `🔥 ${streak} day streak`}
            </p>
          </div>
        </motion.div>
        
        <motion.button 
          onClick={onOpenExchange}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChargeCounter balance={chargeBalance} size="sm" />
        </motion.button>
      </div>

      {/* Progress dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {feedCards.slice(0, 8).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goToCard(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            whileHover={{ scale: 1.3 }}
          />
        ))}
        {feedCards.length > 8 && (
          <span className="text-xs text-muted-foreground">+{feedCards.length - 8}</span>
        )}
      </div>

      {/* Swipeable feed */}
      <motion.div
        className="h-full w-full"
        style={{ y, opacity: cardOpacity }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handlePanEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard?.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="h-full w-full"
          >
            {currentCard && (
              <FeedCard
                card={currentCard}
                isActive={true}
                onAction={() => handleCardAction(currentCard)}
                onCheckin={onClaimStreak}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-30" />
    </div>
  );
}
