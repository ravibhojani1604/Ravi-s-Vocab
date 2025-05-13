'use server';

/**
 * @fileOverview Generates example sentences and Hindi meanings for a given list of words using AI.
 *
 * - generateExampleSentences - A function that generates example sentences and Hindi meanings for a list of words.
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

const WordOutputSchema = z.object({
  word: z.string().describe('The original word.'),
  sentence: z.string().describe('An example sentence for the word.'),
  hindiMeaning: z.string().describe('The Hindi meaning of the word.'),
});

const GenerateExampleSentencesOutputSchema = z.object({
  wordDetails: z
    .array(WordOutputSchema)
    .describe('An array of objects, each containing the word, its example sentence, and its Hindi meaning.'),
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
  prompt: `You are an AI assistant that generates example sentences and Hindi meanings for given English words.

  For each word in the following list, provide:
  1. An example sentence that clearly demonstrates the meaning of the word.
  2. The Hindi meaning of the word.

  List of words:
  {{#each words}}
  - {{this}}
  {{/each}}
  
  Return the output as an array of objects, where each object has 'word', 'sentence', and 'hindiMeaning' fields.
  Example for a single word "ephemeral":
  {
    "word": "ephemeral",
    "sentence": "The beauty of the cherry blossoms is ephemeral, lasting only a few weeks.",
    "hindiMeaning": "क्षणिक"
  }
  Ensure the output strictly follows this JSON structure for the 'wordDetails' array.
  `,
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    // Ensure the input words are passed to the prompt.
    // The prompt is designed to iterate over input.words internally.
    const {output} = await prompt(input);
    return output!;
  }
);

