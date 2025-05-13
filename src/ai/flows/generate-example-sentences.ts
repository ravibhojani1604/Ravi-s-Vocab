'use server';

/**
 * @fileOverview Generates example sentences, Hindi meanings, and pronunciations for a given list of words using AI.
 *
 * - generateExampleSentences - A function that generates example sentences, Hindi meanings, and pronunciations for a list of words.
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
  pronunciation: z.string().describe('A simple phonetic pronunciation guide for the word (e.g., "ephemeral" -> "i-FEM-er-uhl").'),
});

const GenerateExampleSentencesOutputSchema = z.object({
  wordDetails: z
    .array(WordOutputSchema)
    .describe('An array of objects, each containing the word, its example sentence, its Hindi meaning, and its pronunciation.'),
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
  prompt: `You are an AI assistant that generates example sentences, Hindi meanings, and phonetic pronunciations for given English words.

  For each word in the following list, provide:
  1. An example sentence that clearly demonstrates the meaning of the word.
  2. The Hindi meaning of the word.
  3. A simple phonetic pronunciation guide for the word (e.g., for "ephemeral", pronunciation might be "i-FEM-er-uhl").

  List of words:
  {{#each words}}
  - {{this}}
  {{/each}}
  
  Return the output as an array of objects, where each object has 'word', 'sentence', 'hindiMeaning', and 'pronunciation' fields.
  Example for a single word "ephemeral":
  {
    "word": "ephemeral",
    "sentence": "The beauty of the cherry blossoms is ephemeral, lasting only a few weeks.",
    "hindiMeaning": "क्षणिक",
    "pronunciation": "i-FEM-er-uhl"
  }
  Ensure the output strictly follows this JSON structure for the 'wordDetails' array.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH', // Be less restrictive for dangerous content if words are innocuous
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    console.log('[AI Flow] Received input for generateExampleSentencesFlow:', input);
    try {
      const {output} = await prompt(input);
      console.log('[AI Flow] Successfully generated output:', output);
      if (!output || !output.wordDetails) {
        console.warn('[AI Flow] Output is missing or wordDetails is not present. Output:', output);
        // Return a structure that matches the schema but indicates failure if needed
        return { wordDetails: input.words.map(w => ({ 
            word: w, 
            sentence: "AI generation failed or returned no details.", 
            hindiMeaning: "AI generation failed or returned no details.", 
            pronunciation: "AI generation failed or returned no details." 
        }))};
      }
      return output;
    } catch (error) {
      console.error('[AI Flow] Error in generateExampleSentencesFlow:', error);
      // Propagate the error or return a structured error response
      // For now, returning a fallback that matches the schema
      return { 
        wordDetails: input.words.map(w => ({ 
            word: w, 
            sentence: "Error during AI generation.", 
            hindiMeaning: "Error during AI generation.", 
            pronunciation: "Error during AI generation." 
        }))
      };
    }
  }
);
