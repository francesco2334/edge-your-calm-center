import { motion } from 'framer-motion';

interface StreakRingProps {
  streak: number;
  claimed: boolean;
  size?: number;
  children?: React.ReactNode;
}

export function StreakRing({ streak, claimed, size = 180, children }: StreakRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Progress based on streak (max 7 days for visual)
  const progress = Math.min(streak / 7, 1);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
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
          opacity={0.3}
        />
      </svg>
      
      {/* Progress ring */}
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
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="dopa-ring"
        />
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
      
      {/* Streak badge */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute -top-1 -right-1 bg-gradient-neon rounded-full px-2.5 py-1 shadow-neon"
        >
          <span className="text-xs font-bold text-primary-foreground">
            🔥 {streak}
          </span>
        </motion.div>
      )}
      
      {/* Completion indicator */}
      {claimed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 rounded-full px-2 py-0.5"
        >
          <span className="text-[10px] font-medium text-white">Today ✓</span>
        </motion.div>
      )}
    </div>
  );
}
