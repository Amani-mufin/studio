'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WishCardData } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'wish-weaver-board';

export function useWishBoard() {
  const [cards, setCards] = useState<WishCardData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCards = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      }
    } catch (error) {
      console.error('Failed to load cards from local storage', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
      } catch (error) {
        console.error('Failed to save cards to local storage', error);
      }
    }
  }, [cards, isMounted]);

  const addCard = useCallback((cardData: Omit<WishCardData, 'id' | 'createdAt' | 'position' | 'reactions'>) => {
    const newCard: WishCardData = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      position: {
        x: window.innerWidth / 2 - 150 + (Math.random() - 0.5) * 100,
        y: window.innerHeight / 2 - 200 + (Math.random() - 0.5) * 100,
      },
      ...cardData,
      imageUrl: cardData.imageUrl || 'https://i.imgur.com/Ip7b2C1.png',
      reactions: {
        love: 0,
        celebration: 0,
        clap: 0,
      },
    };
    setCards((prev) => [...prev, newCard]);
  }, []);

  const updateCard = useCallback((updatedCard: WishCardData) => {
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const updateCardPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, position } : card))
    );
  }, []);

  return { cards, addCard, updateCard, deleteCard, updateCardPosition };
}
