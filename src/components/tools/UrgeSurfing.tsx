import { useState, useEffect, forwardRef, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Star, AlertTriangle } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';

interface UrgeSurfingProps {
  onComplete: (wavesRidden: number) => void;
  onCancel: () => void;
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

const GAME_DURATION = 60;
const WAVE_INTERVAL = 10;
const WAVE_ZONE_SIZE = 18; // Generous zone for relaxed gameplay

export const UrgeSurfing = forwardRef<HTMLDivElement, UrgeSurfingProps>(
  function UrgeSurfing({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [surferY, setSurferY] = useState(50); // 0-100, user controlled position
    const [waveY, setWaveY] = useState(50); // 0-100, where the wave currently is
    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [wavesRidden, setWavesRidden] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
    const [showWaveLabel, setShowWaveLabel] = useState(false);
    const [status, setStatus] = useState<'riding' | 'sinking' | 'falling'>('riding');
    const [combo, setCombo] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [offWaveTime, setOffWaveTime] = useState(0); // Track how long off wave
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHapticRef = useRef(0);

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

    // Wave movement - slow, gentle, relaxing waves
    useEffect(() => {
      if (phase !== 'active') return;
      
      const waveTimer = setInterval(() => {
        const time = Date.now() / 1000;
        const progress = timeElapsed / GAME_DURATION; // 0 to 1
        
        // Very slow, gentle wave motion - like breathing
        const baseSpeed = 0.15; // Super slow base speed
        const speedIncrease = progress * 0.1; // Slight speed increase over time
        const speed = baseSpeed + speedIncrease;
        
        // Gentle amplitude that slowly increases
        const baseAmplitude = 10 + progress * 8; // Start small, grow gently
        
        // Single smooth sine wave - calming motion
        const primaryWave = Math.sin(time * speed) * baseAmplitude;
        // Very subtle secondary wave for slight variation
        const subtleVariation = Math.sin(time * speed * 0.5) * 3;
        
        const newWaveY = 50 + primaryWave + subtleVariation;
        setWaveY(Math.max(30, Math.min(70, newWaveY)));
      }, 100); // Slower update rate for smoother feel
      
      return () => clearInterval(waveTimer);
    }, [phase, timeElapsed]);

    // Check if surfer is matching the wave + escalating haptic feedback
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
          // Off the wave - track time and escalate haptics
          setOffWaveTime((prev) => prev + 1);
          setCombo(0);
          
          const isBelow = surferY > waveY + WAVE_ZONE_SIZE;
          setStatus(isBelow ? 'sinking' : 'falling');
          setShowWarning(true);
          
          // Escalating haptic feedback based on how long off wave
          const hapticInterval = Math.max(300, 1000 - (offWaveTime * 50)); // Slower, gentler feedback
          if (now - lastHapticRef.current > hapticInterval) {
            lastHapticRef.current = now;
            
            // Intensity increases the longer you're off
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

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl"
              >
                🏄
              </motion.div>
            </motion.div>

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

          {/* WAVE TARGET ZONE - gentle band following wave line */}
          <motion.div
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ 
              height: `${WAVE_ZONE_SIZE}%`
            }}
            animate={{ top: `${waveY - (WAVE_ZONE_SIZE / 2)}%` }}
            transition={{ type: 'tween', duration: 0.8, ease: 'easeInOut' }}
          >
            {/* Wave zone indicator - relaxed band */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/15 via-cyan-400/30 to-cyan-400/15 border-y border-cyan-300/40" />
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-cyan-300/60" />
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0" style={{ height: '45%' }}>
            {/* Deep ocean base */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-700 to-blue-500" />
            
            {/* Animated wave layers */}
            <svg 
              className="absolute top-0 left-0 w-[200%] h-full"
              viewBox="0 0 1440 200" 
              preserveAspectRatio="none"
              style={{ animation: 'wave-scroll 8s linear infinite' }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={currentChallenge.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Main curvy wave */}
              <path
                fill="url(#waveGradient)"
                d="M0,40 C120,80 240,0 360,40 C480,80 600,0 720,40 C840,80 960,0 1080,40 C1200,80 1320,20 1440,40 L1440,200 L0,200 Z"
              />
              {/* Foam line */}
              <path
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeOpacity="0.6"
                d="M0,42 C120,82 240,2 360,42 C480,82 600,2 720,42 C840,82 960,2 1080,42 C1200,82 1320,22 1440,42"
              />
              {/* Foam bubbles */}
              <circle cx="100" cy="35" r="6" fill="white" fillOpacity="0.7" />
              <circle cx="130" cy="50" r="4" fill="white" fillOpacity="0.6" />
              <circle cx="300" cy="30" r="5" fill="white" fillOpacity="0.7" />
              <circle cx="500" cy="45" r="6" fill="white" fillOpacity="0.6" />
              <circle cx="700" cy="35" r="4" fill="white" fillOpacity="0.7" />
              <circle cx="900" cy="50" r="5" fill="white" fillOpacity="0.6" />
              <circle cx="1100" cy="38" r="6" fill="white" fillOpacity="0.7" />
              <circle cx="1300" cy="45" r="4" fill="white" fillOpacity="0.6" />
            </svg>

            {/* Second wave layer */}
            <svg 
              className="absolute top-4 left-0 w-[200%] h-full opacity-70"
              viewBox="0 0 1440 200" 
              preserveAspectRatio="none"
              style={{ animation: 'wave-scroll 12s linear infinite reverse' }}
            >
              <path
                fill="#0ea5e9"
                d="M0,60 C180,20 300,100 480,60 C660,20 780,100 960,60 C1140,20 1260,80 1440,60 L1440,200 L0,200 Z"
              />
            </svg>
          </div>

          {/* SURFER */}
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
              className={`text-6xl transition-all ${
                status === 'sinking' ? 'opacity-70' : 
                status === 'falling' ? 'opacity-70' : ''
              }`}
              style={{ 
                filter: status === 'riding' 
                  ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' 
                  : 'drop-shadow(0 4px 12px rgba(239,68,68,0.5))'
              }}
            >
              🏄
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
            
            <div className="flex items-center gap-3">
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

    // Complete phase
    const isNight = true;
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
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              🏄
            </motion.div>
            <div className="flex justify-center gap-1">
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
