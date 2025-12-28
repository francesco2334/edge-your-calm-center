import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useEffect, useState } from 'react';

export type CompanionMood = 
  | 'cheering' | 'worried' | 'celebrating' | 'thinking' | 'encouraging' | 'surfing'
  | 'mischievous' | 'curious' | 'sleepy' | 'excited' | 'proud' | 'shy';

interface MojoCompanionProps {
  mood: CompanionMood;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showMessage?: boolean;
  className?: string;
  askQuestion?: boolean; // Enable quirky questions
  onQuestionDismiss?: () => void;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

// Quirky EVE-like questions Mojo can ask
const QUIRKY_QUESTIONS = [
  "Psst... how are you feeling right now? 🌟",
  "Hey! Did you drink water today? 💧",
  "Wanna know a secret? You're doing great! ✨",
  "What's making you smile today? 😊",
  "Quick! Think of something you're grateful for! 🙏",
  "Beep boop! What adventure are we going on? 🚀",
  "I'm curious... what made you open the app? 🤔",
  "*nudge* Have you taken a break lately? 🌈",
  "Tell me something fun about your day! 🎉",
  "Hey friend! Ready to level up? 💪",
];

const MISCHIEVOUS_SOUNDS = ['beep!', 'boop!', 'whirr~', '*chirp*', 'eep!', 'wooo!'];

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
  mischievous: {
    gradient: 'from-fuchsia-500/80 via-pink-500/60 to-purple-500/50',
    glow: '0 0 30px hsl(290 80% 55% / 0.5)',
    animation: { rotate: [-3, 3, -3], scale: [1, 1.08, 0.95, 1] },
  },
  curious: {
    gradient: 'from-sky-500/80 via-cyan-500/60 to-teal-500/50',
    glow: '0 0 28px hsl(190 85% 50% / 0.45)',
    animation: { rotate: [0, 15, 0, -15, 0], y: [0, -2, 0] },
  },
  sleepy: {
    gradient: 'from-indigo-500/60 via-purple-500/40 to-slate-500/30',
    glow: '0 0 20px hsl(240 50% 50% / 0.3)',
    animation: { y: [0, 2, 0], scale: [1, 0.98, 1] },
  },
  excited: {
    gradient: 'from-orange-500/80 via-yellow-500/60 to-red-500/50',
    glow: '0 0 40px hsl(30 95% 55% / 0.6)',
    animation: { y: [0, -15, 0], rotate: [-8, 8, -8], scale: [1, 1.2, 1] },
  },
  proud: {
    gradient: 'from-amber-500/80 via-yellow-400/60 to-orange-500/50',
    glow: '0 0 35px hsl(45 95% 55% / 0.5)',
    animation: { scale: [1, 1.1, 1], y: [0, -5, 0] },
  },
  shy: {
    gradient: 'from-rose-400/70 via-pink-400/50 to-rose-500/40',
    glow: '0 0 20px hsl(350 80% 60% / 0.4)',
    animation: { x: [-1, 1, -1], scale: [1, 0.95, 1] },
  },
};

