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
  const totalTime = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
  const averageTimePerQuestion = calculateAverageTime(userAnswers);
  const performance = getPerformanceLevel(score);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
          <div className="text-6xl font-bold mb-4 text-primary-600">
            {score}%
          </div>
          <p className={`text-xl font-semibold ${performance.color}`}>
            {performance.level}
          </p>
          <p className="text-gray-600 mt-2">{performance.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{correctAnswers}</div>
            <div className="text-gray-600">Correct Answers</div>
            <div className="text-sm text-gray-500">out of {questions.length}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{formatTime(totalTime)}</div>
            <div className="text-gray-600">Total Time</div>
            <div className="text-sm text-gray-500">minutes:seconds</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{formatTime(averageTimePerQuestion)}</div>
            <div className="text-gray-600">Avg per Question</div>
            <div className="text-sm text-gray-500">minutes:seconds</div>
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
            onClick={() => window.location.href = '/'}
            className="btn-secondary px-8"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}