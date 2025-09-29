'use client';

import { QuizSession } from '@/types/quiz';
import { formatTime, calculateAverageTime, getPerformanceLevel } from '@/utils/quiz';

interface ResultsScreenProps {
  session: QuizSession;
  onRestartQuiz: () => void;
}

export default function ResultsScreen({ session, onRestartQuiz }: ResultsScreenProps) {
  const { score, userAnswers, questions, startTime, endTime } = session;
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalTime = endTime && startTime ? (() => {
    const endTimeObj = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const startTimeObj = typeof startTime === 'string' ? new Date(startTime) : startTime;
    return Math.floor((endTimeObj.getTime() - startTimeObj.getTime()) / 1000);
  })() : 0;
  const averageTimePerQuestion = calculateAverageTime(userAnswers);
  const performance = getPerformanceLevel(score);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card text-center">
        <div className="mb-8">
          <div className="animate-bounce-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quiz Complete!</h1>
            <div className="text-6xl font-bold mb-4 text-blue-600 dark:text-blue-400 animate-scale-in">
              {score}%
            </div>
          </div>
          <div className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
            <p className={`text-xl font-semibold ${performance.color}`}>
              {performance.level}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{performance.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-slide-in-left" style={{ animationDelay: '400ms' }}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{correctAnswers}</div>
            <div className="text-gray-700 dark:text-gray-200">Correct Answers</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">out of {questions.length}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-slide-in-up" style={{ animationDelay: '500ms' }}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(totalTime)}</div>
            <div className="text-gray-700 dark:text-gray-200">Total Time</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">minutes:seconds</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-slide-in-right" style={{ animationDelay: '600ms' }}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(averageTimePerQuestion)}</div>
            <div className="text-gray-700 dark:text-gray-200">Avg per Question</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">minutes:seconds</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Breakdown</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(answer => answer.questionIndex === index);
              const isCorrect = userAnswer?.isCorrect ?? false;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 truncate max-w-md">
                        {question.question}
                      </div>
                      <div className="text-sm text-gray-600">
                        Time: {formatTime(userAnswer?.timeSpent ?? 0)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onRestartQuiz}
            className="btn-primary px-8"
          >
            Take Quiz Again
          </button>
          <button
            onClick={() => window.location.href = '/QuizApp'}
            className="btn-secondary px-8"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}