'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { MemoryCardData } from '@/lib/types';
import {
  getMemories,
  addMemory,
  updateMemory as updateMemoryAction,
  updateMemoryPosition as updateMemoryPositionAction,
} from '@/app/actions';
import { useToast } from './use-toast';

export function useMemoryBoard() {
  const [cards, setCards] = useState<MemoryCardData[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedMemories = await getMemories();
      setCards(fetchedMemories);
    } catch (error) {
      console.error("Failed to load memories:", error);
      toast({
        variant: 'destructive',
        title: 'Error Loading Memories',
        description: 'Could not retrieve memories from the database.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const addCard = useCallback(
    async (
      cardData: Omit<MemoryCardData, 'id' | 'createdAt' | 'position' | 'reactions'>
    ) => {
      const newCardData: Omit<MemoryCardData, 'id' | 'createdAt'> = {
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
      const optimisticCard: MemoryCardData = {
        ...newCardData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [optimisticCard, ...prev]);

      const result = await addMemory(newCardData);
      
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setCards((prev) => prev.filter((card) => card.id !== tempId));
      } else {
        // Replace temp card with the real one from the server
        setCards((prev) =>
          prev.map((card) => (card.id === tempId ? result : card))
        );
      }
    },
    [toast]
  );

  const updateCard = useCallback(
    async (updatedCard: MemoryCardData) => {
      const originalCards = cards;
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      const { id, createdAt, ...dataToUpdate } = updatedCard;
      const result = await updateMemoryAction(id, dataToUpdate);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        // Revert to original state on failure
        setCards(originalCards);
      }
    },
    [toast, cards]
  );

  const updateCardPosition = useCallback(
    async (id: string, position: { x: number; y: number }) => {
       // Optimistically update the position in the UI
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, position } : card))
      );
      
      // Debounce the database update to avoid excessive writes during drag
      const timer = setTimeout(async () => {
         const result = await updateMemoryPositionAction(id, position);
      
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error,
          });
          // Note: We don't revert position on failure to avoid UI jumps.
          // The next successful fetch will correct it.
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    },
    [toast]
  );

  return { cards, addCard, updateCard, updateCardPosition, isLoading };
}
