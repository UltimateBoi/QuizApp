'use client';

import { useState } from 'react';
import { FlashCardDeck } from '@/types/quiz';
import FlashCardView from './FlashCardView';

interface FlashCardStudyProps {
  deck: FlashCardDeck;
  onExit: () => void;
}

export default function FlashCardStudy({ deck, onExit }: FlashCardStudyProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleNext = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const currentCard = deck.cards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onExit}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center"
        >
          ← Back to Decks
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {deck.name}
        </h2>
        {deck.description && (
          <p className="text-gray-600 dark:text-gray-400">{deck.description}</p>
        )}
      </div>

      <FlashCardView
        card={currentCard}
        onNext={currentCardIndex < deck.cards.length - 1 ? handleNext : undefined}
        onPrevious={currentCardIndex > 0 ? handlePrevious : undefined}
        cardNumber={currentCardIndex + 1}
        totalCards={deck.cards.length}
      />

      <div className="mt-8 text-center">
        <button onClick={onExit} className="btn-secondary px-6 py-2">
          Exit Study Mode
        </button>
      </div>
    </div>
  );
}
