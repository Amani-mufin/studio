'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { WishCardData } from '@/lib/types';
import {
  getWishes,
  addWish,
  updateWish,
  updateWishPosition as updateWishPositionAction,
} from '@/app/actions';
import { useToast } from './use-toast';

export function useWishBoard() {
  const [cards, setCards] = useState<WishCardData[]>([]);
  const { toast } = useToast();
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const fetchedWishes = await getWishes();
      setCards(fetchedWishes);
    });
  }, []);

  const addCard = useCallback(
    async (
      cardData: Omit<WishCardData, 'id' | 'createdAt' | 'position' | 'reactions'>
    ) => {
      // This function is only called on the client after user interaction, so window is safe.
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

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticCard: WishCardData = {
        ...newCardData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [...prev, optimisticCard]);

      const result = await addWish(newCardData);
      
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        // Revert optimistic update
        setCards((prev) => prev.filter((card) => card.id !== tempId));
      } else {
        // Replace optimistic card with real one from server
        setCards((prev) =>
          prev.map((card) => (card.id === tempId ? result : card))
        );
      }
    },
    [toast]
  );

  const updateCard = useCallback(
    async (updatedCard: WishCardData) => {
      // Optimistic update
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      const { id, ...dataToUpdate } = updatedCard;
      const result = await updateWish(id, dataToUpdate);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        // Ideally, you'd revert the state here, but that's more complex.
        // For now, we just show an error.
      }
    },
    [toast]
  );

  const updateCardPosition = useCallback(
    async (id: string, position: { x: number; y: number }) => {
      // Optimistic update
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
        // Revert could be implemented here as well.
      }
    },
    [toast]
  );

  return { cards, addCard, updateCard, updateCardPosition, isLoading };
}
