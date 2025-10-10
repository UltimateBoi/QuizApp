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
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

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

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Check if it's an array of cards
      if (Array.isArray(parsed)) {
        const importedCards = parsed.map((item: any) => ({
          front: item.front || '',
          back: item.back || '',
          difficulty: item.difficulty || 'medium',
        }));
        setCards([...cards, ...importedCards]);
        setJsonInput('');
        setJsonError('');
        setShowJsonImport(false);
      } else if (parsed.cards && Array.isArray(parsed.cards)) {
        // Full deck format
        if (parsed.name) setDeckName(parsed.name);
        if (parsed.description) setDeckDescription(parsed.description);
        const importedCards = parsed.cards.map((item: any) => ({
          front: item.front || '',
          back: item.back || '',
          difficulty: item.difficulty || 'medium',
        }));
        setCards([...cards, ...importedCards]);
        setJsonInput('');
        setJsonError('');
        setShowJsonImport(false);
      } else {
        setJsonError('Invalid JSON format. Expected an array of cards or a deck object with a cards array.');
      }
    } catch (err) {
      setJsonError('Invalid JSON: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleJsonImportReplace = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Check if it's an array of cards
      if (Array.isArray(parsed)) {
        const importedCards = parsed.map((item: any) => ({
          front: item.front || '',
          back: item.back || '',
          difficulty: item.difficulty || 'medium',
        }));
        setCards(importedCards);
        setJsonInput('');
        setJsonError('');
        setShowJsonImport(false);
      } else if (parsed.cards && Array.isArray(parsed.cards)) {
        // Full deck format
        if (parsed.name) setDeckName(parsed.name);
        if (parsed.description) setDeckDescription(parsed.description);
        const importedCards = parsed.cards.map((item: any) => ({
          front: item.front || '',
          back: item.back || '',
          difficulty: item.difficulty || 'medium',
        }));
        setCards(importedCards);
        setJsonInput('');
        setJsonError('');
        setShowJsonImport(false);
      } else {
        setJsonError('Invalid JSON format. Expected an array of cards or a deck object with a cards array.');
      }
    } catch (err) {
      setJsonError('Invalid JSON: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const generateSampleJson = () => {
    const sampleDeck = {
      name: "Sample Flashcard Deck",
      description: "A sample deck to demonstrate JSON format",
      cards: [
        {
          front: "What is JavaScript?",
          back: "A high-level, interpreted programming language that conforms to the ECMAScript specification.",
          difficulty: "easy"
        },
        {
          front: "What is a closure in JavaScript?",
          back: "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.",
          difficulty: "medium"
        }
      ]
    };
    
    setJsonInput(JSON.stringify(sampleDeck, null, 2));
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="btn-secondary px-4 py-2"
          >
            Import JSON
          </button>
          <button onClick={onCancel} className="btn-secondary px-4 py-2">
            Cancel
          </button>
        </div>
      </div>

      {/* JSON Import Modal */}
      {showJsonImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Cards from JSON</h3>
              <button
                onClick={() => {
                  setShowJsonImport(false);
                  setJsonInput('');
                  setJsonError('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Paste your JSON (complete deck or cards array):
                  </label>
                  <button
                    onClick={generateSampleJson}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                  >
                    Load Sample Format
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Paste your JSON array of cards here..."
                />
              </div>

              {jsonError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error:</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{jsonError}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">Supported Formats:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <strong>Format 1 - Cards Array:</strong>
                </p>
                <pre className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded overflow-x-auto mb-2">
{`[
  {
    "front": "Question or term",
    "back": "Answer or definition",
    "difficulty": "easy"
  }
]`}
                </pre>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <strong>Format 2 - Complete Deck:</strong>
                </p>
                <pre className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded overflow-x-auto">
{`{
  "name": "Deck Name",
  "description": "Deck Description",
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "difficulty": "medium"
    }
  ]
}`}
                </pre>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  • <strong>front</strong>: Text on the front of the card<br/>
                  • <strong>back</strong>: Text on the back of the card<br/>
                  • <strong>difficulty</strong>: Optional - &quot;easy&quot;, &quot;medium&quot;, or &quot;hard&quot;<br/>
                  • <strong>name/description</strong>: Optional deck metadata (Format 2 only)
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowJsonImport(false);
                    setJsonInput('');
                    setJsonError('');
                  }}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJsonImport}
                  disabled={!jsonInput.trim()}
                  className="btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  Add to Existing Cards
                </button>
                <button
                  onClick={handleJsonImportReplace}
                  disabled={!jsonInput.trim()}
                  className="btn-primary px-4 py-2 disabled:opacity-50"
                >
                  Replace All Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
