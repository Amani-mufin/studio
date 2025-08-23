'use server';

import { generatePoemForWish } from '@/ai/flows/generate-poem-for-wish';

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
