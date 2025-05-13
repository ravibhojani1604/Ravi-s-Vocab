"use client"; // Card components might use client features, keeping it simple. Can be server if no client hooks used.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordDisplayProps {
  word: string;
  exampleSentence: string;
}

export default function WordDisplay({ word, exampleSentence }: WordDisplayProps) {
  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-6 bg-card">
        <CardTitle className="text-3xl font-bold capitalize text-primary">{word}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <p className="text-lg text-foreground leading-relaxed">
          {exampleSentence || "No example sentence available for this word."}
        </p>
      </CardContent>
    </Card>
  );
}
