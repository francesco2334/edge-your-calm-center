import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Dumbbell, BookOpen, Brain, Heart, Salad, Pencil, Droplets, Apple, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WellnessBar } from './WellnessBar';

interface ProductivityCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  examples: string[];
}

const CATEGORIES: ProductivityCategory[] = [
  {
    id: 'physical',
    label: 'Physical Activity',
    icon: <Dumbbell className="w-6 h-6" />,
    examples: ['Gym', 'Football', 'Boxing', 'Running', 'Any sport']
  },
  {
    id: 'work',
    label: 'Work / Study',
    icon: <BookOpen className="w-6 h-6" />,
    examples: ['Homework', 'Job work', 'Skill learning', 'Focused task']
  },
  {
    id: 'mental',
    label: 'Mental Health',
    icon: <Brain className="w-6 h-6" />,
    examples: ['Therapy', 'Journaling', 'Meditation', 'Recovery work']
  },
  {
    id: 'deed',
    label: 'Good Deed',
    icon: <Heart className="w-6 h-6" />,
    examples: ['Helping someone', 'Volunteering', 'Meaningful kindness']
  },
  {
    id: 'health',
    label: 'Health',
    icon: <Salad className="w-6 h-6" />,
    examples: ['Eating healthy', 'Cooking a meal', 'Sleep hygiene']
  },
  {
    id: 'other',
    label: 'Other',
    icon: <Pencil className="w-6 h-6" />,
    examples: ['Describe your action']
  }
];

interface WellnessData {
  water: number;
  waterLocked: boolean;
  meals: number;
  mealsLocked: boolean;
  exercise: number;
  exerciseLocked: boolean;
  lastUpdated?: string;
}

interface ProductivityScreenProps {
  logsToday: number;
  logsRemaining: number;
  onLogProductivity: (category: string, description?: string) => void;
  wellness?: WellnessData;
  onWellnessChange?: (wellness: WellnessData) => void;
}

const MAX_LOGS = 3;

export function ProductivityScreen({ 
  logsToday, 
  logsRemaining, 
  onLogProductivity,
  wellness = { water: 0, waterLocked: false, meals: 0, mealsLocked: false, exercise: 0, exerciseLocked: false },
  onWellnessChange
}: ProductivityScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [otherDescription, setOtherDescription] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const updateWellness = (updates: Partial<WellnessData>) => {
    onWellnessChange?.({ ...wellness, ...updates });
  };

  const handleLog = async () => {
    if (!selectedCategory) return;
    
    setIsLogging(true);
    await onLogProductivity(
      selectedCategory, 
      selectedCategory === 'other' ? otherDescription : undefined
    );
    setIsLogging(false);
    setSelectedCategory(null);
    setOtherDescription('');
  };

  const allLogsComplete = logsRemaining === 0;

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1 
          className="text-3xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Productivity
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Log up to 3 real-world actions today ({logsRemaining} remaining)
        </motion.p>
      </div>

      {/* PRODUCTIVITY SECTION - Locked after completion */}
      {allLogsComplete ? (
        <motion.div 
          className="mx-6 p-8 rounded-2xl bg-primary/10 border border-primary/20 text-center mb-8"
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
            You've earned +{MAX_LOGS} tokens today.<br />
            Productivity tasks reset tomorrow.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Honesty framing */}
          <motion.div 
            className="mx-6 mb-6 p-4 rounded-xl bg-muted/50 border border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground text-center italic">
              This is honesty-based.<br />
              Logging something you didn't do helps nothing.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="px-6 space-y-3">
            {CATEGORIES.map((category, index) => (
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
                  <div className={`p-3 rounded-xl ${
                    selectedCategory === category.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
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

          {/* Other description input */}
          <AnimatePresence>
            {selectedCategory === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 mt-4"
              >
                <Textarea
                  placeholder="Describe what you did..."
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value.slice(0, 200))}
                  className="bg-card border-border/50 resize-none"
                  rows={3}
                  maxLength={200}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Log button */}
          <AnimatePresence>
            {selectedCategory && (selectedCategory !== 'other' || otherDescription.trim()) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-0 right-0 px-6 z-20"
              >
                <Button
                  onClick={handleLog}
                  disabled={isLogging}
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  {isLogging ? 'Logging...' : 'Log & Earn +1 Token'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* WELLNESS SECTION - ALWAYS ACCESSIBLE */}
      <motion.div 
        className="px-6 mt-4 mb-32 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Daily Wellness</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Log once per day — the higher you go, the more points you earn!
        </p>
        
        <WellnessBar
          icon={Droplets}
          title="Water Intake"
          subtitle="Log once per day • More water = more points!"
          value={wellness.water}
          maxValue={3}
          unit="L"
          color="blue"
          basePoints={5}
          isLocked={wellness.waterLocked}
          onValueChange={(v) => updateWellness({ water: v })}
          onLock={(earnedPoints) => updateWellness({ waterLocked: true })}
        />

        <WellnessBar
          icon={Apple}
          title="Healthy Meals"
          subtitle="Log once per day • More meals = more points!"
          value={wellness.meals}
          maxValue={3}
          unit=""
          color="green"
          basePoints={5}
          isLocked={wellness.mealsLocked}
          onValueChange={(v) => updateWellness({ meals: v })}
          onLock={(earnedPoints) => updateWellness({ mealsLocked: true })}
        />

        <WellnessBar
          icon={Flame}
          title="Exercise Hours"
          subtitle="Log once per day • More hours = more points!"
          value={wellness.exercise}
          maxValue={4}
          unit="h"
          color="orange"
          basePoints={8}
          isLocked={wellness.exerciseLocked}
          onValueChange={(v) => updateWellness({ exercise: v })}
          onLock={(earnedPoints) => updateWellness({ exerciseLocked: true })}
        />
      </motion.div>
    </div>
  );
}
