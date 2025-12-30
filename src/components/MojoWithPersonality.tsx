import { forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MojoOrb, EquippedCosmetics } from './MojoOrb';
import { useMojoPersonality } from '@/hooks/useMojoPersonality';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady' | 'thinking';

interface MojoWithPersonalityProps {
  state: MojoState;
  selectedPull?: string | null;
  size?: 'sm' | 'md' | 'lg';
  cosmetics?: EquippedCosmetics;
  onTap?: () => void;
}

// Export the handle type for useImperativeHandle
export interface MojoPersonalityHandle {
  celebrateStreakMilestone: (streak: number) => void;
  celebrateTokenEarned: (amount?: number) => void;
  celebrateGameWin: (gameName?: string) => void;
  celebrateDailyLogin: (streak: number) => void;
  celebrateLearnProgress: (cardsViewed: number) => void;
  celebrateTrophyEarned: (trophyName: string) => void;
  celebrateComeback: () => void;
  triggerHappyBurst: () => void;
  triggerEncouragement: () => void;
  triggerDanceParty: () => void;
}

export const MojoWithPersonality = forwardRef<MojoPersonalityHandle, MojoWithPersonalityProps>(
  function MojoWithPersonality({ state, selectedPull, size = 'lg', cosmetics, onTap }, ref) {
    const personality = useMojoPersonality();

    // Expose celebration methods via ref
    useImperativeHandle(ref, () => ({
      celebrateStreakMilestone: personality.celebrateStreakMilestone,
      celebrateTokenEarned: personality.celebrateTokenEarned,
      celebrateGameWin: personality.celebrateGameWin,
      celebrateDailyLogin: personality.celebrateDailyLogin,
      celebrateLearnProgress: personality.celebrateLearnProgress,
      celebrateTrophyEarned: personality.celebrateTrophyEarned,
      celebrateComeback: personality.celebrateComeback,
      triggerHappyBurst: personality.triggerHappyBurst,
      triggerEncouragement: personality.triggerEncouragement,
      triggerDanceParty: personality.triggerDanceParty,
    }), [personality]);

    const handleTap = () => {
      // Sometimes trigger a random action on tap
      if (Math.random() > 0.6 && personality.canTriggerEmote) {
        const actions = [
          () => personality.triggerEmote('wave'),
          () => personality.triggerEmote('giggle'),
          () => personality.triggerEmote('blush'),
          () => personality.triggerHappyBurst(),
          () => personality.triggerDanceParty(),
        ];
        actions[Math.floor(Math.random() * actions.length)]();
      }
      
      onTap?.();
    };

    return (
      <div className="relative">
        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          {personality.isPhraseVisible && personality.currentPhrase && size !== 'sm' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            >
              <div className="relative">
                <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-2 shadow-lg min-w-max max-w-[220px]">
                  <p className="text-sm text-foreground text-center whitespace-nowrap">
                    {personality.currentPhrase}
                  </p>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-background/95" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The actual Mojo orb */}
        <motion.div
          onClick={handleTap}
          whileTap={{ scale: 0.96 }}
          className="cursor-pointer"
        >
          <MojoOrb 
            state={state} 
            selectedPull={selectedPull} 
            size={size} 
            cosmetics={cosmetics} 
          />
        </motion.div>

        {/* Subtle floating particles when happy */}
        <AnimatePresence>
          {(personality.mood === 'playful' || personality.mood === 'celebrating') && size === 'lg' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    y: -40,
                    x: (i - 1) * 30,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                  className="absolute top-0 left-1/2 text-lg pointer-events-none"
                >
                  {['✨', '💫', '⭐'][i]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Celebration confetti burst */}
        <AnimatePresence>
          {personality.mood === 'celebrating' && size === 'lg' && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.8],
                    x: Math.cos((i * 45) * Math.PI / 180) * 60,
                    y: Math.sin((i * 45) * Math.PI / 180) * 60 - 20,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg pointer-events-none"
                >
                  {['🎉', '✨', '🎊', '💫', '⭐', '🌟', '🎆', '💥'][i]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export { useMojoPersonality };
