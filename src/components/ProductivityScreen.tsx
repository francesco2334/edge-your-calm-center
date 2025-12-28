import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Dumbbell, BookOpen, Brain, Heart, Salad, Pencil, Droplets, Apple, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

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

interface ProductivityScreenProps {
  logsToday: number;
  logsRemaining: number;
  onLogProductivity: (category: string, description?: string) => void;
  waterIntake?: number;
  onWaterChange?: (litres: number) => void;
  healthyMeals?: number;
  onHealthyMealLog?: () => void;
  exerciseHours?: number;
  onExerciseChange?: (hours: number) => void;
}

const MAX_LOGS = 3;

export function ProductivityScreen({ 
  logsToday, 
  logsRemaining, 
  onLogProductivity,
  waterIntake = 0,
  onWaterChange,
  healthyMeals = 0,
  onHealthyMealLog,
  exerciseHours = 0,
  onExerciseChange
}: ProductivityScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [otherDescription, setOtherDescription] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [localWater, setLocalWater] = useState(waterIntake);
  const [localExercise, setLocalExercise] = useState(exerciseHours);

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

  return (
    <div className="min-h-screen bg-background pb-32">
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

      {/* All logged state */}
      {logsRemaining === 0 ? (
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
            You've earned +{MAX_LOGS} tokens today.<br />
            Come back tomorrow.
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

          {/* Wellness Trackers Section */}
          <motion.div 
            className="px-6 mt-8 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Daily Wellness</h2>
            
            {/* Water Intake */}
            <div className="p-4 rounded-xl bg-card border border-border/50 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Water Intake</h3>
                  <p className="text-xs text-muted-foreground">Stay hydrated!</p>
                </div>
                <span className="text-lg font-bold text-blue-400">{localWater.toFixed(1)}L</span>
              </div>
              <div className="relative">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(localWater / 3) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                </div>
                <Slider
                  value={[localWater]}
                  onValueChange={(val) => {
                    setLocalWater(val[0]);
                    onWaterChange?.(val[0]);
                  }}
                  max={3}
                  step={0.25}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0L</span>
                <span>1L</span>
                <span>2L</span>
                <span>3L</span>
              </div>
            </div>

            {/* Healthy Eating */}
            <motion.button
              onClick={() => onHealthyMealLog?.()}
              className={`w-full p-4 rounded-xl border transition-all text-left mb-3 ${
                healthyMeals > 0
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-card border-border/50 hover:border-border'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  healthyMeals > 0 ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                }`}>
                  <Apple className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Healthy Eating</h3>
                  <p className="text-xs text-muted-foreground">Log a nutritious meal</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((meal) => (
                    <div 
                      key={meal}
                      className={`w-3 h-3 rounded-full transition-all ${
                        meal <= healthyMeals ? 'bg-green-400' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.button>

            {/* Exercise Hours */}
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  localExercise > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'
                }`}>
                  <Timer className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Exercise Today</h3>
                  <p className="text-xs text-muted-foreground">How many hours?</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((hours) => (
                  <motion.button
                    key={hours}
                    onClick={() => {
                      setLocalExercise(hours);
                      onExerciseChange?.(hours);
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      localExercise >= hours
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-muted text-muted-foreground border border-transparent hover:bg-muted/80'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {hours}h
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Log button */}
          <AnimatePresence>
            {selectedCategory && (selectedCategory !== 'other' || otherDescription.trim()) && (
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
                  {isLogging ? 'Logging...' : 'Log & Earn +1 Token'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
