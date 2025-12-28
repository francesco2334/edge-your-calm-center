import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X } from 'lucide-react';

interface NoiseDissolverProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function NoiseDissolver({ onComplete, onCancel }: NoiseDissolverProps) {
  const [noiseLevel, setNoiseLevel] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const [swipeSpeed, setSwipeSpeed] = useState(0);
  
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeDistanceRef = useRef(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Track swipe effectiveness
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    lastTouchRef.current = {
      x: point.clientX,
      y: point.clientY,
      time: Date.now(),
    };
    swipeDistanceRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!lastTouchRef.current) return;
    
    const point = 'touches' in e ? e.touches[0] : e;
    const dx = point.clientX - lastTouchRef.current.x;
    const dy = point.clientY - lastTouchRef.current.y;
    const dt = Date.now() - lastTouchRef.current.time;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = distance / Math.max(dt, 1);
    
    setSwipeSpeed(speed);
    
    // Slow swipes are more effective (speed < 0.5 is slow)
    // Fast swipes do almost nothing
    const effectiveness = speed < 0.3 ? 1 : speed < 0.5 ? 0.6 : speed < 1 ? 0.2 : 0.05;
    const dissolveAmount = distance * 0.02 * effectiveness;
    
    swipeDistanceRef.current += dissolveAmount;
    
    setNoiseLevel(prev => Math.max(0, prev - dissolveAmount));
    
    lastTouchRef.current = {
      x: point.clientX,
      y: point.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    setSwipeSpeed(0);
  }, []);

  // Check for completion
  useEffect(() => {
    if (noiseLevel <= 0 && !isComplete) {
      setIsComplete(true);
    }
  }, [noiseLevel, isComplete]);

  // Generate noise pattern using CSS
  const noiseOpacity = noiseLevel / 100;
  
  // Gradient that emerges as noise dissolves
  const gradientOpacity = 1 - noiseLevel / 100;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={(e) => e.buttons === 1 && handleTouchMove(e)}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Base calm gradient (revealed as noise dissolves) */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity: gradientOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-800/20 via-transparent to-teal-900/20" />
        
        {/* Soft light orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </motion.div>

      {/* Noise overlay layers */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ opacity: noiseOpacity }}
      >
        {/* Multiple noise layers for depth */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"
        />
        {/* Grain effect */}
        <div 
          className="absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            opacity: 0.5,
          }}
        />
      </div>

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onCancel}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-border/20 z-20"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Speed indicator - subtle feedback */}
      <div className="absolute top-24 left-0 right-0 flex justify-center">
        <motion.div
          className="px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-border/10"
          animate={{
            opacity: swipeSpeed > 0 ? 1 : 0.5,
            borderColor: swipeSpeed < 0.3 ? 'hsl(var(--primary) / 0.3)' : swipeSpeed > 0.8 ? 'hsl(0 50% 50% / 0.3)' : 'hsl(var(--border) / 0.1)',
          }}
        >
          <p className="text-xs text-muted-foreground/70">
            {swipeSpeed === 0 ? 'Swipe slowly to dissolve' : 
             swipeSpeed < 0.3 ? 'Perfect... keep going' :
             swipeSpeed < 0.5 ? 'A little slower' :
             swipeSpeed < 1 ? 'Too fast' : 'Way too fast'}
          </p>
        </motion.div>
      </div>

      {/* Progress indicator - very subtle */}
      <div className="absolute bottom-24 left-8 right-8">
        <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500/50 to-teal-500/50 rounded-full"
            style={{ width: `${100 - noiseLevel}%` }}
          />
        </div>
      </div>

      {/* Completion overlay */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center px-8 text-center"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-teal-500/20 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10"
              animate={{ 
                boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.1)', '0 0 0 30px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.1)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-5xl">✨</span>
            </motion.div>
            
            <h2 className="text-3xl font-light text-foreground mb-2">Clarity</h2>
            <p className="text-muted-foreground/70 text-sm mb-10 max-w-xs">
              The noise has dissolved. Your mind is clear.
            </p>
            
            <motion.button
              onClick={onComplete}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-violet-500/20 to-teal-500/20 text-foreground font-medium border border-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Embrace the calm
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
