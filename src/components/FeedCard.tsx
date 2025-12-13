import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { FeedCardData } from '@/lib/feed-data';

interface FeedCardProps {
  card: FeedCardData;
  isActive: boolean;
  onAction: () => void;
  onCheckin?: () => void;
}

export function FeedCard({ card, isActive, onAction, onCheckin }: FeedCardProps) {
  const isPullCheckin = card.type === 'pull-checkin';

  return (
    <div className="h-full w-full flex flex-col justify-end p-6 pb-24 relative">
      {/* Background gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`}
        style={{ zIndex: -1 }}
      />
      
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.4 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 70%, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
          zIndex: -1,
        }}
      />

      {/* Content overlay box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isActive ? 1 : 0.3, y: isActive ? 0 : 20 }}
        transition={{ duration: 0.5, delay: isActive ? 0.1 : 0 }}
        className="relative"
      >
        {/* Category / Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{card.icon}</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {card.type === 'pull-checkin' ? 'Daily' : card.type}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-foreground mb-2 leading-tight">
          {card.title}
        </h2>

        {/* Subtitle */}
        {card.subtitle && (
          <p className="text-lg text-muted-foreground mb-3">
            {card.subtitle}
          </p>
        )}

        {/* Content */}
        {card.content && (
          <p className="text-base text-foreground/80 mb-4 leading-relaxed max-w-sm">
            {card.content}
          </p>
        )}

        {/* Fact callout */}
        {card.fact && (
          <div className="mb-6 p-4 rounded-xl bg-background/40 backdrop-blur-sm border border-border/20">
            <p className="text-sm text-primary font-medium">
              💡 {card.fact}
            </p>
          </div>
        )}

        {/* Action button */}
        {card.action && (
          <Button
            onClick={isPullCheckin ? onCheckin : onAction}
            size="lg"
            className="dopa-glow-button bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl"
          >
            {card.action.label}
          </Button>
        )}
      </motion.div>

      {/* Scroll hint at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.5 : 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-muted-foreground text-sm">↓ Swipe</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
