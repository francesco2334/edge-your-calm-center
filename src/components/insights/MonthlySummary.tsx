import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { REFLECTION_PROMPTS, getMonthLabel } from '@/lib/progress-data';

interface MonthlySummaryProps {
  month: string;
  hasSummary: boolean;
  onSubmit: (content: string) => void;
  earnedPoints?: number;
}

export function MonthlySummary({ month, hasSummary, onSubmit, earnedPoints = 50 }: MonthlySummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthLabel = getMonthLabel(month);

  const handleSubmit = () => {
    if (content.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit(content);
        setIsOpen(false);
        setIsSubmitting(false);
      }, 500);
    }
  };

  if (hasSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dopa-card border border-primary/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{monthLabel} Summary Complete</p>
            <p className="text-xs text-muted-foreground">+{earnedPoints} points allowed</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="dopa-card overflow-hidden border border-accent/20"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{monthLabel} Summary</p>
            <p className="text-xs text-muted-foreground">+{earnedPoints} points • End of month</p>
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
              <p className="text-sm text-muted-foreground italic">
                {REFLECTION_PROMPTS.monthly.prompt}
              </p>
              
              <Textarea
                placeholder={REFLECTION_PROMPTS.monthly.placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] bg-muted/50 border-border/50 resize-none"
              />

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="w-full"
                variant="secondary"
              >
                {isSubmitting ? 'Saving...' : 'Save Monthly Summary'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
