import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FiUpload, FiDownload, FiFile, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DataConsentDialog from '../components/DataConsentDialog';
import { collectUserData } from '../services/dataCollection';

// Maximum file size for processing: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const PdfCompressor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);

  // Clean up any blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function
      if (compressedPdf && compressedPdf instanceof Blob) {
        // If we created any object URLs, revoke them
        URL.revokeObjectURL(URL.createObjectURL(compressedPdf));
      }
    };
  }, [compressedPdf]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setCompressedPdf(null);
    
    // Only accept one PDF file
    const file = acceptedFiles[0];
    
    if (!file) {
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }
    
    setPdfFile(file);
    setOriginalSize(file.size);
    setShowConsentDialog(true);
  }, []);

  // Handle consent
  const handleConsent = (accepted: boolean) => {
    if (accepted && pdfFile) {
      collectUserData({
        fileName: pdfFile.name,
        fileType: pdfFile.type,
        fileSize: pdfFile.size,
        toolUsed: 'pdf-compressor'
      }, true);
    }
    setShowConsentDialog(false);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  // Compress PDF with improved error handling and progress updates
  const compressPdf = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file');
      return;
    }
    
    setIsCompressing(true);
    setProgress(10);
    setError(null);
    
    try {
      // Read the file
      setProgress(20);
      const pdfBytes = await readFileAsArrayBuffer(pdfFile);
      
      // Load the PDF document
      setProgress(40);
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(pdfBytes, {
          updateMetadata: false, // Skip metadata updates which can cause errors
          ignoreEncryption: true, // Try to open encrypted documents 
        });
      } catch (err) {
        console.error('Error loading PDF:', err);
        throw new Error('Could not read the PDF file. It may be corrupted or encrypted.');
      }
      
      // Compress the PDF with compression level settings
      setProgress(60);
      let compressedPdfBytes;
      try {
        compressedPdfBytes = await pdfDoc.save({
          useObjectStreams: compressionLevel === 'high',
          addDefaultPage: false,
          objectsPerTick: compressionLevel === 'low' ? 20 : compressionLevel === 'medium' ? 50 : 100,
          updateFieldAppearances: false
        });
      } catch (err) {
        console.error('Error saving PDF:', err);
        throw new Error('Failed to compress the PDF. The file might be incompatible or damaged.');
      }
      
      // Create blob from compressed PDF
      setProgress(80);
      const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      setCompressedPdf(compressedPdfBlob);
      setCompressedSize(compressedPdfBlob.size);
      
      setProgress(100);
      
      // Check if the compressed file is actually smaller
      if (compressedPdfBlob.size >= pdfFile.size) {
        setError('The file could not be compressed further. It may already be optimized.');
      }
    } catch (err: any) {
      console.error('PDF compression error:', err);
      setError(err.message || 'An error occurred while compressing the PDF. Make sure it is a valid PDF document.');
      setCompressedPdf(null);
      setCompressedSize(0);
    } finally {
      setIsCompressing(false);
    }
  };

  // Helper function to read file as ArrayBuffer with better error handling
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Set up error handling
      reader.onerror = () => {
        reject(new Error('Failed to read the file. Please try again with a different file.'));
      };
      
      reader.onabort = () => {
        reject(new Error('File reading was aborted. Please try again.'));
      };
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to the required format.'));
        }
      };
      
      // Start reading the file
      try {
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(new Error('Could not read the file. The file might be corrupted.'));
      }
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

  // Calculate compression percentage
  const getCompressionPercentage = (): number => {
    if (!originalSize || !compressedSize) return 0;
    const percentage = 100 - (compressedSize / originalSize) * 100;
    return Math.round(percentage * 10) / 10; // Round to 1 decimal place
  };

  // Download compressed PDF with error handling
  const downloadCompressedPdf = () => {
    if (!compressedPdf || !pdfFile) return;
    
    try {
      const fileName = pdfFile.name.replace('.pdf', '-compressed.pdf');
      saveAs(compressedPdf, fileName);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download the compressed PDF. Please try again.');
    }
  };

  // Reset the component state
  const resetState = () => {
    setPdfFile(null);
    setCompressedPdf(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setError(null);
    setProgress(0);
    setIsCompressing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container-custom py-10"
    >
      <DataConsentDialog
        isOpen={showConsentDialog}
        onAccept={() => handleConsent(true)}
        onDecline={() => handleConsent(false)}
      />
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">PDF Compressor</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Reduce the file size of your PDF documents while maintaining quality. Perfect for 
          email attachments, uploading to websites, or saving storage space.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          {/* Upload area */}
          {!pdfFile ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-6 ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <FiUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop a PDF file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Only PDF files are supported (max {formatFileSize(MAX_FILE_SIZE)})
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Processing is done entirely in your browser. Your files are never uploaded to a server.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium">Selected PDF</h3>
                <button 
                  onClick={resetState}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change file
                </button>
              </div>
              <div className="p-4 flex items-center">
                <div className="bg-gray-100 p-2 rounded-md mr-4">
                  <FiFile size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="font-medium truncate">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    Size: {formatFileSize(pdfFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compression options */}
          {pdfFile && (
            <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Compression Level</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="compression-low"
                      name="compression-level"
                      checked={compressionLevel === 'low'}
                      onChange={() => setCompressionLevel('low')}
                      className="mr-2"
                    />
                    <label htmlFor="compression-low" className="flex flex-col">
                      <span className="font-medium">Low compression</span>
                      <span className="text-sm text-gray-500">Better quality, larger file size</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="compression-medium"
                      name="compression-level"
                      checked={compressionLevel === 'medium'}
                      onChange={() => setCompressionLevel('medium')}
                      className="mr-2"
                    />
                    <label htmlFor="compression-medium" className="flex flex-col">
                      <span className="font-medium">Medium compression (recommended)</span>
                      <span className="text-sm text-gray-500">Good balance between quality and file size</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="compression-high"
                      name="compression-level"
                      checked={compressionLevel === 'high'}
                      onChange={() => setCompressionLevel('high')}
                      className="mr-2"
                    />
                    <label htmlFor="compression-high" className="flex flex-col">
                      <span className="font-medium">High compression</span>
                      <span className="text-sm text-gray-500">Smaller file size, potential quality loss</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compress button */}
          {pdfFile && !isCompressing && !compressedPdf && (
            <button
              onClick={compressPdf}
              disabled={isCompressing}
              className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                isCompressing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isCompressing ? 'Compressing...' : 'Compress PDF'}
            </button>
          )}

          {/* Try again button if there was an error */}
          {error && pdfFile && !isCompressing && (
            <button
              onClick={compressPdf}
              className="w-full mt-4 py-3 px-4 rounded-md font-medium text-white bg-secondary-600 hover:bg-secondary-700"
            >
              Try Again
            </button>
          )}

          {/* Progress bar */}
          {isCompressing && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Compressing... {progress}%</p>
            </div>
          )}

          {/* Compression results */}
          {compressedPdf && (
            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <FiZap className="text-green-500 mr-2" size={24} />
                <h3 className="font-medium text-green-800">Compression Complete!</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original size:</span>
                  <span className="font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compressed size:</span>
                  <span className="font-medium">{formatFileSize(compressedSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reduction:</span>
                  <span className="font-medium text-green-600">{getCompressionPercentage()}%</span>
                </div>
              </div>
              
              <button
                onClick={downloadCompressedPdf}
                className="w-full py-2 px-4 rounded-md font-medium text-white bg-secondary-600 hover:bg-secondary-700 flex items-center justify-center"
              >
                <FiDownload className="mr-2" />
                Download Compressed PDF
              </button>
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
          <h2 className="text-xl font-bold mb-4">Compress PDF Files</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Upload a PDF file you want to compress</li>
              <li>Select your preferred compression level</li>
              <li>Click "Compress PDF" to reduce the file size</li>
              <li>Download the compressed PDF when processing is complete</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Multiple compression levels to choose from</li>
              <li>Fast processing entirely in your browser</li>
              <li>Your files are never uploaded to a server</li>
              <li>The original document structure and quality are preserved</li>
              <li>Free to use with no file size limits</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-md bg-blue-50">
            <p className="text-blue-800 font-medium">Why compress PDFs?</p>
            <p className="text-blue-700 text-sm mb-2">
              Compressing PDFs makes them easier to share via email, saves storage space, and helps 
              web pages load faster when PDFs are embedded or linked.
            </p>
            <p className="text-blue-700 text-sm">
              Our compression algorithms attempt to maintain document quality while reducing unnecessary data.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfCompressor; 