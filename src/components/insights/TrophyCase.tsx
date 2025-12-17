import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Trophy } from '@/lib/progress-data';
import { TROPHY_DEFINITIONS } from '@/lib/progress-data';

interface TrophyCaseProps {
  totalDaysActive: number;
  earnedTrophies?: Trophy[];
}

export function TrophyCase({ totalDaysActive, earnedTrophies = [] }: TrophyCaseProps) {
  const allTrophyTypes = Object.keys(TROPHY_DEFINITIONS) as Array<keyof typeof TROPHY_DEFINITIONS>;
  
  // Determine which trophies are earned based on total active days
  const getEarnedTrophies = () => {
    return allTrophyTypes.filter(type => totalDaysActive >= TROPHY_DEFINITIONS[type].threshold);
  };
  
  const earnedTypes = new Set(getEarnedTrophies());
  const nextTrophy = allTrophyTypes.find(type => !earnedTypes.has(type));
  const nextThreshold = nextTrophy ? TROPHY_DEFINITIONS[nextTrophy].threshold : 365;
  const progressToNext = nextTrophy 
    ? Math.min(100, (totalDaysActive / nextThreshold) * 100)
    : 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Trophies</h3>
        <span className="text-xs text-primary">{earnedTypes.size}/{allTrophyTypes.length}</span>
      </div>
      
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{totalDaysActive} days active</span>
          {nextTrophy && (
            <span className="text-primary">{nextThreshold - totalDaysActive} days to {TROPHY_DEFINITIONS[nextTrophy].name}</span>
          )}
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {allTrophyTypes.map((type, i) => {
          const definition = TROPHY_DEFINITIONS[type];
          const isEarned = earnedTypes.has(type);

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                isEarned 
                  ? 'bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30' 
                  : 'bg-muted/30 border border-border/30'
              }`}
            >
              <div className={`text-2xl mb-1 ${!isEarned && 'grayscale opacity-40'}`}>
                {definition.icon}
              </div>
              <p className={`text-[10px] text-center font-medium leading-tight ${
                isEarned ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {definition.name}
              </p>
              <p className={`text-[8px] text-center ${
                isEarned ? 'text-primary' : 'text-muted-foreground/50'
              }`}>
                {definition.threshold}d
              </p>
              
              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-xl">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
              )}

              {isEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                >
                  <span className="text-[8px]">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {earnedTypes.size === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Use the app daily to unlock trophies over the year
        </p>
      )}
    </div>
  );
}
