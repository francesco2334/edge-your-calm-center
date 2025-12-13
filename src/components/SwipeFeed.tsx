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
      y: dir === 'up' ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? -100 : 100,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative px-5">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-4">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? 'w-6 bg-primary' 
                : 'w-1.5 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Card container */}
      <div className="relative h-[340px] overflow-hidden rounded-[22px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {/* Card content with AI-style background */}
            <div 
              className={`h-full w-full rounded-[22px] overflow-hidden relative bg-gradient-to-t ${currentCard.gradient}`}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              
              {/* Content container at bottom */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{currentCard.icon}</span>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground/80 font-medium">
                    {currentCard.type === 'pull-checkin' ? 'Daily' : currentCard.type}
                  </span>
                </div>

                {/* Title - Large */}
                <h2 className="text-[22px] font-bold text-foreground mb-2 leading-tight">
                  {currentCard.title}
                </h2>

                {/* Content text */}
                {currentCard.content && (
                  <p className="text-[15px] text-foreground/75 mb-4 leading-relaxed line-clamp-3">
                    {currentCard.content}
                  </p>
                )}

                {/* Action button */}
                {currentCard.action && (
                  <button
                    onClick={() => onCardAction(currentCard)}
                    className="py-3 px-5 rounded-[14px] bg-foreground/10 backdrop-blur-md border border-foreground/10 text-foreground text-[15px] font-medium hover:bg-foreground/15 active:scale-[0.98] transition-all"
                  >
                    {currentCard.action.label}
                  </button>
                )}
              </div>

              {/* Swipe indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
              >
                <motion.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[12px] text-muted-foreground/60"
                >
                  {currentIndex < cards.length - 1 ? '↑ Swipe' : ''}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Peek of next card */}
        {currentIndex < cards.length - 1 && (
          <div 
            className={`absolute bottom-0 left-0 right-0 h-16 rounded-b-[22px] bg-gradient-to-t ${cards[currentIndex + 1].gradient} opacity-30 blur-sm translate-y-[90%]`}
          />
        )}
      </div>
    </div>
  );
}
