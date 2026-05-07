import { pdfjs } from 'react-pdf';
import Tesseract from 'tesseract.js';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File, updateProgress?: (progress: number) => void): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= Math.min(numPages, 10); i++) { // limit to first 10 pages for speed
    if (updateProgress) {
        updateProgress((i - 1) / Math.min(numPages, 10));
    }
    const page = await pdf.getPage(i);
    // Extract raw text
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');

    // If page has sufficient text, it's not a scanned image, skip OCR to save time
    if (pageText.length > 200) {
      fullText += pageText + "\n\n";
      continue;
    }

    // Otherwise, render to canvas and OCR
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    
    // OCR with Tesseract
    const dataUrl = canvas.toDataURL('image/png');
    const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng', {
      logger: m => console.log(m)
    });
    
    fullText += text + "\n\n";
  }
  
  if (updateProgress) {
     updateProgress(1.0);
  }
  
  return fullText;
}
