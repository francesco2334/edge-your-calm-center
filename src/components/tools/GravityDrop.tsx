import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';

interface GravityDropProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface Position {
  x: number;
  y: number;
}

const generateRandomPosition = (): Position => {
  // Generate positions within safe bounds (padding from edges)
  const padding = 80;
  const x = padding + Math.random() * (window.innerWidth - padding * 2 - 96);
  const y = padding + 100 + Math.random() * (window.innerHeight - padding * 2 - 200);
  return { x, y };
};

export function GravityDrop({ onComplete, onCancel }: GravityDropProps) {
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(5);
  const [ballPos, setBallPos] = useState<Position>({ x: window.innerWidth / 2 - 48, y: window.innerHeight / 2 - 48 });
  const [targetPos, setTargetPos] = useState<Position>(() => generateRandomPosition());
  const [isSettled, setIsSettled] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const settledTimeRef = useRef<NodeJS.Timeout | null>(null);
  
  const ballX = useMotionValue(ballPos.x);
  const ballY = useMotionValue(ballPos.y);
  const scale = useMotionValue(1);
  
  // Spring physics for the ball
  const springX = useSpring(ballX, {
    stiffness: 80,
    damping: 15,
    mass: 1.5,
  });
  
  const springY = useSpring(ballY, {
    stiffness: 80,
    damping: 15,
    mass: 1.5,
  });
  
  const springScale = useSpring(scale, {
    stiffness: 300,
    damping: 20,
  });

  // Initialize new round with new target position
  const startNewRound = useCallback(() => {
    const newTarget = generateRandomPosition();
    setTargetPos(newTarget);
    // Reset ball to center
    const centerX = window.innerWidth / 2 - 48;
    const centerY = window.innerHeight / 2 - 48;
    setBallPos({ x: centerX, y: centerY });
    ballX.set(centerX);
    ballY.set(centerY);
    setIsSettled(false);
  }, [ballX, ballY]);

  // Check if ball is in target
  const checkInTarget = useCallback(() => {
    const ballCenterX = ballPos.x + 48;
    const ballCenterY = ballPos.y + 48;
    const targetCenterX = targetPos.x + 48;
    const targetCenterY = targetPos.y + 48;
    
    const distance = Math.sqrt(
      Math.pow(ballCenterX - targetCenterX, 2) + 
      Math.pow(ballCenterY - targetCenterY, 2)
    );
    
    return distance < 30; // Threshold for "in target"
  }, [ballPos, targetPos]);

  // Check for settled state
  useEffect(() => {
    if (checkInTarget() && !isSettled) {
      settledTimeRef.current = setTimeout(() => {
        setIsSettled(true);
        
        // Visual feedback
        scale.set(1.2);
        setTimeout(() => scale.set(1), 200);
        
        // Move to next round or complete
        setTimeout(() => {
          if (round + 1 >= totalRounds) {
            setShowComplete(true);
          } else {
            setRound(prev => prev + 1);
            startNewRound();
          }
        }, 800);
      }, 500);
    } else if (settledTimeRef.current && !checkInTarget()) {
      clearTimeout(settledTimeRef.current);
    }
    
    return () => {
      if (settledTimeRef.current) {
        clearTimeout(settledTimeRef.current);
      }
    };
  }, [ballPos, checkInTarget, isSettled, round, totalRounds, scale, startNewRound]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isSettled) return;
    
    e.stopPropagation();
    
    // Get tap position
    let tapX: number, tapY: number;
    if ('touches' in e) {
      tapX = e.touches[0].clientX;
      tapY = e.touches[0].clientY;
    } else {
      tapX = e.clientX;
      tapY = e.clientY;
    }
    
    // Calculate direction from tap to ball center
    const ballCenterX = ballPos.x + 48;
    const ballCenterY = ballPos.y + 48;
    
    // Push ball away from tap point (gentle nudge)
    const dx = ballCenterX - tapX;
    const dy = ballCenterY - tapY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return; // Too close, no push
    
    // Normalize and apply gentle push (smaller = more control needed)
    const pushStrength = 25 + Math.random() * 15;
    const newX = ballPos.x + (dx / distance) * pushStrength;
    const newY = ballPos.y + (dy / distance) * pushStrength;
    
    // Clamp to screen bounds
    const clampedX = Math.max(20, Math.min(window.innerWidth - 116, newX));
    const clampedY = Math.max(100, Math.min(window.innerHeight - 150, newY));
    
    setBallPos({ x: clampedX, y: clampedY });
    ballX.set(clampedX);
    ballY.set(clampedY);
    
    // Visual feedback - subtle pulse
    scale.set(1.05);
    setTimeout(() => scale.set(1), 100);
  }, [isSettled, ballPos, ballX, ballY, scale]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Calculate proximity for visual feedback
  const getProximity = () => {
    const ballCenterX = ballPos.x + 48;
    const ballCenterY = ballPos.y + 48;
    const targetCenterX = targetPos.x + 48;
    const targetCenterY = targetPos.y + 48;
    
    const distance = Math.sqrt(
      Math.pow(ballCenterX - targetCenterX, 2) + 
      Math.pow(ballCenterY - targetCenterY, 2)
    );
    
    return Math.max(0, 1 - distance / 200);
  };

  const proximity = getProximity();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden touch-none"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(180deg, 
            hsl(220, 30%, 12%) 0%, 
            hsl(240, 25%, 8%) 100%)`
        }}
      />

      {/* Subtle grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{ 
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
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

      {/* Round indicator */}
      <motion.div
        className="absolute top-12 left-5 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[...Array(totalRounds)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${i < round ? 'bg-primary' : i === round ? 'bg-primary/50' : 'bg-muted/30'}`}
            animate={i === round ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Instruction text */}
      <motion.p
        className="absolute top-24 text-center text-muted-foreground/60 text-sm px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Tap to guide the orb into the ring
      </motion.p>

      {/* Target outline */}
      <motion.div
        className="absolute z-10"
        style={{ 
          left: targetPos.x, 
          top: targetPos.y,
          width: 96,
          height: 96,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          borderColor: proximity > 0.8 ? 'hsl(150, 70%, 50%)' : 'hsl(270, 50%, 60%)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed"
          style={{ borderColor: 'inherit' }}
          animate={{
            rotate: 360,
            borderColor: proximity > 0.8 ? 'hsl(150, 70%, 50%)' : 'hsl(270, 50%, 60%)',
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            borderColor: { duration: 0.3 }
          }}
        />
        
        {/* Inner glow when close */}
        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            background: proximity > 0.5 
              ? `radial-gradient(circle, hsl(${proximity > 0.8 ? 150 : 270}, 50%, 30%, ${proximity * 0.4}) 0%, transparent 70%)`
              : 'transparent',
            boxShadow: proximity > 0.8 
              ? '0 0 30px hsl(150, 70%, 50%, 0.5)' 
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Pulsing center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            backgroundColor: proximity > 0.8 ? 'hsl(150, 70%, 50%)' : 'hsl(270, 50%, 60%)',
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      {/* The floating ball */}
      <motion.div
        className="absolute z-20"
        style={{ 
          x: springX, 
          y: springY, 
          scale: springScale,
          width: 96,
          height: 96,
        }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{
            background: `radial-gradient(circle, hsl(${proximity > 0.8 ? 150 : 260}, 70%, 60%) 0%, transparent 70%)`,
            scale: 1.5,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Main orb */}
        <motion.div
          className="relative w-24 h-24 rounded-full"
          animate={{
            background: proximity > 0.8 
              ? `radial-gradient(circle at 30% 30%, 
                  hsl(150, 80%, 70%) 0%, 
                  hsl(140, 60%, 40%) 50%,
                  hsl(130, 40%, 20%) 100%)`
              : `radial-gradient(circle at 30% 30%, 
                  hsl(270, 80%, 70%) 0%, 
                  hsl(250, 60%, 40%) 50%,
                  hsl(230, 40%, 20%) 100%)`,
            boxShadow: proximity > 0.8
              ? '0 10px 40px hsl(150 50% 30% / 0.4), inset 0 -5px 15px hsl(0 0% 0% / 0.3)'
              : '0 10px 40px hsl(260 50% 30% / 0.4), inset 0 -5px 15px hsl(0 0% 0% / 0.3)',
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Inner highlight */}
          <div className="absolute top-3 left-4 w-6 h-6 rounded-full bg-white/20 blur-sm" />
        </motion.div>
      </motion.div>

      {/* Settled feedback */}
      {isSettled && !showComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-30 pointer-events-none"
          style={{ left: targetPos.x + 48, top: targetPos.y + 48, transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="w-32 h-32 rounded-full border-2 border-green-500/50"
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ duration: 0.8 }}
          />
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center mb-6"
              animate={{ 
                boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.2)', '0 0 0 20px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">🎯</span>
            </motion.div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Centered</h2>
            <p className="text-muted-foreground text-sm mb-8">You found your focus</p>
            
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
