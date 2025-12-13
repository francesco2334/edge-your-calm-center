import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { EDUCATION_SLIDES, EDUCATION_CATEGORIES, type EducationSlide } from '@/lib/education-data';

interface EducationSwiperProps {
  onClose: () => void;
  onEarnCharge?: (amount: number, reason: string) => void;
}

export function EducationSwiper({ onClose, onEarnCharge }: EducationSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewedSlides, setViewedSlides] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSlides = selectedCategory === 'all' 
    ? EDUCATION_SLIDES 
    : EDUCATION_SLIDES.filter(s => s.category === selectedCategory);

  const currentSlide = filteredSlides[currentIndex];

  const handleSwipe = useCallback((newDirection: number) => {
    if (newDirection > 0 && currentIndex < filteredSlides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      
      // Track viewed slides for charge
      const nextSlide = filteredSlides[currentIndex + 1];
      if (nextSlide && !viewedSlides.has(nextSlide.id)) {
        setViewedSlides(prev => new Set([...prev, nextSlide.id]));
      }
    } else if (newDirection < 0 && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, filteredSlides, viewedSlides]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      handleSwipe(1);
    } else if (info.offset.y > threshold) {
      handleSwipe(-1);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
  };

  const handleCloseWithReward = () => {
    if (viewedSlides.size >= 3 && onEarnCharge) {
      onEarnCharge(1, `Learned ${viewedSlides.size} facts`);
    }
    onClose();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="relative z-20 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleCloseWithReward}
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            ← Close
          </button>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {filteredSlides.length}
          </span>
          {viewedSlides.size >= 3 && (
            <span className="text-xs text-primary">+1 Charge</span>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {EDUCATION_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-dopa-surface text-muted-foreground border border-border/30'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide?.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex flex-col px-6 cursor-grab active:cursor-grabbing"
          >
            {currentSlide && (
              <SlideContent slide={currentSlide} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {filteredSlides.slice(
            Math.max(0, currentIndex - 2), 
            Math.min(filteredSlides.length, currentIndex + 3)
          ).map((slide, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <div
                key={slide.id}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  actualIndex === currentIndex
                    ? 'bg-primary w-4'
                    : 'bg-muted-foreground/30'
                }`}
              />
            );
          })}
        </div>

        {/* Swipe hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2"
        >
          <motion.p
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-muted-foreground/50"
          >
            Swipe up for more
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: EducationSlide }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`p-8 rounded-3xl bg-gradient-to-br ${slide.color} border border-border/20 mb-6`}
      >
        <span className="text-5xl mb-4 block">{slide.icon}</span>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {slide.title}
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed">
          {slide.content}
        </p>
      </motion.div>

      {slide.fact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-dopa-surface border border-primary/20"
        >
          <p className="text-xs text-primary mb-1">💡 Did you know?</p>
          <p className="text-sm text-muted-foreground">
            {slide.fact}
          </p>
        </motion.div>
      )}
    </div>
  );
}
