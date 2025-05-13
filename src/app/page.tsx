import WordDisplay from '@/components/lexidaily/WordDisplay';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { BookOpenText } from 'lucide-react';

// Mocked list of daily words. In a real app, this would come from an external API.
const MOCK_DAILY_WORDS: string[] = ["ephemeral", "ubiquitous", "serendipity", "mellifluous", "labyrinthine", "eloquent", "pernicious"];

async function fetchDailyWords(): Promise<string[]> {
  // Simulate an API call to fetch daily words
  console.log("Fetching daily words...");
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate a short delay
  return MOCK_DAILY_WORDS;
}

interface WordData {
  word: string;
  sentence: string;
}

export default async function HomePage() {
  const words = await fetchDailyWords();
  let wordDataList: WordData[] = [];

  if (words.length > 0) {
    try {
      const exampleSentencesResult = await generateExampleSentences({ words });
      // Assuming the AI returns one sentence per word, in the same order.
      wordDataList = words.map((word, index) => ({
        word,
        sentence: exampleSentencesResult.sentences[index] || "Example sentence generation is currently unavailable.",
      }));
    } catch (error) {
      console.error("Error generating example sentences:", error);
      // Fallback: Populate with words but indicate sentence generation failure.
      wordDataList = words.map(word => ({
        word,
        sentence: "Could not retrieve an example sentence at this time.",
      }));
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="w-full p-4 sm:p-8 flex flex-col items-center">
        <header className="w-full max-w-3xl mt-8 mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpenText className="h-12 w-12 text-primary mr-3" aria-hidden="true" />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">LexiDaily</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Expand your vocabulary, one day at a time.
          </p>
        </header>

        <main className="w-full max-w-xl space-y-6">
          <h2 className="text-3xl font-semibold text-center text-foreground mb-8">
            Today's Words
          </h2>
          {wordDataList.length > 0 ? (
            <div className="space-y-6">
              {wordDataList.map((data, index) => (
                <WordDisplay key={index} word={data.word} exampleSentence={data.sentence} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-card rounded-lg shadow-md">
                <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground text-lg">
                No new words for today. Please check back tomorrow!
              </p>
            </div>
          )}
        </main>

        <footer className="w-full max-w-3xl mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LexiDaily. AI-enhanced learning.
          </p>
        </footer>
      </div>
    </div>
  );
}
