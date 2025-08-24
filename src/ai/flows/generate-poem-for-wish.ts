'use server';
/**
 * @fileOverview Generates a short poem based on the wish text and handles Firestore operations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
} from 'firebase/firestore';


// --- AI Poem Generation Flow ---

const GeneratePoemForWishInputSchema = z.object({
  wishText: z.string().describe('The text of the wish.'),
});
export type GeneratePoemForWishInput = z.infer<typeof GeneratePoemForWishInputSchema>;

const GeneratePoemForWishOutputSchema = z.object({
  poem: z.string().describe('A short poem based on the wish text.'),
});
export type GeneratePoemForWishOutput = z.infer<typeof GeneratePoemForWishOutputSchema>;


const generatePoemPrompt = ai.definePrompt({
  name: 'generatePoemPrompt',
  input: {schema: GeneratePoemForWishInputSchema},
  output: {schema: GeneratePoemForWishOutputSchema},
  prompt: `You are a poet laureate specializing in composing short, heartfelt poems.

  Based on the wish provided, write a short poem (4-8 lines) that captures the essence of the wish.
  The poem should be creative, thoughtful, and emotionally resonant.

  Wish: {{{wishText}}}`,
});

const generatePoemForWishFlow = ai.defineFlow(
  {
    name: 'generatePoemForWishFlow',
    inputSchema: GeneratePoemForWishInputSchema,
    outputSchema: GeneratePoemForWishOutputSchema,
  },
  async input => {
    const {output} = await generatePoemPrompt(input);
    return output!;
  }
);

export async function getPoemAction(
  wishText: string
): Promise<{ poem?: string; error?: string }> {
  if (!wishText) {
    return { error: 'Wish text is required.' };
  }
  try {
    const result = await generatePoemForWishFlow({ wishText });
    return { poem: result.poem };
  } catch (error) {
    console.error('Poem generation failed:', error);
    return {
      error: 'Could not generate a poem at this time. Please try again later.',
    };
  }
}


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
        createdAt: createdAt.toDate().toISOString(),
      } as WishCardData;
    });
  } catch (error) {
    console.error('Error fetching wishes from Firestore:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
}

export async function addWish(
  wishData: Omit<WishCardData, 'id' | 'createdAt'>
): Promise<WishCardData | { error: string }> {
  try {
    const docData = {
      ...wishData,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(wishesCollection, docData);
    
    // For optimistic update, we can't get the server timestamp back immediately.
    // We will return the data with a client-generated timestamp.
    // The real data will be fetched on the next load.
    const newWish: WishCardData = {
      ...wishData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
    };
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
