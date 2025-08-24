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
      // When data is fetched from Firestore, createdAt is a Timestamp object.
      // It needs to be converted to a serializable format (like an ISO string)
      // before being sent to the client component.
      const createdAt = data.createdAt as Timestamp;
      return {
        ...data,
        id: doc.id,
        // Convert Timestamp to ISO string. Handle cases where it might be null.
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      } as WishCardData;
    });
  } catch (error) {
    console.error('Error fetching wishes from Firestore:', error);
    // In case of an error, return an empty array to prevent the app from crashing.
    return [];
  }
}

export async function addWish(
  wishData: Omit<WishCardData, 'id' | 'createdAt'>
): Promise<WishCardData | { error: string }> {
  try {
    // The data to be added to Firestore.
    // We include `createdAt: serverTimestamp()` to let Firestore generate the timestamp.
    const docData = {
      ...wishData,
      createdAt: serverTimestamp(),
    };
    
    // Add the document to the 'wishes' collection.
    const docRef = await addDoc(wishesCollection, docData);

    // Fetch the newly created document from Firestore to get the generated ID and timestamp.
    const newDocSnapshot = await getDoc(docRef);
    
    if (!newDocSnapshot.exists()) {
      throw new Error("Failed to retrieve the new wish after creation.");
    }

    const newWishData = newDocSnapshot.data();
    const createdAtTimestamp = newWishData.createdAt as Timestamp;

    // Construct the final WishCardData object with the server-generated values.
    const newWish: WishCardData = {
      ...(newWishData as Omit<WishCardData, 'id' | 'createdAt'>), // Cast the data to the correct type
      id: docRef.id,
      createdAt: createdAtTimestamp.toDate().toISOString(),
    };

    return newWish;
  } catch (error) {
    console.error('Error adding wish to Firestore:', error);
    if (error instanceof Error) {
        return { error: `Failed to add wish: ${error.message}` };
    }
    return { error: 'An unknown error occurred while adding the wish.' };
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
