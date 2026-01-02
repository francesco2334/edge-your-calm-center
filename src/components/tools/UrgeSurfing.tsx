import { useState, useEffect, forwardRef, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Star, AlertTriangle } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';
import { MojoCompanion } from '../MojoCompanion';
import { MojoOrb } from '../MojoOrb';
import { useMojoCosmeticsOptional } from '@/contexts/MojoCosmeticsContext';
import { GameDifficulty, getDifficultyMultipliers } from '@/lib/game-difficulty';
import { FirstTimeTooltip } from './FirstTimeTooltip';

interface UrgeSurfingProps {
  onComplete: (wavesRidden: number) => void;
  onCancel: () => void;
  difficulty?: GameDifficulty;
}

const CHALLENGES = [
  { name: 'Restlessness', color: '#22d3ee' },
  { name: 'Boredom', color: '#2dd4bf' },
  { name: 'Anxiety', color: '#34d399' },
  { name: 'Craving', color: '#4ade80' },
  { name: 'Frustration', color: '#a78bfa' },
  { name: 'Loneliness', color: '#c084fc' },
  { name: 'Stress', color: '#f472b6' },
  { name: 'Doubt', color: '#fb7185' },
];

const QUOTES = [
  "You are stronger than any wave",
  "This feeling will pass",
  "Stay present, stay calm",
  "One moment at a time",
  "You've got this",
  "Breathe and ride",
  "Peace is within you",
  "Trust the process",
];

