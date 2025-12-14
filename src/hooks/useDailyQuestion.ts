import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'daily_question_data';

// Weekly rotating questions - deep self-knowledge builders
const WEEKLY_QUESTIONS = [
  { week: 1, question: 'What were you avoiding today?' },
  { week: 2, question: 'What gave you energy today?' },
  { week: 3, question: 'What felt pointless today?' },
  { week: 4, question: 'What did you do even though you didn\'t want to?' },
];

interface QuestionData {
  answers: Array<{
    question: string;
    answer: string;
    timestamp: string;
    week: number;
  }>;
  lastAnsweredDate: string | null;
}

const getWeekNumber = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(days / 7) % 4 + 1;
};

const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getInitialData = (): QuestionData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    answers: [],
    lastAnsweredDate: null,
  };
};

export function useDailyQuestion() {
  const [data, setData] = useState<QuestionData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const currentWeek = useMemo(() => getWeekNumber(), []);
  
  const currentQuestion = useMemo(() => {
    return WEEKLY_QUESTIONS.find(q => q.week === currentWeek)?.question || WEEKLY_QUESTIONS[0].question;
  }, [currentWeek]);

  const hasAnsweredToday = useMemo(() => {
    return data.lastAnsweredDate === getTodayKey();
  }, [data.lastAnsweredDate]);

  const submitAnswer = useCallback((answer: string) => {
    if (answer.trim().length === 0) return;
    
    setData(prev => ({
      answers: [
        {
          question: currentQuestion,
          answer: answer.trim(),
          timestamp: new Date().toISOString(),
          week: currentWeek,
        },
        ...prev.answers.slice(0, 29), // Keep last 30 answers
      ],
      lastAnsweredDate: getTodayKey(),
    }));
  }, [currentQuestion, currentWeek]);

  const skipToday = useCallback(() => {
    setData(prev => ({
      ...prev,
      lastAnsweredDate: getTodayKey(),
    }));
  }, []);

  // Get recent answers for reflection
  const recentAnswers = useMemo(() => {
    return data.answers.slice(0, 7);
  }, [data.answers]);

  return {
    currentQuestion,
    hasAnsweredToday,
    submitAnswer,
    skipToday,
    recentAnswers,
    currentWeek,
  };
}