'use server';

/**
 * @fileOverview Generates example sentences for a given list of words using AI.
 *
 * - generateExampleSentences - A function that generates example sentences for a list of words.
 * - GenerateExampleSentencesInput - The input type for the generateExampleSentences function.
 * - GenerateExampleSentencesOutput - The return type for the generateExampleSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExampleSentencesInputSchema = z.object({
  words: z.array(z.string()).describe('An array of new words.'),
});
export type GenerateExampleSentencesInput = z.infer<
  typeof GenerateExampleSentencesInputSchema
>;

const GenerateExampleSentencesOutputSchema = z.object({
  sentences: z
    .array(z.string())
    .describe('An array of example sentences for the given words.'),
});
export type GenerateExampleSentencesOutput = z.infer<
  typeof GenerateExampleSentencesOutputSchema
>;

export async function generateExampleSentences(
  input: GenerateExampleSentencesInput
): Promise<GenerateExampleSentencesOutput> {
  return generateExampleSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExampleSentencesPrompt',
  input: {schema: GenerateExampleSentencesInputSchema},
  output: {schema: GenerateExampleSentencesOutputSchema},
  prompt: `You are an AI assistant that generates example sentences for given words.

  Generate one example sentence for each word in the following list:
  {{#each words}}
  - {{this}}
  {{/each}}
  
  Return the sentences as a numbered list in the output. Each sentence should clearly demonstrate the meaning of the word. The output should only include the list of sentences. 
  `,
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
