import { QuizQuestion, UserAnswer, QuizSession } from '@/types/quiz';

export const calculateScore = (questions: QuizQuestion[], userAnswers: UserAnswer[]): number => {
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / questions.length) * 100);
};

export const checkAnswer = (question: QuizQuestion, selectedOptions: number[]): boolean => {
  if (question.answer.length !== selectedOptions.length) {
    return false;
  }
  
  return question.answer.every(answer => selectedOptions.includes(answer));
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateAverageTime = (userAnswers: UserAnswer[]): number => {
  if (userAnswers.length === 0) return 0;
  const totalTime = userAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);
  return Math.round(totalTime / userAnswers.length);
};

export const getPerformanceLevel = (score: number): { level: string; color: string; message: string } => {
  if (score >= 90) {
    return { level: 'Excellent', color: 'text-green-600', message: 'Outstanding performance!' };
  } else if (score >= 75) {
    return { level: 'Good', color: 'text-blue-600', message: 'Well done!' };
  } else if (score >= 60) {
    return { level: 'Average', color: 'text-yellow-600', message: 'Keep practicing!' };
  } else {
    return { level: 'Needs Improvement', color: 'text-red-600', message: 'More study required!' };
  }
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};