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
          opacity={0.15}
        />
      </svg>
      
      {/* Progress ring - animated fill with gradient */}
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
          transition={{ duration: 1.4, ease: 'easeOut' }}
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
      
      {/* Streak badge - top right, only if streak > 0 */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 280, damping: 18 }}
          className="absolute -top-1 -right-1 bg-gradient-neon rounded-full px-2.5 py-1.5 shadow-lg shadow-primary/25"
        >
          <span className="text-[11px] font-bold text-primary-foreground tracking-wide">
            🔥 {streak}
          </span>
        </motion.div>
      )}
      
      {/* Completion indicator - bottom, only if claimed */}
      {claimed && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-500/95 rounded-full px-3.5 py-1.5 shadow-md"
        >
          <span className="text-[10px] font-bold text-white tracking-wide">Today ✓</span>
        </motion.div>
      )}
    </div>
  );
}