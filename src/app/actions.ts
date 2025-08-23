'use server';

import { generatePoemForWish } from '@/ai/flows/generate-poem-for-wish';
import { db } from '@/lib/firebase';
import type { WishCardData } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export async function getPoemAction(
  wishText: string
): Promise<{ poem?: string; error?: string }> {
  if (!wishText) {
    return { error: 'Wish text is required.' };
  }
  try {
    const result = await generatePoemForWish({ wishText });
    return { poem: result.poem };
  } catch (error) {
    console.error('Poem generation failed:', error);
    return {
      error: 'Could not generate a poem at this time. Please try again later.',
    };
  }
}

// Firestore Server Actions

const wishesCollection = collection(db, 'wishes');

export async function getWishes(): Promise<WishCardData[]> {
  try {
    const snapshot = await getDocs(wishesCollection);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      } as WishCardData;
    });
  } catch (error) {
    console.error('Error fetching wishes:', error);
    return [];
  }
}

export async function addWish(
  wishData: Omit<WishCardData, 'id' | 'createdAt'>
): Promise<WishCardData | { error: string }> {
  try {
    const docRef = await addDoc(wishesCollection, {
      ...wishData,
      createdAt: serverTimestamp(),
    });
    const newWish = {
      ...wishData,
      id: docRef.id,
      createdAt: new Date().toISOString(), // optimistic update
    };
    return newWish;
  } catch (error) {
    console.error('Error adding wish:', error);
    return { error: 'Failed to add wish.' };
  }
}

export async function updateWish(
  wishId: string,
  wishData: Partial<WishCardData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const wishDoc = doc(db, 'wishes', wishId);
    // serverTimestamp cannot be used in update, so we remove createdAt
    const { id, createdAt, ...dataToUpdate } = wishData;
    await updateDoc(wishDoc, dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error('Error updating wish:', error);
    return { error: 'Failed to update wish.' };
  }
}

export async function updateWishPosition(
  wishId: string,
  position: { x: number; y: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const wishDoc = doc(db, 'wishes', wishId);
    await updateDoc(wishDoc, { position });
    return { success: true };
  } catch (error) {
    console.error('Error updating wish position:', error);
    return { error: 'Failed to update wish position.' };
  }
}
