'use client';

import { QuizQuestion } from '@/types/quiz';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptions: number[];
  onOptionSelect: (optionIndex: number) => void;
  onSubmitAnswer: () => void;
  showExplanation: boolean;
  isAnswered: boolean;
  autoSubmit: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptions,
  onOptionSelect,
  onSubmitAnswer,
  showExplanation,
  isAnswered,
  autoSubmit
}: QuestionCardProps) {
  
  const isMultiSelect = question.type === 'multiSelect';
  const hasSelectedAnswers = selectedOptions.length > 0;
  const canSubmit = hasSelectedAnswers && !isAnswered;
  return (
    <div className="card max-w-4xl mx-auto animate-slide-in-up shadow-2xl border-2 border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const isCorrect = question.answer.includes(index);
          
          let optionClasses = "w-full p-4 text-left rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] transform ";
          
          if (showExplanation) {
            if (isCorrect) {
              optionClasses += "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border-green-400 dark:border-green-700 text-green-900 dark:text-green-100 shadow-lg animate-bounce-in";
            } else if (isSelected && !isCorrect) {
              optionClasses += "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 border-red-400 dark:border-red-700 text-red-900 dark:text-red-100 shadow-lg animate-scale-in";
            } else {
              optionClasses += "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400";
            }
          } else {
            if (isSelected) {
              optionClasses += "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300 dark:ring-blue-700 scale-[1.02] shadow-lg";
            } else {
              optionClasses += "bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md";
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

      {/* Submit button for multi-select questions or when auto-submit is disabled */}
      {!isAnswered && !showExplanation && (isMultiSelect || !autoSubmit) && (
        <div className="mt-6">
          <button
            onClick={onSubmitAnswer}
            disabled={!canSubmit}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transform'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isMultiSelect ? 'Submit Answer' : 'Submit'}
          </button>
        </div>
      )}

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