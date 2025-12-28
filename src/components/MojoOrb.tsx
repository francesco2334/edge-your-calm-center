import { forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady' | 'thinking';

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
  thinking: {
    gradient: 'from-violet-500/75 via-primary/60 to-accent/45',
    glow: '0 0 44px hsl(var(--primary) / 0.35)',
    scale: 1,
  },
};

export const MojoOrb = forwardRef<HTMLDivElement, MojoOrbProps>(
  function MojoOrb({ state, selectedPull, size = 'md' }, ref) {
    const styles = stateStyles[state];
    const [prevState, setPrevState] = useState(state);
    const [justBecameHappy, setJustBecameHappy] = useState(false);
    
    // Detect transition to steady state
    useEffect(() => {
      if (state === 'steady' && prevState !== 'steady') {
        setJustBecameHappy(true);
        const timer = setTimeout(() => setJustBecameHappy(false), 600);
        return () => clearTimeout(timer);
      }
      setPrevState(state);
    }, [state, prevState]);
    
    // Calculate lean direction based on selected pull
    const leanX = selectedPull && selectedPull !== 'none' ? 3 : 0;

    return (
      <motion.div
        ref={ref}
        className={`${sizeClasses[size]} relative`}
        animate={{
          scale: justBecameHappy ? [styles.scale, styles.scale * 1.15, styles.scale * 0.95, styles.scale * 1.05, styles.scale] : styles.scale,
          y: justBecameHappy ? [0, -8, 2, -4, 0] : 0,
          x: leanX,
        }}
        transition={justBecameHappy ? {
          duration: 0.5,
          ease: [0.36, 0, 0.66, -0.56],
        } : {
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
            } : state === 'thinking' ? {
              scale: [1, 1.04, 1],
              rotate: [0, 2, -2, 0],
            } : {
              scale: [1, 1.05, 1],
              opacity: [0.85, 1, 0.85],
            }
          }
          transition={{
            duration: state === 'calm' ? 4 : state === 'thinking' ? 1.5 : state === 'regulating' ? 2 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Eyes */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="flex gap-[18%]"
              style={{ marginTop: '-5%' }}
              animate={
                state === 'under-load' ? { y: [0, 1, 0] } : 
                state === 'thinking' ? { y: [0, -2, 0] } : {}
              }
              transition={{ duration: state === 'thinking' ? 1 : 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {state === 'steady' ? (
                // Happy squint eyes ^_^ 
                <>
                  <svg 
                    width={size === 'lg' ? '20' : '12'} 
                    height={size === 'lg' ? '14' : '8'} 
                    viewBox="0 0 20 14"
                    className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  >
                    <motion.path
                      d="M2 12 Q10 2 18 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                  <svg 
                    width={size === 'lg' ? '20' : '12'} 
                    height={size === 'lg' ? '14' : '8'} 
                    viewBox="0 0 20 14"
                    className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  >
                    <motion.path
                      d="M2 12 Q10 2 18 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                </>
              ) : state === 'thinking' ? (
                // Thinking face - eyes looking up and to the side
                <>
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] relative overflow-hidden"
                    style={{ 
                      width: size === 'lg' ? '18px' : '10px', 
                      height: size === 'lg' ? '22px' : '12px',
                    }}
                  >
                    <motion.div
                      className="absolute bg-primary/60 rounded-full"
                      style={{
                        width: size === 'lg' ? '8px' : '5px',
                        height: size === 'lg' ? '8px' : '5px',
                      }}
                      animate={{ 
                        x: [3, 5, 3],
                        y: [-2, -3, -2],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] relative overflow-hidden"
                    style={{ 
                      width: size === 'lg' ? '18px' : '10px', 
                      height: size === 'lg' ? '22px' : '12px',
                    }}
                  >
                    <motion.div
                      className="absolute bg-primary/60 rounded-full"
                      style={{
                        width: size === 'lg' ? '8px' : '5px',
                        height: size === 'lg' ? '8px' : '5px',
                      }}
                      animate={{ 
                        x: [3, 5, 3],
                        y: [-2, -3, -2],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </>
              ) : (
                // Normal oval eyes for other states
                <>
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    style={{ 
                      width: size === 'lg' ? '18px' : '10px', 
                      height: size === 'lg' ? '22px' : '12px',
                    }}
                    animate={
                      state === 'calm' ? { scaleY: [1, 0.15, 1], scaleX: [1, 1.1, 1] } : 
                      state === 'under-load' ? { scaleY: 0.6, rotate: -8 } :
                      {}
                    }
                    transition={{ 
                      duration: state === 'under-load' ? 0.3 : 0.15,
                      repeat: state === 'under-load' ? 0 : Infinity,
                      repeatDelay: 3.5,
                      ease: 'easeInOut'
                    }}
                  />
                  <motion.div
                    className="bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    style={{ 
                      width: size === 'lg' ? '18px' : '10px', 
                      height: size === 'lg' ? '22px' : '12px',
                    }}
                    animate={
                      state === 'calm' ? { scaleY: [1, 0.15, 1], scaleX: [1, 1.1, 1] } : 
                      state === 'under-load' ? { scaleY: 0.6, rotate: 8 } :
                      {}
                    }
                    transition={{ 
                      duration: state === 'under-load' ? 0.3 : 0.15,
                      repeat: state === 'under-load' ? 0 : Infinity,
                      repeatDelay: 3.5,
                      ease: 'easeInOut'
                    }}
                  />
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Thinking dots */}
        {state === 'thinking' && size !== 'sm' && (
          <motion.div 
            className="absolute -top-2 -right-2 flex gap-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-white/70 rounded-full"
                animate={{ 
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Inner highlight - depth and shine */}
        <motion.div
          className="absolute inset-[12%] rounded-full bg-gradient-to-br from-white/20 via-white/8 to-transparent pointer-events-none"
          animate={{
            opacity: state === 'steady' ? [0.2, 0.35, 0.2] : state === 'thinking' ? [0.25, 0.4, 0.25] : [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: state === 'thinking' ? 1.5 : 2.8,
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