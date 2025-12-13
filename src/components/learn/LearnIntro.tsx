import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { LEARN_TOPICS } from '@/lib/learn-data';

interface LearnIntroProps {
  onChooseTopics: () => void;
  onStartLearning: () => void;
}

export function LearnIntro({ onChooseTopics, onStartLearning }: LearnIntroProps) {
  // Show first 6 topics as preview chips
  const previewTopics = LEARN_TOPICS.slice(0, 6);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6"
        >
          <BookOpen className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-foreground text-center mb-3"
        >
          Learn
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center max-w-xs leading-relaxed mb-8"
        >
          Discover bite-sized knowledge about your brain, habits, and how to build a better life. Swipe through cards tailored to your interests.
        </motion.p>

        {/* Topic preview chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-8 max-w-sm"
        >
          {previewTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 flex items-center gap-1.5"
            >
              <span className="text-sm">{topic.icon}</span>
              <span className="text-xs text-muted-foreground font-medium">{topic.label}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">+{LEARN_TOPICS.length - 6} more</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 pb-32 space-y-3"
      >
        {/* Primary: Choose Topics */}
        <button
          onClick={onChooseTopics}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          Choose Your Topics
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Secondary: Start with defaults */}
        <button
          onClick={onStartLearning}
          className="w-full h-14 rounded-2xl bg-muted/50 border border-border/50 text-foreground font-medium text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          Start Learning
        </button>
      </motion.div>
    </div>
  );
}
