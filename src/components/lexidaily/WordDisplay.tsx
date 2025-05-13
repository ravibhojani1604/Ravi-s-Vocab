
"use client"; 

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WordDisplayProps {
  word: string;
  exampleSentence: string;
  hindiMeaning: string;
  pronunciation: string;
}

export default function WordDisplay({ word, exampleSentence, hindiMeaning, pronunciation }: WordDisplayProps) {
  const { toast } = useToast();

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; 
      
      const voices = window.speechSynthesis.getVoices();
      // Ensure voices are loaded. If not, it might use a default voice.
      // Some browsers load voices asynchronously.
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Pronunciation Unavailable",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    // Pre-load voices if necessary, or handle onvoiceschanged event
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0 && window.speechSynthesis.onvoiceschanged !== undefined) {
          // This event listener will be called when voices are loaded
          window.speechSynthesis.onvoiceschanged = () => {
            // Voices loaded, no specific action needed here other than allowing future `getVoices()` calls to succeed
          };
        }
      };
      loadVoices();
      
      // Cleanup: remove the event listener when the component unmounts
      return () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
      }
    }
  }, []);

  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-6 bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold capitalize text-primary">{word}</CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSpeak} 
              aria-label={`Listen to the pronunciation of ${word}`}
              className="text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-full p-2"
            >
              <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Example Sentence:</h3>
            <p className="text-lg text-foreground leading-relaxed">
            {exampleSentence || "No example sentence available for this word."}
            </p>
        </div>
        
        {pronunciation && (
             <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <Volume2 className="h-4 w-4 mr-2 text-accent" aria-hidden="true" />
                    Pronunciation:
                </h3>
                <p className="text-lg text-foreground font-medium leading-relaxed">
                    {pronunciation}
                </p>
            </div>
        )}

        {hindiMeaning && (
            <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <Languages className="h-4 w-4 mr-2 text-secondary" aria-hidden="true" />
                    Hindi Meaning:
                </h3>
                <p className="text-lg text-secondary-foreground font-semibold leading-relaxed">
                    {hindiMeaning}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
