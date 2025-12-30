import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker, UrgeSurfing, BodyScan, CalmDown, GravityDrop, NoiseDissolver } from './tools';
import { GameStartScreen } from './GameStartScreen';
import { DailyPullGate } from './DailyPullGate';

interface GamesScreenProps {
  onGameComplete: (gameId: string, details: string) => void;
  onGameFail: (gameId: string, reason: string) => void;
  hasLoggedToday: boolean;
  onLogPull: () => void;
}

type GameId = 'standoff' | 'nameIt' | 'bluff' | 'sync' | 'reaction' | 'surfing' | 'bodyscan' | 'calmdown' | 'gravitydrop' | 'noisedissolver';
type ActiveGame = { id: GameId; started: boolean } | null;

const GAMES: {
  id: GameId;
  name: string;
  tagline: string;
  instruction: string;
  whyItWorks: string;
  icon: string;
  gradient: string;
  reward: string;
  duration: string;
}[] = [
  {
    id: 'standoff',
    name: 'The Standoff',
    tagline: 'Hold the urge. Don\'t act.',
    instruction: 'A timer will count up. Your only job is to not give in. See how long you can hold.',
    whyItWorks: 'Delay trains your prefrontal cortex to override impulse signals.',
    icon: '⏸️',
    gradient: 'from-violet-600/40 via-purple-700/30 to-background',
    reward: '+1 token, +20 pts',
    duration: '10-60s',
  },
  {
    id: 'bluff',
    name: 'The Bluff',
    tagline: 'Catch your brain lying.',
    instruction: 'Rate how good you think something will feel, then rate how it actually felt.',
    whyItWorks: 'Dopamine exaggerates predictions. Seeing the gap weakens cravings.',
    icon: '🎯',
    gradient: 'from-amber-600/40 via-orange-700/30 to-background',
    reward: '+1 token, +15 pts',
    duration: '30s',
  },
  {
    id: 'reaction',
    name: 'Catch the Flicker',
    tagline: 'Test your awareness.',
    instruction: 'When you see the flash, tap as fast as you can. Train noticing urges early.',
    whyItWorks: 'Faster awareness = more time to choose a different action.',
    icon: '⚡',
    gradient: 'from-cyan-600/40 via-blue-700/30 to-background',
    reward: '+1 token, +10 pts',
    duration: '20s',
  },
  {
    id: 'sync',
    name: 'Sync',
    tagline: '90 seconds to calm.',
    instruction: 'Match your breath to the rhythm. Your nervous system will follow.',
    whyItWorks: 'Slow breathing activates your parasympathetic system, reducing urge intensity.',
    icon: '🫁',
    gradient: 'from-teal-600/40 via-emerald-700/30 to-background',
    reward: '+1 token, +25 pts',
    duration: '90s',
  },
  {
    id: 'nameIt',
    name: 'Name It',
    tagline: 'Label the feeling.',
    instruction: 'Identify what emotion is underneath the urge. Naming reduces its power.',
    whyItWorks: 'Affect labeling reduces amygdala activation by up to 50%.',
    icon: '📍',
    gradient: 'from-rose-600/40 via-pink-700/30 to-background',
    reward: '+1 token, +15 pts',
    duration: '15s',
  },
  {
    id: 'surfing',
    name: 'Urge Surfing',
    tagline: 'Ride the wave out.',
    instruction: 'Match the rising and falling waves with your finger. Watch Mojo surf as you ride each urge wave.',
    whyItWorks: 'Physics-based wave matching teaches you that urges rise and fall naturally without action.',
    icon: '🌊',
    gradient: 'from-cyan-600/40 via-blue-600/30 to-background',
    reward: '+1 token, +20 pts',
    duration: '60s',
  },
  {
    id: 'bodyscan',
    name: 'Knowledge Quiz',
    tagline: 'Test what you\'ve learned.',
    instruction: 'Answer questions based on the Learn feed to reinforce your knowledge.',
    whyItWorks: 'Active recall strengthens memory and reinforces what you\'ve learned about dopamine and habits.',
    icon: '🧠',
    gradient: 'from-violet-600/40 via-purple-700/30 to-background',
    reward: '+1 token, +15 pts',
    duration: '2-3min',
  },
  {
    id: 'calmdown',
    name: 'Calm Down',
    tagline: 'Catch peace. Find calm.',
    instruction: 'Catch falling leaves to reveal calming quotes and advice. Let nature soothe your mind.',
    whyItWorks: 'The gentle catching motion combined with calming wisdom reduces stress and redirects focus.',
    icon: '🍃',
    gradient: 'from-emerald-600/40 via-teal-700/30 to-background',
    reward: '+1 token, +30 pts',
    duration: '30s',
  },
  {
    id: 'gravitydrop',
    name: 'Gravity Drop',
    tagline: 'Guide Mojo home.',
    instruction: 'Drag Mojo into the target rings across 5 rounds. Targets shrink, move, and even run away!',
    whyItWorks: 'Progressive difficulty trains focus and patience. Evading targets in later rounds build persistence.',
    icon: '🎯',
    gradient: 'from-slate-600/40 via-zinc-700/30 to-background',
    reward: '+1 token, +25 pts',
    duration: '30-60s',
  },
  {
    id: 'noisedissolver',
    name: 'Noise Dissolver',
    tagline: 'Erase the mental clutter.',
    instruction: 'Paint away the static noise to reveal hidden positive affirmations and calming gradients.',
    whyItWorks: 'Visually clearing mental noise reveals clarity. Affirmations are weighted by what resonates with you.',
    icon: '✨',
    gradient: 'from-violet-600/40 via-indigo-700/30 to-background',
    reward: '+1 token, +35 pts',
    duration: '45-90s',
  },
];

