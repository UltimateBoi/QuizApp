'use client';

import { QuizQuestion } from '@/types/quiz';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptions: number[];
  onOptionSelect: (optionIndex: number) => void;
  showExplanation: boolean;
  isAnswered: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptions,
  onOptionSelect,
  showExplanation,
  isAnswered
}: QuestionCardProps) {
  return (
    <div className="card max-w-4xl mx-auto animate-slide-in-up">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const isCorrect = question.answer.includes(index);
          
          let optionClasses = "w-full p-4 text-left rounded-lg border transition-all duration-300 hover:scale-102 transform ";
          
          if (showExplanation) {
            if (isCorrect) {
              optionClasses += "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 animate-bounce-in";
            } else if (isSelected && !isCorrect) {
              optionClasses += "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 animate-scale-in";
            } else {
              optionClasses += "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400";
            }
          } else {
            if (isSelected) {
              optionClasses += "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 ring-2 ring-blue-200 dark:ring-blue-800 scale-105";
            } else {
              optionClasses += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-200 dark:hover:border-blue-700";
            }
          }

          return (
            <button
              key={index}
              onClick={() => !isAnswered && onOptionSelect(index)}
              disabled={isAnswered}
              className={optionClasses}
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <div className="flex items-center">
                <span className={`flex-shrink-0 w-8 h-8 mr-3 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  showExplanation && isCorrect 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : showExplanation && isSelected && !isCorrect
                    ? 'bg-red-600 border-red-600 text-white'
                    : isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-current'
                }`}>
                  {showExplanation && isCorrect ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : showExplanation && isSelected && !isCorrect ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="text-left">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-slide-in-up">
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
  );
}