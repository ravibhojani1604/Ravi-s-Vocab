"use client";

import type { WordData } from '@/app/page';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

interface PageControlsProps {
  wordDataList: WordData[];
  pageTitle: string;
}

export default function PageControls({ wordDataList, pageTitle }: PageControlsProps) {
  const { toast } = useToast();

  const handleExportToPdf = () => {
    if (wordDataList.length === 0) {
      toast({
        title: "No words to export",
        description: "There are no words currently displayed to export to PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const lineHeight = 7; // Approximate line height for font size 12 in points
      const margin = 20; // Page margin in points
      let yPos = margin; // Current Y position for drawing text

      // Page Title
      doc.setFontSize(18);
      doc.text(pageTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 3; // Space after title

      doc.setFontSize(12); // Reset to content font size

      wordDataList.forEach((data) => {
        const linesForEntry: Array<{ text: string, fontStyle: 'normal' | 'bold' }> = [];
        
        // Word (Bold)
        const wordLines = doc.splitTextToSize(data.word, pageWidth - margin * 2);
        wordLines.forEach(line => linesForEntry.push({ text: line, fontStyle: 'bold'}));

        // Sentence
        const sentenceLines = doc.splitTextToSize(`Sentence: ${data.sentence}`, pageWidth - margin * 2);
        sentenceLines.forEach(line => linesForEntry.push({ text: line, fontStyle: 'normal'}));
        
        // Hindi Meaning
        // Note: Hindi text might not render correctly without custom fonts embedded in jsPDF.
        const hindiMeaningLines = doc.splitTextToSize(`Hindi Meaning: ${data.hindiMeaning}`, pageWidth - margin * 2);
        hindiMeaningLines.forEach(line => linesForEntry.push({ text: line, fontStyle: 'normal'}));

        // Pronunciation
        const pronunciationLines = doc.splitTextToSize(`Pronunciation: ${data.pronunciation}`, pageWidth - margin * 2);
        pronunciationLines.forEach(line => linesForEntry.push({ text: line, fontStyle: 'normal'}));
        
        // Calculate height of the current entry block
        const blockHeight = (linesForEntry.length * lineHeight) + lineHeight; // Add extra lineheight for spacing after block

        // Check if block fits on current page, if not, add a new page
        if (yPos + blockHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin; // Reset Y position for new page
          // Optional: Add continuation title to new page
          doc.setFontSize(18);
          doc.text(pageTitle + " (cont.)", pageWidth / 2, yPos, { align: 'center' });
          yPos += lineHeight * 3;
          doc.setFontSize(12);
        }

        // Draw the lines for the current entry
        linesForEntry.forEach(lineInfo => {
          doc.setFont(undefined, lineInfo.fontStyle); // Set font style for the line
          doc.text(lineInfo.text, margin, yPos);
          yPos += lineHeight;
        });
        yPos += lineHeight; // Add spacing after the entry
      });

      doc.save("lexidaily_words.pdf");
      toast({
        title: "PDF Exported",
        description: "Your words have been successfully exported to PDF.",
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "PDF Export Failed",
        description: "An error occurred while generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center my-6">
      <Button onClick={handleExportToPdf} variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
        <Download className="mr-2 h-4 w-4" />
        Export All to PDF
      </Button>
    </div>
  );
}
