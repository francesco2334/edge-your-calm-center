import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MojoOrb } from '../MojoOrb';
import { Check, X } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';

interface NameThePullProps {
  onComplete: (feeling: string) => void;
  onCancel: () => void;
}

const FEELINGS = [
  { id: 'bored', label: 'Bored', desc: 'Nothing to do, seeking stimulation' },
  { id: 'stressed', label: 'Stressed', desc: 'Tension, pressure, overwhelm' },
  { id: 'lonely', label: 'Lonely', desc: 'Disconnected, craving connection' },
  { id: 'avoiding', label: 'Avoiding', desc: 'Running from something harder' },
  { id: 'restless', label: 'Restless', desc: 'Physically or mentally agitated' },
  { id: 'empty', label: 'Empty', desc: 'Low energy, seeking a boost' },
];

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface FeelingQuiz {
  question: string;
  options: QuizOption[];
}

const FEELING_QUIZZES: Record<string, FeelingQuiz> = {
  bored: {
    question: "What's the best way to handle boredom without quick dopamine?",
    options: [
      { id: 'a', text: 'Scroll social media for a few minutes', isCorrect: false, explanation: 'This feeds the craving for instant stimulation and reinforces the loop.' },
      { id: 'b', text: 'Sit with the boredom for 2 minutes, then do something physical', isCorrect: true, explanation: 'Tolerating boredom briefly resets your baseline. Physical activity provides healthy dopamine.' },
      { id: 'c', text: 'Distract yourself with food or snacks', isCorrect: false, explanation: 'Replacing one dopamine hit with another doesn\'t address the underlying pattern.' },
    ],
  },
  stressed: {
    question: "When stress hits, what actually helps your nervous system?",
    options: [
      { id: 'a', text: 'Take 6 slow breaths, exhaling longer than inhaling', isCorrect: true, explanation: 'Extended exhales activate your parasympathetic system and reduce cortisol.' },
      { id: 'b', text: 'Push through and keep working harder', isCorrect: false, explanation: 'This increases cortisol and can lead to burnout. Regulation first, then action.' },
      { id: 'c', text: 'Vent about it immediately to someone', isCorrect: false, explanation: 'Venting can sometimes amplify stress. Calming first is more effective.' },
    ],
  },
  lonely: {
    question: "What's a healthy response to feeling lonely?",
    options: [
      { id: 'a', text: 'Browse dating apps or social media', isCorrect: false, explanation: 'Passive scrolling often increases loneliness. It mimics connection without providing it.' },
      { id: 'b', text: 'Send a genuine message to one person you care about', isCorrect: true, explanation: 'Real connection, even small, is more fulfilling than passive consumption.' },
      { id: 'c', text: 'Isolate further until you feel better', isCorrect: false, explanation: 'Isolation usually deepens loneliness. Small steps toward connection help.' },
    ],
  },
  avoiding: {
    question: "When you're avoiding something difficult, what works best?",
    options: [
      { id: 'a', text: 'Commit to just 2 minutes of the avoided task', isCorrect: true, explanation: 'Tiny starts reduce the mental barrier. Action often follows momentum.' },
      { id: 'b', text: 'Wait until you feel motivated', isCorrect: false, explanation: 'Motivation often comes after starting, not before. Waiting can lead to more avoidance.' },
      { id: 'c', text: 'Do something fun first as a reward', isCorrect: false, explanation: 'Pre-rewards can become procrastination. Small action first, then reward.' },
    ],
  },
  restless: {
    question: "What's the best outlet for restless energy?",
    options: [
      { id: 'a', text: 'Channel it into physical movement for 5+ minutes', isCorrect: true, explanation: 'Physical activity processes restless energy and releases healthy neurotransmitters.' },
      { id: 'b', text: 'Try to ignore it and sit still', isCorrect: false, explanation: 'Suppressing restlessness often makes it worse. Movement helps discharge it.' },
      { id: 'c', text: 'Rapid-switch between apps and tasks', isCorrect: false, explanation: 'This feeds the agitation rather than resolving it. Focused action is better.' },
    ],
  },
  empty: {
    question: "When you feel empty and low, what helps restore energy?",
    options: [
      { id: 'a', text: 'Consume high-stimulation content for a boost', isCorrect: false, explanation: 'This creates a spike-crash cycle that deepens the emptiness.' },
      { id: 'b', text: 'Rest or do something gentle and restorative', isCorrect: true, explanation: 'Low energy often signals a need for recovery, not more stimulation.' },
      { id: 'c', text: 'Force yourself to be productive anyway', isCorrect: false, explanation: 'Pushing through emptiness can lead to burnout. Gentle restoration works better.' },
    ],
  },
};

