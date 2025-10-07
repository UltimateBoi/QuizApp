'use client';

import { useState, useCallback } from 'react';
import { FlashCardDeck, FlashCard } from '@/types/quiz';
import { useLocalStorage } from './useLocalStorage';

export function useFlashCards() {
  const [flashCardDecks, setFlashCardDecks] = useLocalStorage<FlashCardDeck[]>('flashcard-decks', []);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const getDeckById = useCallback((id: string): FlashCardDeck | undefined => {
    return flashCardDecks.find(deck => deck.id === id);
  }, [flashCardDecks]);

  const createDeck = useCallback((deckData: Omit<FlashCardDeck, 'id' | 'createdAt' | 'updatedAt'>): FlashCardDeck => {
    const newDeck: FlashCardDeck = {
      id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...deckData,
      cards: deckData.cards.map((card, index) => ({
        ...card,
        id: card.id || `card-${Date.now()}-${index}`,
        deckId: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update card deckId references
    newDeck.cards = newDeck.cards.map(card => ({
      ...card,
      deckId: newDeck.id,
    }));

    setFlashCardDecks(prev => [...prev, newDeck]);
    return newDeck;
  }, [setFlashCardDecks]);

  const updateDeck = useCallback((id: string, deckData: Omit<FlashCardDeck, 'id' | 'createdAt' | 'updatedAt'>) => {
    setFlashCardDecks(prev => prev.map(deck => {
      if (deck.id === id) {
        return {
          ...deck,
          ...deckData,
          cards: deckData.cards.map((card, index) => ({
            ...card,
            id: card.id || `card-${Date.now()}-${index}`,
            deckId: id,
            createdAt: card.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        };
      }
      return deck;
    }));
  }, [setFlashCardDecks]);

  const deleteDeck = useCallback((id: string) => {
    setFlashCardDecks(prev => prev.filter(deck => deck.id !== id));
  }, [setFlashCardDecks]);

  return {
    flashCardDecks,
    isLoading,
    error,
    getDeckById,
    createDeck,
    updateDeck,
    deleteDeck,
    setFlashCardDecks,
  };
}
