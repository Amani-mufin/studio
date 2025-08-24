
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MemoryCardData } from '@/lib/types';
import {
  addMemory,
  updateMemory as updateMemoryAction,
  updateMemoryPosition as updateMemoryPositionAction,
} from '@/app/actions';
import { useToast } from './use-toast';
import { useUserId } from './use-user-id';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useMemoryBoard() {
  const [cards, setCards] = useState<MemoryCardData[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const userId = useUserId();
  
  useEffect(() => {
    setIsLoading(true);
    const memoriesCollection = collection(db, 'memories');
    const q = query(memoriesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedMemories = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          return {
            ...data,
            id: doc.id,
            createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
          } as MemoryCardData;
        });
        setCards(fetchedMemories);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to memories:", error);
        toast({
          variant: 'destructive',
          title: 'Error Loading Memories',
          description: 'Could not retrieve memories in real-time.',
        });
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [toast]);


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

      // No optimistic update needed, as Firestore real-time listener will handle it.
      const result = await addMemory(newCardData);
      
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    },
    [toast, userId]
  );

  const updateCard = useCallback(
    async (updatedCard: MemoryCardData) => {
      // Optimistic update is no longer strictly necessary but can make the UI feel faster.
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
        // Revert on error
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
          // Note: Reverting position on error can be jarring, so we might leave it.
          // The real-time listener would eventually correct it anyway.
        }
      }, 500);

      return () => clearTimeout(timer);
    },
    [toast]
  );

  return { cards, addCard, updateCard, updateCardPosition, isLoading, userId };
}
