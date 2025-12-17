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

const FEELING_QUIZZES: Record<string, FeelingQuiz[]> = {
  bored: [
    {
      question: "What's the best way to handle boredom without quick dopamine?",
      options: [
        { id: 'a', text: 'Scroll social media for a few minutes', isCorrect: false, explanation: 'This feeds the craving for instant stimulation and reinforces the loop.' },
        { id: 'b', text: 'Sit with the boredom for 2 minutes, then do something physical', isCorrect: true, explanation: 'Tolerating boredom briefly resets your baseline. Physical activity provides healthy dopamine.' },
        { id: 'c', text: 'Distract yourself with food or snacks', isCorrect: false, explanation: 'Replacing one dopamine hit with another doesn\'t address the underlying pattern.' },
      ],
    },
    {
      question: "Why is boredom actually valuable for your brain?",
      options: [
        { id: 'a', text: 'It signals you need more entertainment', isCorrect: false, explanation: 'Boredom isn\'t a problem to solve with more stimulation — it\'s a reset opportunity.' },
        { id: 'b', text: 'It\'s the birthplace of creativity and helps reset dopamine sensitivity', isCorrect: true, explanation: 'Boredom allows your brain to wander, make connections, and recover from overstimulation.' },
        { id: 'c', text: 'It means you\'re not being productive enough', isCorrect: false, explanation: 'Constant productivity isn\'t healthy. Boredom serves an important mental function.' },
      ],
    },
    {
      question: "When bored, what happens if you immediately grab your phone?",
      options: [
        { id: 'a', text: 'You satisfy a genuine need efficiently', isCorrect: false, explanation: 'The phone provides temporary relief but strengthens the need for constant stimulation.' },
        { id: 'b', text: 'You train your brain to need constant stimulation', isCorrect: true, explanation: 'Each instant response to boredom lowers your tolerance for low-stimulation moments.' },
        { id: 'c', text: 'Nothing — it\'s a neutral choice', isCorrect: false, explanation: 'Every action reinforces neural pathways. Phone-reaching becomes automatic over time.' },
      ],
    },
  ],
  stressed: [
    {
      question: "When stress hits, what actually helps your nervous system?",
      options: [
        { id: 'a', text: 'Take 6 slow breaths, exhaling longer than inhaling', isCorrect: true, explanation: 'Extended exhales activate your parasympathetic system and reduce cortisol.' },
        { id: 'b', text: 'Push through and keep working harder', isCorrect: false, explanation: 'This increases cortisol and can lead to burnout. Regulation first, then action.' },
        { id: 'c', text: 'Vent about it immediately to someone', isCorrect: false, explanation: 'Venting can sometimes amplify stress. Calming first is more effective.' },
      ],
    },
    {
      question: "Why do people often reach for screens when stressed?",
      options: [
        { id: 'a', text: 'Screens genuinely reduce stress hormones', isCorrect: false, explanation: 'Screen use often increases arousal rather than promoting true calm.' },
        { id: 'b', text: 'It\'s an escape that numbs but doesn\'t regulate', isCorrect: true, explanation: 'Scrolling distracts from stress but doesn\'t process it. The tension stays stored in your body.' },
        { id: 'c', text: 'It\'s the most effective coping strategy', isCorrect: false, explanation: 'Research shows physical activity, breathing, and nature outperform screen-based coping.' },
      ],
    },
    {
      question: "What's the connection between stress and impulsive behavior?",
      options: [
        { id: 'a', text: 'Stress has no effect on self-control', isCorrect: false, explanation: 'Chronic stress significantly depletes willpower and prefrontal cortex function.' },
        { id: 'b', text: 'Stress improves decision-making', isCorrect: false, explanation: 'Stress shifts the brain toward reactive, short-term thinking.' },
        { id: 'c', text: 'Cortisol depletes dopamine, making you seek quick hits', isCorrect: true, explanation: 'Stress hormones deplete your reward system, making quick dopamine sources more tempting.' },
      ],
    },
  ],
  lonely: [
    {
      question: "What's a healthy response to feeling lonely?",
      options: [
        { id: 'a', text: 'Browse dating apps or social media', isCorrect: false, explanation: 'Passive scrolling often increases loneliness. It mimics connection without providing it.' },
        { id: 'b', text: 'Send a genuine message to one person you care about', isCorrect: true, explanation: 'Real connection, even small, is more fulfilling than passive consumption.' },
        { id: 'c', text: 'Isolate further until you feel better', isCorrect: false, explanation: 'Isolation usually deepens loneliness. Small steps toward connection help.' },
      ],
    },
    {
      question: "Why does scrolling social media often make loneliness worse?",
      options: [
        { id: 'a', text: 'You\'re comparing your inside to others\' highlight reels', isCorrect: true, explanation: 'Social comparison and passive consumption increase feelings of disconnection.' },
        { id: 'b', text: 'The content is boring', isCorrect: false, explanation: 'The issue isn\'t entertainment value — it\'s the lack of genuine reciprocal connection.' },
        { id: 'c', text: 'You\'re not following the right accounts', isCorrect: false, explanation: 'The medium itself — passive consumption vs. active connection — is the issue.' },
      ],
    },
    {
      question: "What type of connection does your brain actually crave?",
      options: [
        { id: 'a', text: 'Seeing updates from many acquaintances', isCorrect: false, explanation: 'Breadth of connections matters less than depth for wellbeing.' },
        { id: 'b', text: 'Getting lots of likes and comments', isCorrect: false, explanation: 'Validation metrics don\'t satisfy the need for real connection.' },
        { id: 'c', text: 'Reciprocal, real-time interaction with someone who knows you', isCorrect: true, explanation: 'Face-to-face or voice interaction releases oxytocin. Passive content doesn\'t.' },
      ],
    },
  ],
  avoiding: [
    {
      question: "When you're avoiding something difficult, what works best?",
      options: [
        { id: 'a', text: 'Commit to just 2 minutes of the avoided task', isCorrect: true, explanation: 'Tiny starts reduce the mental barrier. Action often follows momentum.' },
        { id: 'b', text: 'Wait until you feel motivated', isCorrect: false, explanation: 'Motivation often comes after starting, not before. Waiting can lead to more avoidance.' },
        { id: 'c', text: 'Do something fun first as a reward', isCorrect: false, explanation: 'Pre-rewards can become procrastination. Small action first, then reward.' },
      ],
    },
    {
      question: "What usually happens when you give in to avoidance?",
      options: [
        { id: 'a', text: 'You feel better and can tackle it later refreshed', isCorrect: false, explanation: 'Avoidance usually increases anxiety about the task over time.' },
        { id: 'b', text: 'The task stays the same size', isCorrect: false, explanation: 'Avoided tasks often feel bigger the longer you wait, due to anxiety buildup.' },
        { id: 'c', text: 'Short-term relief but longer-term anxiety buildup', isCorrect: true, explanation: 'Avoidance is borrowing relief from your future self at high interest.' },
      ],
    },
    {
      question: "Why does your brain prefer distractions over difficult tasks?",
      options: [
        { id: 'a', text: 'Distractions are genuinely more important', isCorrect: false, explanation: 'Your brain prioritizes immediate comfort, not actual importance.' },
        { id: 'b', text: 'Immediate rewards feel better than delayed ones', isCorrect: true, explanation: 'Present bias: your brain heavily discounts future benefits for immediate comfort.' },
        { id: 'c', text: 'Hard tasks aren\'t worth doing', isCorrect: false, explanation: 'The hardest tasks are often the most meaningful. Resistance is a signal of importance.' },
      ],
    },
  ],
  restless: [
    {
      question: "What's the best outlet for restless energy?",
      options: [
        { id: 'a', text: 'Channel it into physical movement for 5+ minutes', isCorrect: true, explanation: 'Physical activity processes restless energy and releases healthy neurotransmitters.' },
        { id: 'b', text: 'Try to ignore it and sit still', isCorrect: false, explanation: 'Suppressing restlessness often makes it worse. Movement helps discharge it.' },
        { id: 'c', text: 'Rapid-switch between apps and tasks', isCorrect: false, explanation: 'This feeds the agitation rather than resolving it. Focused action is better.' },
      ],
    },
    {
      question: "What does restlessness often signal?",
      options: [
        { id: 'a', text: 'You need more screen time', isCorrect: false, explanation: 'Screens often increase restlessness by providing fragmented stimulation.' },
        { id: 'b', text: 'Your body has energy that needs physical expression', isCorrect: true, explanation: 'Restlessness is often pent-up physical energy that movement can release.' },
        { id: 'c', text: 'Something is wrong with you', isCorrect: false, explanation: 'Restlessness is normal and often a signal, not a problem to fix with distraction.' },
      ],
    },
    {
      question: "Why does scrolling feel tempting when restless but make it worse?",
      options: [
        { id: 'a', text: 'It doesn\'t — scrolling helps restlessness', isCorrect: false, explanation: 'Scrolling provides mental stimulation without physical discharge.' },
        { id: 'b', text: 'It gives micro-stimulation without resolving the physical agitation', isCorrect: true, explanation: 'The rapid novelty of scrolling feeds mental restlessness while physical tension stays trapped.' },
        { id: 'c', text: 'The content is too boring', isCorrect: false, explanation: 'The issue is the mismatch between physical need and mental-only stimulation.' },
      ],
    },
  ],
  empty: [
    {
      question: "When you feel empty and low, what helps restore energy?",
      options: [
        { id: 'a', text: 'Consume high-stimulation content for a boost', isCorrect: false, explanation: 'This creates a spike-crash cycle that deepens the emptiness.' },
        { id: 'b', text: 'Rest or do something gentle and restorative', isCorrect: true, explanation: 'Low energy often signals a need for recovery, not more stimulation.' },
        { id: 'c', text: 'Force yourself to be productive anyway', isCorrect: false, explanation: 'Pushing through emptiness can lead to burnout. Gentle restoration works better.' },
      ],
    },
    {
      question: "What's actually happening when you feel empty?",
      options: [
        { id: 'a', text: 'You\'re lazy and need to push harder', isCorrect: false, explanation: 'Emptiness is a signal, not a character flaw. Judgment makes it worse.' },
        { id: 'b', text: 'Your dopamine system may be depleted and needs gentle recovery', isCorrect: true, explanation: 'Chronic overstimulation can deplete baseline dopamine. Rest helps restore it.' },
        { id: 'c', text: 'You need something exciting to snap out of it', isCorrect: false, explanation: 'Seeking excitement when depleted often deepens the crash afterward.' },
      ],
    },
    {
      question: "Why do we often seek stimulation when already exhausted?",
      options: [
        { id: 'a', text: 'We confuse stimulation with restoration', isCorrect: true, explanation: 'Stimulation feels like energy but actually depletes reserves further. True rest restores.' },
        { id: 'b', text: 'Stimulation is genuinely restorative', isCorrect: false, explanation: 'There\'s a difference between arousal and recovery. Rest is underrated.' },
        { id: 'c', text: 'We\'re naturally wired to avoid rest', isCorrect: false, explanation: 'We\'re wired to seek rewards, but our environment exploits this. Rest is necessary.' },
      ],
    },
  ],
};

