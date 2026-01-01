import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Sparkles } from 'lucide-react';

interface CalmDownProps {
  onComplete: (relaxationLevel: number) => void;
  onCancel: () => void;
}

const CALMING_TIPS = [
  "This feeling is temporary. It will pass.",
  "You are not your thoughts.",
  "Peace is always one breath away.",
  "The storm will end. You will remain.",
  "Strength isn't forcing calm — it's allowing it.",
  "You've survived 100% of your hardest days.",
  "Stillness is not weakness. It's wisdom.",
  "The urge is loud, but you are louder.",
  "Nothing external can fill an internal void.",
  "Your worth isn't measured by your productivity.",
  "Rest is not a reward. It's a requirement.",
  "You don't have to have it all figured out today.",
  "Progress isn't always visible. Trust the process.",
  "What you resist, persists. Let it flow through.",
  "You are exactly where you need to be right now.",
];

interface FallingLeaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  tip: string;
  size: number;
}

export function CalmDown({ onComplete, onCancel }: CalmDownProps) {
  const [leaves, setLeaves] = useState<FallingLeaf[]>([]);
  const [clickedLeaves, setClickedLeaves] = useState<Set<number>>(new Set());
  const [revealedTip, setRevealedTip] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [relaxationLevel, setRelaxationLevel] = useState(5);
  const [collectedCount, setCollectedCount] = useState(0);

  const LEAVES_TO_COLLECT = 8;

  // Spawn leaves continuously
  useEffect(() => {
    if (isComplete) return;

    const usedTips = new Set<number>();
    
    const spawnLeaf = () => {
      let tipIndex: number;
      do {
        tipIndex = Math.floor(Math.random() * CALMING_TIPS.length);
      } while (usedTips.has(tipIndex) && usedTips.size < CALMING_TIPS.length);
      
      usedTips.add(tipIndex);
      if (usedTips.size >= CALMING_TIPS.length) usedTips.clear();

      const newLeaf: FallingLeaf = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80,
        delay: 0,
        duration: 6 + Math.random() * 4,
        rotation: Math.random() * 360,
        tip: CALMING_TIPS[tipIndex],
        size: 40 + Math.random() * 20,
      };

      setLeaves(prev => [...prev.slice(-8), newLeaf]);
    };

    // Initial leaves
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnLeaf(), i * 800);
    }

    const interval = setInterval(spawnLeaf, 2000);
    return () => clearInterval(interval);
  }, [isComplete]);

  const handleLeafClick = useCallback((leaf: FallingLeaf) => {
    if (clickedLeaves.has(leaf.id)) return;

    setClickedLeaves(prev => new Set(prev).add(leaf.id));
    setRevealedTip(leaf.tip);
    setCollectedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= LEAVES_TO_COLLECT) {
        setTimeout(() => setIsComplete(true), 2000);
      }
      return newCount;
    });

    // Hide tip after 2.5 seconds
    setTimeout(() => setRevealedTip(null), 2500);
  }, [clickedLeaves]);

  const handleComplete = useCallback(() => {
    onComplete(relaxationLevel);
  }, [onComplete, relaxationLevel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-950/90 via-background to-background"
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onCancel}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-border/20 z-20"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Header */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-0 right-0 text-center z-10 px-8"
        >
          <h2 className="text-xl font-medium text-foreground mb-2">
            Catch the falling leaves
          </h2>
          <p className="text-muted-foreground text-sm">
            Tap each leaf for calming wisdom
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: LEAVES_TO_COLLECT }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < collectedCount ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                }`}
                animate={i < collectedCount ? { scale: [1, 1.3, 1] } : {}}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Falling leaves */}
      <AnimatePresence>
        {!isComplete && leaves.map((leaf) => {
          const isClicked = clickedLeaves.has(leaf.id);
          
          return (
            <motion.button
              key={leaf.id}
              initial={{ y: -100, x: `${leaf.x}vw`, rotate: 0, opacity: 0 }}
              animate={{
                y: isClicked ? undefined : '110vh',
                rotate: isClicked ? 0 : leaf.rotation + 720,
                opacity: isClicked ? 0 : 1,
                scale: isClicked ? 1.5 : 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                y: { duration: leaf.duration, ease: 'linear' },
                rotate: { duration: leaf.duration, ease: 'linear' },
                opacity: { duration: isClicked ? 0.3 : 0.5 },
                scale: { duration: 0.2 },
              }}
              onClick={() => handleLeafClick(leaf)}
              disabled={isClicked}
              className="absolute top-0 z-10 cursor-pointer"
              style={{ left: 0 }}
            >
              <motion.div
                animate={{
                  x: [0, 20, -20, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Leaf 
                  className="text-emerald-400 drop-shadow-lg" 
                  style={{ width: leaf.size, height: leaf.size }}
                />
              </motion.div>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Revealed tip popup */}
      <AnimatePresence>
        {revealedTip && !isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl px-8 py-6 max-w-xs text-center shadow-2xl">
              <Leaf className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-emerald-50">
                {revealedTip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion screen */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              className="relative mb-6"
            >
              <Sparkles className="w-16 h-16 text-emerald-400" />
              <motion.div
                className="absolute inset-0 blur-xl bg-emerald-400/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h2 className="text-3xl font-bold text-foreground mb-2">
              Beautiful work
            </h2>
            <p className="text-muted-foreground mb-8">
              You collected {LEAVES_TO_COLLECT} moments of calm
            </p>

            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-4">
                How calm do you feel now?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setRelaxationLevel(level)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      level <= relaxationLevel
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted-foreground/10 text-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={handleComplete}
              className="px-8 py-4 rounded-full bg-emerald-500 text-white font-semibold text-lg flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Leaf className="w-5 h-5" />
              Claim Calm
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
