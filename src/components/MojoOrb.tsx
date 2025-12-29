import { forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type MojoState = 'calm' | 'regulating' | 'under-load' | 'steady' | 'thinking';

export interface EquippedCosmetics {
  color: string | null;
  hat: string | null;
  face: string | null;
  accessory: string | null;
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

// Color gradients for different Mojo colors
const COLOR_GRADIENTS: Record<string, { gradient: string; glow: string }> = {
  'color-default': { gradient: 'from-primary/75 via-primary/55 to-accent/45', glow: '0 0 40px hsl(var(--primary) / 0.3)' },
  'color-ocean': { gradient: 'from-cyan-500/75 via-blue-500/55 to-blue-600/45', glow: '0 0 40px hsl(200 80% 50% / 0.3)' },
  'color-sunset': { gradient: 'from-orange-500/75 via-red-400/55 to-pink-500/45', glow: '0 0 40px hsl(25 90% 55% / 0.3)' },
  'color-forest': { gradient: 'from-emerald-500/75 via-green-500/55 to-teal-500/45', glow: '0 0 40px hsl(150 70% 45% / 0.3)' },
  'color-rose': { gradient: 'from-pink-400/75 via-rose-400/55 to-pink-300/45', glow: '0 0 40px hsl(340 70% 60% / 0.3)' },
  'color-midnight': { gradient: 'from-slate-700/85 via-slate-800/70 to-slate-900/60', glow: '0 0 40px hsl(220 20% 25% / 0.4)' },
  'color-gold': { gradient: 'from-yellow-400/80 via-amber-500/65 to-orange-400/50', glow: '0 0 50px hsl(45 95% 55% / 0.4)' },
  'color-rainbow': { gradient: 'from-red-500/70 via-yellow-400/60 to-blue-500/70', glow: '0 0 50px hsl(280 70% 60% / 0.3)' },
};

const stateStyles: Record<MojoState, { 
  gradientOverride?: string;
  glowOverride?: string;
  scale: number;
}> = {
  calm: { scale: 1 },
  regulating: { 
    gradientOverride: 'from-amber-500/75 via-primary/60 to-primary/45',
    glowOverride: '0 0 48px hsl(var(--dopa-warm) / 0.4)',
    scale: 1.04 
  },
  'under-load': { 
    gradientOverride: 'from-orange-500/80 via-amber-500/60 to-primary/45',
    glowOverride: '0 0 44px hsl(var(--dopa-warm) / 0.45)',
    scale: 1.08 
  },
  steady: { 
    gradientOverride: 'from-emerald-500/75 via-emerald-400/55 to-primary/45',
    glowOverride: '0 0 52px hsl(142 70% 45% / 0.4)',
    scale: 1 
  },
  thinking: { 
    gradientOverride: 'from-violet-500/75 via-primary/60 to-accent/45',
    glowOverride: '0 0 44px hsl(var(--primary) / 0.35)',
    scale: 1 
  },
};

export const MojoOrb = forwardRef<HTMLDivElement, MojoOrbProps>(
  function MojoOrb({ state, selectedPull, size = 'md', cosmetics }, ref) {
    const stateStyle = stateStyles[state];
    const [prevState, setPrevState] = useState(state);
    const [justBecameHappy, setJustBecameHappy] = useState(false);
    
    // Get color from cosmetics or default
    const colorId = cosmetics?.color || 'color-default';
    const colorStyle = COLOR_GRADIENTS[colorId] || COLOR_GRADIENTS['color-default'];
    
    // Use state override or cosmetic color
    const gradient = stateStyle.gradientOverride || colorStyle.gradient;
    const glow = stateStyle.glowOverride || colorStyle.glow;
    
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

    // Size multipliers for cosmetics
    const sizeMultiplier = size === 'lg' ? 1 : size === 'md' ? 0.5 : 0.25;

    return (
      <motion.div
        ref={ref}
        className={`${sizeClasses[size]} relative`}
        animate={{
          scale: justBecameHappy ? [stateStyle.scale, stateStyle.scale * 1.15, stateStyle.scale * 0.95, stateStyle.scale * 1.05, stateStyle.scale] : stateStyle.scale,
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
        {/* Accessory: Wings (behind orb) */}
        {cosmetics?.accessory === 'acc-wings' && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 200 100" className="absolute -left-[60%] top-[15%] w-[60%] h-[70%] opacity-80">
              <motion.path
                d="M100 50 Q60 20 20 40 Q40 50 60 45 Q40 60 25 80 Q50 65 75 55 Q60 70 55 90 Q75 70 100 50"
                fill="white"
                fillOpacity="0.3"
                stroke="white"
                strokeWidth="1"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
            <svg viewBox="0 0 200 100" className="absolute -right-[60%] top-[15%] w-[60%] h-[70%] opacity-80 scale-x-[-1]">
              <motion.path
                d="M100 50 Q60 20 20 40 Q40 50 60 45 Q40 60 25 80 Q50 65 75 55 Q60 70 55 90 Q75 70 100 50"
                fill="white"
                fillOpacity="0.3"
                stroke="white"
                strokeWidth="1"
                animate={{ rotate: [5, -5, 5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        )}

        {/* Accessory: Cape (behind orb) */}
        {cosmetics?.accessory === 'acc-cape' && size !== 'sm' && (
          <motion.svg
            viewBox="0 0 100 120"
            className="absolute -bottom-[40%] left-1/2 -translate-x-1/2 w-[90%] h-[80%] -z-10"
            animate={{ skewX: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M20 0 Q10 60 25 120 L75 120 Q90 60 80 0"
              fill="url(#capeGradient)"
            />
            <defs>
              <linearGradient id="capeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
          </motion.svg>
        )}

        {/* Accessory: Fire Aura */}
        {cosmetics?.accessory === 'acc-flames' && size !== 'sm' && (
          <div className="absolute -inset-4 pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="absolute w-4 h-8 rounded-full"
                style={{
                  background: 'linear-gradient(to top, #f97316, #fbbf24, transparent)',
                  left: `${15 + i * 18}%`,
                  bottom: '-10%',
                }}
                animate={{
                  y: [0, -10, 0],
                  scaleY: [1, 1.3, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 0.5 + (i * 0.1),
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Accessory: Sparkles */}
        {cosmetics?.accessory === 'acc-sparkles' && size !== 'sm' && (
          <div className="absolute -inset-6 pointer-events-none">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: `${10 + (i * 15) + Math.sin(i) * 10}%`,
                  top: `${20 + Math.cos(i * 2) * 30}%`,
                  boxShadow: '0 0 8px #fcd34d',
                }}
                animate={{
                  scale: [0.5, 1.2, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Hat cosmetics */}
        {cosmetics?.hat && size !== 'sm' && (
          <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ top: size === 'lg' ? '-35%' : '-30%' }}>
            {cosmetics.hat === 'hat-beanie' && (
              <svg width={size === 'lg' ? 80 : 45} height={size === 'lg' ? 50 : 28} viewBox="0 0 80 50">
                <ellipse cx="40" cy="45" rx="38" ry="12" fill="#374151" />
                <path d="M5 45 Q5 15 40 10 Q75 15 75 45" fill="#6366f1" />
                <circle cx="40" cy="5" r="6" fill="#6366f1" />
                <rect x="5" y="38" width="70" height="10" rx="3" fill="#4f46e5" />
              </svg>
            )}
            {cosmetics.hat === 'hat-cap' && (
              <svg width={size === 'lg' ? 90 : 50} height={size === 'lg' ? 45 : 25} viewBox="0 0 90 45">
                <ellipse cx="45" cy="40" rx="40" ry="10" fill="#1e3a8a" />
                <path d="M10 40 Q10 20 45 15 Q80 20 80 40" fill="#3b82f6" />
                <path d="M5 40 Q0 42 15 45 L85 45 Q90 42 85 38" fill="#1e3a8a" />
              </svg>
            )}
            {cosmetics.hat === 'hat-tophat' && (
              <svg width={size === 'lg' ? 70 : 40} height={size === 'lg' ? 70 : 40} viewBox="0 0 70 70">
                <ellipse cx="35" cy="65" rx="32" ry="8" fill="#1f2937" />
                <rect x="12" y="15" width="46" height="50" rx="3" fill="#374151" />
                <rect x="12" y="15" width="46" height="8" fill="#4b5563" />
                <rect x="18" y="25" width="4" height="6" rx="2" fill="#fbbf24" />
              </svg>
            )}
            {cosmetics.hat === 'hat-wizard' && (
              <svg width={size === 'lg' ? 90 : 50} height={size === 'lg' ? 80 : 45} viewBox="0 0 90 80">
                <path d="M45 0 L10 75 L80 75 Z" fill="#4c1d95" />
                <ellipse cx="45" cy="75" rx="38" ry="8" fill="#5b21b6" />
                <circle cx="45" cy="8" r="6" fill="#fbbf24" />
                {[0, 1, 2, 3, 4].map(i => (
                  <circle key={i} cx={25 + i * 12} cy={30 + (i % 2) * 15} r="3" fill="#fbbf24" opacity="0.8" />
                ))}
              </svg>
            )}
            {cosmetics.hat === 'hat-crown' && (
              <svg width={size === 'lg' ? 80 : 45} height={size === 'lg' ? 55 : 30} viewBox="0 0 80 55">
                <path d="M5 50 L10 20 L25 35 L40 5 L55 35 L70 20 L75 50 Z" fill="#fbbf24" />
                <rect x="5" y="45" width="70" height="10" rx="2" fill="#f59e0b" />
                <circle cx="20" cy="25" r="4" fill="#dc2626" />
                <circle cx="40" cy="12" r="5" fill="#dc2626" />
                <circle cx="60" cy="25" r="4" fill="#dc2626" />
              </svg>
            )}
            {cosmetics.hat === 'hat-halo' && (
              <motion.svg 
                width={size === 'lg' ? 100 : 55} 
                height={size === 'lg' ? 30 : 18} 
                viewBox="0 0 100 30"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="#fbbf24" strokeWidth="6" />
                <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="#fef3c7" strokeWidth="2" />
              </motion.svg>
            )}
            {cosmetics.hat === 'hat-chef' && (
              <svg width={size === 'lg' ? 85 : 48} height={size === 'lg' ? 60 : 35} viewBox="0 0 85 60">
                <ellipse cx="42" cy="55" rx="38" ry="8" fill="#e5e7eb" />
                <circle cx="25" cy="25" r="20" fill="#f9fafb" />
                <circle cx="42" cy="20" r="22" fill="#f9fafb" />
                <circle cx="60" cy="25" r="20" fill="#f9fafb" />
                <rect x="10" y="40" width="65" height="15" fill="#f9fafb" />
              </svg>
            )}
            {cosmetics.hat === 'hat-pirate' && (
              <svg width={size === 'lg' ? 100 : 55} height={size === 'lg' ? 55 : 30} viewBox="0 0 100 55">
                <ellipse cx="50" cy="50" rx="45" ry="8" fill="#1f2937" />
                <path d="M10 50 Q10 25 50 20 Q90 25 90 50" fill="#374151" />
                <circle cx="50" cy="30" r="12" fill="#f9fafb" />
                <path d="M45 25 L50 35 L55 25 L50 40 Z" fill="#1f2937" />
              </svg>
            )}
          </div>
        )}

        {/* Base orb with gradient */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient}`}
          style={{ boxShadow: glow }}
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

        {/* Face cosmetics: Below eyes */}
        {cosmetics?.face && size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* Blush - on cheeks */}
            {cosmetics.face === 'face-blush' && (
              <>
                <div 
                  className="absolute rounded-full bg-pink-400/40"
                  style={{ 
                    width: size === 'lg' ? '20px' : '12px',
                    height: size === 'lg' ? '12px' : '7px',
                    left: size === 'lg' ? '15%' : '15%',
                    top: '55%',
                  }}
                />
                <div 
                  className="absolute rounded-full bg-pink-400/40"
                  style={{ 
                    width: size === 'lg' ? '20px' : '12px',
                    height: size === 'lg' ? '12px' : '7px',
                    right: size === 'lg' ? '15%' : '15%',
                    top: '55%',
                  }}
                />
              </>
            )}
            
            {/* Freckles */}
            {cosmetics.face === 'face-freckles' && (
              <>
                {[
                  { x: '20%', y: '50%' },
                  { x: '25%', y: '55%' },
                  { x: '22%', y: '60%' },
                  { x: '75%', y: '50%' },
                  { x: '80%', y: '55%' },
                  { x: '78%', y: '60%' },
                ].map((pos, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-amber-600/50"
                    style={{ 
                      width: size === 'lg' ? '4px' : '2px',
                      height: size === 'lg' ? '4px' : '2px',
                      left: pos.x,
                      top: pos.y,
                    }}
                  />
                ))}
              </>
            )}

            {/* Glasses */}
            {cosmetics.face === 'face-glasses' && (
              <svg 
                viewBox="0 0 100 40" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '70%' : '60%',
                  top: size === 'lg' ? '32%' : '30%',
                }}
              >
                <circle cx="25" cy="20" r="16" fill="none" stroke="#374151" strokeWidth="3" />
                <circle cx="75" cy="20" r="16" fill="none" stroke="#374151" strokeWidth="3" />
                <path d="M41 20 Q50 15 59 20" fill="none" stroke="#374151" strokeWidth="3" />
                <circle cx="25" cy="20" r="14" fill="white" fillOpacity="0.1" />
                <circle cx="75" cy="20" r="14" fill="white" fillOpacity="0.1" />
              </svg>
            )}

            {/* Sunglasses */}
            {cosmetics.face === 'face-sunglasses' && (
              <svg 
                viewBox="0 0 100 35" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '75%' : '65%',
                  top: size === 'lg' ? '33%' : '32%',
                }}
              >
                <rect x="5" y="8" width="35" height="22" rx="4" fill="#1f2937" />
                <rect x="60" y="8" width="35" height="22" rx="4" fill="#1f2937" />
                <path d="M40 18 L60 18" stroke="#1f2937" strokeWidth="4" />
                <rect x="7" y="10" width="31" height="18" rx="3" fill="linear-gradient(to bottom, #374151, #1f2937)" />
                <rect x="62" y="10" width="31" height="18" rx="3" fill="linear-gradient(to bottom, #374151, #1f2937)" />
              </svg>
            )}

            {/* Monocle */}
            {cosmetics.face === 'face-monocle' && (
              <svg 
                viewBox="0 0 50 60" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '30%' : '25%',
                  left: size === 'lg' ? '55%' : '55%',
                  top: size === 'lg' ? '28%' : '28%',
                }}
              >
                <circle cx="25" cy="20" r="18" fill="none" stroke="#fbbf24" strokeWidth="3" />
                <circle cx="25" cy="20" r="15" fill="white" fillOpacity="0.15" />
                <path d="M25 38 L25 55" stroke="#fbbf24" strokeWidth="2" />
              </svg>
            )}

            {/* Eye Patch */}
            {cosmetics.face === 'face-eyepatch' && (
              <svg 
                viewBox="0 0 60 50" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '35%' : '30%',
                  left: size === 'lg' ? '8%' : '10%',
                  top: size === 'lg' ? '25%' : '25%',
                }}
              >
                <ellipse cx="30" cy="25" rx="25" ry="18" fill="#1f2937" />
                <path d="M0 5 L30 25 L60 5" fill="none" stroke="#374151" strokeWidth="4" />
              </svg>
            )}

            {/* Mustaches - positioned below eyes */}
            {cosmetics.face === 'face-mustache' && (
              <svg 
                viewBox="0 0 80 30" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '50%' : '40%',
                  top: size === 'lg' ? '58%' : '55%',
                }}
              >
                <path 
                  d="M40 5 Q25 5 15 15 Q10 25 5 20 Q15 15 25 18 Q35 22 40 15 Q45 22 55 18 Q65 15 75 20 Q70 25 65 15 Q55 5 40 5" 
                  fill="#4a3728"
                />
              </svg>
            )}

            {/* Handlebar Mustache */}
            {cosmetics.face === 'face-handlebar' && (
              <svg 
                viewBox="0 0 100 35" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '60%' : '50%',
                  top: size === 'lg' ? '58%' : '55%',
                }}
              >
                <path 
                  d="M50 15 Q35 5 20 10 Q5 15 0 5 Q10 20 25 15 Q40 12 50 18 Q60 12 75 15 Q90 20 100 5 Q95 15 80 10 Q65 5 50 15" 
                  fill="#2d1f14"
                  strokeWidth="1"
                  stroke="#1a1209"
                />
              </svg>
            )}
          </div>
        )}

        {/* Accessory: Bow Tie (front) */}
        {cosmetics?.accessory === 'acc-bowtie' && size !== 'sm' && (
          <svg 
            viewBox="0 0 60 30" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '40%' : '35%',
              bottom: size === 'lg' ? '-5%' : '-3%',
            }}
          >
            <path d="M30 15 L5 0 L5 30 Z" fill="#dc2626" />
            <path d="M30 15 L55 0 L55 30 Z" fill="#dc2626" />
            <circle cx="30" cy="15" r="6" fill="#b91c1c" />
          </svg>
        )}

        {/* Accessory: Scarf */}
        {cosmetics?.accessory === 'acc-scarf' && size !== 'sm' && (
          <svg 
            viewBox="0 0 100 50" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '80%' : '70%',
              bottom: size === 'lg' ? '-15%' : '-10%',
            }}
          >
            <path d="M10 10 Q50 0 90 10 L90 25 Q50 15 10 25 Z" fill="#dc2626" />
            <path d="M80 25 L85 50 L75 50 L70 30" fill="#b91c1c" />
            <rect x="15" y="12" width="70" height="3" fill="#fef3c7" opacity="0.5" />
          </svg>
        )}

        {/* Accessory: Gold Chain */}
        {cosmetics?.accessory === 'acc-necklace' && size !== 'sm' && (
          <svg 
            viewBox="0 0 80 35" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '55%' : '45%',
              bottom: size === 'lg' ? '-8%' : '-5%',
            }}
          >
            <path d="M10 5 Q40 30 70 5" fill="none" stroke="#fbbf24" strokeWidth="4" />
            <circle cx="40" cy="25" r="8" fill="#fbbf24" />
            <text x="40" y="29" textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">M</text>
          </svg>
        )}

        {/* Accessory: Headphones */}
        {cosmetics?.accessory === 'acc-headphones' && size !== 'sm' && (
          <svg 
            viewBox="0 0 120 80" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '90%' : '80%',
              top: size === 'lg' ? '-10%' : '-8%',
            }}
          >
            <path d="M20 50 Q20 10 60 10 Q100 10 100 50" fill="none" stroke="#374151" strokeWidth="8" />
            <rect x="5" y="45" width="25" height="35" rx="8" fill="#1f2937" />
            <rect x="90" y="45" width="25" height="35" rx="8" fill="#1f2937" />
            <rect x="8" y="50" width="19" height="25" rx="5" fill="#4b5563" />
            <rect x="93" y="50" width="19" height="25" rx="5" fill="#4b5563" />
          </svg>
        )}

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
