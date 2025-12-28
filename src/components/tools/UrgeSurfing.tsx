import { useState, useEffect, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Star } from 'lucide-react';
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
  "Let it flow through you",
  "You are in control",
  "Calm is your superpower",
  "Ride, don't fight",
];

const GAME_DURATION = 60;
const WAVE_INTERVAL = 8;

// SVG Wave Component
const CartoonWave = ({ 
  color, 
  offset, 
  height, 
  speed 
}: { 
  color: string; 
  offset: number; 
  height: number; 
  speed: number;
}) => {
  return (
    <motion.div
      className="absolute bottom-0 left-0 w-[200%]"
      animate={{ x: [0, -window.innerWidth] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      style={{ height: `${height}%` }}
    >
      <svg
        viewBox="0 0 1440 320"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`waveGrad-${offset}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#waveGrad-${offset})`}
          d={`M0,${160 + offset} 
              C120,${100 + offset} 240,${200 + offset} 360,${160 + offset}
              C480,${120 + offset} 600,${180 + offset} 720,${140 + offset}
              C840,${100 + offset} 960,${200 + offset} 1080,${160 + offset}
              C1200,${120 + offset} 1320,${180 + offset} 1440,${140 + offset}
              L1440,320 L0,320 Z`}
        />
      </svg>
    </motion.div>
  );
};

// Foam bubbles component
const FoamBubbles = ({ waveHeight }: { waveHeight: number }) => {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 8 + Math.random() * 20,
    delay: Math.random() * 2,
  }));

  return (
    <>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-white/80 shadow-inner"
          style={{
            left: `${bubble.x}%`,
            bottom: `${waveHeight - 5 + Math.random() * 10}%`,
            width: bubble.size,
            height: bubble.size,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: bubble.delay,
          }}
        />
      ))}
    </>
  );
};

