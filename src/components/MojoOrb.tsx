import { forwardRef } from 'react';
import { motion } from 'framer-motion';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

interface MojoOrbProps {
  state: MojoState;
  selectedPull?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

// iOS-sized orbs per spec: sm=20, md=80, lg=156
const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-20 h-20',
  lg: 'w-[156px] h-[156px]',
};

const stateStyles: Record<MojoState, { 
  gradient: string; 
  glow: string; 
  scale: number;
}> = {
  calm: {
    gradient: 'from-primary/75 via-primary/55 to-accent/45',
    glow: '0 0 40px hsl(var(--primary) / 0.3)',
    scale: 1,
  },
  regulating: {
    gradient: 'from-amber-500/75 via-primary/60 to-primary/45',
    glow: '0 0 48px hsl(var(--dopa-warm) / 0.4)',
    scale: 1.04,
  },
  'under-load': {
    gradient: 'from-orange-500/80 via-amber-500/60 to-primary/45',
    glow: '0 0 44px hsl(var(--dopa-warm) / 0.45)',
    scale: 1.08,
  },
  steady: {
    gradient: 'from-emerald-500/75 via-emerald-400/55 to-primary/45',
    glow: '0 0 52px hsl(142 70% 45% / 0.4)',
    scale: 1,
  },
};

export const MojoOrb = forwardRef<HTMLDivElement, MojoOrbProps>(
  function MojoOrb({ state, selectedPull, size = 'md' }, ref) {
    const styles = stateStyles[state];
    
    // Calculate lean direction based on selected pull
    const leanX = selectedPull && selectedPull !== 'none' ? 3 : 0;

    return (
      <motion.div
        ref={ref}
        className={`${sizeClasses[size]} relative`}
        animate={{
          scale: styles.scale,
          x: leanX,
        }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 18,
        }}
      >
        {/* Base orb with gradient */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient}`}
          style={{ boxShadow: styles.glow }}
          animate={
            state === 'calm' ? {
              y: [0, -5, 0],
              scale: [1, 1.03, 1],
            } : state === 'regulating' ? {
              scale: [1, 1.08, 1],
              opacity: [0.88, 1, 0.88],
            } : state === 'under-load' ? {
              x: [-2, 2, -2],
              scale: [1.05, 1.1, 1.05],
            } : {
              scale: [1, 1.05, 1],
              opacity: [0.85, 1, 0.85],
            }
          }
          transition={{
            duration: state === 'calm' ? 4 : state === 'regulating' ? 2 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Inner highlight - depth and shine */}
        <motion.div
          className="absolute inset-[12%] rounded-full bg-gradient-to-br from-white/30 via-white/12 to-transparent"
          animate={{
            opacity: state === 'steady' ? [0.3, 0.5, 0.3] : [0.22, 0.38, 0.22],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Outer pulse ring for steady state */}
        {state === 'steady' && (
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-emerald-400/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: [1, 1.18, 1],
              opacity: [0.45, 0, 0.45],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>
    );
  }
);