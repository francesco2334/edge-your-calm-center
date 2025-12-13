import { motion } from 'framer-motion';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

interface MojoOrbProps {
  state: MojoState;
  selectedPull?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-20 h-20',
  lg: 'w-32 h-32', // +33% from 24 -> 32
};

const stateStyles: Record<MojoState, { 
  gradient: string; 
  glow: string; 
  animation: string;
  scale: number;
}> = {
  calm: {
    gradient: 'from-primary/60 via-primary/40 to-accent/30',
    glow: '0 0 20px hsl(var(--primary) / 0.3)',
    animation: 'float',
    scale: 1,
  },
  regulating: {
    gradient: 'from-amber-500/60 via-primary/50 to-primary/30',
    glow: '0 0 30px hsl(var(--dopa-warm) / 0.4)',
    animation: 'pulse-slow',
    scale: 1.05,
  },
  'under-load': {
    gradient: 'from-orange-500/70 via-amber-500/50 to-primary/30',
    glow: '0 0 25px hsl(var(--dopa-warm) / 0.5)',
    animation: 'lean',
    scale: 1.1,
  },
  steady: {
    gradient: 'from-emerald-500/60 via-emerald-400/40 to-primary/30',
    glow: '0 0 35px hsl(142 70% 45% / 0.4)',
    animation: 'glow-warm',
    scale: 1,
  },
};

export function MojoOrb({ state, selectedPull, size = 'md' }: MojoOrbProps) {
  const styles = stateStyles[state];
  
  // Calculate lean direction based on selected pull
  const leanX = selectedPull && selectedPull !== 'none' ? 3 : 0;

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={{
        scale: styles.scale,
        x: leanX,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    >
      {/* Base orb */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient}`}
        style={{ boxShadow: styles.glow }}
        animate={
          state === 'calm' ? {
            y: [0, -3, 0],
            scale: [1, 1.02, 1],
          } : state === 'regulating' ? {
            scale: [1, 1.08, 1],
            opacity: [0.9, 1, 0.9],
          } : state === 'under-load' ? {
            x: [-1, 1, -1],
            scale: [1.05, 1.1, 1.05],
          } : {
            scale: [1, 1.05, 1],
            opacity: [0.85, 1, 0.85],
          }
        }
        transition={{
          duration: state === 'calm' ? 3 : state === 'regulating' ? 1.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
        animate={{
          opacity: state === 'steady' ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Outer ring for steady state */}
      {state === 'steady' && (
        <motion.div
          className="absolute -inset-1 rounded-full border border-emerald-400/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.div>
  );
}
