'use client';

import { FlashCardDeck } from '@/types/quiz';

interface FlashCardManagerProps {
  decks: FlashCardDeck[];
  onCreateDeck: () => void;
  onEditDeck: (deck: FlashCardDeck) => void;
  onDeleteDeck: (id: string) => void;
  onStudyDeck: (deck: FlashCardDeck) => void;
  onCreateFromQuiz: () => void;
}

export default function FlashCardManager({
  decks,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
  onStudyDeck,
  onCreateFromQuiz,
}: FlashCardManagerProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Flash Card Decks
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCreateFromQuiz}
            className="btn-secondary px-4 py-2"
          >
            Create from Quiz
          </button>
          <button
            onClick={onCreateDeck}
            className="btn-primary px-4 py-2"
          >
            + New Deck
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Flash Card Decks Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first deck or convert a quiz into flash cards
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCreateDeck} className="btn-primary px-6 py-2">
              Create New Deck
            </button>
            <button onClick={onCreateFromQuiz} className="btn-secondary px-6 py-2">
              Create from Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="card hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {deck.name}
                </h3>
                {deck.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {deck.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{deck.cards.length} cards</span>
                <span>
                  {new Date(deck.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onStudyDeck(deck)}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  Study
                </button>
                <button
                  onClick={() => onEditDeck(deck)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
                      onDeleteDeck(deck.id);
                    }
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-4 py-2 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
