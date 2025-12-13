import { motion } from 'framer-motion';
import { PauseLadder, NameThePull, PredictionReality, BreathingSync, ReactionTracker } from './tools';
import type { ReactionLeaderboard } from '@/lib/reaction-data';

interface GamesScreenProps {
  reactionLeaderboard: ReactionLeaderboard;
  onEarnCharge: (amount: number, reason: string) => void;
  onRecordReaction: (ms: number) => void;
}

type ActiveGame = 'pause' | 'name' | 'prediction' | 'breathing' | 'reaction' | null;

const GAMES = [
  {
    id: 'pause' as const,
    name: 'The Standoff',
    desc: 'Hold the urge. Don\'t act.',
    detail: 'Practice delay tolerance from 10-60 seconds',
    icon: '⏸️',
    gradient: 'from-violet-500/20 to-purple-600/20',
    charge: '1-2',
  },
  {
    id: 'prediction' as const,
    name: 'The Bluff',
    desc: 'Catch your brain lying.',
    detail: 'Predict how good something will feel, then check reality',
    icon: '🎯',
    gradient: 'from-amber-500/20 to-orange-600/20',
    charge: '1',
  },
  {
    id: 'reaction' as const,
    name: 'Catch the Flicker',
    desc: 'Test your awareness.',
    detail: 'How fast can you notice an urge appearing?',
    icon: '⚡',
    gradient: 'from-cyan-500/20 to-blue-600/20',
    charge: '1',
  },
  {
    id: 'breathing' as const,
    name: 'Sync Reset',
    desc: '90 seconds to calm.',
    detail: 'Match your breath to Mojo. Your nervous system will follow.',
    icon: '🫁',
    gradient: 'from-teal-500/20 to-emerald-600/20',
    charge: '2',
  },
  {
    id: 'name' as const,
    name: 'Name It',
    desc: 'Label the feeling.',
    detail: 'What\'s really pulling you? Name it to tame it.',
    icon: '📍',
    gradient: 'from-rose-500/20 to-pink-600/20',
    charge: '1',
  },
];

import { useState } from 'react';

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

  // Render active game
  if (activeGame === 'pause') {
    return (
      <PauseLadder 
        onComplete={(seconds) => handleGameComplete(seconds >= 40 ? 2 : 1, `The Standoff: ${seconds}s`)}
        onCancel={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'name') {
    return (
      <NameThePull 
        onComplete={(feeling) => handleGameComplete(1, `Named the pull: ${feeling}`)}
        onCancel={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'prediction') {
    return (
      <PredictionReality 
        onComplete={(pred, real) => handleGameComplete(1, `The Bluff: ${pred} → ${real}`)}
        onCancel={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'breathing') {
    return (
      <BreathingSync 
        onComplete={() => handleGameComplete(2, 'Sync Reset completed')}
        onCancel={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === 'reaction') {
    return (
      <ReactionTracker 
        onComplete={handleReactionComplete}
        onCancel={() => setActiveGame(null)}
        leaderboard={reactionLeaderboard}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 px-6 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">Games</h1>
        <p className="text-sm text-muted-foreground">
          Train your brain. Earn Charge.
        </p>
      </motion.div>

      <div className="space-y-4">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveGame(game.id)}
            className={`w-full p-5 rounded-2xl bg-gradient-to-br ${game.gradient} border border-border/30 hover:border-primary/40 transition-all text-left group`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{game.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <span className="text-xs text-primary font-medium">
                    +{game.charge} ⚡
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mb-1">{game.desc}</p>
                <p className="text-xs text-muted-foreground">{game.detail}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
