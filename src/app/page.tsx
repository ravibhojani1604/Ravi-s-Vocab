import WordDisplay from '@/components/ravisvocab/WordDisplay';
import PageControls from '@/components/ravisvocab/PageControls';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { BookOpenText } from 'lucide-react';
import { getDayOfYear } from 'date-fns';

// Expanded list of daily words. In a real app, this would come from a dynamic source.
const MOCK_DAILY_WORDS: string[] = [
  "ephemeral", "ubiquitous", "serendipity", "mellifluous", "labyrinthine", 
  "eloquent", "pernicious", "auspicious", "cacophony", "epiphany",
  "quintessential", "plethora", "surreptitious", "vicarious", "anachronistic",
  "benevolent", "camaraderie", "deleterious", "ebullient", "fastidious",
  "gregarious", "harbinger", "iconoclast", "juxtaposition", "kudos",
  "loquacious", "maverick", "nefarious", "obsequious", "paradigm",
  "recalcitrant", "sagacious", "tenacious", "unctuous", "veritable",
  "whimsical", "zenith", "alacrity", "bombastic", "capricious",
  "diffident", "erudite", "flummox", "galvanize", "histrionic",
  "innocuous", "judicious", "myriad", "nonchalant", "ostentatious"
];

async function fetchDailyWords(): Promise<string[]> {
  console.log("Fetching daily words based on IST date...");
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate a short delay

  const now = new Date(); // Server's current time (usually UTC on hosting platforms)
  
  // IST is UTC+5:30
  const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
  // Calculate IST by creating a new Date object representing the UTC time, then adjusting.
  // Server time is assumed UTC. If server has a local timezone, this needs adjustment.
  // For a robust solution, date-fns-tz or similar timezone library would be better.
  // getTime() gives UTC milliseconds. Add IST offset.
  const istTime = new Date(now.getTime() + istOffsetMilliseconds);
  
  const dayOfYearInIST = getDayOfYear(istTime); // Get day of the year (1-366) in IST

  const wordsPerDay = 10;
  const totalWords = MOCK_DAILY_WORDS.length;

  if (totalWords === 0) {
    return [];
  }
  
  // Calculate a starting index that cycles through the MOCK_DAILY_WORDS list.
  // (dayOfYearInIST - 1) to make it 0-indexed for calculations.
  const startIndex = ((dayOfYearInIST - 1) * wordsPerDay) % totalWords;

  const selectedWords: string[] = [];
  for (let i = 0; i < wordsPerDay; i++) {
    selectedWords.push(MOCK_DAILY_WORDS[(startIndex + i) % totalWords]);
  }
  
  return selectedWords;
}

export interface WordData {
  word: string;
  sentence: string;
  hindiMeaning: string;
  pronunciation: string;
}

export default async function HomePage() {
  const words = await fetchDailyWords();
  let wordDataList: WordData[] = [];

  if (words.length > 0) {
    try {
      const aiResult = await generateExampleSentences({ words });
      if (aiResult && aiResult.wordDetails && aiResult.wordDetails.length > 0) {
        wordDataList = aiResult.wordDetails.map(detail => ({
          word: detail.word,
          sentence: detail.sentence || "Example sentence generation is currently unavailable.",
          hindiMeaning: detail.hindiMeaning || "Hindi meaning not available.",
          pronunciation: detail.pronunciation || "Pronunciation not available.",
        }));
      } else {
        // Fallback if AI response is not as expected
        wordDataList = words.map(word => ({
          word,
          sentence: "Could not retrieve an example sentence at this time.",
          hindiMeaning: "Hindi meaning not available.",
          pronunciation: "Pronunciation not available.",
        }));
      }
    } catch (error) {
      console.error("Error generating example sentences, meanings, and pronunciations:", error);
      // Fallback: Populate with words but indicate generation failure.
      wordDataList = words.map(word => ({
        word,
        sentence: "Could not retrieve an example sentence at this time.",
        hindiMeaning: "Hindi meaning not available.",
        pronunciation: "Pronunciation not available.",
      }));
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="w-full p-4 sm:p-8 flex flex-col items-center">
        <header className="w-full max-w-3xl mt-8 mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpenText className="h-12 w-12 text-primary mr-3" aria-hidden="true" />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">Ravi's Vocab</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Expand your vocabulary, one day at a time, with Hindi meanings and pronunciations.
          </p>
        </header>

        {wordDataList.length > 0 && (
          <PageControls wordDataList={wordDataList} pageTitle="Ravi's Vocab - Today's Words" />
        )}

        <main className="w-full max-w-xl space-y-6">
          <h2 className="text-3xl font-semibold text-center text-foreground mb-8">
            Today's Words
          </h2>
          {wordDataList.length > 0 ? (
            <div className="space-y-6">
              {wordDataList.map((data, index) => (
                <WordDisplay 
                  key={index} 
                  word={data.word} 
                  exampleSentence={data.sentence}
                  hindiMeaning={data.hindiMeaning}
                  pronunciation={data.pronunciation}
                />
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
            &copy; {new Date().getFullYear()} Ravi's Vocab. AI-enhanced learning.
          </p>
        </footer>
      </div>
    </div>
  );
}
