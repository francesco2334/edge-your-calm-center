import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Droplets, Apple, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WellnessBar } from './WellnessBar';
import { ACTION_CATEGORIES } from '@/lib/credit-data';

interface WellnessData {
  water: number;
  waterLocked: boolean;
  meals: number;
  mealsLocked: boolean;
  exercise: number;
  exerciseLocked: boolean;
}

interface ActScreenProps {
  actionsToday: number;
  actionsRemaining: number;
  onLogAction: (category: string, description?: string) => void;
  wellness?: WellnessData;
  onWellnessChange?: (wellness: WellnessData) => void;
}

const MAX_ACTIONS = 3;

export function ActScreen({ 
  actionsToday, 
  actionsRemaining, 
  onLogAction,
  wellness = { water: 0, waterLocked: false, meals: 0, mealsLocked: false, exercise: 0, exerciseLocked: false },
  onWellnessChange
}: ActScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const updateWellness = (updates: Partial<WellnessData>) => {
    onWellnessChange?.({ ...wellness, ...updates });
  };

  const handleLog = async () => {
    if (!selectedCategory) return;
    
    setIsLogging(true);
    await onLogAction(selectedCategory, description || undefined);
    setIsLogging(false);
    setSelectedCategory(null);
    setDescription('');
  };

  const selectedCat = ACTION_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1 
          className="text-3xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Act
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Do 1 real-world action to replace the pull ({actionsRemaining} of {MAX_ACTIONS} remaining)
        </motion.p>
      </div>

      {/* All logged state */}
      {actionsRemaining === 0 ? (
        <motion.div 
          className="mx-6 p-8 rounded-2xl bg-primary/10 border border-primary/20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            All 3 actions logged
          </h2>
          <p className="text-muted-foreground text-sm">
            You've earned +{MAX_ACTIONS} credits today.<br />
            Come back tomorrow.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Identity framing */}
          <motion.div 
            className="mx-6 mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-foreground/80 text-center">
              <span className="font-semibold">You become what you do.</span><br />
              <span className="text-muted-foreground">Each action builds identity.</span>
            </p>
          </motion.div>

          {/* Identity-based categories */}
          <div className="px-6 space-y-3">
            {ACTION_CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedCategory === category.id
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border/50 hover:border-border'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    selectedCategory === category.id
                      ? 'bg-primary/20'
                      : 'bg-muted'
                  }`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      selectedCategory === category.id
                        ? 'text-foreground'
                        : 'text-foreground/80'
                    }`}>
                      {category.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {category.examples.join(' · ')}
                    </p>
                    {selectedCategory === category.id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-primary mt-2 italic"
                      >
                        → {category.identity}
                      </motion.p>
                    )}
                  </div>
                  {selectedCategory === category.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Optional description */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 mt-4"
              >
                <Textarea
                  placeholder="Optional: What did you do? (builds memory)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  className="bg-card border-border/50 resize-none"
                  rows={2}
                  maxLength={200}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wellness Trackers Section */}
          <motion.div 
            className="px-6 mt-8 mb-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Daily Wellness</h2>
            
            <WellnessBar
              icon={Droplets}
              title="Water Intake"
              subtitle="Drag to log your hydration"
              value={wellness.water}
              maxValue={3}
              unit="L"
              color="blue"
              points={5}
              isLocked={wellness.waterLocked}
              onValueChange={(v) => updateWellness({ water: v })}
              onLock={() => updateWellness({ waterLocked: true })}
            />

            <WellnessBar
              icon={Apple}
              title="Healthy Meals"
              subtitle="Log your nutritious meals today"
              value={wellness.meals}
              maxValue={3}
              unit=""
              color="green"
              points={5}
              isLocked={wellness.mealsLocked}
              onValueChange={(v) => updateWellness({ meals: v })}
              onLock={() => updateWellness({ mealsLocked: true })}
            />

            <WellnessBar
              icon={Flame}
              title="Exercise Hours"
              subtitle="How long did you move today?"
              value={wellness.exercise}
              maxValue={4}
              unit="h"
              color="orange"
              points={10}
              isLocked={wellness.exerciseLocked}
              onValueChange={(v) => updateWellness({ exercise: v })}
              onLock={() => updateWellness({ exerciseLocked: true })}
            />
          </motion.div>

          {/* Log button */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-0 right-0 px-6"
              >
                <Button
                  onClick={handleLog}
                  disabled={isLogging}
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  {isLogging ? 'Logging...' : 'Log & Earn +1 Credit'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
