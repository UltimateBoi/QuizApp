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
    <div className="card max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const isCorrect = question.answer.includes(index);
          
          let optionClasses = "w-full p-4 text-left rounded-lg border transition-all duration-200 ";
          
          if (showExplanation) {
            if (isCorrect) {
              optionClasses += "bg-success-50 border-green-300 text-green-800";
            } else if (isSelected && !isCorrect) {
              optionClasses += "bg-error-50 border-red-300 text-red-800";
            } else {
              optionClasses += "bg-gray-50 border-gray-200 text-gray-600";
            }
          } else {
            if (isSelected) {
              optionClasses += "bg-primary-50 border-primary-300 text-primary-800";
            } else {
              optionClasses += "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => !isAnswered && onOptionSelect(index)}
              disabled={isAnswered}
              className={optionClasses}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 mr-3 rounded-full border border-current flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-left">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
          <p className="text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}