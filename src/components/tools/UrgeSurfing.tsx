import { useState, useEffect, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Check, Star } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';

interface UrgeSurfingProps {
  onComplete: (wavesRidden: number) => void;
  onCancel: () => void;
}

const CHALLENGES = [
  { name: 'Restlessness', color: 'from-blue-400 to-cyan-500' },
  { name: 'Boredom', color: 'from-cyan-400 to-teal-500' },
  { name: 'Anxiety', color: 'from-teal-400 to-emerald-500' },
  { name: 'Craving', color: 'from-emerald-400 to-green-500' },
  { name: 'Frustration', color: 'from-green-400 to-lime-500' },
  { name: 'Loneliness', color: 'from-violet-400 to-purple-500' },
  { name: 'Stress', color: 'from-purple-400 to-pink-500' },
  { name: 'Doubt', color: 'from-pink-400 to-rose-500' },
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
  "Let it flow through you",
  "You are in control",
  "Calm is your superpower",
  "Ride, don't fight",
];

const GAME_DURATION = 60; // seconds
const WAVE_INTERVAL = 8; // seconds per wave

export const UrgeSurfing = forwardRef<HTMLDivElement, UrgeSurfingProps>(
  function UrgeSurfing({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [boardY, setBoardY] = useState(50); // 0-100, vertical position
    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [wavesRidden, setWavesRidden] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
    const [waveHeight, setWaveHeight] = useState(30);
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
    const [showWaveLabel, setShowWaveLabel] = useState(false);

    // Generate stars on mount
    useEffect(() => {
      const newStars = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 40,
        size: Math.random() * 2 + 1,
      }));
      setStars(newStars);
    }, []);

    const startGame = () => {
      setPhase('active');
      setShowWaveLabel(true);
      haptics.selectionChanged();
      setTimeout(() => setShowWaveLabel(false), 2000);
    };

    // Touch/mouse controls for board
    const handleMove = useCallback((clientY: number, containerHeight: number) => {
      if (phase !== 'active') return;
      const percentage = (clientY / containerHeight) * 100;
      setBoardY(Math.max(20, Math.min(80, percentage)));
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
          
          // Increase wave intensity
          setWaveHeight((h) => Math.min(60, h + 5));
          
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
      }, 5000);

      return () => clearInterval(quoteTimer);
    }, [phase]);

    // Animate wave height oscillation
    useEffect(() => {
      if (phase !== 'active') return;

      const waveOscillation = setInterval(() => {
        setWaveHeight((h) => {
          const base = 30 + (currentWaveIndex * 3);
          const oscillation = Math.sin(Date.now() / 1000) * 10;
          return base + oscillation;
        });
      }, 100);

      return () => clearInterval(waveOscillation);
    }, [phase, currentWaveIndex]);

    const currentChallenge = CHALLENGES[currentWaveIndex];

    if (phase === 'intro') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          {/* Night sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-cyan-900" />
          
          {/* Stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
            />
          ))}
          
          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onCancel}
              className="mb-6 text-white/70 text-sm"
            >
              ← Back
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-semibold text-white mb-2">
                Urge Surfing
              </h1>
              <p className="text-cyan-200/80 text-sm">
                Ride the waves of challenge. Stay calm.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-12"
            >
              {/* Animated surfboard preview */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl"
              >
                🏄
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-8"
            >
              <p className="text-sm text-cyan-100/90 text-center mb-4">
                Move your finger up and down to ride the waves. Each wave represents a challenge you're facing.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CHALLENGES.slice(0, 4).map((challenge) => (
                  <span 
                    key={challenge.name}
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${challenge.color} text-white text-xs font-medium`}
                  >
                    {challenge.name}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/30"
            >
              Start Surfing
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-cyan-200/60 mt-8"
            >
              60 seconds of calm. You control the journey.
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'active') {
      const timeRemaining = GAME_DURATION - timeElapsed;

      return (
        <div 
          ref={ref} 
          className="min-h-screen relative overflow-hidden touch-none select-none"
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleMove(touch.clientY, window.innerHeight);
          }}
          onMouseMove={(e) => {
            if (e.buttons === 1) {
              handleMove(e.clientY, window.innerHeight);
            }
          }}
        >
          {/* Night sky gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-blue-900" />
          
          {/* Stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
            />
          ))}

          {/* Moon */}
          <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-lg shadow-yellow-200/30" />

          {/* Inspirational quote in sky */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-24 left-0 right-0 text-center px-8"
            >
              <p className="text-lg font-light text-cyan-200/90 italic">
                "{currentQuote}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Current wave/challenge label */}
          <AnimatePresence>
            {showWaveLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-44 left-0 right-0 text-center"
              >
                <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${currentChallenge.color} text-white font-medium shadow-lg`}>
                  Wave: {currentChallenge.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ocean waves - multiple layers */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* Back wave */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentChallenge.color} opacity-30`}
              animate={{ 
                height: `${waveHeight + 15}%`,
              }}
              transition={{ duration: 0.5 }}
              style={{
                borderTopLeftRadius: '50% 20px',
                borderTopRightRadius: '50% 30px',
              }}
            />
            
            {/* Middle wave */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentChallenge.color} opacity-50`}
              animate={{ 
                height: `${waveHeight + 5}%`,
              }}
              transition={{ duration: 0.3 }}
              style={{
                borderTopLeftRadius: '60% 25px',
                borderTopRightRadius: '40% 35px',
              }}
            />
            
            {/* Front wave */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentChallenge.color}`}
              animate={{ 
                height: `${waveHeight}%`,
              }}
              transition={{ duration: 0.2 }}
              style={{
                borderTopLeftRadius: '70% 30px',
                borderTopRightRadius: '30% 40px',
              }}
            />

            {/* Wave foam */}
            <motion.div
              className="absolute left-0 right-0 h-4 bg-gradient-to-b from-white/40 to-transparent"
              animate={{ 
                bottom: `${waveHeight}%`,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Surfboard and surfer */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            animate={{ 
              top: `${boardY}%`,
              rotate: (boardY - 50) * 0.3,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🏄
            </motion.div>
          </motion.div>

          {/* Water splash particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-300/60"
              style={{ left: `${20 + i * 15}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                bottom: [`${waveHeight}%`, `${waveHeight + 10}%`, `${waveHeight}%`],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}

          {/* UI Overlay */}
          <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-30">
            <button
              onClick={onCancel}
              className="text-white/70 text-sm bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              Exit
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Waves className="w-4 h-4 text-cyan-300" />
                <span className="text-white text-sm font-medium">{wavesRidden}</span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white text-sm font-medium tabular-nums">{timeRemaining}s</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-8 left-6 right-6 z-30">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(timeElapsed / GAME_DURATION) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-white/60 text-xs mt-2">
              Move finger up/down to ride
            </p>
          </div>
        </div>
      );
    }

    // Complete phase
    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        {/* Night sky background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-blue-900" />
        
        {/* Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
          />
        ))}
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-4"
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
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-white mb-2"
          >
            Waves conquered
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-200/80 text-sm mb-2"
          >
            You stayed calm through {wavesRidden} waves
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/60 text-sm italic mb-6"
          >
            "{QUOTES[Math.floor(Math.random() * QUOTES.length)]}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 inline-block"
          >
            <span className="text-cyan-300 font-medium">+1 Token earned</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onComplete(wavesRidden)}
            className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/30"
          >
            Collect Token
          </motion.button>
        </div>
      </div>
    );
  }
);