export const NameThePull = forwardRef<HTMLDivElement, NameThePullProps>(
  function NameThePull({ onComplete, onCancel }, ref) {
    const [selected, setSelected] = useState<string | null>(null);
    const [phase, setPhase] = useState<'select' | 'quiz' | 'result' | 'complete'>('select');
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleSelect = (id: string) => {
      setSelected(id);
      setPhase('quiz');
    };

    const handleAnswerSelect = (answerId: string) => {
      setSelectedAnswer(answerId);
      setShowExplanation(true);
      
      const quiz = selected ? FEELING_QUIZZES[selected] : null;
      const isCorrect = quiz?.options.find(o => o.id === answerId)?.isCorrect;
      
      if (isCorrect) {
        haptics.notifySuccess();
      } else {
        haptics.notifyWarning();
      }
    };

    const handleQuizComplete = () => {
      setPhase('result');
    };

    const handleComplete = () => {
      setPhase('complete');
      setTimeout(() => {
        if (selected) onComplete(selected);
      }, 1500);
    };

    if (phase === 'select') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onCancel}
              className="mb-6 text-muted-foreground text-sm"
            >
              ← Back
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Name the Pull
              </h1>
              <p className="text-muted-foreground text-sm">
                Naming creates distance. What's underneath?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <MojoOrb state="under-load" size="md" />
            </motion.div>

            <div className="space-y-3">
              {FEELINGS.map((feeling, i) => (
                <motion.button
                  key={feeling.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  onClick={() => handleSelect(feeling.id)}
                  className="w-full p-4 rounded-xl text-left transition-all duration-200 border bg-dopa-surface border-border/30 hover:border-primary/30"
                >
                  <p className="text-foreground font-medium">{feeling.label}</p>
                  <p className="text-xs text-muted-foreground">{feeling.desc}</p>
                </motion.button>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Affect labelling reduces impulse strength.
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'quiz' && selected) {
      const quiz = FEELING_QUIZZES[selected];
      const selectedFeeling = FEELINGS.find((f) => f.id === selected);
      const selectedOption = quiz.options.find(o => o.id === selectedAnswer);
      const isCorrect = selectedOption?.isCorrect;

      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setPhase('select');
                setSelectedAnswer(null);
                setShowExplanation(false);
              }}
              className="mb-6 text-muted-foreground text-sm"
            >
              ← Back
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-xs text-primary font-medium mb-1">
                You feel: {selectedFeeling?.label}
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {quiz.question}
              </h2>
            </motion.div>

            <div className="space-y-3 mb-6">
              {quiz.options.map((option, i) => {
                const isSelected = selectedAnswer === option.id;
                const showResult = showExplanation && isSelected;
                
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => !showExplanation && handleAnswerSelect(option.id)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                      showExplanation
                        ? option.isCorrect
                          ? 'bg-green-500/10 border-green-500/50'
                          : isSelected
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-dopa-surface border-border/30 opacity-50'
                        : 'bg-dopa-surface border-border/30 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        showExplanation && option.isCorrect
                          ? 'bg-green-500 text-white'
                          : showResult && !option.isCorrect
                            ? 'bg-red-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {showExplanation && option.isCorrect ? (
                          <Check className="w-4 h-4" />
                        ) : showResult && !option.isCorrect ? (
                          <X className="w-4 h-4" />
                        ) : (
                          option.id.toUpperCase()
                        )}
                      </div>
                      <p className="text-foreground text-sm flex-1">{option.text}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-xl mb-6 ${
                    isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOption.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showExplanation && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleQuizComplete}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
              >
                Continue
              </motion.button>
            )}
          </div>
        </div>
      );
    }

    if (phase === 'result') {
      const selectedFeeling = FEELINGS.find((f) => f.id === selected);
      const quiz = selected ? FEELING_QUIZZES[selected] : null;
      const correctOption = quiz?.options.find(o => o.isCorrect);

      return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-calm" />
          
          <div className="relative z-10 text-center max-w-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <MojoOrb state="regulating" size="lg" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-2"
            >
              You named it:
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-semibold text-foreground mb-4"
            >
              {selectedFeeling?.label}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6"
            >
              <p className="text-xs text-primary font-medium mb-1">Remember:</p>
              <p className="text-sm text-foreground">
                {correctOption?.text}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mb-12"
            >
              The urge doesn't disappear.
              <br />
              But now there's space between you and it.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleComplete}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-medium dopa-glow-button"
            >
              Continue
            </motion.button>
          </div>
        </div>
      );
    }

    // Complete phase
    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <MojoOrb state="steady" size="lg" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-foreground text-lg"
          >
            +1 Charge
          </motion.p>
        </div>
      </div>
    );
  }
);