import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

export type CompanionMood = 'cheering' | 'worried' | 'celebrating' | 'thinking' | 'encouraging' | 'surfing';

interface MojoCompanionProps {
  mood: CompanionMood;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showMessage?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const moodStyles: Record<CompanionMood, { 
  gradient: string; 
  glow: string;
  animation: object;
}> = {
  cheering: {
    gradient: 'from-emerald-500/80 via-primary/60 to-accent/50',
    glow: '0 0 30px hsl(142 70% 45% / 0.5)',
    animation: { y: [0, -8, 0], scale: [1, 1.1, 1] },
  },
  worried: {
    gradient: 'from-orange-500/80 via-amber-500/60 to-primary/50',
    glow: '0 0 25px hsl(25 95% 53% / 0.4)',
    animation: { x: [-2, 2, -2], scale: [1, 0.95, 1] },
  },
  celebrating: {
    gradient: 'from-yellow-400/80 via-emerald-500/60 to-primary/50',
    glow: '0 0 40px hsl(142 70% 45% / 0.6)',
    animation: { y: [0, -12, 0], rotate: [-5, 5, -5], scale: [1, 1.15, 1] },
  },
  thinking: {
    gradient: 'from-violet-500/80 via-primary/60 to-accent/50',
    glow: '0 0 25px hsl(var(--primary) / 0.4)',
    animation: { y: [0, -3, 0], rotate: [0, 3, 0] },
  },
  encouraging: {
    gradient: 'from-primary/80 via-accent/60 to-emerald-500/50',
    glow: '0 0 30px hsl(var(--primary) / 0.45)',
    animation: { scale: [1, 1.05, 1] },
  },
  surfing: {
    gradient: 'from-cyan-500/80 via-blue-500/60 to-primary/50',
    glow: '0 0 35px hsl(190 90% 50% / 0.5)',
    animation: { rotate: [-8, 8, -8], y: [0, -4, 0] },
  },
};

export const MojoCompanion = forwardRef<HTMLDivElement, MojoCompanionProps>(
  function MojoCompanion({ mood, size = 'md', message, showMessage = false, className = '' }, ref) {
    const styles = moodStyles[mood];
    const sizeClass = sizeClasses[size];
    
    // Get eye size based on component size
    const eyeSize = size === 'lg' ? { w: 10, h: 12 } : size === 'md' ? { w: 6, h: 8 } : { w: 4, h: 5 };
    
    return (
      <div ref={ref} className={`relative ${className}`}>
        {/* Speech bubble */}
        <AnimatePresence>
          {showMessage && message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
            >
              <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-medium text-foreground border border-border/40 shadow-lg">
                {message}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-background/90 border-r border-b border-border/40 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mojo body */}
        <motion.div
          className={`${sizeClass} relative rounded-full`}
          animate={styles.animation as { y?: number[]; x?: number[]; scale?: number[]; rotate?: number[] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Main orb */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient}`}
            style={{ boxShadow: styles.glow }}
          />
          
          {/* Eyes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex gap-[20%]" style={{ marginTop: '-8%' }}>
              {mood === 'celebrating' || mood === 'cheering' ? (
                // Happy squint eyes
                <>
                  <svg width={eyeSize.w * 1.5} height={eyeSize.h} viewBox="0 0 20 14" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
                    <path d="M2 12 Q10 2 18 12" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                  <svg width={eyeSize.w * 1.5} height={eyeSize.h} viewBox="0 0 20 14" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
                    <path d="M2 12 Q10 2 18 12" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </>
              ) : mood === 'worried' ? (
                // Worried eyes (slightly squished, concerned)
                <>
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{ width: eyeSize.w, height: eyeSize.h * 0.7 }}
                    animate={{ scaleY: [0.7, 0.8, 0.7] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{ width: eyeSize.w, height: eyeSize.h * 0.7 }}
                    animate={{ scaleY: [0.7, 0.8, 0.7] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </>
              ) : mood === 'thinking' ? (
                // Thinking eyes (looking up)
                <>
                  <div className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)] relative overflow-hidden"
                    style={{ width: eyeSize.w, height: eyeSize.h }}>
                    <motion.div
                      className="absolute bg-primary/60 rounded-full"
                      style={{ width: eyeSize.w * 0.5, height: eyeSize.w * 0.5, left: '25%' }}
                      animate={{ y: [-1, -3, -1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)] relative overflow-hidden"
                    style={{ width: eyeSize.w, height: eyeSize.h }}>
                    <motion.div
                      className="absolute bg-primary/60 rounded-full"
                      style={{ width: eyeSize.w * 0.5, height: eyeSize.w * 0.5, left: '25%' }}
                      animate={{ y: [-1, -3, -1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </>
              ) : (
                // Normal eyes
                <>
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{ width: eyeSize.w, height: eyeSize.h }}
                    animate={{ scaleY: [1, 0.2, 1] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{ width: eyeSize.w, height: eyeSize.h }}
                    animate={{ scaleY: [1, 0.2, 1] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Inner highlight */}
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/25 via-white/10 to-transparent pointer-events-none" />
          
          {/* Celebration sparkles */}
          {mood === 'celebrating' && (
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-xs"
                  style={{ 
                    top: `${10 + i * 20}%`, 
                    left: `${80 + i * 10}%` 
                  }}
                  animate={{ 
                    y: [0, -15], 
                    opacity: [1, 0],
                    scale: [0.8, 1.2]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
);
