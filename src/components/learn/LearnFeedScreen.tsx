import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronUp, RefreshCw, Settings2 } from 'lucide-react';
import { LearnCardComponent } from './LearnCard';
import { 
  LEARN_CARDS, 
  LEARN_STORAGE_KEYS, 
  getCardsByTopics, 
  shuffleCards,
  type LearnCard 
} from '@/lib/learn-data';
import { useToast } from '@/hooks/use-toast';

interface LearnFeedScreenProps {
  selectedTopics: string[];
  onOpenTopicPicker: () => void;
  onCardViewed?: () => void;
  onCardSaved?: () => void;
}

const CARDS_PER_BATCH = 10;

export function LearnFeedScreen({ selectedTopics, onOpenTopicPicker, onCardViewed, onCardSaved }: LearnFeedScreenProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [likedCards, setLikedCards] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LEARN_STORAGE_KEYS.likedCards);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LEARN_STORAGE_KEYS.hiddenCards);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [feedCards, setFeedCards] = useState<LearnCard[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate initial feed
  const generateFeed = useCallback(() => {
    const baseCards = getCardsByTopics(selectedTopics);
    const visibleCards = baseCards.filter(c => !hiddenCards.has(c.id));
    const shuffled = shuffleCards(visibleCards);
    return shuffled;
  }, [selectedTopics, hiddenCards]);

  // Initialize feed
  useEffect(() => {
    setFeedCards(generateFeed());
    setCurrentIndex(0);
  }, [generateFeed]);

  // Save liked cards
  useEffect(() => {
    localStorage.setItem(LEARN_STORAGE_KEYS.likedCards, JSON.stringify([...likedCards]));
  }, [likedCards]);

  // Save hidden cards
  useEffect(() => {
    localStorage.setItem(LEARN_STORAGE_KEYS.hiddenCards, JSON.stringify([...hiddenCards]));
  }, [hiddenCards]);

  // Handle swipe
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -threshold || velocity < -500) {
      // Swipe up - next card
      if (currentIndex < feedCards.length - 1) {
        setDirection('up');
        setCurrentIndex(prev => prev + 1);
        // Track card viewed
        onCardViewed?.();
      } else {
        // End of feed - load more
        loadMoreCards();
      }
    } else if (offset > threshold || velocity > 500) {
      // Swipe down - previous card
      if (currentIndex > 0) {
        setDirection('down');
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex, feedCards.length, onCardViewed]);

  // Load more cards (infinite scroll simulation)
  const loadMoreCards = useCallback(() => {
    const moreCards = shuffleCards(generateFeed());
    setFeedCards(prev => [...prev, ...moreCards.slice(0, CARDS_PER_BATCH)]);
    toast({
      title: "More content loaded",
      description: "Keep swiping to learn more!",
    });
  }, [generateFeed, toast]);

  // Refresh feed
  const refreshFeed = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setFeedCards(generateFeed());
      setCurrentIndex(0);
      setIsRefreshing(false);
      toast({
        title: "Feed refreshed",
        description: "Fresh content loaded!",
      });
    }, 500);
  }, [generateFeed, toast]);

  // Toggle like
  const toggleLike = (id: string) => {
    setLikedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Track card saved
        onCardSaved?.();
        toast({
          title: "Saved!",
          description: "Card added to your saves.",
        });
      }
      return next;
    });
  };

  // Share card
  const shareCard = async (card: LearnCard) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: `${card.title}\n\n${card.content}${card.fact ? `\n\n📊 ${card.fact}` : ''}`,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${card.title}\n\n${card.content}`);
      toast({
        title: "Copied!",
        description: "Card content copied to clipboard.",
      });
    }
  };

  // Hide card (not interested)
  const hideCard = (id: string) => {
    setHiddenCards(prev => new Set([...prev, id]));
    // Move to next card
    if (currentIndex < feedCards.length - 1) {
      setDirection('up');
      setCurrentIndex(prev => prev + 1);
    }
    toast({
      title: "Got it",
      description: "You won't see this card again.",
    });
  };

  const currentCard = feedCards[currentIndex];

  const variants = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  if (feedCards.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No cards available for your selected topics.</p>
          <button
            onClick={onOpenTopicPicker}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            Choose Different Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-2 flex items-center justify-between">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1 w-24 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((currentIndex + 1) / feedCards.length) * 100, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentIndex + 1}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenTopicPicker}
            className="w-9 h-9 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center"
          >
            <Settings2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Card container */}
      <AnimatePresence mode="wait" custom={direction}>
        {currentCard && (
          <motion.div
            key={currentCard.id + currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 },
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <LearnCardComponent
              card={currentCard}
              isLiked={likedCards.has(currentCard.id)}
              onLike={() => toggleLike(currentCard.id)}
              onShare={() => shareCard(currentCard)}
              onHide={() => hideCard(currentCard.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe hint */}
      {currentIndex < feedCards.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronUp className="w-5 h-5 text-foreground/40" />
          </motion.div>
          <span className="text-[10px] text-foreground/30">Swipe up</span>
        </motion.div>
      )}

      {/* End of feed indicator */}
      {currentIndex >= feedCards.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
        >
          <button
            onClick={loadMoreCards}
            className="px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Load more
          </button>
        </motion.div>
      )}
    </div>
  );
}
