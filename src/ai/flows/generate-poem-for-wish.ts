'use server';
/**
 * @fileOverview Generates a short poem based on the wish text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
