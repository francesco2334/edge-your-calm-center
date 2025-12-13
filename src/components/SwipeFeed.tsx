import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { FeedCardData } from '@/lib/feed-data';

interface SwipeFeedProps {
  cards: FeedCardData[];
  onCardAction: (card: FeedCardData) => void;
}

export function SwipeFeed({ cards, onCardAction }: SwipeFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -threshold || velocity < -500) {
      // Swipe up - next card
      if (currentIndex < cards.length - 1) {
        setDirection('up');
        setCurrentIndex(prev => prev + 1);
      }
    } else if (offset > threshold || velocity > 500) {
      // Swipe down - previous card
      if (currentIndex > 0) {
        setDirection('down');
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex, cards.length]);

  const currentCard = cards[currentIndex];

  const variants = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? 120 : -120,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? -120 : 120,
      opacity: 0,
      scale: 0.94,
    }),
  };

  return (
    <div className="relative px-5">
      {/* Progress dots - cleaner, minimal */}
      <div className="flex justify-center gap-2 mb-5">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? 'w-7 bg-primary' 
                : 'w-[6px] bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>

      {/* Card container - TikTok style, full height feel */}
      <div className="relative h-[360px] overflow-hidden rounded-[22px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: 'spring', stiffness: 280, damping: 32 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {/* Card with gradient background */}
            <div 
              className={`h-full w-full rounded-[22px] overflow-hidden relative bg-gradient-to-t ${currentCard.gradient}`}
            >
              {/* Dark overlay for luxury depth and text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              
              {/* Content container - positioned at bottom */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Category badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-[28px]">{currentCard.icon}</span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 font-semibold">
                    {currentCard.type === 'pull-checkin' ? 'Daily' : currentCard.type}
                  </span>
                </div>

                {/* Title - Large, bold, clear */}
                <h2 className="text-[24px] font-bold text-foreground mb-2.5 leading-tight">
                  {currentCard.title}
                </h2>

                {/* Content text */}
                {currentCard.content && (
                  <p className="text-[15px] text-foreground/70 mb-5 leading-relaxed line-clamp-3 font-medium">
                    {currentCard.content}
                  </p>
                )}

                {/* Action button - single clear CTA */}
                {currentCard.action && (
                  <button
                    onClick={() => onCardAction(currentCard)}
                    className="py-3.5 px-6 rounded-[16px] bg-foreground/10 backdrop-blur-md border border-foreground/10 text-foreground text-[15px] font-semibold hover:bg-foreground/15 active:scale-[0.98] transition-all"
                  >
                    {currentCard.action.label}
                  </button>
                )}
              </div>

              {/* Swipe indicator - subtle */}
              {currentIndex < cards.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ delay: 2 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                >
                  <motion.span
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-[11px] text-muted-foreground/50 font-medium"
                  >
                    ↑ Swipe for more
                  </motion.span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Peek of next card - subtle depth indicator */}
        {currentIndex < cards.length - 1 && (
          <div 
            className={`absolute bottom-0 left-2 right-2 h-20 rounded-b-[22px] bg-gradient-to-t ${cards[currentIndex + 1].gradient} opacity-20 blur-sm translate-y-[95%]`}
          />
        )}
      </div>
    </div>
  );
}