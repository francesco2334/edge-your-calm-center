import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface WellnessBarProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: number;
  maxValue: number;
  unit: string;
  color: 'blue' | 'green' | 'orange';
  points: number;
  isLocked: boolean;
  onValueChange: (value: number) => void;
  onLock: () => void;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/50',
    icon: 'bg-blue-500/20 text-blue-400',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    locked: 'bg-blue-500/10',
  },
  green: {
    bg: 'from-green-500 to-emerald-400',
    glow: 'shadow-green-500/50',
    icon: 'bg-green-500/20 text-green-400',
    border: 'border-green-500/30',
    text: 'text-green-400',
    locked: 'bg-green-500/10',
  },
  orange: {
    bg: 'from-orange-500 to-amber-400',
    glow: 'shadow-orange-500/50',
    icon: 'bg-orange-500/20 text-orange-400',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    locked: 'bg-orange-500/10',
  },
};

export function WellnessBar({
  icon: Icon,
  title,
  subtitle,
  value,
  maxValue,
  unit,
  color,
  points,
  isLocked,
  onValueChange,
  onLock,
}: WellnessBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const colors = colorClasses[color];
  const progress = (localValue / maxValue) * 100;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(percentage * maxValue * 4) / 4; // Step by 0.25
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || isLocked) return;
    handleBarClick(e);
  };

  const handleLockClick = () => {
    if (localValue > 0 && !isLocked) {
      setShowPoints(true);
      onLock();
      setTimeout(() => setShowPoints(false), 1500);
    }
  };

  return (
    <motion.div
      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
        isLocked 
          ? `${colors.locked} ${colors.border}` 
          : 'bg-card border-border/50 hover:border-border'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { scale: 1.01 } : {}}
    >
      {/* Locked overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Points popup */}
      <AnimatePresence>
        {showPoints && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          >
            <div className={`px-4 py-2 rounded-full ${colors.icon} flex items-center gap-2 shadow-lg ${colors.glow}`}>
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">+{points} pts</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className={`p-2.5 rounded-xl ${colors.icon}`}
          animate={isLocked ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.5, repeat: isLocked ? 0 : Infinity, repeatDelay: 3 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <motion.span 
            className={`text-2xl font-bold ${colors.text}`}
            key={localValue}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {localValue}
          </motion.span>
          <span className="text-sm text-muted-foreground">/{maxValue}{unit}</span>
        </div>
      </div>

      {/* Interactive Bar */}
      <div 
        className={`relative h-12 rounded-xl bg-muted/50 overflow-hidden cursor-pointer ${
          isLocked ? 'cursor-not-allowed' : ''
        }`}
        onClick={handleBarClick}
        onMouseDown={() => !isLocked && setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleDrag}
      >
        {/* Progress fill with glow */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.bg} rounded-xl`}
          initial={{ width: 0 }}
          animate={{ 
            width: `${progress}%`,
            boxShadow: progress > 0 ? `0 0 20px rgba(var(--${color}-glow), 0.5)` : 'none'
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
        
        {/* Segment markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: maxValue }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-background/20 last:border-r-0"
            />
          ))}
        </div>

        {/* Animated bubbles for water */}
        {color === 'blue' && localValue > 0 && !isLocked && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{ 
                  x: `${Math.random() * progress}%`, 
                  y: '100%',
                  opacity: 0.5 
                }}
                animate={{ 
                  y: '-100%',
                  opacity: [0.5, 0.8, 0] 
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5 
                }}
              />
            ))}
          </div>
        )}

        {/* Pulse animation for green */}
        {color === 'green' && localValue > 0 && !isLocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Fire particles for orange */}
        {color === 'orange' && localValue > 0 && !isLocked && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full blur-sm"
                style={{ left: `${20 + i * 30}%` }}
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        )}

        {/* Drag handle */}
        {!isLocked && localValue > 0 && (
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 w-6 h-10 rounded-lg bg-white shadow-lg flex items-center justify-center ${colors.glow}`}
            style={{ left: `calc(${progress}% - 12px)` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-0.5 bg-muted-foreground/50 rounded" />
              <div className="w-3 h-0.5 bg-muted-foreground/50 rounded" />
              <div className="w-3 h-0.5 bg-muted-foreground/50 rounded" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Lock button */}
      <motion.button
        onClick={handleLockClick}
        disabled={isLocked || localValue === 0}
        className={`w-full mt-3 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isLocked 
            ? `${colors.locked} ${colors.text} cursor-not-allowed`
            : localValue > 0
              ? `bg-gradient-to-r ${colors.bg} text-white hover:opacity-90`
              : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        whileTap={!isLocked && localValue > 0 ? { scale: 0.98 } : {}}
      >
        {isLocked ? (
          <>
            <Lock className="w-4 h-4" />
            <span>Logged • +{points} pts earned</span>
            <Check className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Lock in & Earn +{points} pts</span>
            <Sparkles className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}