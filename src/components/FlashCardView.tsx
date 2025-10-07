'use client';

import { useState } from 'react';
import { FlashCard } from '@/types/quiz';

interface FlashCardViewProps {
  card: FlashCard;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  cardNumber?: number;
  totalCards?: number;
}

export default function FlashCardView({
  card,
  onNext,
  onPrevious,
  showNavigation = true,
  cardNumber,
  totalCards,
}: FlashCardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {cardNumber && totalCards && (
        <div className="text-center mb-4 text-gray-600 dark:text-gray-400">
          Card {cardNumber} of {totalCards}
        </div>
      )}

      <div
        className="relative w-full h-96 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* Front of card */}
          <div
            className="absolute w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Question
              </div>
              <div className="text-2xl text-center text-gray-900 dark:text-white">
                {card.front}
              </div>
              <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                Click to reveal answer
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute w-full h-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full h-full bg-white dark:bg-gray-800 border-2 border-green-500 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Answer
              </div>
              <div className="text-2xl text-center text-gray-900 dark:text-white">
                {card.back}
              </div>
              <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                Click to flip back
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNavigation && (
        <div className="flex justify-between mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
              setIsFlipped(false);
            }}
            disabled={!onPrevious}
            className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
              setIsFlipped(false);
            }}
            disabled={!onNext}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
