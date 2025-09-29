'use client';

import { QuizSession } from '@/types/quiz';
import { formatTime } from '@/utils/quiz';

interface QuizHistoryViewerProps {
  session: QuizSession;
  onClose: () => void;
}

export default function QuizHistoryViewer({ session, onClose }: QuizHistoryViewerProps) {
  const { questions, userAnswers, startTime, endTime, score } = session;
  
  const totalTime = endTime && startTime ? (() => {
    const endTimeObj = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const startTimeObj = typeof startTime === 'string' ? new Date(startTime) : startTime;
    return Math.floor((endTimeObj.getTime() - startTimeObj.getTime()) / 1000);
  })() : 0;

  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const averageTime = Math.floor(userAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0) / userAnswers.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Results</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {typeof startTime === 'string' ? new Date(startTime).toLocaleString() : startTime.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}%</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Final Score</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}/{questions.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Correct Answers</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(totalTime)}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Total Time</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatTime(averageTime)}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Avg. per Question</div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Question by Question Review</h3>
            
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer?.isCorrect || false;
              const selectedOptions = userAnswer?.selectedOptions || [];
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg p-6 transition-all duration-300 ${
                    isCorrect 
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                      : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatTime(userAnswer?.timeSpent || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-gray-900 dark:text-white mb-4 font-medium">
                    {question.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedOptions.includes(optionIndex);
                      const isCorrectOption = question.answer.includes(optionIndex);
                      
                      return (
                        <div 
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 flex items-center ${
                            isCorrectOption 
                              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                              : isSelected 
                                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-8 h-8 mr-3 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCorrectOption 
                              ? 'bg-green-600 text-white' 
                              : isSelected 
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {isCorrectOption ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : isSelected ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              String.fromCharCode(65 + optionIndex)
                            )}
                          </span>
                          <span className={`${
                            isCorrectOption || isSelected 
                              ? 'font-medium text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {option}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Explanation:
                      </h5>
                      <p className="text-blue-700 dark:text-blue-300">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Close Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}