'use client';

import { useState } from 'react';
import { CustomQuiz, FlashCard } from '@/types/quiz';

interface QuizToFlashCardsProps {
  quizzes: CustomQuiz[];
  onConvert: (deckData: {
    name: string;
    description: string;
    cards: Omit<FlashCard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>[];
  }) => void;
  onCancel: () => void;
}

export default function QuizToFlashCards({ quizzes, onConvert, onCancel }: QuizToFlashCardsProps) {
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [deckName, setDeckName] = useState('');

  const handleConvert = () => {
    const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
    if (!selectedQuiz) {
      alert('Please select a quiz');
      return;
    }

    const cards: Omit<FlashCard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>[] = selectedQuiz.questions.map(question => ({
      front: question.question,
      back: `${question.options.filter((_, i) => question.answer.includes(i)).join(', ')}\n\n${question.explanation}`,
    }));

    const finalDeckName = deckName.trim() || `${selectedQuiz.name} - Flash Cards`;

    onConvert({
      name: finalDeckName,
      description: `Flash cards created from quiz: ${selectedQuiz.name}`,
      cards,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create Flash Cards from Quiz
      </h2>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => {
              setSelectedQuizId(e.target.value);
              const quiz = quizzes.find(q => q.id === e.target.value);
              if (quiz && !deckName) {
                setDeckName(`${quiz.name} - Flash Cards`);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">-- Select a quiz --</option>
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.name} ({quiz.questions.length} questions)
              </option>
            ))}
          </select>
        </div>

        {selectedQuizId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deck Name
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter deck name"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-600 dark:text-blue-400 mr-3 text-xl">ℹ️</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Conversion Info</p>
                  <p>
                    Each question will become a flash card with the question on the front
                    and the correct answer(s) with explanation on the back.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleConvert}
            disabled={!selectedQuizId}
            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Flash Cards
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary px-8 py-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
