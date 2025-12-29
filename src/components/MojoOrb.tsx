import { forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CosmeticType } from '@/hooks/useMojoCosmetics';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady' | 'thinking';

export interface EquippedCosmetics {
  hat: string | null;
  accessory: string | null;
  aura: string | null;
  eyes: string | null;
}

interface MojoOrbProps {
  state: MojoState;
  selectedPull?: string | null;
  size?: 'sm' | 'md' | 'lg';
  cosmetics?: EquippedCosmetics;
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

// Cosmetic visual mappings
const HAT_VISUALS: Record<string, string> = {
  'hat-crown': '👑',
  'hat-party': '🎉',
  'hat-wizard': '🧙‍♂️',
  'hat-cap': '🧢',
  'hat-tophat': '🎩',
  'hat-halo': '😇',
};

const ACCESSORY_VISUALS: Record<string, { emoji: string; position: string }> = {
  'acc-glasses': { emoji: '🕶️', position: 'center' },
  'acc-bow': { emoji: '🎀', position: 'top-right' },
  'acc-monocle': { emoji: '🧐', position: 'center' },
  'acc-headphones': { emoji: '🎧', position: 'top' },
  'acc-scarf': { emoji: '🧣', position: 'bottom' },
};

const AURA_STYLES: Record<string, { particles: string[]; color: string }> = {
  'aura-fire': { particles: ['🔥'], color: 'orange' },
  'aura-sparkle': { particles: ['✨', '⭐'], color: 'yellow' },
  'aura-rainbow': { particles: ['🌈'], color: 'rainbow' },
  'aura-hearts': { particles: ['💕', '💖', '💗'], color: 'pink' },
  'aura-stars': { particles: ['⭐', '🌟'], color: 'gold' },
};

export const MojoOrb = forwardRef<HTMLDivElement, MojoOrbProps>(
  function MojoOrb({ state, selectedPull, size = 'md', cosmetics }, ref) {
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

    // Get cosmetic visuals
    const equippedHat = cosmetics?.hat ? HAT_VISUALS[cosmetics.hat] : null;
    const equippedAccessory = cosmetics?.accessory ? ACCESSORY_VISUALS[cosmetics.accessory] : null;
    const equippedAura = cosmetics?.aura ? AURA_STYLES[cosmetics.aura] : null;
    const hasCustomEyes = cosmetics?.eyes;

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
        {/* Aura particles */}
        {equippedAura && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            {equippedAura.particles.map((particle, i) => (
              <motion.span
                key={i}
                className="absolute text-lg"
                style={{
                  left: `${20 + (i * 30)}%`,
                  top: '-20%',
                }}
                animate={{
                  y: [0, -10, 0],
                  x: [0, (i % 2 === 0 ? 5 : -5), 0],
                  rotate: [0, 10, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2 + (i * 0.3),
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              >
                {particle}
              </motion.span>
            ))}
          </div>
        )}

        {/* Hat cosmetic */}
        {equippedHat && size !== 'sm' && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ fontSize: size === 'lg' ? '28px' : '20px' }}
            animate={{ y: [0, -2, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {equippedHat}
          </motion.div>
        )}

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

        {/* Accessory cosmetic */}
        {equippedAccessory && size !== 'sm' && (
          <motion.div
            className={`absolute z-20 pointer-events-none ${
              equippedAccessory.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              equippedAccessory.position === 'top-right' ? '-top-1 -right-1' :
              equippedAccessory.position === 'top' ? '-top-3 left-1/2 -translate-x-1/2' :
              'bottom-0 left-1/2 -translate-x-1/2'
            }`}
            style={{ fontSize: size === 'lg' ? '24px' : '16px' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {equippedAccessory.emoji}
          </motion.div>
        )}

        {/* Eyes */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {hasCustomEyes ? (
              // Custom eyes from cosmetics
              <motion.div
                className="flex gap-[18%]"
                style={{ marginTop: '-5%', fontSize: size === 'lg' ? '24px' : '16px' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {cosmetics?.eyes === 'eyes-heart' && <span>😍</span>}
                {cosmetics?.eyes === 'eyes-star' && <span>🤩</span>}
                {cosmetics?.eyes === 'eyes-laser' && (
                  <>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    >
                      🔴
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
                    >
                      🔴
                    </motion.span>
                  </>
                )}
                {cosmetics?.eyes === 'eyes-sleepy' && <span>😴</span>}
              </motion.div>
            ) : (
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
            )}
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