// Function to get a random quiz for a feeling
const getRandomQuiz = (feelingId: string): FeelingQuiz => {
  const quizzes = FEELING_QUIZZES[feelingId];
  return quizzes[Math.floor(Math.random() * quizzes.length)];
};

export const NameThePull = forwardRef<HTMLDivElement, NameThePullProps>(
  function NameThePull({ onComplete, onCancel }, ref) {
    const [selected, setSelected] = useState<string | null>(null);
    const [currentQuiz, setCurrentQuiz] = useState<FeelingQuiz | null>(null);
    const [phase, setPhase] = useState<'select' | 'quiz' | 'result' | 'complete'>('select');
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleSelect = (id: string) => {
      setSelected(id);
      setCurrentQuiz(getRandomQuiz(id));
      setPhase('quiz');
    };

    const handleAnswerSelect = (answerId: string) => {
      setSelectedAnswer(answerId);
      setShowExplanation(true);
      
      const isCorrect = currentQuiz?.options.find(o => o.id === answerId)?.isCorrect;
      
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

    if (phase === 'quiz' && selected && currentQuiz) {
      const selectedFeeling = FEELINGS.find((f) => f.id === selected);
      const selectedOption = currentQuiz.options.find(o => o.id === selectedAnswer);
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
                {currentQuiz.question}
              </h2>
            </motion.div>

            <div className="space-y-3 mb-6">
              {currentQuiz.options.map((option, i) => {
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
      const correctOption = currentQuiz?.options.find(o => o.isCorrect);

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