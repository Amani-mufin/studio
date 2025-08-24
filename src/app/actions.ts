'use server';

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
  orderBy,
  query,
  getDoc,
} from 'firebase/firestore';
import { getPoemAction as getPoemFromAi } from '@/ai/flows/generate-poem-for-wish';

// Re-export the AI action
export const getPoemAction = getPoemFromAi;

// --- Firestore Server Actions ---

const wishesCollection = collection(db, 'wishes');

export async function getWishes(): Promise<WishCardData[]> {
  try {
    const q = query(wishesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No wishes found in Firestore.');
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return {
        ...data,
        id: doc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      } as WishCardData;
    });
  } catch (error) {
    console.error('Error fetching wishes from Firestore:', error);
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
    const newDoc = await getDoc(docRef);
    const data = newDoc.data();
    if (!data) {
        throw new Error("Could not retrieve new wish after creation.")
    }
    const createdAt = data.createdAt as Timestamp;
    
    const newWish: WishCardData = {
        ...data,
        id: docRef.id,
        createdAt: createdAt.toDate().toISOString(),
    } as WishCardData;

    return newWish;
  } catch (error) {
    console.error('Error adding wish to Firestore:', error);
    return { error: 'Failed to add wish.' };
  }
}

export async function updateWish(
  wishId: string,
  wishData: Partial<Omit<WishCardData, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const wishDoc = doc(db, 'wishes', wishId);
    await updateDoc(wishDoc, wishData);
    return { success: true };
  } catch (error) {
    console.error('Error updating wish in Firestore:', error);
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
    console.error('Error updating wish position in Firestore:', error);
    return { error: 'Failed to update wish position.' };
  }
}
