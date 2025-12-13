import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MoreHorizontal, EyeOff, Flag } from 'lucide-react';
import { type LearnCard as LearnCardData, getTopicById } from '@/lib/learn-data';

interface LearnCardProps {
  card: LearnCardData;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
  onHide: () => void;
}

export function LearnCardComponent({ card, isLiked, onLike, onShare, onHide }: LearnCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const topic = getTopicById(card.topicId);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Image section - top 60% */}
      <div className="relative h-[60%] overflow-hidden">
        {!imageError ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback gradient when image fails
          <div className={`w-full h-full bg-gradient-to-br ${topic?.color || 'from-primary to-primary/60'}`} />
        )}
        
        {/* Overlay gradient for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />
      </div>

      {/* Content section - bottom 40% */}
      <div className="relative flex-1 bg-background px-6 pt-5 pb-20 overflow-hidden">
        {/* Topic badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${topic?.color || 'from-primary to-primary/60'} flex items-center gap-1.5`}>
            <span className="text-sm">{topic?.icon || '📚'}</span>
            <span className="text-xs font-semibold text-white uppercase tracking-wide">
              {topic?.label || card.topicId}
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-3 leading-tight"
        >
          {card.title}
        </motion.h2>

        {/* Content */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-[15px] text-foreground/80 leading-relaxed mb-4 line-clamp-3"
        >
          {card.content}
        </motion.p>

        {/* Fact box */}
        {card.fact && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3"
          >
            <p className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-0.5">
              The science:
            </p>
            <p className="text-[13px] text-foreground/90 leading-snug">
              {card.fact}
            </p>
          </motion.div>
        )}

        {/* Try this */}
        {card.tryThis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <p className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">
              Try this:
            </p>
            <p className="text-[13px] text-foreground/90 leading-snug">
              {card.tryThis}
            </p>
          </motion.div>
        )}
      </div>

      {/* Side actions - TikTok style */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-1"
        >
          <motion.div 
            whileTap={{ scale: 1.2 }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isLiked ? 'bg-rose-500' : 'bg-foreground/10 backdrop-blur-sm'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-foreground'}`} />
          </motion.div>
          <span className="text-[10px] text-foreground/60">Save</span>
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-[10px] text-foreground/60">Share</span>
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5 text-foreground" />
            </div>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-14 right-0 w-40 rounded-xl bg-card border border-border shadow-xl overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onHide();
                }}
                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                Not interested
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t border-border"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlay to close menu */}
      {showMenu && (
        <div 
          className="absolute inset-0 z-0" 
          onClick={() => setShowMenu(false)} 
        />
      )}
    </div>
  );
}
