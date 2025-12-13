import { motion } from 'framer-motion';

interface StreakRingProps {
  streak: number;
  claimed: boolean;
  size?: number;
  children?: React.ReactNode;
}

export function StreakRing({ streak, claimed, size = 196, children }: StreakRingProps) {
  // Ring thickness per spec: 8-12pt, target 10pt
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Progress based on streak (max 7 days for visual)
  const progress = Math.min(streak / 7, 1);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring - subtle */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
      </svg>
      
      {/* Progress ring - refined glow */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#streakGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="dopa-ring"
        />
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content (Mojo orb) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
      
      {/* Streak badge - top right */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          className="absolute -top-1 -right-1 bg-gradient-neon rounded-full px-2.5 py-1 shadow-lg shadow-primary/20"
        >
          <span className="text-[11px] font-bold text-primary-foreground">
            🔥 {streak}
          </span>
        </motion.div>
      )}
      
      {/* Completion indicator - bottom */}
      {claimed && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500/90 rounded-full px-3 py-1"
        >
          <span className="text-[10px] font-semibold text-white tracking-wide">Today ✓</span>
        </motion.div>
      )}
    </div>
  );
}
