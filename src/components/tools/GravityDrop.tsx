import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { MojoOrb } from '../MojoOrb';
import { useHaptics } from '@/hooks/useHaptics';

interface GravityDropProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface Position {
  x: number;
  y: number;
}

const generateRandomPosition = (containerWidth: number, containerHeight: number): Position => {
  const padding = 120;
  const orbSize = 80;
  const x = padding + Math.random() * (containerWidth - padding * 2 - orbSize);
  const y = padding + Math.random() * (containerHeight - padding * 2 - orbSize);
  return { x, y };
};

export function GravityDrop({ onComplete, onCancel }: GravityDropProps) {
  const { notifySuccess, selectionChanged } = useHaptics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(5);
  const [targetPos, setTargetPos] = useState<Position>({ x: 0, y: 0 });
  const [ballPos, setBallPos] = useState<Position>({ x: 0, y: 0 });
  const [isSettled, setIsSettled] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [mojoState, setMojoState] = useState<'calm' | 'regulating' | 'steady'>('calm');
  const [proximity, setProximity] = useState(0);
  const wasCloseRef = useRef(false);

  // Initialize container size and positions
  useEffect(() => {
    const initGame = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        setContainerSize({ width, height });
        
        // Set initial target position
        const target = generateRandomPosition(width, height);
        setTargetPos(target);
        
        // Center the ball initially
        const centerX = width / 2 - 40;
        const centerY = height / 2 - 40;
        setBallPos({ x: centerX, y: centerY });
        
        setIsReady(true);
      }
    };
    
    // Small delay to ensure container is rendered
    const timer = setTimeout(initGame, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check proximity whenever ball position changes
  useEffect(() => {
    if (!isReady || isSettled) return;
    
    const ballCenterX = ballPos.x + 40;
    const ballCenterY = ballPos.y + 40;
    const targetCenterX = targetPos.x + 40;
    const targetCenterY = targetPos.y + 40;
    
    const distance = Math.sqrt(
      Math.pow(ballCenterX - targetCenterX, 2) + 
      Math.pow(ballCenterY - targetCenterY, 2)
    );
    
    const newProximity = Math.max(0, 1 - distance / 150);
    setProximity(newProximity);
    
    // Haptic feedback when getting close
    if (newProximity > 0.7 && !wasCloseRef.current) {
      wasCloseRef.current = true;
      selectionChanged();
    } else if (newProximity < 0.5) {
      wasCloseRef.current = false;
    }
    
    // Update Mojo state based on proximity
    if (newProximity > 0.8) {
      setMojoState('steady');
    } else if (newProximity > 0.3) {
      setMojoState('regulating');
    } else {
      setMojoState('calm');
    }
    
    // Check if in target
    if (distance < 30) {
      handleSuccess();
    }
  }, [ballPos, targetPos, isReady, isSettled, selectionChanged]);

  const handleSuccess = useCallback(() => {
    if (isSettled) return;
    setIsSettled(true);
    setIsExcited(true);
    notifySuccess();
    
    // Excited phase, then pop
    setTimeout(() => {
      setIsExcited(false);
      setShowPop(true);
      
      // Pop animation duration
      setTimeout(() => {
        setShowPop(false);
        wasCloseRef.current = false;
        
        if (round + 1 >= totalRounds) {
          setTimeout(() => setShowComplete(true), 300);
        } else {
          // Next round
          setRound(prev => prev + 1);
          setIsSettled(false);
          setMojoState('calm');
          setProximity(0);
          
          // New target position
          const newTarget = generateRandomPosition(containerSize.width, containerSize.height);
          setTargetPos(newTarget);
          
          // Reset ball to center
          setBallPos({
            x: containerSize.width / 2 - 40,
            y: containerSize.height / 2 - 40,
          });
        }
      }, 500);
    }, 600);
  }, [isSettled, round, totalRounds, containerSize, notifySuccess]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isSettled) return;
    
    setBallPos(prev => {
      const newX = Math.max(10, Math.min(containerSize.width - 90, prev.x + info.delta.x));
      const newY = Math.max(10, Math.min(containerSize.height - 90, prev.y + info.delta.y));
      return { x: newX, y: newY };
    });
  }, [isSettled, containerSize]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

      {/* Subtle ambient glow */}
      {isReady && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${targetPos.x + 40}px ${targetPos.y + 40}px, hsl(var(--primary) / 0.2) 0%, transparent 40%)`
          }}
        />
      )}

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onCancel}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center border border-border/20 z-20"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Round indicator */}
      <motion.div
        className="absolute top-12 left-5 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[...Array(totalRounds)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i < round ? 'bg-primary' : i === round ? 'bg-primary/60' : 'bg-muted/40'
            }`}
            animate={i === round ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Instruction text */}
      <motion.p
        className="absolute top-24 text-center text-muted-foreground text-sm px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.5 }}
      >
        Drag Mojo into the ring
      </motion.p>

      {/* Target ring */}
      {isReady && (
        <motion.div
          className="absolute z-10 pointer-events-none"
          style={{ 
            left: targetPos.x, 
            top: targetPos.y,
            width: 80,
            height: 80,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: showPop ? 1.5 : 1, 
            opacity: showPop ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-dashed"
            animate={{
              borderColor: proximity > 0.8 ? 'hsl(142, 70%, 50%)' : 'hsl(var(--primary))',
              rotate: 360,
            }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
              borderColor: { duration: 0.2 }
            }}
          />
          
          {/* Inner glow */}
          <motion.div
            className="absolute inset-1 rounded-full"
            animate={{
              background: proximity > 0.5 
                ? `radial-gradient(circle, hsl(${proximity > 0.8 ? '142, 70%, 50%' : 'var(--primary)'} / ${proximity * 0.3}) 0%, transparent 70%)`
                : 'transparent',
              boxShadow: proximity > 0.8 
                ? '0 0 25px hsl(142, 70%, 50%, 0.5), inset 0 0 15px hsl(142, 70%, 50%, 0.3)' 
                : 'none',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Center pulse */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={{
              backgroundColor: proximity > 0.8 ? 'hsl(142, 70%, 50%)' : 'hsl(var(--primary))',
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Pop effect */}
      {showPop && (
        <motion.div
          className="absolute z-25 pointer-events-none"
          style={{ 
            left: targetPos.x + 40, 
            top: targetPos.y + 40,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-400" />
        </motion.div>
      )}

      {/* Sparkles on pop */}
      {showPop && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-25 w-2 h-2 rounded-full bg-emerald-400 pointer-events-none"
          style={{
            left: targetPos.x + 40,
            top: targetPos.y + 40,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            x: Math.cos((i / 8) * Math.PI * 2) * 60,
            y: Math.sin((i / 8) * Math.PI * 2) * 60,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      ))}

      {/* Draggable Mojo */}
      {isReady && !showPop && (
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing"
          style={{ 
            left: ballPos.x,
            top: ballPos.y,
            width: 80,
            height: 80,
          }}
          drag={!isSettled}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={containerRef}
          onDrag={handleDrag}
          whileDrag={{ scale: 1.1 }}
          animate={isExcited ? {
            scale: [1, 1.3, 1.2, 1.4, 1.2],
            rotate: [0, -10, 10, -5, 5, 0],
          } : {}}
          transition={isExcited ? { duration: 0.5, ease: 'easeOut' } : {}}
        >
          <MojoOrb state={isExcited ? 'steady' : mojoState} size="md" />
        </motion.div>
      )}

      {/* Completion overlay */}
      {showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="mb-6"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MojoOrb state="steady" size="lg" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Centered</h2>
            <p className="text-muted-foreground text-sm mb-8">You found your focus</p>
            
            <motion.button
              onClick={handleComplete}
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
