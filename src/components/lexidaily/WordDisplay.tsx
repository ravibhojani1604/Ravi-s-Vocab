"use client"; 

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Volume2, Share2 } from "lucide-react";
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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      };
      loadVoices();
      
      return () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
      }
    }
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `LexiDaily Word: ${word}`,
      text: `Word: ${word}\nExample: ${exampleSentence}\nHindi Meaning: ${hindiMeaning}\nPronunciation: ${pronunciation}\n\nLearn more with LexiDaily!`,
      // url: typeof window !== 'undefined' ? window.location.href : undefined, // Optional: Share the current page URL
    };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: `"${word}" has been shared.`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Only show toast if it's not an AbortError (user cancelled share dialog)
        if ((error as DOMException)?.name !== 'AbortError') {
          toast({
            title: "Sharing failed",
            description: "Could not share the word at this time.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API: copy to clipboard
      try {
        if (typeof navigator.clipboard?.writeText === 'function') {
          await navigator.clipboard.writeText(shareData.text);
          toast({
            title: "Copied to clipboard!",
            description: "Sharing is not supported, so the word details have been copied to your clipboard.",
          });
        } else {
          toast({
            title: "Sharing not supported",
            description: "Web Share API and Clipboard API are not available in your browser.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error copying to clipboard:", err);
        toast({
          title: "Copy failed",
          description: "Could not copy word details to clipboard.",
          variant: "destructive",
        });
      }
    }
  };


  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-6 bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold capitalize text-primary">{word}</CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2"> {/* Adjusted spacing for potentially smaller screens */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSpeak} 
              aria-label={`Listen to the pronunciation of ${word}`}
              className="text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-full p-2"
            >
              <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare} 
              aria-label={`Share this word: ${word}`}
              className="text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-full p-2"
            >
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
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
