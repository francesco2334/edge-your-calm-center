import { motion } from 'framer-motion';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady';

interface MojoOrbProps {
  state: MojoState;
  selectedPull?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

// iOS-sized orbs: sm=24, md=80, lg=156 (per spec)
const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-20 h-20',
  lg: 'w-[156px] h-[156px]',
};

const stateStyles: Record<MojoState, { 
  gradient: string; 
  glow: string; 
  animation: string;
  scale: number;
}> = {
  calm: {
    gradient: 'from-primary/70 via-primary/50 to-accent/40',
    glow: '0 0 32px hsl(var(--primary) / 0.25)',
    animation: 'float',
    scale: 1,
  },
  regulating: {
    gradient: 'from-amber-500/70 via-primary/60 to-primary/40',
    glow: '0 0 40px hsl(var(--dopa-warm) / 0.35)',
    animation: 'pulse-slow',
    scale: 1.03,
  },
  'under-load': {
    gradient: 'from-orange-500/75 via-amber-500/55 to-primary/40',
    glow: '0 0 36px hsl(var(--dopa-warm) / 0.4)',
    animation: 'lean',
    scale: 1.06,
  },
  steady: {
    gradient: 'from-emerald-500/70 via-emerald-400/50 to-primary/40',
    glow: '0 0 44px hsl(142 70% 45% / 0.35)',
    animation: 'glow-warm',
    scale: 1,
  },
};

export function MojoOrb({ state, selectedPull, size = 'md' }: MojoOrbProps) {
  const styles = stateStyles[state];
  
  // Calculate lean direction based on selected pull
  const leanX = selectedPull && selectedPull !== 'none' ? 2 : 0;

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
            y: [0, -4, 0],
            scale: [1, 1.02, 1],
          } : state === 'regulating' ? {
            scale: [1, 1.06, 1],
            opacity: [0.9, 1, 0.9],
          } : state === 'under-load' ? {
            x: [-1, 1, -1],
            scale: [1.03, 1.08, 1.03],
          } : {
            scale: [1, 1.04, 1],
            opacity: [0.88, 1, 0.88],
          }
        }
        transition={{
          duration: state === 'calm' ? 3.5 : state === 'regulating' ? 1.8 : 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner highlight - gives depth */}
      <motion.div
        className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/25 via-white/10 to-transparent"
        animate={{
          opacity: state === 'steady' ? [0.25, 0.45, 0.25] : [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Outer pulse ring for steady state */}
      {state === 'steady' && (
        <motion.div
          className="absolute -inset-2 rounded-full border border-emerald-400/25"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.div>
  );
}
