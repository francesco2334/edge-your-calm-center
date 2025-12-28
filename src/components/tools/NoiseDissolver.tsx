import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface NoiseDissolverProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function NoiseDissolver({ onComplete, onCancel }: NoiseDissolverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentCleared, setPercentCleared] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas with noise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    contextRef.current = ctx;
    
    // Draw noise pattern
    drawNoise(ctx, canvas.width, canvas.height);
    
    // Hide intro text after delay
    const timer = setTimeout(() => setShowIntroText(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const drawNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create noise image data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Generate grainy noise with dark tones
      const noise = Math.random();
      const value = noise < 0.3 ? 20 + Math.random() * 30 : 
                   noise < 0.6 ? 40 + Math.random() * 40 : 
                   60 + Math.random() * 50;
      
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add some darker overlay patches for texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 50 + Math.random() * 150;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const calculatePercentCleared = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) {
        transparentPixels++;
      }
    }
    
    const totalPixels = data.length / 4;
    return (transparentPixels / totalPixels) * 100;
  }, []);

  const erase = useCallback((x: number, y: number) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    // Use destination-out to erase
    ctx.globalCompositeOperation = 'destination-out';
    
    // Create soft circular eraser brush
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return null;
  };

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    setShowIntroText(false);
    
    const coords = getCoordinates(e);
    if (coords) {
      erase(coords.x, coords.y);
    }
  }, [erase]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    if (coords) {
      erase(coords.x, coords.y);
    }
  }, [isDrawing, erase]);

  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    
    // Calculate how much has been cleared
    const cleared = calculatePercentCleared();
    setPercentCleared(cleared);
    
    // Complete when 70% is cleared
    if (cleared >= 70 && !isComplete) {
      setIsComplete(true);
    }
  }, [calculatePercentCleared, isComplete]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden touch-none select-none"
    >
      {/* Calm gradient background (revealed as noise is erased) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-indigo-900/50 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-800/30 via-transparent to-teal-900/30" />
        
        {/* Soft light orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Noise canvas layer (user erases this) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      />

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

      {/* Intro instruction text */}
      <motion.div
        className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntroText ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center px-12">
          <motion.p
            className="text-2xl font-light text-white/90 mb-4 leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Imagine this noise as the clutter in your mind
          </motion.p>
          <motion.p
            className="text-lg text-white/60"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Gently erase it away
          </motion.p>
        </div>
      </motion.div>

      {/* Subtle hint when text fades */}
      {!showIntroText && !isComplete && (
        <motion.div
          className="absolute top-24 left-0 right-0 flex justify-center z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-white/50">
            Touch and drag to clear your mind
          </p>
        </motion.div>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-24 left-8 right-8 z-20">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500/70 to-teal-500/70 rounded-full"
            animate={{ width: `${Math.min(percentCleared, 100)}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        <p className="text-center text-white/30 text-xs mt-2">
          {percentCleared < 70 ? 'Keep going...' : 'Almost there...'}
        </p>
      </div>

      {/* Completion overlay */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/20 to-background/40"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center px-8 text-center"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/30 to-teal-500/30 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10"
              animate={{ 
                boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.1)', '0 0 0 30px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.1)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-5xl">✨</span>
            </motion.div>
            
            <h2 className="text-3xl font-light text-foreground mb-2">Clarity</h2>
            <p className="text-muted-foreground/70 text-sm mb-10 max-w-xs">
              The clutter has dissolved. Your mind is clear.
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
