import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MojoCompanion, CompanionMood } from './MojoCompanion';

interface MojoTeacherProps {
  className?: string;
}

const TEACHER_PHRASES = [
  { mood: 'proud' as CompanionMood, text: "Ooh, good stuff!" },
  { mood: 'curious' as CompanionMood, text: "Did you know this?" },
  { mood: 'excited' as CompanionMood, text: "This is so cool!" },
  { mood: 'encouraging' as CompanionMood, text: "You're learning!" },
  { mood: 'thinking' as CompanionMood, text: "Hmm, interesting..." },
  { mood: 'mischievous' as CompanionMood, text: "*scribbles notes*" },
  { mood: 'celebrating' as CompanionMood, text: "Knowledge power!" },
  { mood: 'curious' as CompanionMood, text: "Pay attention~" },
];

export function MojoTeacher({ className = '' }: MojoTeacherProps) {
  const [currentEmote, setCurrentEmote] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  // Cycle through emotes periodically
  useEffect(() => {
    // Show bubble after a short delay
    const bubbleTimer = setTimeout(() => setShowBubble(true), 1500);
    
    // Change emote every few seconds
    const emoteInterval = setInterval(() => {
      setCurrentEmote(prev => (prev + 1) % TEACHER_PHRASES.length);
      setShowBubble(true);
      
      // Hide bubble after showing
      setTimeout(() => setShowBubble(false), 2500);
    }, 5000);

    // Hide initial bubble
    const hideBubble = setTimeout(() => setShowBubble(false), 4000);

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(hideBubble);
      clearInterval(emoteInterval);
    };
  }, []);

  const currentPhrase = TEACHER_PHRASES[currentEmote];

  return (
    <div className={`relative ${className}`}>
      {/* Teacher hat */}
      <motion.div
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Graduation cap */}
        <div className="relative">
          {/* Top board */}
          <div className="w-8 h-1 bg-slate-800 rotate-[8deg] rounded-sm shadow-md" />
          {/* Cap dome */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-slate-800 rounded-b-full" />
          {/* Tassel */}
          <motion.div
            className="absolute -right-1 top-0 flex flex-col items-center"
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-0.5 h-3 bg-amber-500" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 5 }}
            className="absolute -right-2 -top-10 z-20 whitespace-nowrap"
          >
            <div className="bg-background/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] font-medium text-foreground border border-border/50 shadow-lg">
              {currentPhrase.text}
            </div>
            <div className="absolute left-3 -bottom-1 w-2 h-2 bg-background/95 border-r border-b border-border/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mojo body */}
      <MojoCompanion 
        mood={currentPhrase.mood} 
        size="sm"
      />
      
      {/* Pointer stick (appears occasionally) */}
      <AnimatePresence>
        {currentPhrase.mood === 'curious' && (
          <motion.div
            initial={{ opacity: 0, rotate: -45, x: -10 }}
            animate={{ opacity: 1, rotate: 25, x: 0 }}
            exit={{ opacity: 0, rotate: -45, x: -10 }}
            className="absolute -right-6 bottom-0 origin-bottom-left"
          >
            <div className="w-1 h-8 bg-amber-700 rounded-full" />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
