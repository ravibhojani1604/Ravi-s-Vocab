
"use client"; 

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Volume2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WordDisplayProps {
  word: string;
  exampleSentence: string;
  hindiMeaning: string;
  pronunciation: string;
}

export default function WordDisplay({ word, exampleSentence, hindiMeaning, pronunciation }: WordDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = React.useState(false);

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; 
      
      // Attempt to find a preferred English voice, if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-') && voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default);
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
  
  const fallbackCopyToClipboard = async (text: string, shareErrorName?: string) => {
    try {
      if (typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        if (shareErrorName) { 
          toast({
            title: shareErrorName === 'NotAllowedError' ? "Sharing Permission Denied" : "Sharing Failed",
            description: `Content copied to clipboard as a fallback. Reason: ${shareErrorName}`,
            variant: "destructive",
            duration: 7000,
          });
        } else {
           toast({
            title: "Copied to Clipboard",
            description: "Content copied successfully.",
          });
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Final fallback for very old browsers or restricted environments
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Invisible
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          if (shareErrorName) {
             toast({
                title: shareErrorName === 'NotAllowedError' ? "Sharing Permission Denied" : "Sharing Failed",
                description: `Content copied to clipboard using fallback. Reason: ${shareErrorName}`,
                variant: "destructive",
                duration: 7000,
              });
          } else {
            toast({
              title: "Copied to Clipboard",
              description: "Content copied using a fallback method.",
            });
          }
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
           toast({
            title: "Copy Failed",
            description: "Could not copy content. Please try manually.",
            variant: "destructive",
          });
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      let message = "Could not copy content. Please try manually.";
      if (err instanceof Error) {
        message = `Failed to copy: ${err.message}. Try manually.`;
      }
      toast({
        title: "Copy Failed",
        description: message,
        variant: "destructive",
      });
    }
  };


  const handleCopyToClipboard = () => {
    const textToCopy = `Word: ${word}\nSentence: ${exampleSentence}\nPronunciation: ${pronunciation}\nHindi Meaning: ${hindiMeaning}`;
    fallbackCopyToClipboard(textToCopy);
  };


  React.useEffect(() => {
    // Pre-load voices if necessary, or handle onvoiceschanged event
    // This ensures that getVoices() returns a list of available voices.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices(); // Request voices
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices(); // Initial call in case voices are already loaded
      
      // Cleanup: remove the event listener when the component unmounts
      return () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
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
              onClick={handleCopyToClipboard} 
              aria-label={`Copy details for ${word}`}
              className="text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-full p-2"
            >
              {isCopied ? <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" /> : <Copy className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
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
