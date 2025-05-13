
"use client";

import type { WordData } from '@/app/page';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

// IMPORTANT: Replace this with the actual Base64 encoded string of NotoSansDevanagari-Regular.ttf
// You can use an online converter or a local script to convert the .ttf file to Base64.
// For example, in Node.js: fs.readFileSync('path/to/NotoSansDevanagari-Regular.ttf').toString('base64');
// This string will be very long.
const notoSansDevanagariBase64 = ""; // Placeholder - MUST BE REPLACED

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

      // Add Noto Sans Devanagari font for Hindi text
      // Ensure the notoSansDevanagariBase64 variable is populated with the correct Base64 string.
      if (notoSansDevanagariBase64) {
        doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', notoSansDevanagariBase64);
        doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');
      } else {
        console.warn("Noto Sans Devanagari font Base64 data is missing. Hindi text may not render correctly in PDF.");
      }
      const defaultFont = 'helvetica'; // jsPDF's default font

      // Page Title
      doc.setFont(defaultFont, 'normal');
      doc.setFontSize(18);
      doc.text(pageTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2; 

      // Disclaimer for Hindi characters if font is not loaded
      if (!notoSansDevanagariBase64) {
        doc.setFont(defaultFont, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100); 
        const hindiNote = "Note: Hindi font is not loaded. Hindi characters may not display correctly in this PDF. Please ensure the Noto Sans Devanagari font is correctly configured.";
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
        const entryStartYPos = yPos;
        let tempYPos = yPos;

        // Calculate height of the current entry block
        let blockHeight = 0;
        
        // Word (Bold)
        doc.setFont(defaultFont, 'bold');
        const wordLines = doc.splitTextToSize(data.word, pageWidth - margin * 2);
        blockHeight += wordLines.length * lineHeight;

        // Sentence
        doc.setFont(defaultFont, 'normal');
        const sentenceLines = doc.splitTextToSize(`Sentence: ${data.sentence}`, pageWidth - margin * 2);
        blockHeight += sentenceLines.length * lineHeight;
        
        // Hindi Meaning
        doc.setFont(notoSansDevanagariBase64 ? 'NotoSansDevanagari' : defaultFont, 'normal');
        const hindiMeaningLines = doc.splitTextToSize(`Hindi Meaning: ${data.hindiMeaning}`, pageWidth - margin * 2);
        blockHeight += hindiMeaningLines.length * lineHeight;

        // Pronunciation
        doc.setFont(defaultFont, 'normal');
        const pronunciationLines = doc.splitTextToSize(`Pronunciation: ${data.pronunciation}`, pageWidth - margin * 2);
        blockHeight += pronunciationLines.length * lineHeight;
        
        blockHeight += lineHeight; // Spacing after the entry

        // Check if block fits on current page, if not, add a new page
        if (tempYPos + blockHeight > pageHeight - margin && tempYPos !== margin) { // also ensure it's not the first item on a fresh page
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
        wordLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });

        // Draw Sentence
        doc.setFont(defaultFont, 'normal');
        sentenceLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        
        // Draw Hindi Meaning
        doc.setFont(notoSansDevanagariBase64 ? 'NotoSansDevanagari' : defaultFont, 'normal');
        hindiMeaningLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        doc.setFont(defaultFont, 'normal'); // Reset to default font

        // Draw Pronunciation
        pronunciationLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        
        yPos += lineHeight; // Add spacing after the entry
      });

      doc.save("lexidaily_words.pdf");
      toast({
        title: "PDF Exported",
        description: `Your words have been exported. ${!notoSansDevanagariBase64 ? "Hindi characters may not display correctly as the font is not loaded." : "Hindi characters should display correctly."}`,
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
