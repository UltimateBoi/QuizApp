'use client';

import { useState } from 'react';
import { FlashCard, FlashCardDeck } from '@/types/quiz';

interface FlashCardCreatorProps {
  deck?: FlashCardDeck;
  onSave: (deckData: Omit<FlashCardDeck, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function FlashCardCreator({ deck, onSave, onCancel }: FlashCardCreatorProps) {
  const [deckName, setDeckName] = useState(deck?.name || '');
  const [deckDescription, setDeckDescription] = useState(deck?.description || '');
  const [cards, setCards] = useState<Omit<FlashCard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>[]>(
    deck?.cards.map(card => ({
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
    })) || []
  );
  const [currentFront, setCurrentFront] = useState('');
  const [currentBack, setCurrentBack] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddCard = () => {
    if (!currentFront.trim() || !currentBack.trim()) return;

    const newCard = {
      front: currentFront.trim(),
      back: currentBack.trim(),
    };

    if (editingIndex !== null) {
      const updatedCards = [...cards];
      updatedCards[editingIndex] = newCard;
      setCards(updatedCards);
      setEditingIndex(null);
    } else {
      setCards([...cards, newCard]);
    }

    setCurrentFront('');
    setCurrentBack('');
  };

  const handleEditCard = (index: number) => {
    const card = cards[index];
    setCurrentFront(card.front);
    setCurrentBack(card.back);
    setEditingIndex(index);
  };

  const handleDeleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!deckName.trim() || cards.length === 0) {
      alert('Please provide a deck name and at least one card');
      return;
    }

    const deckData: Omit<FlashCardDeck, 'id' | 'createdAt' | 'updatedAt'> = {
      name: deckName.trim(),
      description: deckDescription.trim(),
      cards: cards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        deckId: deck?.id || 'temp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    onSave(deckData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {deck ? 'Edit Flash Card Deck' : 'Create Flash Card Deck'}
        </h2>
      </div>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deck Name *
          </label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., JavaScript Fundamentals"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Brief description of this deck"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingIndex !== null ? 'Edit Card' : 'Add New Card'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Front (Question) *
              </label>
              <textarea
                value={currentFront}
                onChange={(e) => setCurrentFront(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="What appears on the front of the card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Back (Answer) *
              </label>
              <textarea
                value={currentBack}
                onChange={(e) => setCurrentBack(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="What appears on the back of the card"
              />
            </div>

            <button
              onClick={handleAddCard}
              className="btn-primary px-6 py-2"
            >
              {editingIndex !== null ? 'Update Card' : 'Add Card'}
            </button>
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setCurrentFront('');
                  setCurrentBack('');
                }}
                className="btn-secondary px-6 py-2 ml-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cards ({cards.length})
            </h3>
            <div className="space-y-3">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Front:
                        </span>
                        <p className="text-gray-900 dark:text-white">{card.front}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Back:
                        </span>
                        <p className="text-gray-900 dark:text-white">{card.back}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditCard(index)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCard(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="btn-primary px-8 py-3"
          >
            Save Deck
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
