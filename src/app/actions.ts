'use server';

import { db } from '@/lib/firebase';
import type { MemoryCardData } from '@/lib/types';
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

const memoriesCollection = collection(db, 'memory');

export async function getMemories(): Promise<MemoryCardData[]> {
  try {
    const q = query(memoriesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No memories found in Firestore.');
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
      } as MemoryCardData;
    });
  } catch (error) {
    console.error('Error fetching memories from Firestore:', error);
    // In case of an error, return an empty array to prevent the app from crashing.
    return [];
  }
}

export async function addMemory(
  memoryData: Omit<MemoryCardData, 'id' | 'createdAt'>
): Promise<MemoryCardData | { error: string }> {
  try {
    // The data to be added to Firestore.
    // We include `createdAt: serverTimestamp()` to let Firestore generate the timestamp.
    const docData = {
      ...memoryData,
      createdAt: serverTimestamp(),
    };
    
    // Add the document to the 'memory' collection.
    const docRef = await addDoc(memoriesCollection, docData);

    // Fetch the newly created document from Firestore to get the generated ID and timestamp.
    const newDocSnapshot = await getDoc(docRef);
    
    if (!newDocSnapshot.exists()) {
      throw new Error("Failed to retrieve the new memory after creation.");
    }

    const newMemoryData = newDocSnapshot.data();
    const createdAtTimestamp = newMemoryData.createdAt as Timestamp;

    // Construct the final MemoryCardData object with the server-generated values.
    const newMemory: MemoryCardData = {
      ...(newMemoryData as Omit<MemoryCardData, 'id' | 'createdAt'>), // Cast the data to the correct type
      id: docRef.id,
      createdAt: createdAtTimestamp.toDate().toISOString(),
    };

    return newMemory;
  } catch (error) {
    console.error('Error adding memory to Firestore:', error);
    if (error instanceof Error) {
        return { error: `Failed to add memory: ${error.message}` };
    }
    return { error: 'An unknown error occurred while adding the memory.' };
  }
}


export async function updateMemory(
  memoryId: string,
  memoryData: Partial<Omit<MemoryCardData, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const memoryDoc = doc(db, 'memory', memoryId);
    await updateDoc(memoryDoc, memoryData);
    return { success: true };
  } catch (error) {
    console.error('Error updating memory in Firestore:', error);
    return { error: 'Failed to update memory.' };
  }
}

export async function updateMemoryPosition(
  memoryId: string,
  position: { x: number; y: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const memoryDoc = doc(db, 'memory', memoryId);
    await updateDoc(memoryDoc, { position });
    return { success: true };
  } catch (error) {
    console.error('Error updating memory position in Firestore:', error);
    return { error: 'Failed to update memory position.' };
  }
}
