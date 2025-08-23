// src/ai/flows/generate-poem-for-wish.ts
'use server';
/**
 * @fileOverview Generates a short poem based on the wish text.
 *
 * - generatePoemForWish - A function that generates a poem for a given wish.
 * - GeneratePoemForWishInput - The input type for the generatePoemForWish function.
 * - GeneratePoemForWishOutput - The return type for the generatePoemForWish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoemForWishInputSchema = z.object({
  wishText: z.string().describe('The text of the wish.'),
});
export type GeneratePoemForWishInput = z.infer<typeof GeneratePoemForWishInputSchema>;

const GeneratePoemForWishOutputSchema = z.object({
  poem: z.string().describe('A short poem based on the wish text.'),
});
export type GeneratePoemForWishOutput = z.infer<typeof GeneratePoemForWishOutputSchema>;

export async function generatePoemForWish(input: GeneratePoemForWishInput): Promise<GeneratePoemForWishOutput> {
  return generatePoemForWishFlow(input);
}

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
