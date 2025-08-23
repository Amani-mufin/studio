'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WishCardData } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'wish-weaver-board';

export function useWishBoard() {
  const [cards, setCards] = useState<WishCardData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const boardData = urlParams.get('board');

      if (boardData) {
        const decodedData = atob(boardData);
        setCards(JSON.parse(decodedData));
        // Optionally, you can clear the URL parameter after loading
        // window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const storedCards = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedCards) {
          setCards(JSON.parse(storedCards));
        }
      }
    } catch (error) {
      console.error('Failed to load cards', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('board')) { // Only save to LS if not viewing a shared board
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
        }
      } catch (error) {
        console.error('Failed to save cards to local storage', error);
      }
    }
  }, [cards, isClient]);

  const addCard = useCallback((cardData: Omit<WishCardData, 'id' | 'createdAt' | 'position' | 'reactions'>) => {
    if(!isClient) return;

    const newCard: WishCardData = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      position: {
        x: Math.random() * (window.innerWidth - 350), 
        y: 100 + Math.random() * (window.innerHeight - 450),
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
  }, [isClient]);

  const updateCard = useCallback((updatedCard: WishCardData) => {
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  }, []);

  const updateCardPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, position } : card))
    );
  }, []);

  return { cards, addCard, updateCard, updateCardPosition };
}
