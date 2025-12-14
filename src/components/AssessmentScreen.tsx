import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ASSESSMENT_QUESTIONS, ANSWER_OPTIONS, type AssessmentAnswer } from '@/lib/edge-data';

interface AssessmentScreenProps {
  onComplete: (answers: AssessmentAnswer[]) => void;
}

export function AssessmentScreen({ onComplete }: AssessmentScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    setSelectedValue(value);
  };

  const handleNext = () => {
    if (selectedValue === null) return;

    const newAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      value: selectedValue,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedValue(null);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />

      {/* Progress bar */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>DopaMINE Scan</span>
          <span>{currentIndex + 1}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="dopa-card mb-8"
          >
            <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
              "{currentQuestion.text}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          {ANSWER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                selectedValue === option.value
                  ? 'bg-primary/10 border-primary/50 text-foreground'
                  : 'bg-dopa-surface border-border/30 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 pt-6"
      >
        <Button
          variant="edge"
          size="lg"
          onClick={handleNext}
          disabled={selectedValue === null}
          className="w-full"
        >
          {currentIndex === ASSESSMENT_QUESTIONS.length - 1 ? 'See Results' : 'Continue'}
        </Button>
      </motion.div>
    </div>
  );
}
