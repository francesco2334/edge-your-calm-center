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
    gradient: 'from-violet-500/30 via-purple-600/20 to-background',
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
    gradient: 'from-amber-500/30 via-orange-600/20 to-background',
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
    gradient: 'from-cyan-500/30 via-blue-600/20 to-background',
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
    gradient: 'from-teal-500/30 via-emerald-600/20 to-background',
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
    gradient: 'from-rose-500/30 via-pink-600/20 to-background',
    charge: '1',
    duration: '15s',
  },
];

export function GamesScreen({ reactionLeaderboard, onEarnCharge, onRecordReaction }: GamesScreenProps) {
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
    const game = GAMES.find(g => g.id === activeGame.id)!;
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
    }
  }

  return (
    <div className="min-h-screen pb-32 px-5 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">Arcade</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Short wins. Real control.
        </p>
      </motion.div>

      {/* Game tiles - Large mode tiles */}
      <div className="space-y-4">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleStartGame(game.id)}
            className={`w-full h-[170px] rounded-[22px] overflow-hidden relative bg-gradient-to-br ${game.gradient} border border-border/20 hover:border-primary/30 active:scale-[0.98] transition-all`}
          >
            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-left">
              {/* Top: Icon + Charge */}
              <div className="flex items-start justify-between">
                <span className="text-4xl">{game.icon}</span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/40 backdrop-blur-sm">
                  <span className="text-[11px] font-medium text-primary">+{game.charge} ⚡</span>
                </div>
              </div>
              
              {/* Bottom: Title, tagline, button */}
              <div>
                <h3 className="text-[20px] font-bold text-foreground mb-0.5">
                  {game.name}
                </h3>
                <p className="text-[14px] text-muted-foreground mb-3">{game.tagline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground/60">{game.duration}</span>
                  <span className="px-4 py-1.5 rounded-full bg-foreground/10 backdrop-blur-sm text-[13px] font-medium text-foreground">
                    Start
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