export const GamesScreen = forwardRef<HTMLDivElement, GamesScreenProps>(
  function GamesScreen({ onGameComplete, onGameFail, hasLoggedToday, onLogPull }, ref) {
    const [activeGame, setActiveGame] = useState<ActiveGame>(null);

    // Gate: Must log daily pull before accessing games
    if (!hasLoggedToday) {
      return <DailyPullGate onLogPull={onLogPull} />;
    }

    const handleGameComplete = (gameId: GameId, details: string) => {
      onGameComplete(gameId, details);
      setActiveGame(null);
    };

    const handleGameFail = (gameId: GameId, reason: string) => {
      onGameFail(gameId, reason);
      setActiveGame(null);
    };

    const handleStartGame = (gameId: GameId) => {
      setActiveGame({ id: gameId, started: false });
    };

    const handleConfirmStart = () => {
      if (activeGame) {
        setActiveGame({ ...activeGame, started: true });
      }
    };

    // Show start screen first
    if (activeGame && !activeGame.started) {
      const game = GAMES.find(g => g.id === activeGame.id);
      if (!game) {
        setActiveGame(null);
        return null;
      }
      return (
        <GameStartScreen
          name={game.name}
          instruction={game.instruction}
          whyItWorks={game.whyItWorks}
          icon={game.icon}
          onStart={handleConfirmStart}
          onCancel={() => setActiveGame(null)}
        />
      );
    }

    // Render active game
    if (activeGame?.started) {
      switch (activeGame.id) {
        case 'standoff':
          return (
            <PauseLadder 
              onComplete={(seconds) => handleGameComplete('standoff', `${seconds}s hold`)}
              onCancel={() => handleGameFail('standoff', 'Early exit')}
            />
          );
        case 'nameIt':
          return (
            <NameThePull 
              onComplete={(feeling) => handleGameComplete('nameIt', `Named: ${feeling}`)}
              onCancel={() => handleGameFail('nameIt', 'Early exit')}
            />
          );
        case 'bluff':
          return (
            <PredictionReality 
              onComplete={(pred, real) => handleGameComplete('bluff', `${pred} → ${real}`)}
              onCancel={() => handleGameFail('bluff', 'Early exit')}
            />
          );
        case 'sync':
          return (
            <BreathingSync 
              onComplete={() => handleGameComplete('sync', 'Completed')}
              onCancel={() => handleGameFail('sync', 'Early exit')}
            />
          );
        case 'reaction':
          return (
            <ReactionTracker 
              onComplete={(ms) => handleGameComplete('reaction', `${ms}ms`)}
              onCancel={() => handleGameFail('reaction', 'Early exit')}
              leaderboard={{ personalBest: 999, averageTime: 0, totalAttempts: 0, history: [], percentile: 50 }}
            />
          );
        case 'surfing':
          return (
            <UrgeSurfing 
              onComplete={(peak) => handleGameComplete('surfing', `Peak: ${peak}/10`)}
              onCancel={() => handleGameFail('surfing', 'Early exit')}
            />
          );
        case 'bodyscan':
          return (
            <BodyScan 
              onComplete={(areas) => handleGameComplete('bodyscan', `${areas} areas`)}
              onCancel={() => handleGameFail('bodyscan', 'Early exit')}
            />
          );
        case 'calmdown':
          return (
            <CalmDown 
              onComplete={(level) => handleGameComplete('calmdown', `Relaxation: ${level}/10`)}
              onCancel={() => handleGameFail('calmdown', 'Early exit')}
            />
          );
        case 'gravitydrop':
          return (
            <GravityDrop 
              onComplete={() => handleGameComplete('gravitydrop', 'Settled')}
              onCancel={() => handleGameFail('gravitydrop', 'Early exit')}
            />
          );
        case 'noisedissolver':
          return (
            <NoiseDissolver 
              onComplete={() => handleGameComplete('noisedissolver', 'Dissolved')}
              onCancel={() => handleGameFail('noisedissolver', 'Early exit')}
            />
          );
        default:
          return null;
      }
    }

    return (
      <div ref={ref} className="min-h-screen pb-32 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 px-5 pt-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-[32px] font-bold text-foreground tracking-tight">Arcade</h1>
            <p className="text-[16px] text-muted-foreground/70 mt-1 font-medium">
              Complete games to earn tokens. Exit early = points lost only.
            </p>
          </motion.div>

          {/* Game tiles */}
          <div className="space-y-4">
            {GAMES.map((game, i) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleStartGame(game.id)}
                className={`w-full h-[180px] rounded-[22px] overflow-hidden relative bg-gradient-to-br ${game.gradient} border border-border/15 hover:border-primary/25 active:scale-[0.98] transition-all`}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-left">
                  {/* Top: Icon + Reward badge */}
                  <div className="flex items-start justify-between">
                    <span className="text-[44px]">{game.icon}</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/20">
                      <span className="text-[12px] font-bold text-primary">{game.reward}</span>
                    </div>
                  </div>
                  
                  {/* Bottom: Title, tagline, duration */}
                  <div>
                    <h3 className="text-[22px] font-bold text-foreground mb-0.5 leading-tight">
                      {game.name}
                    </h3>
                    <p className="text-[15px] text-muted-foreground/80 mb-3 font-medium">{game.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-muted-foreground/50 font-medium">{game.duration}</span>
                      <span className="px-5 py-2 rounded-full bg-foreground/10 backdrop-blur-sm border border-foreground/10 text-[14px] font-semibold text-foreground">
                        Start
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
