import { useState, useEffect, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, Trophy, BookOpen } from 'lucide-react';
import { haptics } from '@/hooks/useHaptics';
import { LEARN_CARDS, LEARN_TOPICS, LearnCard } from '@/lib/learn-data';

interface BodyScanProps {
  onComplete: (correctAnswers: number) => void;
  onCancel: () => void;
}

interface QuizQuestion {
  card: LearnCard;
  topic: typeof LEARN_TOPICS[0];
  correctAnswer: string;
  options: string[];
}

const TOTAL_QUESTIONS = 10;

// Generate quiz questions from learn cards
function generateQuestions(): QuizQuestion[] {
  const shuffledCards = [...LEARN_CARDS].sort(() => Math.random() - 0.5);
  const selectedCards = shuffledCards.slice(0, TOTAL_QUESTIONS);
  
  return selectedCards.map(card => {
    const topic = LEARN_TOPICS.find(t => t.id === card.topicId)!;
    
    // Create wrong answers from other cards
    const otherCards = LEARN_CARDS.filter(c => c.id !== card.id);
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.title);
    
    // The correct answer is the card title
    const correctAnswer = card.title;
    
    // Shuffle all options
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    return {
      card,
      topic,
      correctAnswer,
      options,
    };
  });
}

export const BodyScan = forwardRef<HTMLDivElement, BodyScanProps>(
  function BodyScan({ onComplete, onCancel }, ref) {
    const [phase, setPhase] = useState<'intro' | 'active' | 'result' | 'complete'>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    
    const questions = useMemo(() => generateQuestions(), []);

    const startQuiz = () => {
      setPhase('active');
      haptics.selectionChanged();
    };

    const handleAnswer = (answer: string) => {
      if (showResult) return;
      
      setSelectedAnswer(answer);
      setShowResult(true);
      
      const isCorrect = answer === questions[currentQuestion].correctAnswer;
      
      if (isCorrect) {
        setCorrectCount(c => c + 1);
        haptics.notifySuccess();
      } else {
        haptics.notifyWarning();
      }
    };

    const nextQuestion = () => {
      if (currentQuestion >= TOTAL_QUESTIONS - 1) {
        setPhase('complete');
        haptics.notifySuccess();
      } else {
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    };

    if (phase === 'intro') {
      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950 via-purple-950 to-background" />
          
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
                Knowledge Quiz
              </h1>
              <p className="text-muted-foreground text-sm">
                Test what you've learned
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-10"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-pink-500/30 flex items-center justify-center">
                <Brain className="w-16 h-16 text-violet-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="dopa-card mb-8"
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                Answer {TOTAL_QUESTIONS} questions based on the Learn cards. See how much you've absorbed!
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-xs text-violet-300">
                  Multiple Choice
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-xs text-purple-300">
                  {TOTAL_QUESTIONS} Questions
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-xs text-pink-300">
                  Earn Tokens
                </span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startQuiz}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg"
            >
              Start Quiz
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Questions are randomly selected from the Learn feed
            </motion.p>
          </div>
        </div>
      );
    }

    if (phase === 'active') {
      const question = questions[currentQuestion];
      const isCorrect = selectedAnswer === question.correctAnswer;

      return (
        <div ref={ref} className="min-h-screen flex flex-col px-6 py-8 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950 via-purple-950 to-background" />
          
          <div className="relative z-10 flex flex-col flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={onCancel} className="text-muted-foreground text-sm">
                Exit
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentQuestion + 1}/{TOTAL_QUESTIONS}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i < currentQuestion
                          ? 'bg-violet-500'
                          : i === currentQuestion
                          ? 'bg-violet-400 scale-125'
                          : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Topic badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${question.topic.color} text-white`}>
                {question.topic.icon} {question.topic.label}
              </span>
            </motion.div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <div className="text-center mb-6">
                  <p className="text-muted-foreground text-sm mb-3">
                    Which concept matches this description?
                  </p>
                  <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                    <p className="text-foreground text-sm leading-relaxed">
                      "{question.card.content}"
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, i) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === question.correctAnswer;
                    
                    let bgClass = 'bg-muted/10 border-border/30';
                    if (showResult) {
                      if (isCorrectOption) {
                        bgClass = 'bg-green-500/20 border-green-500/50';
                      } else if (isSelected && !isCorrectOption) {
                        bgClass = 'bg-red-500/20 border-red-500/50';
                      }
                    } else if (isSelected) {
                      bgClass = 'bg-violet-500/20 border-violet-500/50';
                    }

                    return (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${bgClass} ${
                          !showResult ? 'active:scale-[0.98]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-foreground text-sm font-medium pr-2">
                            {option}
                          </span>
                          {showResult && isCorrectOption && (
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          )}
                          {showResult && isSelected && !isCorrectOption && (
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Result feedback */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <div className={`p-4 rounded-xl ${
                        isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                      }`}>
                        <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                          {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                        </p>
                        {question.card.fact && (
                          <p className="text-xs text-muted-foreground">
                            💡 {question.card.fact}
                          </p>
                        )}
                      </div>

                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={nextQuestion}
                        className="w-full mt-4 py-3 rounded-xl bg-violet-600 text-white font-medium"
                      >
                        {currentQuestion >= TOTAL_QUESTIONS - 1 ? 'See Results' : 'Next Question'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Complete phase
    const percentage = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const grade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';
    const message = percentage >= 80 
      ? "Outstanding! You've really been paying attention!" 
      : percentage >= 60 
      ? "Good job! Keep using the Learn feature!"
      : percentage >= 40
      ? "Not bad! Try reviewing more cards."
      : "Keep learning! Check out the Learn tab.";

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950 via-purple-950 to-background" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-pink-500/40 flex items-center justify-center mx-auto border border-violet-400/30">
              <Trophy className="w-14 h-14 text-violet-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            Grade: {grade}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-violet-400 mb-2"
          >
            {correctCount}/{TOTAL_QUESTIONS}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto"
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 inline-block"
          >
            <span className="text-primary font-medium">+1 Token earned</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onComplete(correctCount)}
            className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg"
          >
            Collect Token
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-muted-foreground"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Visit Learn to study more</span>
          </motion.div>
        </div>
      </div>
    );
  }
);
