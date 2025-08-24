
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MemoryCardData } from '@/lib/types';
import {
  getMemories,
  addMemory,
  updateMemory as updateMemoryAction,
  updateMemoryPosition as updateMemoryPositionAction,
} from '@/app/actions';
import { useToast } from './use-toast';
import { useUserId } from './use-user-id';

export function useMemoryBoard() {
  const [cards, setCards] = useState<MemoryCardData[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const userId = useUserId();
  
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
      cardData: Omit<MemoryCardData, 'id' | 'createdAt' | 'position' | 'reactions' | 'userId'>
    ) => {
      if (!userId) {
        toast({ variant: 'destructive', title: 'Error', description: 'User ID not found. Cannot create card.' });
        return;
      }
      const newCardData: Omit<MemoryCardData, 'id' | 'createdAt'> = {
        position: {
          x: Math.random() * (window.innerWidth - 350),
          y: 100 + Math.random() * (window.innerHeight - 450),
        },
        ...cardData,
        userId: userId,
        reactions: {
          love: 0,
          celebration: 0,
        },
        reactedUserIds: {
          love: [],
          celebration: [],
        }
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
        setCards((prev) =>
          prev.map((card) => (card.id === tempId ? result : card))
        );
      }
    },
    [toast, userId]
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
        setCards(originalCards);
      }
    },
    [toast, cards]
  );

  const updateCardPosition = useCallback(
    async (id: string, position: { x: number; y: number }) => {
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, position } : card))
      );
      
      const timer = setTimeout(async () => {
         const result = await updateMemoryPositionAction(id, position);
      
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error,
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    },
    [toast]
  );

  return { cards, addCard, updateCard, updateCardPosition, isLoading, userId };
}
