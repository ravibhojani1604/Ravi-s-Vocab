
"use client";

import type { WordData } from '@/app/page';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

// IMPORTANT: THE HINDI FONT (NotoSansDevanagari-Regular.ttf) MUST BE PROVIDED AS A BASE64 STRING BELOW.
// 1. Obtain the NotoSansDevanagari-Regular.ttf font file (e.g., from Google Fonts).
// 2. Convert this .ttf file to a Base64 string.
//    You can use an online Base64 encoder tool or a local script. For example, in Node.js:
//    // const fs = require('fs');
//    // const fontBase64 = fs.readFileSync('path/to/NotoSansDevanagari-Regular.ttf').toString('base64');
//    // console.log(fontBase64);
// 3. Replace the empty string below with the generated (very long) Base64 encoded string.
// WITHOUT THIS, HINDI CHARACTERS WILL NOT RENDER CORRECTLY IN THE PDF.
const notoSansDevanagariBase64 = ""; // Placeholder - MUST BE REPLACED BY THE DEVELOPER with the actual Base64 string.

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

      // Add Noto Sans Devanagari font for Hindi text
      // This font is necessary for proper rendering of Hindi characters in the PDF.
      if (notoSansDevanagariBase64) {
        try {
          doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', notoSansDevanagariBase64);
          doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');
        } catch (fontError) {
          console.error("Error adding Noto Sans Devanagari font to PDF:", fontError);
          toast({
            title: "Font Loading Error",
            description: "Could not load the Hindi font for the PDF. Hindi text may not render correctly.",
            variant: "destructive",
          });
          // Proceed without custom font, relying on disclaimer
        }
      } else {
        console.warn("Noto Sans Devanagari font Base64 data is missing in PageControls.tsx. Hindi text may not render correctly in PDF.");
      }
      

      // Page Title
      doc.setFont(defaultFont, 'normal');
      doc.setFontSize(18);
      doc.text(pageTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2; 

      // Disclaimer for Hindi characters if font is not loaded or failed to load
      const isHindiFontEffectivelyMissing = !notoSansDevanagariBase64 || !doc.getFontList()['NotoSansDevanagari'];

      if (isHindiFontEffectivelyMissing) {
        doc.setFont(defaultFont, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100); 
        const hindiNote = "Note: Hindi font (Noto Sans Devanagari) data is missing or failed to load in the application code (PageControls.tsx). Hindi characters may not display correctly in this PDF. Please ensure the font's Base64 string is correctly configured.";
        const splitHindiNote = doc.splitTextToSize(hindiNote, pageWidth - margin * 2);
        splitHindiNote.forEach(line => {
          if (yPos + lineHeight > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        yPos += lineHeight; 
        doc.setTextColor(0); 
      }

      doc.setFontSize(12);

      wordDataList.forEach((data) => {
        // Calculate height of the current entry block to check for page break
        let tempYPos = yPos;
        let blockHeight = 0;
        
        doc.setFont(defaultFont, 'bold');
        blockHeight += doc.splitTextToSize(data.word, pageWidth - margin * 2).length * lineHeight;

        doc.setFont(defaultFont, 'normal');
        blockHeight += doc.splitTextToSize(`Sentence: ${data.sentence}`, pageWidth - margin * 2).length * lineHeight;
        
        // Use NotoSansDevanagari for Hindi if available, otherwise fallback
        const hindiFontToUse = !isHindiFontEffectivelyMissing ? 'NotoSansDevanagari' : defaultFont;
        doc.setFont(hindiFontToUse, 'normal');
        blockHeight += doc.splitTextToSize(`Hindi Meaning: ${data.hindiMeaning}`, pageWidth - margin * 2).length * lineHeight;

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
        
        // Draw Hindi Meaning
        doc.setFont(hindiFontToUse, 'normal');
        const hindiMeaningLines = doc.splitTextToSize(`Hindi Meaning: ${data.hindiMeaning}`, pageWidth - margin * 2);
        hindiMeaningLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        doc.setFont(defaultFont, 'normal'); // Reset to default font

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
        description: `Your words have been exported. ${isHindiFontEffectivelyMissing ? "IMPORTANT: Hindi characters may not display correctly as the Noto Sans Devanagari font Base64 data is missing or failed to load in PageControls.tsx." : "Hindi characters should display correctly."}`,
        duration: isHindiFontEffectivelyMissing ? 9000 : 5000,
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

