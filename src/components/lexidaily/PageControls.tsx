
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
      const lineHeight = 7; 
      const margin = 20; 
      let yPos = margin; 
      const defaultFont = 'helvetica'; // jsPDF's default font
      
      // Page Title
      doc.setFont(defaultFont, 'normal');
      doc.setFontSize(18);
      doc.text(pageTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2; 

      doc.setFontSize(12);

      wordDataList.forEach((data) => {
        // Calculate height of the current entry block to check for page break
        let blockHeight = 0;
        
        doc.setFont(defaultFont, 'bold');
        blockHeight += doc.splitTextToSize(data.word, pageWidth - margin * 2).length * lineHeight;

        doc.setFont(defaultFont, 'normal');
        blockHeight += doc.splitTextToSize(`Sentence: ${data.sentence}`, pageWidth - margin * 2).length * lineHeight;
        
        doc.setFont(defaultFont, 'normal');
        blockHeight += doc.splitTextToSize(`Pronunciation: ${data.pronunciation}`, pageWidth - margin * 2).length * lineHeight;
        
        blockHeight += lineHeight; // Spacing after the entry

        // Check if block fits on current page, if not, add a new page
        if (yPos + blockHeight > pageHeight - margin && yPos > margin) { // yPos > margin ensures not first item on fresh page
          doc.addPage();
          yPos = margin; 
          doc.setFont(defaultFont, 'normal');
          doc.setFontSize(18);
          doc.text(pageTitle + " (cont.)", pageWidth / 2, yPos, { align: 'center' });
          yPos += lineHeight * 2;
          doc.setFontSize(12);
        }

        // Draw Word
        doc.setFont(defaultFont, 'bold');
        doc.text(data.word, margin, yPos);
        yPos += doc.splitTextToSize(data.word, pageWidth - margin * 2).length * lineHeight;

        // Draw Sentence
        doc.setFont(defaultFont, 'normal');
        const sentenceLines = doc.splitTextToSize(`Sentence: ${data.sentence}`, pageWidth - margin * 2);
        sentenceLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        
        // Draw Pronunciation
        const pronunciationLines = doc.splitTextToSize(`Pronunciation: ${data.pronunciation}`, pageWidth - margin * 2);
        pronunciationLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        
        yPos += lineHeight; // Add spacing after the entry
      });

      doc.save("lexidaily_words.pdf");
      toast({
        title: "PDF Exported",
        description: `Your words have been exported.`,
        duration: 5000,
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

