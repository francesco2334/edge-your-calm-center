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

// State styles - NO gradient overrides, only temporary glow/scale effects
// Mojo keeps its cosmetic color and only changes glow intensity based on state
const stateStyles: Record<MojoState, { 
  glowIntensity?: string;
  scale: number;
}> = {
  calm: { scale: 1 },
  regulating: { 
    glowIntensity: '0 0 48px hsl(var(--primary) / 0.4)',
    scale: 1.04 
  },
  'under-load': { 
    glowIntensity: '0 0 52px hsl(var(--primary) / 0.5)',
    scale: 1.08 
  },
  steady: { 
    glowIntensity: '0 0 56px hsl(var(--primary) / 0.45)',
    scale: 1 
  },
  thinking: { 
    glowIntensity: '0 0 44px hsl(var(--primary) / 0.35)',
    scale: 1 
  },
};

export const MojoOrb = forwardRef<HTMLDivElement, MojoOrbProps>(
  function MojoOrb({ state, selectedPull, size = 'md', cosmetics }, ref) {
    const stateStyle = stateStyles[state];
    const [prevState, setPrevState] = useState(state);
    const [justBecameHappy, setJustBecameHappy] = useState(false);
    
    // Get color from cosmetics or default - always use cosmetic color
    const colorId = cosmetics?.color || 'color-default';
    const colorStyle = COLOR_GRADIENTS[colorId] || COLOR_GRADIENTS['color-default'];
    
    // Always use cosmetic color, state only affects glow intensity
    const gradient = colorStyle.gradient;
    const glow = stateStyle.glowIntensity || colorStyle.glow;
    
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

        {/* Accessory: Sparkles with trailing effect */}
        {cosmetics?.accessory === 'acc-sparkles' && size !== 'sm' && (
          <div className="absolute -inset-8 pointer-events-none overflow-visible">
            {/* Static sparkles around orb */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={`static-${i}`}
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
            {/* Trailing sparkle particles */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <motion.div
                key={`trail-${i}`}
                className="absolute"
                style={{
                  width: size === 'lg' ? '8px' : '5px',
                  height: size === 'lg' ? '8px' : '5px',
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: [0, (Math.cos(i * 45 * Math.PI / 180) * (size === 'lg' ? 80 : 45))],
                  y: [0, (Math.sin(i * 45 * Math.PI / 180) * (size === 'lg' ? 80 : 45))],
                  opacity: [0.9, 0],
                  scale: [1.2, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: 'easeOut',
                }}
              >
                <svg viewBox="0 0 20 20" className="w-full h-full">
                  <path 
                    d="M10 0 L11 8 L20 10 L11 12 L10 20 L9 12 L0 10 L9 8 Z" 
                    fill="#fcd34d"
                    style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
                  />
                </svg>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hat cosmetics - positioned to overlap with orb edge for natural look */}
        {cosmetics?.hat && size !== 'sm' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" 
            style={{ 
              top: size === 'lg' ? '-18%' : '-15%',
            }}
          >
            {cosmetics.hat === 'hat-beanie' && (
              <svg width={size === 'lg' ? 100 : 55} height={size === 'lg' ? 60 : 35} viewBox="0 0 100 60">
                {/* Beanie sits on head with rounded dome */}
                <ellipse cx="50" cy="55" rx="48" ry="15" fill="#4f46e5" />
                <path d="M8 55 Q8 20 50 12 Q92 20 92 55" fill="#6366f1" />
                <circle cx="50" cy="8" r="7" fill="#818cf8" />
                {/* Ribbed band at bottom */}
                <rect x="8" y="48" width="84" height="12" rx="4" fill="#4338ca" />
                <line x1="20" y1="48" x2="20" y2="60" stroke="#3730a3" strokeWidth="1" opacity="0.5" />
                <line x1="35" y1="48" x2="35" y2="60" stroke="#3730a3" strokeWidth="1" opacity="0.5" />
                <line x1="50" y1="48" x2="50" y2="60" stroke="#3730a3" strokeWidth="1" opacity="0.5" />
                <line x1="65" y1="48" x2="65" y2="60" stroke="#3730a3" strokeWidth="1" opacity="0.5" />
                <line x1="80" y1="48" x2="80" y2="60" stroke="#3730a3" strokeWidth="1" opacity="0.5" />
              </svg>
            )}
            {cosmetics.hat === 'hat-cap' && (
              <svg width={size === 'lg' ? 110 : 60} height={size === 'lg' ? 55 : 32} viewBox="0 0 110 55">
                {/* Baseball cap with curved brim */}
                <ellipse cx="55" cy="50" rx="50" ry="12" fill="#1e40af" />
                <path d="M12 50 Q12 25 55 18 Q98 25 98 50" fill="#3b82f6" />
                {/* Cap button on top */}
                <circle cx="55" cy="20" r="4" fill="#1e3a8a" />
                {/* Brim extending forward */}
                <path d="M10 48 Q-5 52 15 58 L95 58 Q115 52 100 48" fill="#1e3a8a" />
              </svg>
            )}
            {cosmetics.hat === 'hat-tophat' && (
              <svg width={size === 'lg' ? 85 : 48} height={size === 'lg' ? 85 : 48} viewBox="0 0 85 85">
                {/* Classic top hat */}
                <ellipse cx="42" cy="80" rx="40" ry="10" fill="#1f2937" />
                <rect x="15" y="20" width="55" height="60" rx="3" fill="#374151" />
                {/* Highlight band */}
                <rect x="15" y="28" width="55" height="10" fill="#4b5563" />
                {/* Gold buckle */}
                <rect x="35" y="30" width="15" height="6" rx="1" fill="#fbbf24" />
              </svg>
            )}
            {cosmetics.hat === 'hat-wizard' && (
              <svg width={size === 'lg' ? 110 : 60} height={size === 'lg' ? 95 : 52} viewBox="0 0 110 95">
                {/* Wizard hat - tall cone shape */}
                <path d="M55 0 L10 88 L100 88 Z" fill="#5b21b6" />
                <ellipse cx="55" cy="88" rx="48" ry="10" fill="#7c3aed" />
                {/* Stars decoration */}
                <circle cx="55" cy="10" r="7" fill="#fbbf24" />
                <circle cx="35" cy="35" r="4" fill="#fcd34d" opacity="0.9" />
                <circle cx="70" cy="45" r="3" fill="#fcd34d" opacity="0.8" />
                <circle cx="45" cy="60" r="3.5" fill="#fcd34d" opacity="0.85" />
                <circle cx="75" cy="70" r="2.5" fill="#fcd34d" opacity="0.7" />
                {/* Moon accent */}
                <path d="M28 55 Q22 50 28 45 Q32 50 28 55" fill="#fbbf24" opacity="0.7" />
              </svg>
            )}
            {cosmetics.hat === 'hat-crown' && (
              <svg width={size === 'lg' ? 100 : 55} height={size === 'lg' ? 65 : 36} viewBox="0 0 100 65">
                {/* Royal crown with gems */}
                <path d="M5 55 L12 22 L28 38 L50 5 L72 38 L88 22 L95 55 Z" fill="#fbbf24" />
                <rect x="5" y="50" width="90" height="15" rx="3" fill="#f59e0b" />
                {/* Jewels */}
                <circle cx="22" cy="28" r="5" fill="#dc2626" />
                <circle cx="50" cy="12" r="6" fill="#dc2626" />
                <circle cx="78" cy="28" r="5" fill="#dc2626" />
                {/* Band gems */}
                <circle cx="25" cy="57" r="3" fill="#3b82f6" />
                <circle cx="50" cy="57" r="3" fill="#10b981" />
                <circle cx="75" cy="57" r="3" fill="#3b82f6" />
              </svg>
            )}
            {cosmetics.hat === 'hat-halo' && (
              <motion.svg 
                width={size === 'lg' ? 120 : 65} 
                height={size === 'lg' ? 35 : 20} 
                viewBox="0 0 120 35"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Glowing halo ring */}
                <ellipse cx="60" cy="18" rx="55" ry="14" fill="none" stroke="#fbbf24" strokeWidth="8" />
                <ellipse cx="60" cy="18" rx="55" ry="14" fill="none" stroke="#fef3c7" strokeWidth="3" />
                {/* Inner glow */}
                <ellipse cx="60" cy="18" rx="50" ry="11" fill="none" stroke="#fef9c3" strokeWidth="1" opacity="0.5" />
              </motion.svg>
            )}
            {cosmetics.hat === 'hat-chef' && (
              <svg width={size === 'lg' ? 105 : 58} height={size === 'lg' ? 80 : 45} viewBox="0 0 105 80">
                {/* Tall puffy chef toque */}
                <ellipse cx="52" cy="75" rx="48" ry="10" fill="#e5e7eb" />
                {/* Puffy clouds making up the toque */}
                <circle cx="28" cy="45" r="22" fill="#f9fafb" />
                <circle cx="52" cy="35" r="26" fill="#ffffff" />
                <circle cx="76" cy="45" r="22" fill="#f9fafb" />
                <circle cx="40" cy="25" r="18" fill="#ffffff" />
                <circle cx="64" cy="25" r="18" fill="#ffffff" />
                <circle cx="52" cy="15" r="15" fill="#f9fafb" />
                {/* Headband */}
                <rect x="8" y="60" width="89" height="18" fill="#f3f4f6" />
                <rect x="8" y="60" width="89" height="4" fill="#e5e7eb" />
              </svg>
            )}
            {cosmetics.hat === 'hat-pirate' && (
              <svg width={size === 'lg' ? 120 : 65} height={size === 'lg' ? 70 : 38} viewBox="0 0 120 70">
                {/* Tricorn pirate hat with proper shape */}
                <ellipse cx="60" cy="65" rx="55" ry="10" fill="#1f2937" />
                {/* Main hat body */}
                <path d="M10 65 Q0 40 30 35 L60 10 L90 35 Q120 40 110 65" fill="#374151" />
                {/* Tricorn fold lines */}
                <path d="M60 10 L60 35" stroke="#4b5563" strokeWidth="2" fill="none" />
                {/* Skull emblem */}
                <circle cx="60" cy="42" r="12" fill="#f9fafb" />
                <circle cx="55" cy="40" r="2.5" fill="#1f2937" />
                <circle cx="65" cy="40" r="2.5" fill="#1f2937" />
                <path d="M56 48 Q60 50 64 48" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                {/* Gold trim */}
                <path d="M15 58 Q60 45 105 58" stroke="#fbbf24" strokeWidth="3" fill="none" />
                {/* Feather */}
                <path d="M95 30 Q110 20 105 10 Q100 20 95 15 Q90 25 95 30" fill="#dc2626" />
              </svg>
            )}
            {cosmetics.hat === 'hat-catears' && (
              <svg width={size === 'lg' ? 100 : 55} height={size === 'lg' ? 50 : 28} viewBox="0 0 100 50">
                {/* Left cat ear */}
                <path d="M10 48 L22 5 L42 45 Z" fill="#f472b6" />
                <path d="M16 42 L22 12 L35 40 Z" fill="#fda4af" />
                {/* Right cat ear */}
                <path d="M58 45 L78 5 L90 48 Z" fill="#f472b6" />
                <path d="M65 40 L78 12 L84 42 Z" fill="#fda4af" />
              </svg>
            )}
            {cosmetics.hat === 'hat-bunnyears' && (
              <svg width={size === 'lg' ? 100 : 55} height={size === 'lg' ? 80 : 44} viewBox="0 0 100 80">
                {/* Left bunny ear - long and floppy */}
                <ellipse cx="25" cy="40" rx="12" ry="38" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />
                <ellipse cx="25" cy="40" rx="6" ry="28" fill="#fda4af" />
                {/* Right bunny ear */}
                <ellipse cx="75" cy="40" rx="12" ry="38" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />
                <ellipse cx="75" cy="40" rx="6" ry="28" fill="#fda4af" />
              </svg>
            )}
            {cosmetics.hat === 'hat-flower' && (
              <svg width={size === 'lg' ? 120 : 66} height={size === 'lg' ? 35 : 20} viewBox="0 0 120 35">
                {/* Flower crown wreath */}
                <ellipse cx="60" cy="30" rx="55" ry="8" fill="none" stroke="#22c55e" strokeWidth="4" />
                {/* Flowers */}
                <circle cx="20" cy="20" r="10" fill="#f472b6" />
                <circle cx="20" cy="20" r="4" fill="#fbbf24" />
                <circle cx="45" cy="15" r="8" fill="#a78bfa" />
                <circle cx="45" cy="15" r="3" fill="#fbbf24" />
                <circle cx="75" cy="15" r="8" fill="#f472b6" />
                <circle cx="75" cy="15" r="3" fill="#fbbf24" />
                <circle cx="100" cy="20" r="10" fill="#fb7185" />
                <circle cx="100" cy="20" r="4" fill="#fbbf24" />
                {/* Leaves */}
                <ellipse cx="32" cy="28" rx="6" ry="4" fill="#22c55e" transform="rotate(-20 32 28)" />
                <ellipse cx="88" cy="28" rx="6" ry="4" fill="#22c55e" transform="rotate(20 88 28)" />
              </svg>
            )}
            {cosmetics.hat === 'hat-tiara' && (
              <motion.svg 
                width={size === 'lg' ? 100 : 55} 
                height={size === 'lg' ? 45 : 25} 
                viewBox="0 0 100 45"
                animate={{ 
                  filter: ['drop-shadow(0 0 3px #f472b6)', 'drop-shadow(0 0 8px #f472b6)', 'drop-shadow(0 0 3px #f472b6)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Tiara base */}
                <path d="M5 40 Q15 35 25 38 L50 8 L75 38 Q85 35 95 40" fill="none" stroke="#fbbf24" strokeWidth="4" />
                {/* Crown points */}
                <path d="M20 38 L30 20 L40 35" fill="none" stroke="#fbbf24" strokeWidth="3" />
                <path d="M60 35 L70 20 L80 38" fill="none" stroke="#fbbf24" strokeWidth="3" />
                {/* Center heart gem */}
                <path d="M50 12 L45 18 L50 28 L55 18 Z" fill="#f472b6" />
                <circle cx="47" cy="16" r="4" fill="#ec4899" />
                <circle cx="53" cy="16" r="4" fill="#ec4899" />
                {/* Side gems */}
                <circle cx="30" cy="25" r="4" fill="#a78bfa" />
                <circle cx="70" cy="25" r="4" fill="#a78bfa" />
                {/* Sparkle accents */}
                <circle cx="50" cy="5" r="2" fill="white" opacity="0.9" />
              </motion.svg>
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

            {/* Heart Eyes - replaces normal eyes with hearts + floating hearts */}
            {cosmetics.face === 'face-hearts' && (
              <>
                <div 
                  className="absolute flex gap-4 items-center justify-center"
                  style={{ top: '35%' }}
                >
                  <motion.svg 
                    width={size === 'lg' ? 20 : 12} 
                    height={size === 'lg' ? 18 : 10} 
                    viewBox="0 0 20 18"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <path d="M10 18 L1 9 Q-2 4 3 2 Q8 0 10 5 Q12 0 17 2 Q22 4 19 9 Z" fill="#ec4899" />
                  </motion.svg>
                  <motion.svg 
                    width={size === 'lg' ? 20 : 12} 
                    height={size === 'lg' ? 18 : 10} 
                    viewBox="0 0 20 18"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
                  >
                    <path d="M10 18 L1 9 Q-2 4 3 2 Q8 0 10 5 Q12 0 17 2 Q22 4 19 9 Z" fill="#ec4899" />
                  </motion.svg>
                </div>
                {/* Floating hearts around Mojo */}
                <div className="absolute -inset-10 pointer-events-none overflow-visible">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={`floating-heart-${i}`}
                      className="absolute"
                      style={{
                        left: `${15 + i * 14}%`,
                        bottom: '20%',
                      }}
                      initial={{ y: 0, opacity: 0, scale: 0.5 }}
                      animate={{
                        y: [0, -(size === 'lg' ? 100 : 60)],
                        x: [0, (i % 2 === 0 ? 15 : -15)],
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1, 0.8, 0.4],
                        rotate: [0, (i % 2 === 0 ? 20 : -20)],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: 'easeOut',
                      }}
                    >
                      <svg 
                        width={size === 'lg' ? 16 : 10} 
                        height={size === 'lg' ? 14 : 9} 
                        viewBox="0 0 20 18"
                      >
                        <path 
                          d="M10 18 L1 9 Q-2 4 3 2 Q8 0 10 5 Q12 0 17 2 Q22 4 19 9 Z" 
                          fill={i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#ec4899' : '#fb7185'}
                          style={{ filter: 'drop-shadow(0 0 3px #ec4899)' }}
                        />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Star Eyes */}
            {cosmetics.face === 'face-stars' && (
              <div 
                className="absolute flex gap-4 items-center justify-center"
                style={{ top: '33%' }}
              >
                <motion.svg 
                  width={size === 'lg' ? 20 : 12} 
                  height={size === 'lg' ? 20 : 12} 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path d="M12 2 L14 9 L22 9 L16 14 L18 22 L12 17 L6 22 L8 14 L2 9 L10 9 Z" fill="#fbbf24" />
                </motion.svg>
                <motion.svg 
                  width={size === 'lg' ? 20 : 12} 
                  height={size === 'lg' ? 20 : 12} 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                >
                  <path d="M12 2 L14 9 L22 9 L16 14 L18 22 L12 17 L6 22 L8 14 L2 9 L10 9 Z" fill="#fbbf24" />
                </motion.svg>
              </div>
            )}

            {/* Cat Whiskers */}
            {cosmetics.face === 'face-whiskers' && (
              <svg 
                viewBox="0 0 100 40" 
                className="absolute"
                style={{ 
                  width: size === 'lg' ? '80%' : '70%',
                  top: size === 'lg' ? '50%' : '48%',
                }}
              >
                {/* Left whiskers */}
                <line x1="5" y1="15" x2="30" y2="18" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="20" x2="30" y2="20" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="25" x2="30" y2="22" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                {/* Right whiskers */}
                <line x1="95" y1="15" x2="70" y2="18" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                <line x1="95" y1="20" x2="70" y2="20" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                <line x1="95" y1="25" x2="70" y2="22" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                {/* Nose */}
                <ellipse cx="50" cy="20" rx="4" ry="3" fill="#374151" />
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

        {/* Accessory: Colored Bow Ties */}
        {(cosmetics?.accessory === 'acc-bowtie-red' || cosmetics?.accessory === 'acc-bowtie-pink' || cosmetics?.accessory === 'acc-bowtie-blue' || cosmetics?.accessory === 'acc-bowtie-gold') && size !== 'sm' && (
          <svg 
            viewBox="0 0 60 30" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '40%' : '35%',
              bottom: size === 'lg' ? '-5%' : '-3%',
            }}
          >
            <path d="M30 15 L5 0 L5 30 Z" fill={
              cosmetics.accessory === 'acc-bowtie-red' ? '#dc2626' :
              cosmetics.accessory === 'acc-bowtie-pink' ? '#f472b6' :
              cosmetics.accessory === 'acc-bowtie-blue' ? '#3b82f6' : '#fbbf24'
            } />
            <path d="M30 15 L55 0 L55 30 Z" fill={
              cosmetics.accessory === 'acc-bowtie-red' ? '#dc2626' :
              cosmetics.accessory === 'acc-bowtie-pink' ? '#f472b6' :
              cosmetics.accessory === 'acc-bowtie-blue' ? '#3b82f6' : '#fbbf24'
            } />
            <circle cx="30" cy="15" r="6" fill={
              cosmetics.accessory === 'acc-bowtie-red' ? '#b91c1c' :
              cosmetics.accessory === 'acc-bowtie-pink' ? '#ec4899' :
              cosmetics.accessory === 'acc-bowtie-blue' ? '#2563eb' : '#f59e0b'
            } />
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

        {/* Accessory: Pearl Necklace */}
        {cosmetics?.accessory === 'acc-pearls' && size !== 'sm' && (
          <svg 
            viewBox="0 0 80 30" 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ 
              width: size === 'lg' ? '55%' : '45%',
              bottom: size === 'lg' ? '-6%' : '-4%',
            }}
          >
            <path d="M8 5 Q40 28 72 5" fill="none" stroke="#fce7f3" strokeWidth="2" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <circle key={i} cx={10 + i * 7.5} cy={5 + Math.sin((i - 4) * 0.35) * 18} r="4" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="0.5" />
            ))}
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

        {/* Accessory: Butterfly Wings */}
        {cosmetics?.accessory === 'acc-butterflywings' && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.svg 
              viewBox="0 0 100 80" 
              className="absolute -left-[55%] top-[10%] w-[55%] h-[80%]"
              animate={{ rotate: [-5, 8, -5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M95 40 Q70 5 30 15 Q5 25 15 45 Q25 65 50 55 Q75 45 95 40" fill="url(#butterflyGrad1)" opacity="0.85" />
              <path d="M95 40 Q75 55 50 75 Q35 85 25 70 Q15 55 40 50 Q65 45 95 40" fill="url(#butterflyGrad2)" opacity="0.85" />
              <defs>
                <linearGradient id="butterflyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="butterflyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </motion.svg>
            <motion.svg 
              viewBox="0 0 100 80" 
              className="absolute -right-[55%] top-[10%] w-[55%] h-[80%] scale-x-[-1]"
              animate={{ rotate: [5, -8, 5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M95 40 Q70 5 30 15 Q5 25 15 45 Q25 65 50 55 Q75 45 95 40" fill="url(#butterflyGrad1)" opacity="0.85" />
              <path d="M95 40 Q75 55 50 75 Q35 85 25 70 Q15 55 40 50 Q65 45 95 40" fill="url(#butterflyGrad2)" opacity="0.85" />
            </motion.svg>
          </div>
        )}

        {/* EXCLUSIVE OUTFIT: James Bond / Secret Agent */}
        {cosmetics?.accessory === 'outfit-jamesbond' && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Martini glass on left side */}
            <svg 
              viewBox="0 0 40 60" 
              className="absolute z-30"
              style={{ 
                width: size === 'lg' ? '22%' : '18%',
                left: size === 'lg' ? '-20%' : '-15%',
                top: size === 'lg' ? '25%' : '28%',
              }}
            >
              {/* Glass */}
              <path d="M5 5 L35 5 L20 30 L20 50 L10 55 L30 55 L20 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d="M8 8 L32 8 L20 28 Z" fill="#e0f2fe" fillOpacity="0.6" />
              {/* Olive */}
              <circle cx="20" cy="15" r="4" fill="#84cc16" />
              <rect x="19" y="8" width="2" height="10" fill="#78716c" />
            </svg>
            
            {/* Pistol on right side */}
            <svg 
              viewBox="0 0 50 35" 
              className="absolute z-30"
              style={{ 
                width: size === 'lg' ? '28%' : '22%',
                right: size === 'lg' ? '-25%' : '-18%',
                top: size === 'lg' ? '30%' : '32%',
              }}
            >
              {/* Gun body */}
              <rect x="5" y="8" width="35" height="10" rx="2" fill="#374151" />
              {/* Barrel */}
              <rect x="35" y="10" width="12" height="6" rx="1" fill="#1f2937" />
              {/* Handle */}
              <path d="M8 18 L5 32 L15 32 L18 18" fill="#78716c" />
              {/* Trigger guard */}
              <path d="M18 18 Q22 25 18 28 L22 28 Q26 22 22 18" fill="none" stroke="#374151" strokeWidth="2" />
              {/* Trigger */}
              <rect x="19" y="20" width="2" height="5" fill="#1f2937" />
              {/* Slide detail */}
              <line x1="10" y1="10" x2="10" y2="16" stroke="#4b5563" strokeWidth="1" />
              <line x1="15" y1="10" x2="15" y2="16" stroke="#4b5563" strokeWidth="1" />
            </svg>
            
            {/* Tuxedo body - positioned lower */}
            <svg 
              viewBox="0 0 100 60" 
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ 
                width: size === 'lg' ? '85%' : '75%',
                bottom: size === 'lg' ? '-30%' : '-25%',
              }}
            >
              {/* Black jacket */}
              <path d="M15 0 L5 60 L95 60 L85 0 L65 10 L50 5 L35 10 Z" fill="#1f2937" />
              {/* White shirt */}
              <path d="M35 10 L50 5 L65 10 L60 60 L40 60 Z" fill="#f9fafb" />
              {/* Lapels */}
              <path d="M35 10 L40 30 L35 35 L20 15" fill="#374151" />
              <path d="M65 10 L60 30 L65 35 L80 15" fill="#374151" />
              {/* Bow tie */}
              <path d="M50 15 L42 10 L42 20 Z" fill="#1f2937" />
              <path d="M50 15 L58 10 L58 20 Z" fill="#1f2937" />
              <circle cx="50" cy="15" r="3" fill="#374151" />
              {/* Pocket square */}
              <path d="M22 25 L28 22 L30 30 L24 32" fill="#f9fafb" />
            </svg>
          </div>
        )}


        {/* EXCLUSIVE OUTFIT: Princess */}
        {cosmetics?.accessory === 'outfit-princess' && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Princess dress */}
            <svg 
              viewBox="0 0 120 80" 
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ 
                width: size === 'lg' ? '95%' : '85%',
                bottom: size === 'lg' ? '-35%' : '-28%',
              }}
            >
              {/* Dress body */}
              <path d="M40 0 L20 80 L100 80 L80 0 Q60 10 40 0" fill="url(#princessDressGrad)" />
              {/* Bodice */}
              <path d="M40 0 L45 25 L60 30 L75 25 L80 0 Q60 10 40 0" fill="#ec4899" />
              {/* Sparkles on dress */}
              <circle cx="35" cy="45" r="2" fill="white" opacity="0.7" />
              <circle cx="85" cy="50" r="2" fill="white" opacity="0.7" />
              <circle cx="50" cy="60" r="1.5" fill="white" opacity="0.6" />
              <circle cx="70" cy="55" r="1.5" fill="white" opacity="0.6" />
              <circle cx="60" cy="70" r="2" fill="white" opacity="0.7" />
              <defs>
                <linearGradient id="princessDressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            {/* Tiara (on top) */}
            <motion.svg 
              width={size === 'lg' ? 80 : 44} 
              height={size === 'lg' ? 35 : 20} 
              viewBox="0 0 80 35"
              className="absolute left-1/2 -translate-x-1/2 z-30"
              style={{ top: size === 'lg' ? '-15%' : '-12%' }}
              animate={{ filter: ['drop-shadow(0 0 4px #f472b6)', 'drop-shadow(0 0 10px #f472b6)', 'drop-shadow(0 0 4px #f472b6)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path d="M5 32 Q20 25 40 8 Q60 25 75 32" fill="none" stroke="#fbbf24" strokeWidth="4" />
              <circle cx="40" cy="10" r="5" fill="#f472b6" />
              <circle cx="22" cy="22" r="3" fill="#a78bfa" />
              <circle cx="58" cy="22" r="3" fill="#a78bfa" />
            </motion.svg>
            {/* Magic wand */}
            <motion.svg 
              viewBox="0 0 50 80" 
              className="absolute z-20"
              style={{ 
                width: size === 'lg' ? '25%' : '20%',
                right: size === 'lg' ? '-15%' : '-10%',
                top: size === 'lg' ? '20%' : '25%',
              }}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <rect x="22" y="25" width="6" height="55" rx="2" fill="#f472b6" />
              <path d="M25 0 L28 18 L45 12 L32 22 L40 38 L25 28 L10 38 L18 22 L5 12 L22 18 Z" fill="#fbbf24" />
              <circle cx="25" cy="20" r="4" fill="white" opacity="0.8" />
            </motion.svg>
          </div>
        )}

        {/* EXCLUSIVE OUTFIT: Teddy Bear */}
        {cosmetics?.accessory === 'outfit-teddy' && size !== 'sm' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Teddy ears */}
            <svg 
              width={size === 'lg' ? 120 : 66} 
              height={size === 'lg' ? 45 : 25} 
              viewBox="0 0 120 45"
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ top: size === 'lg' ? '-20%' : '-15%' }}
            >
              {/* Left ear */}
              <circle cx="25" cy="25" r="22" fill="#d4a574" />
              <circle cx="25" cy="25" r="12" fill="#c4956a" />
              {/* Right ear */}
              <circle cx="95" cy="25" r="22" fill="#d4a574" />
              <circle cx="95" cy="25" r="12" fill="#c4956a" />
            </svg>
            {/* Fuzzy texture overlay */}
            <div 
              className="absolute inset-0 rounded-full opacity-30 z-10"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #d4a574 0%, transparent 50%)',
              }}
            />
            {/* Teddy nose */}
            <svg 
              viewBox="0 0 40 30" 
              className="absolute left-1/2 -translate-x-1/2 z-30"
              style={{ 
                width: size === 'lg' ? '25%' : '20%',
                top: size === 'lg' ? '50%' : '48%',
              }}
            >
              <ellipse cx="20" cy="12" rx="12" ry="8" fill="#c4956a" />
              <ellipse cx="20" cy="10" rx="5" ry="4" fill="#4a3728" />
            </svg>
            {/* Bow */}
            <svg 
              viewBox="0 0 60 30" 
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ 
                width: size === 'lg' ? '40%' : '35%',
                bottom: size === 'lg' ? '-5%' : '-3%',
              }}
            >
              <path d="M30 15 L5 0 L5 30 Z" fill="#ec4899" />
              <path d="M30 15 L55 0 L55 30 Z" fill="#ec4899" />
              <circle cx="30" cy="15" r="6" fill="#db2777" />
            </svg>
          </div>
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
