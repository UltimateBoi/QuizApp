export interface QuizQuestion {
  type: 'singleSelect' | 'multiSelect';
  question: string;
  options: string[];
  answer: number[];
  explanation: string;
}

export interface CustomQuiz {
  id: string;
  name: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: Date | string;
  updatedAt: Date | string;
  isDefault?: boolean;
  tags?: string[];
}

export interface UserAnswer {
  questionIndex: number;
  selectedOptions: number[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizSession {
  id: string;
  quizId: string;
  quizName: string;
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  startTime: Date | string;
  endTime?: Date | string;
  score: number;
  totalQuestions: number;
}

export interface QuizStatistics {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number; // in seconds
  averageTimePerQuestion: number;
  topicPerformance: { [topic: string]: number };
  recentSessions: QuizSession[];
}

export interface QuizCreationData {
  name: string;
  description: string;
  questions: QuizQuestion[];
  tags?: string[];
}