export const MojoCompanion = forwardRef<HTMLDivElement, MojoCompanionProps>(
  function MojoCompanion({ 
    mood, 
    size = 'md', 
    message, 
    showMessage = false, 
    className = '',
    askQuestion = false,
    onQuestionDismiss
  }, ref) {
    const styles = moodStyles[mood];
    const sizeClass = sizeClasses[size];
    const [quirkyQuestion, setQuirkyQuestion] = useState<string | null>(null);
    const [mischievousSound, setMischievousSound] = useState<string | null>(null);
    
    // Get eye size based on component size
    const eyeSize = size === 'lg' ? { w: 10, h: 12 } : size === 'md' ? { w: 6, h: 8 } : { w: 4, h: 5 };

    // Bubble offset based on size
    const bubbleOffset = size === 'lg' ? '-top-16' : size === 'md' ? '-top-14' : '-top-12';
    
    // Random quirky question when asked
    useEffect(() => {
      if (askQuestion) {
        const q = QUIRKY_QUESTIONS[Math.floor(Math.random() * QUIRKY_QUESTIONS.length)];
        setQuirkyQuestion(q);
      } else {
        setQuirkyQuestion(null);
      }
    }, [askQuestion]);

    // Occasional mischievous sounds for certain moods
    useEffect(() => {
      if (mood === 'mischievous' || mood === 'excited') {
        const interval = setInterval(() => {
          if (Math.random() > 0.7) {
            setMischievousSound(MISCHIEVOUS_SOUNDS[Math.floor(Math.random() * MISCHIEVOUS_SOUNDS.length)]);
            setTimeout(() => setMischievousSound(null), 1000);
          }
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [mood]);

    // Render eyes based on mood
    const renderEyes = () => {
      switch (mood) {
        case 'celebrating':
        case 'cheering':
        case 'proud':
          // Happy squint eyes
          return (
            <>
              <svg width={eyeSize.w * 1.5} height={eyeSize.h} viewBox="0 0 20 14" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
                <path d="M2 12 Q10 2 18 12" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
              <svg width={eyeSize.w * 1.5} height={eyeSize.h} viewBox="0 0 20 14" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
                <path d="M2 12 Q10 2 18 12" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </>
          );
        case 'worried':
          // Worried eyes
          return (
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
          );
        case 'thinking':
        case 'curious':
          // Looking up/around
          return (
            <>
              <div className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)] relative overflow-hidden"
                style={{ width: eyeSize.w, height: eyeSize.h }}>
                <motion.div
                  className="absolute bg-primary/60 rounded-full"
                  style={{ width: eyeSize.w * 0.5, height: eyeSize.w * 0.5, left: '25%' }}
                  animate={mood === 'curious' ? { x: [-2, 2, -2], y: [-1, 1, -1] } : { y: [-1, -3, -1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)] relative overflow-hidden"
                style={{ width: eyeSize.w, height: eyeSize.h }}>
                <motion.div
                  className="absolute bg-primary/60 rounded-full"
                  style={{ width: eyeSize.w * 0.5, height: eyeSize.w * 0.5, left: '25%' }}
                  animate={mood === 'curious' ? { x: [-2, 2, -2], y: [-1, 1, -1] } : { y: [-1, -3, -1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </>
          );
        case 'mischievous':
          // One eye winking, mischievous look
          return (
            <>
              <motion.div
                className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                style={{ width: eyeSize.w, height: eyeSize.h }}
                animate={{ scaleY: [1, 0.2, 1] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
              />
              <svg width={eyeSize.w * 1.2} height={eyeSize.h * 0.8} viewBox="0 0 16 10" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
                <path d="M2 8 Q8 2 14 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </>
          );
        case 'sleepy':
          // Droopy half-closed eyes
          return (
            <>
              <motion.div
                className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                style={{ width: eyeSize.w, height: eyeSize.h * 0.4 }}
                animate={{ scaleY: [0.4, 0.3, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                style={{ width: eyeSize.w, height: eyeSize.h * 0.4 }}
                animate={{ scaleY: [0.4, 0.3, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          );
        case 'excited':
          // Big sparkly eyes
          return (
            <>
              <motion.div
                className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: eyeSize.w * 1.3, height: eyeSize.h * 1.3 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <motion.div
                className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: eyeSize.w * 1.3, height: eyeSize.h * 1.3 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </>
          );
        case 'shy':
          // Small averted eyes with blush
          return (
            <>
              <motion.div
                className="bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                style={{ width: eyeSize.w * 0.8, height: eyeSize.h * 0.8 }}
                animate={{ x: [2, 3, 2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                style={{ width: eyeSize.w * 0.8, height: eyeSize.h * 0.8 }}
                animate={{ x: [2, 3, 2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </>
          );
        default:
          // Normal blinking eyes
          return (
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
          );
      }
    };
    
    return (
      <div ref={ref} className={`relative ${className}`}>
        {/* Speech bubble - fixed positioning */}
        <AnimatePresence>
          {((showMessage && message) || quirkyQuestion) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className={`absolute ${bubbleOffset} left-1/2 -translate-x-1/2 z-20 w-max max-w-[200px]`}
              onClick={quirkyQuestion ? onQuestionDismiss : undefined}
            >
              <div className="bg-background/95 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-medium text-foreground border border-border/50 shadow-xl text-center leading-relaxed">
                {quirkyQuestion || message}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-background/95 border-r border-b border-border/50 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mischievous sound effect */}
        <AnimatePresence>
          {mischievousSound && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -30 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 z-30"
            >
              <span className="text-xs font-medium text-primary italic">{mischievousSound}</span>
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
              {renderEyes()}
            </div>
          </div>

          {/* Blush for shy mood */}
          {mood === 'shy' && (
            <>
              <div className="absolute rounded-full bg-rose-400/40" style={{ 
                width: eyeSize.w * 1.2, height: eyeSize.w * 0.6, 
                left: '15%', top: '55%' 
              }} />
              <div className="absolute rounded-full bg-rose-400/40" style={{ 
                width: eyeSize.w * 1.2, height: eyeSize.w * 0.6, 
                right: '15%', top: '55%' 
              }} />
            </>
          )}
          
          {/* Inner highlight */}
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/25 via-white/10 to-transparent pointer-events-none" />
          
          {/* Celebration sparkles */}
          {(mood === 'celebrating' || mood === 'excited') && (
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-xs"
                  style={{ 
                    top: `${5 + (i * 25)}%`, 
                    left: `${75 + (i % 2) * 15}%` 
                  }}
                  animate={{ 
                    y: [0, -20], 
                    opacity: [1, 0],
                    scale: [0.8, 1.3],
                    rotate: [0, 180]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.25 
                  }}
                >
                  {mood === 'excited' ? '⚡' : '✨'}
                </motion.span>
              ))}
            </div>
          )}

          {/* Sleepy ZzZs */}
          {mood === 'sleepy' && (
            <div className="absolute -top-2 -right-2 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-muted-foreground font-bold"
                  style={{ fontSize: 8 + i * 2, right: i * 8, top: -i * 6 }}
                  animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  z
                </motion.span>
              ))}
            </div>
          )}

          {/* Question marks for curious */}
          {mood === 'curious' && (
            <motion.span
              className="absolute -top-1 -right-1 text-sm pointer-events-none"
              animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ❓
            </motion.span>
          )}

          {/* Mischievous sparkle */}
          {mood === 'mischievous' && (
            <motion.span
              className="absolute -top-1 right-0 text-xs pointer-events-none"
              animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✧
            </motion.span>
          )}
        </motion.div>
      </div>
    );
  }
);