// Water droplets component
const WaterDroplets = ({ waveHeight }: { waveHeight: number }) => {
  const droplets = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 3,
  }));

  return (
    <>
      {droplets.map((droplet) => (
        <motion.div
          key={droplet.id}
          className="absolute"
          style={{ left: `${droplet.x}%` }}
          initial={{ bottom: `${waveHeight + 5}%`, opacity: 0 }}
          animate={{
            bottom: [`${waveHeight + 5}%`, `${waveHeight + 25}%`, `${waveHeight}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: droplet.delay,
          }}
        >
          {/* Teardrop shape */}
          <svg width="12" height="18" viewBox="0 0 12 18">
            <path
              d="M6 0 C6 0, 0 8, 0 12 C0 15.3137 2.68629 18 6 18 C9.31371 18 12 15.3137 12 12 C12 8, 6 0, 6 0 Z"
              fill="#7dd3fc"
              opacity="0.8"
            />
            <ellipse cx="4" cy="11" rx="1.5" ry="2" fill="white" opacity="0.6" />
          </svg>
        </motion.div>
      ))}
    </>
  );
};

// Wave curl/swirl component
const WaveCurl = ({ x, bottom, size, delay }: { x: number; bottom: number; size: number; delay: number }) => (
  <motion.svg
    className="absolute"
    style={{ left: `${x}%`, bottom: `${bottom}%` }}
    width={size}
    height={size * 0.6}
    viewBox="0 0 80 50"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8], rotate: [0, 5, 0] }}
    transition={{ duration: 4, repeat: Infinity, delay }}
  >
    <path
      d="M5,40 Q20,45 30,35 Q45,20 60,30 Q75,40 75,25 Q75,10 55,15 Q40,20 35,30"
      fill="none"
      stroke="#0ea5e9"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="70" cy="22" r="4" fill="#bae6fd" />
    <circle cx="60" cy="18" r="3" fill="#e0f2fe" />
  </motion.svg>
);

export const UrgeSurfing = forwardRef<HTMLDivElement, UrgeSurfingProps>(
  function UrgeSurfing({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [boardY, setBoardY] = useState(50);
    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [wavesRidden, setWavesRidden] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
    const [waveHeight, setWaveHeight] = useState(35);
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
    const [showWaveLabel, setShowWaveLabel] = useState(false);

    useEffect(() => {
      const newStars = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 35,
        size: Math.random() * 3 + 1,
      }));
      setStars(newStars);
    }, []);

    const startGame = () => {
      setPhase('active');
      setShowWaveLabel(true);
      haptics.selectionChanged();
      setTimeout(() => setShowWaveLabel(false), 2000);
    };

    const handleMove = useCallback((clientY: number, containerHeight: number) => {
      if (phase !== 'active') return;
      const percentage = (clientY / containerHeight) * 100;
      setBoardY(Math.max(20, Math.min(75, percentage)));
    }, [phase]);

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

    useEffect(() => {
      if (phase !== 'active') return;
      const waveTimer = setInterval(() => {
        setCurrentWaveIndex((prev) => {
          const next = (prev + 1) % CHALLENGES.length;
          setWavesRidden((w) => w + 1);
          setShowWaveLabel(true);
          haptics.selectionChanged();
          setTimeout(() => setShowWaveLabel(false), 2000);
          setWaveHeight((h) => Math.min(55, h + 3));
          return next;
        });
      }, WAVE_INTERVAL * 1000);
      return () => clearInterval(waveTimer);
    }, [phase]);

    useEffect(() => {
      if (phase !== 'active') return;
      const quoteTimer = setInterval(() => {
        setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }, 5000);
      return () => clearInterval(quoteTimer);
    }, [phase]);

    const currentChallenge = CHALLENGES[currentWaveIndex];

    if (phase === 'intro') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-pink-300 to-cyan-400" />
          
          {/* Sun */}
          <div className="absolute top-16 right-12 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-2xl shadow-orange-300/50" />
          
          {/* Clouds */}
          <motion.div 
            className="absolute top-20 left-10"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <svg width="80" height="40" viewBox="0 0 80 40">
              <ellipse cx="25" cy="25" rx="20" ry="12" fill="white" opacity="0.9" />
              <ellipse cx="45" cy="20" rx="25" ry="15" fill="white" opacity="0.9" />
              <ellipse cx="60" cy="25" rx="18" ry="10" fill="white" opacity="0.9" />
            </svg>
          </motion.div>
          
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
                Ride the waves of challenge. Stay calm.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl drop-shadow-xl"
              >
                🏄
              </motion.div>
            </motion.div>

            {/* Mini wave preview */}
            <div className="relative h-24 mb-6 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-blue-600" />
              <CartoonWave color="#22d3ee" offset={20} height={60} speed={4} />
              <CartoonWave color="#06b6d4" offset={40} height={50} speed={5} />
              <CartoonWave color="#0891b2" offset={60} height={40} speed={6} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 mb-6"
            >
              <p className="text-sm text-white text-center mb-4 font-medium">
                Move your finger up and down to ride the waves. Each wave represents a challenge.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CHALLENGES.slice(0, 4).map((challenge) => (
                  <span 
                    key={challenge.name}
                    className="px-3 py-1 rounded-full text-white text-xs font-medium shadow-md"
                    style={{ backgroundColor: challenge.color }}
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl shadow-cyan-500/40 active:scale-[0.98] transition-transform"
            >
              Start Surfing 🌊
            </motion.button>
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
          {/* Sky gradient - transitions from sunset to night based on progress */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: timeElapsed < 30 
                ? 'linear-gradient(to bottom, #fcd34d, #fb923c, #38bdf8)'
                : 'linear-gradient(to bottom, #1e1b4b, #312e81, #1e3a5a)'
            }}
            transition={{ duration: 2 }}
          />
          
          {/* Stars (appear as it gets darker) */}
          {timeElapsed > 20 && stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
            />
          ))}

          {/* Sun/Moon */}
          <motion.div 
            className="absolute w-20 h-20 rounded-full"
            animate={{
              top: timeElapsed < 30 ? '8%' : '6%',
              right: '10%',
              background: timeElapsed < 30 
                ? 'linear-gradient(135deg, #fde047, #fb923c)'
                : 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
            }}
            transition={{ duration: 2 }}
            style={{ boxShadow: timeElapsed < 30 ? '0 0 60px #fde047' : '0 0 40px #e2e8f0' }}
          />

          {/* Clouds */}
          <motion.div
            className="absolute top-16 left-[5%]"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          >
            <svg width="100" height="50" viewBox="0 0 100 50">
              <ellipse cx="30" cy="30" rx="25" ry="15" fill="white" opacity="0.7" />
              <ellipse cx="55" cy="25" rx="30" ry="18" fill="white" opacity="0.8" />
              <ellipse cx="75" cy="30" rx="22" ry="12" fill="white" opacity="0.7" />
            </svg>
          </motion.div>

          {/* Inspirational quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-28 left-0 right-0 text-center px-8 z-10"
            >
              <p className="text-xl font-medium text-white drop-shadow-lg italic">
                "{currentQuote}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Challenge label */}
          <AnimatePresence>
            {showWaveLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-48 left-0 right-0 text-center z-20"
              >
                <span 
                  className="px-5 py-2.5 rounded-full text-white font-bold shadow-xl text-lg"
                  style={{ backgroundColor: currentChallenge.color }}
                >
                  🌊 {currentChallenge.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OCEAN WAVES - Multiple layers for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-[70%]">
            {/* Deep water base */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 via-blue-700 to-transparent"
              style={{ height: `${waveHeight + 20}%` }}
            />

            {/* Wave curls/swirls */}
            <WaveCurl x={15} bottom={waveHeight - 5} size={60} delay={0} />
            <WaveCurl x={55} bottom={waveHeight - 8} size={50} delay={1.5} />
            <WaveCurl x={80} bottom={waveHeight - 3} size={55} delay={3} />

            {/* Back wave layer */}
            <motion.div
              className="absolute bottom-0 left-0 w-[200%]"
              animate={{ x: [0, -window.innerWidth * 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ height: `${waveHeight + 15}%` }}
            >
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0e7490" />
                    <stop offset="100%" stopColor="#164e63" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#wave1)"
                  d="M0,128 C180,200 360,80 540,128 C720,176 900,64 1080,128 C1260,192 1350,96 1440,128 L1440,320 L0,320 Z"
                />
              </svg>
            </motion.div>

            {/* Middle wave layer */}
            <motion.div
              className="absolute bottom-0 left-0 w-[200%]"
              animate={{ x: [0, -window.innerWidth * 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ height: `${waveHeight + 5}%` }}
            >
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={currentChallenge.color} />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#wave2)"
                  d="M0,160 C240,96 360,224 540,160 C720,96 840,224 1020,160 C1200,96 1320,192 1440,160 L1440,320 L0,320 Z"
                />
                {/* Wave line detail */}
                <path
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                  d="M0,165 C240,101 360,229 540,165 C720,101 840,229 1020,165 C1200,101 1320,197 1440,165"
                />
              </svg>
            </motion.div>

            {/* Front wave layer with foam */}
            <motion.div
              className="absolute bottom-0 left-0 w-[200%]"
              animate={{ x: [0, -window.innerWidth * 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ height: `${waveHeight}%` }}
            >
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                {/* Main wave */}
                <path
                  fill="url(#wave3)"
                  d="M0,96 C120,160 240,32 360,96 C480,160 600,32 720,96 C840,160 960,32 1080,96 C1200,160 1320,64 1440,96 L1440,320 L0,320 Z"
                />
                {/* Foam on top */}
                <path
                  fill="white"
                  opacity="0.6"
                  d="M0,100 C60,95 90,105 120,98 C150,91 180,108 240,95 C300,82 330,110 390,100 C450,90 480,105 540,98 C600,91 660,108 720,100 C780,92 810,106 870,98 C930,90 990,108 1050,100 C1110,92 1170,106 1230,100 C1290,94 1350,105 1440,100 L1440,105 C1380,112 1320,98 1260,108 C1200,118 1140,95 1080,105 C1020,115 960,92 900,102 C840,112 780,95 720,105 C660,115 600,92 540,102 C480,112 420,95 360,105 C300,115 240,98 180,105 C120,112 60,98 0,105 Z"
                />
                {/* Foam bubbles */}
                <circle cx="100" cy="100" r="8" fill="white" opacity="0.7" />
                <circle cx="130" cy="95" r="5" fill="white" opacity="0.8" />
                <circle cx="250" cy="92" r="7" fill="white" opacity="0.7" />
                <circle cx="280" cy="98" r="4" fill="white" opacity="0.9" />
                <circle cx="400" cy="102" r="6" fill="white" opacity="0.7" />
                <circle cx="420" cy="96" r="4" fill="white" opacity="0.8" />
                <circle cx="550" cy="95" r="7" fill="white" opacity="0.7" />
                <circle cx="700" cy="100" r="5" fill="white" opacity="0.8" />
                <circle cx="730" cy="94" r="6" fill="white" opacity="0.7" />
                <circle cx="850" cy="98" r="5" fill="white" opacity="0.8" />
                <circle cx="1000" cy="102" r="7" fill="white" opacity="0.7" />
                <circle cx="1150" cy="96" r="5" fill="white" opacity="0.8" />
                <circle cx="1300" cy="100" r="6" fill="white" opacity="0.7" />
              </svg>
            </motion.div>

            {/* Foam bubbles floating */}
            <FoamBubbles waveHeight={waveHeight} />
            
            {/* Water droplets splashing */}
            <WaterDroplets waveHeight={waveHeight} />
          </div>

          {/* Surfer */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-30"
            animate={{ 
              top: `${boardY}%`,
              rotate: (boardY - 50) * 0.4,
            }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              🏄
            </motion.div>
          </motion.div>

          {/* UI Overlay */}
          <div className="absolute top-6 left-0 right-0 px-5 flex justify-between items-center z-40">
            <button
              onClick={onCancel}
              className="text-white text-sm bg-black/30 backdrop-blur-md px-4 py-2 rounded-full font-medium shadow-lg"
            >
              Exit
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                <Waves className="w-4 h-4 text-cyan-300" />
                <span className="text-white text-sm font-bold">{wavesRidden}</span>
              </div>
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                <span className="text-white text-sm font-bold tabular-nums">{timeRemaining}s</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-8 left-6 right-6 z-40">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-md shadow-lg">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(timeElapsed / GAME_DURATION) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-white/80 text-xs mt-2 font-medium">
              Drag up/down to surf 🏄
            </p>
          </div>
        </div>
      );
    }

    // Complete phase
    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900" />
        
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
            className="mb-6"
          >
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              🏄
            </motion.div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: Math.min(5, wavesRidden) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 * i, type: 'spring' }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
          >
            Waves Conquered! 🌊
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-200 text-lg mb-2"
          >
            You rode {wavesRidden} waves with calm
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/70 text-sm italic mb-6 max-w-xs mx-auto"
          >
            "{QUOTES[Math.floor(Math.random() * QUOTES.length)]}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 px-5 py-2.5 rounded-full bg-cyan-500/30 border border-cyan-400/50 inline-block"
          >
            <span className="text-cyan-300 font-bold text-lg">+1 Token earned</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onComplete(wavesRidden)}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl shadow-cyan-500/40 active:scale-[0.98] transition-transform"
          >
            Collect Token 🎉
          </motion.button>
        </div>
      </div>
    );
  }
);
