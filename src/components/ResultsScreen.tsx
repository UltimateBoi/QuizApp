'use client';

import { useState } from 'react';
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
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

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
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Question Breakdown</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(answer => answer.questionIndex === index);
              const isCorrect = userAnswer?.isCorrect ?? false;
              const isExpanded = expandedQuestion === index;
              
              return (
                <div key={index}>
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-md">
                          {question.question}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Time: {formatTime(userAnswer?.timeSpent ?? 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 animate-slide-in-up">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{question.question}</h4>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelectedOption = userAnswer?.selectedOptions.includes(optionIndex);
                            const isCorrectOption = question.answer.includes(optionIndex);
                            
                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectOption
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-700'
                                    : isSelectedOption && !isCorrectOption
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-700'
                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className={`w-6 h-6 mr-3 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                    isCorrectOption
                                      ? 'bg-green-600 border-green-600 text-white'
                                      : isSelectedOption && !isCorrectOption
                                      ? 'bg-red-600 border-red-600 text-white'
                                      : 'border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {isCorrectOption ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : isSelectedOption && !isCorrectOption ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      String.fromCharCode(65 + optionIndex)
                                    )}
                                  </span>
                                  <span className={`${
                                    isCorrectOption
                                      ? 'text-green-900 dark:text-green-100'
                                      : isSelectedOption && !isCorrectOption
                                      ? 'text-red-900 dark:text-red-100'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                              <svg className="w-full h-full text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Explanation:</h4>
                              <p className="text-blue-700 dark:text-blue-300">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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