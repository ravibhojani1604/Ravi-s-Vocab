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
  // Simulate a short delay if needed, otherwise remove for production
  // await new Promise(resolve => setTimeout(resolve, 200)); 

  const now = new Date(); // Server's current time (usually UTC on hosting platforms)
  
  // IST is UTC+5:30
  const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMilliseconds);
  
  const dayOfYearInIST = getDayOfYear(istTime); 

  const wordsPerDay = 10;
  const totalWords = MOCK_DAILY_WORDS.length;

  if (totalWords === 0) {
    console.warn("MOCK_DAILY_WORDS list is empty. No words to select.");
    return [];
  }
  
  const startIndex = ((dayOfYearInIST - 1) * wordsPerDay) % totalWords;

  const selectedWords: string[] = [];
  for (let i = 0; i < wordsPerDay; i++) {
    selectedWords.push(MOCK_DAILY_WORDS[(startIndex + i) % totalWords]);
  }
  
  console.log(`Selected ${selectedWords.length} words for day ${dayOfYearInIST} (IST).`);
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
      console.log("Attempting to generate example sentences for words:", words);
      const aiResult = await generateExampleSentences({ words });
      console.log("AI Result received:", JSON.stringify(aiResult, null, 2));

      if (aiResult && aiResult.wordDetails && Array.isArray(aiResult.wordDetails)) {
        if (aiResult.wordDetails.length > 0) {
          wordDataList = aiResult.wordDetails.map(detail => ({
            word: detail.word || "Word not found",
            sentence: detail.sentence || "Example sentence generation is currently unavailable.",
            hindiMeaning: detail.hindiMeaning || "Hindi meaning not available.",
            pronunciation: detail.pronunciation || "Pronunciation not available.",
          }));
        } else {
          console.warn("AI result wordDetails is an empty array. Falling back for words:", words);
          wordDataList = words.map(word => ({
            word,
            sentence: "Could not retrieve an example sentence at this time (empty AI details).",
            hindiMeaning: "Hindi meaning not available (empty AI details).",
            pronunciation: "Pronunciation not available (empty AI details).",
          }));
        }
      } else {
        console.warn("AI result format is unexpected or wordDetails is missing/not an array. AI Response:", aiResult, "Falling back for words:", words);
        wordDataList = words.map(word => ({
          word,
          sentence: "Could not retrieve an example sentence due to an unexpected AI response format.",
          hindiMeaning: "Hindi meaning not available due to an unexpected AI response format.",
          pronunciation: "Pronunciation not available due to an unexpected AI response format.",
        }));
      }
    } catch (error: any) {
      console.error("Error generating example sentences, meanings, and pronunciations:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      if (error.cause) {
        console.error("Error cause:", error.cause);
      }
      // Fallback: Populate with words but indicate generation failure.
      wordDataList = words.map(word => ({
        word,
        sentence: "Could not retrieve an example sentence due to an error.",
        hindiMeaning: "Hindi meaning not available due to an error.",
        pronunciation: "Pronunciation not available due to an error.",
      }));
    }
  } else {
    console.log("No words fetched for today, wordDataList will be empty.");
  }


  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="w-full p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <header className="w-full max-w-3xl mt-6 mb-8 sm:mt-8 sm:mb-10 md:mb-12 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <BookOpenText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mr-2 sm:mr-3" aria-hidden="true" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-primary">Ravi's Vocab</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            Expand your vocabulary, one day at a time, with Hindi meanings and pronunciations.
          </p>
        </header>

        {wordDataList.length > 0 && (
          <PageControls wordDataList={wordDataList} pageTitle="Ravi's Vocab - Today's Words" />
        )}

        <main className="w-full max-w-xl space-y-4 sm:space-y-6 px-2 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-4 sm:mb-6 md:mb-8">
            Today's Words
          </h2>
          {wordDataList.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
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
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 bg-card rounded-lg shadow-md">
                <BookOpenText className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-center text-muted-foreground text-sm sm:text-md md:text-lg">
                No new words for today. Please check back tomorrow!
              </p>
            </div>
          )}
        </main>

        <footer className="w-full max-w-3xl mt-10 sm:mt-12 md:mt-16 pt-5 sm:pt-6 md:pt-8 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ravi's Vocab. AI-enhanced learning.
          </p>
        </footer>
      </div>
    </div>
  );
}
