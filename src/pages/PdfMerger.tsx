import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FiUpload, FiDownload, FiX, FiArrowUp, FiArrowDown, FiFile } from 'react-icons/fi';

interface PdfFile {
  file: File;
  name: string;
  size: number;
  id: string;
}

const PdfMerger = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Filter out non-PDF files
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      if (acceptedFiles.length > 0) {
        setError('Please upload only PDF files');
      }
      return;
    }
    
    // Process each PDF file
    const newPdfFiles = pdfFiles.map(file => {
      return {
        file,
        name: file.name,
        size: file.size,
        id: `${file.name}-${Date.now()}`
      };
    });
    
    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  // Move PDF up in the list
  const movePdfUp = (index: number) => {
    if (index === 0) return;
    
    const newPdfFiles = [...pdfFiles];
    [newPdfFiles[index - 1], newPdfFiles[index]] = [newPdfFiles[index], newPdfFiles[index - 1]];
    setPdfFiles(newPdfFiles);
  };

  // Move PDF down in the list
  const movePdfDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    
    const newPdfFiles = [...pdfFiles];
    [newPdfFiles[index], newPdfFiles[index + 1]] = [newPdfFiles[index + 1], newPdfFiles[index]];
    setPdfFiles(newPdfFiles);
  };

  // Remove PDF from the list
  const removePdf = (id: string) => {
    setPdfFiles(pdfFiles.filter(pdf => pdf.id !== id));
  };

  // Merge PDFs
  const mergePdfs = async () => {
    if (pdfFiles.length === 0) {
      setError('Please add at least one PDF file');
      return;
    }
    
    if (pdfFiles.length === 1) {
      setError('Please add at least two PDF files to merge');
      return;
    }
    
    setIsMerging(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each PDF and add to merged document
      for (let i = 0; i < pdfFiles.length; i++) {
        // Update progress
        setProgress(Math.round((i / pdfFiles.length) * 100));
        
        const pdfFile = pdfFiles[i];
        
        // Read PDF file
        const pdfBytes = await readFileAsArrayBuffer(pdfFile.file);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get the pages
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        // Add pages to the merged PDF
        pages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      saveAs(mergedPdfBlob, 'merged_document.pdf');
      
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('An error occurred while merging PDFs. Make sure all files are valid PDF documents.');
    } finally {
      setIsMerging(false);
    }
  };

  // Helper function to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container-custom py-10"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">PDF Merger</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Combine multiple PDF files into a single document. Simply upload your PDFs, 
          arrange them in the desired order, and merge them into one file.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          {/* Upload area */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-6 ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop PDF files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Only PDF files are supported
            </p>
          </div>

          {/* PDF list */}
          {pdfFiles.length > 0 && (
            <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Uploaded PDFs ({pdfFiles.length})</h3>
                <p className="text-sm text-gray-500">Files will be merged in the order shown below</p>
              </div>
              <div className="divide-y">
                {pdfFiles.map((pdf, index) => (
                  <div key={pdf.id} className="p-4 flex items-center">
                    <div className="bg-gray-100 p-2 rounded-md mr-4">
                      <FiFile size={24} className="text-red-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium truncate">{pdf.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(pdf.size)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => movePdfUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                        title="Move up"
                      >
                        <FiArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => movePdfDown(index)}
                        disabled={index === pdfFiles.length - 1}
                        className={`p-1 rounded hover:bg-gray-100 ${index === pdfFiles.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                        title="Move down"
                      >
                        <FiArrowDown size={18} />
                      </button>
                      <button
                        onClick={() => removePdf(pdf.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        title="Remove"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Merge button */}
          <button
            onClick={mergePdfs}
            disabled={isMerging || pdfFiles.length < 2}
            className={`w-full py-3 px-4 rounded-md font-medium text-white ${
              isMerging || pdfFiles.length < 2 ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isMerging ? 'Merging...' : 'Merge PDFs'}
          </button>

          {/* Progress bar */}
          {isMerging && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Merging... {progress}%</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Merge PDF Files</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Upload multiple PDF files by dragging & dropping or selecting files</li>
              <li>Arrange the PDFs in the order you want them to appear in the final document</li>
              <li>Click "Merge PDFs" to combine them into a single PDF file</li>
              <li>Download the merged PDF when processing is complete</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Merge an unlimited number of PDF files</li>
              <li>Reorder files by moving them up or down</li>
              <li>All pages from the original PDFs are preserved</li>
              <li>Fast processing entirely in your browser</li>
              <li>Your files are never uploaded to a server</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-md bg-yellow-50">
            <p className="text-yellow-800 font-medium">Tips</p>
            <p className="text-yellow-700 text-sm">
              For best results, make sure all your PDF files are valid and not password protected. 
              The order of the files in the list determines the order of pages in the final document.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfMerger; 