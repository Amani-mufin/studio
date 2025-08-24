'use server';

import { db } from '@/lib/firebase';
import type { MemoryCardData } from '@/lib/types';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { getPoemAction as getPoemFromAi } from '@/ai/flows/generate-poem-for-wish';

// Re-export the AI action
export const getPoemAction = getPoemFromAi;

// --- Firestore Server Actions ---

const memoriesCollection = collection(db, 'memories');

export async function addMemory(
  memoryData: Omit<MemoryCardData, 'id' | 'createdAt'>
): Promise<MemoryCardData | { error: string }> {
  try {
    const docData = {
      ...memoryData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(memoriesCollection, docData);

    const newDocSnapshot = await getDoc(docRef);
    
    if (!newDocSnapshot.exists()) {
      throw new Error("Failed to retrieve the new memory after creation.");
    }

    const newMemoryData = newDocSnapshot.data();
    const createdAtTimestamp = newMemoryData.createdAt as Timestamp;

    const newMemory: MemoryCardData = {
      ...(newMemoryData as Omit<MemoryCardData, 'id' | 'createdAt'>),
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
    const memoryDoc = doc(db, 'memories', memoryId);
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
    const memoryDoc = doc(db, 'memories', memoryId);
    await updateDoc(memoryDoc, { position });
    return { success: true };
  } catch (error) {
    console.error('Error updating memory position in Firestore:', error);
    return { error: 'Failed to update memory position.' };
  }
}
