import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { REFLECTION_PROMPTS, type WeeklyReflection as WeeklyReflectionType } from '@/lib/progress-data';

interface WeeklyReflectionProps {
  hasReflected: boolean;
  onSubmit: (prompts: WeeklyReflectionType['prompts']) => void;
  earnedPoints?: number;
}

export function WeeklyReflection({ hasReflected, onSubmit, earnedPoints = 25 }: WeeklyReflectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompts, setPrompts] = useState<WeeklyReflectionType['prompts']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (Object.values(prompts).some(v => v?.trim())) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit(prompts);
        setIsOpen(false);
        setIsSubmitting(false);
      }, 500);
    }
  };

  const canSubmit = Object.values(prompts).some(v => v?.trim());

  if (hasReflected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dopa-card border border-emerald-500/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Weekly Reflection Complete</p>
            <p className="text-xs text-muted-foreground">+{earnedPoints} points allowed</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="dopa-card overflow-hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Weekly Reflection</p>
            <p className="text-xs text-muted-foreground">+{earnedPoints} points • 2 min</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {REFLECTION_PROMPTS.weekly.map((prompt) => (
                <div key={prompt.key}>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {prompt.label}
                  </label>
                  <Textarea
                    placeholder={prompt.placeholder}
                    value={prompts[prompt.key as keyof typeof prompts] || ''}
                    onChange={(e) => setPrompts(prev => ({
                      ...prev,
                      [prompt.key]: e.target.value,
                    }))}
                    className="min-h-[80px] bg-muted/50 border-border/50 resize-none"
                  />
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full dopa-glow-button"
              >
                {isSubmitting ? 'Saving...' : 'Complete Reflection'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