export const UrgeSurfing = forwardRef<HTMLDivElement, UrgeSurfingProps>(
  function UrgeSurfing({ onComplete, onCancel, difficulty = 'medium' }, ref) {
    const cosmeticsContext = useMojoCosmeticsOptional();
    const multipliers = useMemo(() => getDifficultyMultipliers(difficulty), [difficulty]);
    
    const GAME_DURATION = Math.round(60 * multipliers.duration);
    const WAVE_INTERVAL = 10;
    const WAVE_ZONE_SIZE = Math.round(18 * multipliers.tolerance);
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete' | 'lost'>('intro');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [surferY, setSurferY] = useState(50);
    const [waveY, setWaveY] = useState(50);
    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [wavesRidden, setWavesRidden] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
    const [showWaveLabel, setShowWaveLabel] = useState(false);
    const [status, setStatus] = useState<'riding' | 'sinking' | 'falling'>('riding');
    const [combo, setCombo] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [offWaveTime, setOffWaveTime] = useState(0);
    const [warnings, setWarnings] = useState(0);
    const [waveIntensity, setWaveIntensity] = useState(0); // 0-1 for wave shape morphing
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHapticRef = useRef(0);
    const lastWarningRef = useRef(0);
    
    const MAX_WARNINGS = 8;

    const startGame = () => {
      setPhase('active');
      setShowWaveLabel(true);
      haptics.selectionChanged();
      setTimeout(() => setShowWaveLabel(false), 2000);
    };

    // Touch/mouse controls
    const handleMove = useCallback((clientY: number) => {
      if (phase !== 'active' || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percentage = ((clientY - rect.top) / rect.height) * 100;
      setSurferY(Math.max(10, Math.min(90, percentage)));
    }, [phase]);

    // Main game timer
    useEffect(() => {
      if (phase !== 'active') return;
      const timer = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= GAME_DURATION) {
            setPhase('complete');
            haptics.notifySuccess();
            return GAME_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [phase]);

    // Wave movement + intensity based on difficulty
    useEffect(() => {
      if (phase !== 'active') return;
      
      const waveTimer = setInterval(() => {
        const time = Date.now() / 1000;
        const progress = timeElapsed / GAME_DURATION;
        
        // Update wave intensity for visual morphing
        setWaveIntensity(progress);
        
        // Speed increases with progress
        const baseSpeed = 0.15;
        const speedIncrease = progress * 0.15;
        const speed = baseSpeed + speedIncrease;
        
        // Amplitude grows with difficulty
        const baseAmplitude = 10 + progress * 12;
        
        const primaryWave = Math.sin(time * speed) * baseAmplitude;
        const subtleVariation = Math.sin(time * speed * 0.5) * (3 + progress * 4);
        
        const newWaveY = 50 + primaryWave + subtleVariation;
        setWaveY(Math.max(25, Math.min(75, newWaveY)));
      }, 100);
      
      return () => clearInterval(waveTimer);
    }, [phase, timeElapsed]);

    // Check if surfer is matching the wave + warnings system
    useEffect(() => {
      if (phase !== 'active') return;
      
      const checkTimer = setInterval(() => {
        const diff = Math.abs(surferY - waveY);
        const now = Date.now();
        
        if (diff <= WAVE_ZONE_SIZE) {
          // Riding the wave perfectly
          setStatus('riding');
          setShowWarning(false);
          setCombo((c) => c + 1);
          setOffWaveTime(0);
        } else {
          // Off the wave
          setOffWaveTime((prev) => prev + 1);
          setCombo(0);
          
          const isBelow = surferY > waveY + WAVE_ZONE_SIZE;
          setStatus(isBelow ? 'sinking' : 'falling');
          setShowWarning(true);
          
          // Add warning every 1.5 seconds off wave
          if (now - lastWarningRef.current > 1500) {
            lastWarningRef.current = now;
            setWarnings((w) => {
              const newWarnings = w + 1;
              if (newWarnings >= MAX_WARNINGS) {
                setPhase('lost');
                haptics.notifyError();
              } else {
                haptics.notifyWarning();
              }
              return newWarnings;
            });
          }
          
          // Escalating haptic feedback
          const hapticInterval = Math.max(300, 1000 - (offWaveTime * 50));
          if (now - lastHapticRef.current > hapticInterval) {
            lastHapticRef.current = now;
            if (offWaveTime < 5) {
              haptics.selectionChanged();
            } else if (offWaveTime < 10) {
              haptics.tapLight();
            } else if (offWaveTime < 15) {
              haptics.tapMedium();
            } else {
              haptics.tapHeavy();
            }
          }
        }
      }, 100);
      
      return () => clearInterval(checkTimer);
    }, [phase, surferY, waveY, offWaveTime]);

    // Wave progression
    useEffect(() => {
      if (phase !== 'active') return;
      const waveTimer = setInterval(() => {
        setCurrentWaveIndex((prev) => {
          const next = (prev + 1) % CHALLENGES.length;
          setWavesRidden((w) => w + 1);
          setShowWaveLabel(true);
          haptics.selectionChanged();
          setTimeout(() => setShowWaveLabel(false), 2000);
          return next;
        });
      }, WAVE_INTERVAL * 1000);
      return () => clearInterval(waveTimer);
    }, [phase]);

    // Quote rotation
    useEffect(() => {
      if (phase !== 'active') return;
      const quoteTimer = setInterval(() => {
        setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }, 6000);
      return () => clearInterval(quoteTimer);
    }, [phase]);

    const currentChallenge = CHALLENGES[currentWaveIndex];

    if (phase === 'intro') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          {/* Sunset sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-pink-400 to-cyan-500" />
          
          {/* Sun */}
          <div className="absolute top-12 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-orange-400" 
               style={{ boxShadow: '0 0 60px rgba(251, 191, 36, 0.6)' }} />
          
          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onCancel}
              className="mb-6 text-white/90 text-sm font-medium"
            >
              ← Back
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Urge Surfing
              </h1>
              <p className="text-white/90 text-sm drop-shadow">
                Match the wave. Stay balanced.
              </p>
            </motion.div>

            <div className="w-full flex flex-col items-center gap-3 mb-8">
              {/* Mojo on surfboard - Centered */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <MojoCompanion mood="excited" size="lg" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl">
                  🏄
                </div>
              </motion.div>
              <p className="text-white/90 text-sm italic text-center max-w-[200px]">
                "Wooo! Surf's up, friend! Let's catch some waves together! 🌊"
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 mb-6 space-y-3"
            >
              <p className="text-sm text-white text-center font-medium">
                How to play:
              </p>
              <div className="space-y-2 text-sm text-white/90">
                <p>🌊 <strong>Move your finger</strong> up and down</p>
                <p>✅ <strong>Stay on the wave</strong> to ride it</p>
                <p>⬇️ <strong>Go too low</strong> = you sink</p>
                <p>⬆️ <strong>Go too high</strong> = you fall off</p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl active:scale-[0.98] transition-transform"
            >
              Start Surfing 🌊
            </motion.button>
          </div>
          
          {/* First-time tooltip */}
          <FirstTimeTooltip
            storageKey="urge-surfing-tooltip-seen"
            message="This trains your nervous system to ride urges instead of reacting to them."
            delay={1500}
          />
        </div>
      );
    }

    if (phase === 'active') {
      const timeRemaining = GAME_DURATION - timeElapsed;
      const isNight = timeElapsed > 30;

      return (
        <div 
          ref={containerRef}
          className="min-h-screen relative overflow-hidden touch-none select-none"
          onTouchMove={(e) => handleMove(e.touches[0].clientY)}
          onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientY)}
        >
          {/* Sky - transitions sunset to night */}
          <div 
            className="absolute inset-0 transition-colors duration-[5000ms]"
            style={{
              background: isNight 
                ? 'linear-gradient(to bottom, #1e1b4b, #312e81, #1e3a8a)'
                : 'linear-gradient(to bottom, #fbbf24, #f97316, #0891b2)'
            }}
          />
          
          {/* Stars (night only) */}
          {isNight && Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 30}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}

          {/* Sun/Moon */}
          <div 
            className="absolute w-16 h-16 rounded-full top-8 right-8 transition-colors duration-[5000ms]"
            style={{
              background: isNight 
                ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                : 'linear-gradient(135deg, #fef08a, #fbbf24)',
              boxShadow: isNight 
                ? '0 0 30px rgba(226, 232, 240, 0.4)'
                : '0 0 50px rgba(251, 191, 36, 0.6)'
            }}
          />

          {/* Quote */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 left-0 right-0 text-center px-8 text-lg text-white/80 italic font-light"
            >
              "{currentQuote}"
            </motion.p>
          </AnimatePresence>

          {/* Challenge label */}
          <AnimatePresence>
            {showWaveLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-44 left-0 right-0 text-center z-20"
              >
                <span 
                  className="px-5 py-2 rounded-full text-white font-bold shadow-lg"
                  style={{ backgroundColor: currentChallenge.color }}
                >
                  🌊 {currentChallenge.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning indicator */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-44 left-1/2 -translate-x-1/2 z-30"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/90 text-white font-bold shadow-lg">
                  <AlertTriangle className="w-5 h-5" />
                  {status === 'sinking' ? 'Too low! Move up!' : 'Too high! Move down!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC OCEAN - position tied to waveY */}
          <motion.div 
            className="absolute left-0 right-0 pointer-events-none"
            style={{ height: '60%' }}
            animate={{ top: `${waveY - 10}%` }}
            transition={{ type: 'tween', duration: 0.8, ease: 'easeInOut' }}
          >
            {/* Wave crest / target zone indicator - green when riding, red when off */}
            <div className="absolute top-0 left-0 right-0 h-16 z-20 transition-all duration-300">
              <div 
                className={`absolute inset-x-0 top-4 h-8 transition-all duration-300 ${
                  status === 'riding' 
                    ? 'bg-gradient-to-b from-green-400/50 via-green-400/30 to-transparent shadow-[0_0_20px_rgba(74,222,128,0.4)]' 
                    : 'bg-gradient-to-b from-red-500/50 via-red-500/30 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                }`} 
              />
              <div 
                className={`absolute inset-x-4 top-7 h-1 rounded-full transition-all duration-300 ${
                  status === 'riding' ? 'bg-green-400/80' : 'bg-red-500/80'
                }`}
              />
            </div>
            
            {/* Main wave surface - shape morphs with intensity */}
            <svg 
              className="absolute top-0 left-0 w-[200%] h-32"
              viewBox="0 0 1440 120" 
              preserveAspectRatio="none"
              style={{ animation: `wave-scroll ${12 - waveIntensity * 4}s linear infinite` }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={currentChallenge.color} stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Dynamic wave shape - amplitude increases with intensity */}
              {(() => {
                const amp = 8 + waveIntensity * 15; // Wave height grows
                const freq = 1 + waveIntensity * 0.5; // More frequent peaks
                return (
                  <>
                    {/* Foam/crest - more turbulent at high intensity */}
                    <path
                      fill="url(#foamGradient)"
                      d={`M0,${25 - amp * 0.3} Q${60 / freq},${15 - amp * 0.5} ${120 / freq},${25 - amp * 0.3} T${240 / freq},${25 - amp * 0.2} T${360 / freq},${25 - amp * 0.4} T${480 / freq},${25 - amp * 0.3} T${600 / freq},${25 - amp * 0.5} T${720 / freq},${25 - amp * 0.2} T${840 / freq},${25 - amp * 0.4} T${960 / freq},${25 - amp * 0.3} T${1080 / freq},${25 - amp * 0.5} T${1200 / freq},${25 - amp * 0.2} T${1320 / freq},${25 - amp * 0.4} T1440,${25 - amp * 0.3} L1440,40 L0,40 Z`}
                    />
                    {/* Main wave body - choppier at high intensity */}
                    <path
                      fill="url(#waveGradient)"
                      d={`M0,${30 - amp * 0.2} Q80,${20 - amp * 0.6} 160,${35 - amp * 0.1} T320,${30 - amp * 0.4} T480,${35 + amp * 0.2} T640,${25 - amp * 0.5} T800,${35 - amp * 0.1} T960,${30 - amp * 0.3} T1120,${35 + amp * 0.1} T1280,${25 - amp * 0.4} T1440,${30 - amp * 0.2} L1440,120 L0,120 Z`}
                    />
                  </>
                );
              })()}
              
              {/* Foam bubbles - more at high intensity */}
              <circle cx="80" cy={28 - waveIntensity * 5} r={4 + waveIntensity * 2} fill="white" fillOpacity="0.8" />
              <circle cx="200" cy={30 - waveIntensity * 4} r={3 + waveIntensity * 1} fill="white" fillOpacity="0.7" />
              <circle cx="350" cy={27 - waveIntensity * 6} r={5 + waveIntensity * 2} fill="white" fillOpacity="0.75" />
              <circle cx="520" cy={32 - waveIntensity * 3} r={3 + waveIntensity * 1} fill="white" fillOpacity="0.7" />
              <circle cx="680" cy={26 - waveIntensity * 5} r={4 + waveIntensity * 2} fill="white" fillOpacity="0.8" />
              <circle cx="850" cy={30 - waveIntensity * 4} r={3 + waveIntensity * 1} fill="white" fillOpacity="0.7" />
              <circle cx="1000" cy={28 - waveIntensity * 5} r={4 + waveIntensity * 2} fill="white" fillOpacity="0.75" />
              <circle cx="1150" cy={31 - waveIntensity * 3} r={3 + waveIntensity * 1} fill="white" fillOpacity="0.7" />
              <circle cx="1300" cy={27 - waveIntensity * 6} r={4 + waveIntensity * 2} fill="white" fillOpacity="0.8" />
              {waveIntensity > 0.3 && (
                <>
                  <circle cx="150" cy={25 - waveIntensity * 5} r={3} fill="white" fillOpacity="0.6" />
                  <circle cx="450" cy={28 - waveIntensity * 4} r={2} fill="white" fillOpacity="0.5" />
                  <circle cx="750" cy={24 - waveIntensity * 6} r={3} fill="white" fillOpacity="0.6" />
                  <circle cx="1050" cy={29 - waveIntensity * 3} r={2} fill="white" fillOpacity="0.5" />
                </>
              )}
            </svg>
            
            {/* Secondary wave layer for depth */}
            <svg 
              className="absolute top-8 left-0 w-[200%] h-32 opacity-80"
              viewBox="0 0 1440 120" 
              preserveAspectRatio="none"
              style={{ animation: 'wave-scroll 18s linear infinite reverse' }}
            >
              <path
                fill="#0369a1"
                d="M0,20 Q100,35 200,20 T400,25 T600,15 T800,25 T1000,20 T1200,30 T1440,20 L1440,120 L0,120 Z"
              />
            </svg>
            
            {/* Deep ocean below */}
            <div 
              className="absolute top-24 left-0 right-0 bottom-0 bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950"
            />
          </motion.div>

          {/* SURFER - Mojo on surfboard */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20 transition-transform"
            style={{ top: `${surferY}%` }}
          >
            <motion.div
              animate={{ 
                rotate: status === 'sinking' ? 15 : status === 'falling' ? -15 : [-3, 3, -3],
                scale: status === 'riding' ? 1 : 0.9,
              }}
              transition={{ duration: status === 'riding' ? 1 : 0.3, repeat: status === 'riding' ? Infinity : 0 }}
              className={`relative transition-all ${
                status === 'sinking' ? 'opacity-70' : 
                status === 'falling' ? 'opacity-70' : ''
              }`}
              style={{ 
                filter: status === 'riding' 
                  ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' 
                  : 'drop-shadow(0 4px 12px rgba(239,68,68,0.5))'
              }}
            >
              {/* Mojo companion on surfboard */}
              <MojoCompanion 
                mood={status === 'riding' ? 'cheering' : 'worried'} 
                size="md"
                message={status === 'riding' ? (combo > 10 ? "Amazing!" : combo > 5 ? "Yes!" : "") : "Whoa!"}
                showMessage={combo > 5 || status !== 'riding'}
              />
              {/* Surfboard underneath Mojo */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full shadow-lg" 
                   style={{ transform: 'translateX(-50%) perspective(100px) rotateX(20deg)' }} />
            </motion.div>
          </motion.div>

          {/* Combo indicator */}
          {combo > 5 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-56 left-1/2 -translate-x-1/2 z-30"
            >
              <span className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold">
                🔥 {combo} combo!
              </span>
            </motion.div>
          )}

          {/* UI Overlay */}
          <div className="absolute top-6 left-0 right-0 px-5 flex justify-between items-center z-40">
            <button
              onClick={onCancel}
              className="text-white text-sm bg-black/30 backdrop-blur px-4 py-2 rounded-full font-medium"
            >
              Exit
            </button>
            
            <div className="flex items-center gap-2">
              {/* Warnings indicator */}
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur px-3 py-2 rounded-full">
                {Array.from({ length: MAX_WARNINGS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < warnings ? 'bg-red-500' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-3 py-2 rounded-full">
                <Waves className="w-4 h-4 text-cyan-300" />
                <span className="text-white text-sm font-bold">{wavesRidden}</span>
              </div>
              <div className="bg-black/30 backdrop-blur px-3 py-2 rounded-full">
                <span className="text-white text-sm font-bold tabular-nums">{timeRemaining}s</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-8 left-6 right-6 z-40">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(timeElapsed / GAME_DURATION) * 100}%` }}
              />
            </div>
            <p className="text-center text-white/70 text-xs mt-2 font-medium">
              Move up/down to match the wave zone
            </p>
          </div>

          {/* CSS for wave animation */}
          <style>{`
            @keyframes wave-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      );
    }

    // Lost phase
    if (phase === 'lost') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900" />
          
          {/* Underwater bubbles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${(i * 29) % 100}%`,
                bottom: `${10 + (i * 7) % 30}%`,
              }}
              animate={{ y: [-20, -100], opacity: [0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          
          <div className="relative z-10 w-full flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: 180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="mb-6"
            >
              <MojoCompanion mood="worried" size="lg" message="We can try again!" showMessage />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Wiped Out! 🌊
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-blue-200 text-lg mb-4"
            >
              You rode {wavesRidden} waves before losing balance
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-sm mb-8"
            >
              Stay on the wave to avoid warnings
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => onComplete(wavesRidden)}
              className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-xl active:scale-[0.98] transition-transform"
            >
              Try Again 🏄
            </motion.button>
          </div>
        </div>
      );
    }

    // Complete phase (won)
    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900" />
        
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 35}%`,
              opacity: 0.5,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        
        <div className="relative z-10 w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MojoCompanion mood="celebrating" size="lg" message="Amazing surf!" showMessage />
            </motion.div>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: Math.min(5, wavesRidden) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Waves Conquered! 🌊
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-200 text-lg mb-6"
          >
            You rode {wavesRidden} waves
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 px-5 py-2 rounded-full bg-cyan-500/30 border border-cyan-400/50 inline-block"
          >
            <span className="text-cyan-300 font-bold text-lg">+1 Token earned</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onComplete(wavesRidden)}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl active:scale-[0.98] transition-transform"
          >
            Collect Token 🎉
          </motion.button>
        </div>
      </div>
    );
  }
);
