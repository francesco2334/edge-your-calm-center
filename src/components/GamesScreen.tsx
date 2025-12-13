import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import { GameStartScreen } from './GameStartScreen';
import type { ReactionLeaderboard } from '@/lib/reaction-data';

interface GamesScreenProps {
  reactionLeaderboard: ReactionLeaderboard;
  onEarnCharge: (amount: number, reason: string) => void;
  onRecordReaction: (ms: number) => void;
}

type GameId = 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction';
type ActiveGame = { id: GameId; started: boolean } | null;

const GAMES: {
  id: GameId;
  name: string;
  tagline: string;
  instruction: string;
  whyItWorks: string;
  icon: string;
  gradient: string;
  charge: string;
  duration: string;
}[] = [
  {
    id: 'pause',
    name: 'The Standoff',
    tagline: 'Hold the urge. Don\'t act.',
    instruction: 'A timer will count up. Your only job is to not give in. See how long you can hold.',
    whyItWorks: 'Delay trains your prefrontal cortex to override impulse signals.',
    icon: '⏸️',
    gradient: 'from-violet-600/40 via-purple-700/30 to-background',
    charge: '1-2',
    duration: '10-60s',
  },
  {
    id: 'prediction',
    name: 'The Bluff',
    tagline: 'Catch your brain lying.',
    instruction: 'Rate how good you think something will feel, then rate how it actually felt.',
    whyItWorks: 'Dopamine exaggerates predictions. Seeing the gap weakens cravings.',
    icon: '🎯',
    gradient: 'from-amber-600/40 via-orange-700/30 to-background',
    charge: '1',
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
    charge: '1',
    duration: '20s',
  },
  {
    id: 'breathing',
    name: 'Sync',
    tagline: '90 seconds to calm.',
    instruction: 'Match your breath to the rhythm. Your nervous system will follow.',
    whyItWorks: 'Slow breathing activates your parasympathetic system, reducing urge intensity.',
    icon: '🫁',
    gradient: 'from-teal-600/40 via-emerald-700/30 to-background',
    charge: '2',
    duration: '90s',
  },
  {
    id: 'name',
    name: 'Name It',
    tagline: 'Label the feeling.',
    instruction: 'Identify what emotion is underneath the urge. Naming reduces its power.',
    whyItWorks: 'Affect labeling reduces amygdala activation by up to 50%.',
    icon: '📍',
    gradient: 'from-rose-600/40 via-pink-700/30 to-background',
    charge: '1',
    duration: '15s',
  },
];

export const GamesScreen = forwardRef<HTMLDivElement, GamesScreenProps>(
  function GamesScreen({ reactionLeaderboard, onEarnCharge, onRecordReaction }, ref) {
    const [activeGame, setActiveGame] = useState<ActiveGame>(null);

    const handleGameComplete = (charge: number, reason: string) => {
      onEarnCharge(charge, reason);
      setActiveGame(null);
    };

    const handleReactionComplete = (ms: number) => {
      onRecordReaction(ms);
      onEarnCharge(1, `Reaction time: ${ms}ms`);
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
        case 'pause':
          return (
            <PauseLadder 
              onComplete={(seconds) => handleGameComplete(seconds >= 40 ? 2 : 1, `The Standoff: ${seconds}s`)}
              onCancel={() => setActiveGame(null)}
            />
          );
        case 'name':
          return (
            <NameThePull 
              onComplete={(feeling) => handleGameComplete(1, `Named the pull: ${feeling}`)}
              onCancel={() => setActiveGame(null)}
            />
          );
        case 'prediction':
          return (
            <PredictionReality 
              onComplete={(pred, real) => handleGameComplete(1, `The Bluff: ${pred} → ${real}`)}
              onCancel={() => setActiveGame(null)}
            />
          );
        case 'breathing':
          return (
            <BreathingSync 
              onComplete={() => handleGameComplete(2, 'Sync completed')}
              onCancel={() => setActiveGame(null)}
            />
          );
        case 'reaction':
          return (
            <ReactionTracker 
              onComplete={handleReactionComplete}
              onCancel={() => setActiveGame(null)}
              leaderboard={reactionLeaderboard}
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
          {/* Header - Large title, clear hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-[32px] font-bold text-foreground tracking-tight">Arcade</h1>
            <p className="text-[16px] text-muted-foreground/70 mt-1 font-medium">
              Short wins. Real control.
            </p>
          </motion.div>

          {/* Game tiles - Large mode tiles, not small cards */}
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
                {/* Overlay for depth and text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                
                {/* Content layout */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-left">
                  {/* Top: Icon + Charge badge */}
                  <div className="flex items-start justify-between">
                    <span className="text-[44px]">{game.icon}</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/20">
                      <span className="text-[12px] font-bold text-primary">+{game.charge}</span>
                      <span className="text-[12px]">⚡</span>
                    </div>
                  </div>
                  
                  {/* Bottom: Title, tagline, duration, Start */}
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