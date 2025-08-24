'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WishCardData } from '@/lib/types';
import {
  getWishes,
  addWish,
  updateWish as updateWishAction,
  updateWishPosition as updateWishPositionAction,
} from '@/app/actions';
import { useToast } from './use-toast';

export function useWishBoard() {
  const [cards, setCards] = useState<WishCardData[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishes() {
      setIsLoading(true);
      try {
        const fetchedWishes = await getWishes();
        setCards(fetchedWishes);
      } catch (error) {
        console.error("Failed to load wishes:", error);
        toast({
          variant: 'destructive',
          title: 'Error Loading Wishes',
          description: 'Could not retrieve wishes from the database.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadWishes();
  }, [toast]);

  const addCard = useCallback(
    async (
      cardData: Omit<WishCardData, 'id' | 'createdAt' | 'position' | 'reactions'>
    ) => {
      const newCardData: Omit<WishCardData, 'id' | 'createdAt'> = {
        position: {
          x: Math.random() * (window.innerWidth - 350),
          y: 100 + Math.random() * (window.innerHeight - 450),
        },
        ...cardData,
        reactions: {
          love: 0,
          celebration: 0,
        },
      };

      const tempId = `temp-${Date.now()}`;
      const optimisticCard: WishCardData = {
        ...newCardData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [optimisticCard, ...prev]);

      const result = await addWish(newCardData);
      
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setCards((prev) => prev.filter((card) => card.id !== tempId));
      } else {
        setCards((prev) =>
          prev.map((card) => (card.id === tempId ? result : card))
        );
      }
    },
    [toast]
  );

  const updateCard = useCallback(
    async (updatedCard: WishCardData) => {
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      const { id, createdAt, ...dataToUpdate } = updatedCard;
      const result = await updateWishAction(id, dataToUpdate);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        // You might want to revert the state here if the update fails
      }
    },
    [toast]
  );

  const updateCardPosition = useCallback(
    async (id: string, position: { x: number; y: number }) => {
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, position } : card))
      );
      
      const result = await updateWishPositionAction(id, position);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    },
    [toast]
  );

  return { cards, addCard, updateCard, updateCardPosition, isLoading };
}
