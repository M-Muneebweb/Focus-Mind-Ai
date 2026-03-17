// Function to read a file as an ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        const text = await readFileAsText(file);
        if (!text.trim()) {
            throw new Error('No readable text found in this file. It appears to be empty.');
        }
        return text;
    }
    else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // @ts-ignore - pdfjsLib is loaded via CDN in index.html
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            // @ts-ignore
            .map((item) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
          
          // Yield to main thread every 10 pages to prevent UI freeze
          if (i % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        
        if (!fullText.trim()) {
            throw new Error('No readable text found in this PDF. It might be an image-based or scanned document.');
        }
        
        return fullText;
    } else {
        throw new Error('Unsupported file format. Please upload PDF or TXT files.');
    }
  } catch (error: any) {
    console.error('Error extracting text:', error);
    if (error.message && error.message.includes('No readable text')) {
        throw error;
    }
    throw new Error('Failed to parse file. Please ensure it is a valid PDF or Text file.');
  }
};