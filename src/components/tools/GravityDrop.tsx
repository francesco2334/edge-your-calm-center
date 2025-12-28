import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';

interface GravityDropProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function GravityDrop({ onComplete, onCancel }: GravityDropProps) {
  const [gravity, setGravity] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const settledTimeRef = useRef<NodeJS.Timeout | null>(null);
  
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  
  // Spring physics for the object
  const springY = useSpring(y, {
    stiffness: 50,
    damping: 10 + gravity * 2,
    mass: 1,
  });
  
  const springScale = useSpring(scale, {
    stiffness: 300,
    damping: 20,
  });

  // Target position based on gravity (0 = floating center, 100 = fully settled at bottom)
  const targetY = (gravity / 100) * 200;

  useEffect(() => {
    y.set(targetY);
  }, [gravity, targetY, y]);

  // Check for settled state
  useEffect(() => {
    if (gravity >= 100 && !isSettled) {
      settledTimeRef.current = setTimeout(() => {
        setIsSettled(true);
        setTimeout(() => setShowComplete(true), 500);
      }, 1500);
    }
    
    return () => {
      if (settledTimeRef.current) {
        clearTimeout(settledTimeRef.current);
      }
    };
  }, [gravity, isSettled]);

  const handleTap = useCallback(() => {
    if (isSettled) return;
    
    // Each tap adds gravity - intentional, slower taps are implied by design
    const increment = Math.random() * 8 + 5; // 5-13% per tap
    setGravity(prev => Math.min(100, prev + increment));
    
    // Visual feedback - subtle pulse
    scale.set(1.1);
    setTimeout(() => scale.set(1), 100);
  }, [isSettled, scale]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Ambient floating animation when gravity is low
  const floatAmount = Math.max(0, 1 - gravity / 50);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleTap}
    >
      {/* Gradient background that shifts with gravity */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(180deg, 
            hsl(${220 + gravity * 0.3}, 30%, ${12 + gravity * 0.05}%) 0%, 
            hsl(${240 + gravity * 0.2}, 25%, ${8 + gravity * 0.02}%) 100%)`
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Subtle grid lines that fade as object settles */}
      <div 
        className="absolute inset-0 opacity-[0.03] transition-opacity duration-1000"
        style={{ 
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.03 * (1 - gravity / 100)
        }}
      />

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-border/20 z-20"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Instruction text - fades as gravity increases */}
      <motion.p
        className="absolute top-24 text-center text-muted-foreground/60 text-sm px-8"
        animate={{ opacity: Math.max(0, 1 - gravity / 30) }}
      >
        Tap gently to settle
      </motion.p>

      {/* The floating/settling object */}
      <motion.div
        className="relative z-10"
        style={{ y: springY, scale: springScale }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          animate={{
            background: `radial-gradient(circle, hsl(${260 - gravity}, ${70 - gravity * 0.3}%, ${60 - gravity * 0.2}%) 0%, transparent 70%)`,
            scale: 2 - gravity / 200,
          }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Main orb */}
        <motion.div
          className="relative w-24 h-24 rounded-full"
          animate={{
            background: `radial-gradient(circle at 30% 30%, 
              hsl(${270 - gravity * 0.5}, ${80 - gravity * 0.4}%, ${70 - gravity * 0.3}%) 0%, 
              hsl(${250 - gravity * 0.3}, ${60 - gravity * 0.3}%, ${40 - gravity * 0.2}%) 50%,
              hsl(${230 - gravity * 0.2}, ${40 - gravity * 0.2}%, ${20 - gravity * 0.1}%) 100%)`,
            boxShadow: `
              0 ${10 + gravity * 0.5}px ${40 + gravity}px hsl(${260 - gravity} 50% 30% / ${0.4 - gravity * 0.003}),
              inset 0 -${5 + gravity * 0.1}px ${15 + gravity * 0.2}px hsl(0 0% 0% / 0.3)
            `,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Inner highlight */}
          <div className="absolute top-3 left-4 w-6 h-6 rounded-full bg-white/20 blur-sm" />
        </motion.div>

        {/* Floating particles around orb - disappear as it settles */}
        {floatAmount > 0 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [
                    Math.cos((i / 6) * Math.PI * 2) * 50,
                    Math.cos((i / 6) * Math.PI * 2 + 0.5) * 55,
                    Math.cos((i / 6) * Math.PI * 2) * 50,
                  ],
                  y: [
                    Math.sin((i / 6) * Math.PI * 2) * 50,
                    Math.sin((i / 6) * Math.PI * 2 + 0.5) * 55,
                    Math.sin((i / 6) * Math.PI * 2) * 50,
                  ],
                  opacity: floatAmount * 0.6,
                  scale: floatAmount,
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Ground shadow - appears as object settles */}
      <motion.div
        className="absolute bottom-32 w-32 h-4 rounded-full bg-black/20 blur-xl"
        animate={{
          opacity: gravity / 100 * 0.6,
          scaleX: 0.5 + (gravity / 100) * 0.5,
        }}
      />

      {/* Settled state message */}
      {isSettled && !showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-40 text-center"
        >
          <p className="text-muted-foreground/60 text-sm">Settled</p>
        </motion.div>
      )}

      {/* Completion overlay */}
      {showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center mb-6"
              animate={{ 
                boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.2)', '0 0 0 20px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">🪨</span>
            </motion.div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Grounded</h2>
            <p className="text-muted-foreground text-sm mb-8">You found stillness</p>
            
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleComplete(); }}
              className="px-8 py-4 rounded-full bg-primary/20 text-primary font-medium border border-primary/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
