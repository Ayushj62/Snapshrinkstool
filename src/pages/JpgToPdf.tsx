import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FiUpload, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const JpgToPdf = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Filter out non-image files
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      if (acceptedFiles.length > 0) {
        setError('Please upload only image files (JPEG, PNG, etc.)');
      }
      return;
    }
    
    // Process each image file
    const newImages = imageFiles.map(file => {
      // Create a preview for the image
      const preview = URL.createObjectURL(file);
      return {
        file,
        preview,
        id: `${file.name}-${Date.now()}`
      };
    });
    
    setImages(prev => [...prev, ...newImages]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    }
  });

  // Move image up in the list
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
  };

  // Move image down in the list
  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  // Remove image from the list
  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    setImages(images.filter(img => img.id !== id));
  };

  // Convert images to PDF
  const convertToPdf = async () => {
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }
    
    setIsConverting(true);
    setProgress(0);
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Process each image and add to PDF
      for (let i = 0; i < images.length; i++) {
        // Update progress
        setProgress(Math.round((i / images.length) * 100));
        
        const image = images[i];
        
        // Convert image to bytes
        const imageBytes = await readFileAsArrayBuffer(image.file);
        
        let page;
        if (image.file.type === 'image/jpeg' || image.file.type === 'image/jpg') {
          page = await pdfDoc.addPage();
          const jpgImage = await pdfDoc.embedJpg(imageBytes);
          const { width, height } = page.getSize();
          const imgDims = jpgImage.scale(1);
          
          // Calculate scaling to fit the page while preserving aspect ratio
          const scale = Math.min(
            width / imgDims.width,
            height / imgDims.height
          ) * 0.9; // 90% of the page
          
          page.drawImage(jpgImage, {
            x: (width - imgDims.width * scale) / 2,
            y: (height - imgDims.height * scale) / 2,
            width: imgDims.width * scale,
            height: imgDims.height * scale,
          });
        } else if (image.file.type === 'image/png') {
          page = await pdfDoc.addPage();
          const pngImage = await pdfDoc.embedPng(imageBytes);
          const { width, height } = page.getSize();
          const imgDims = pngImage.scale(1);
          
          // Calculate scaling to fit the page while preserving aspect ratio
          const scale = Math.min(
            width / imgDims.width,
            height / imgDims.height
          ) * 0.9; // 90% of the page
          
          page.drawImage(pngImage, {
            x: (width - imgDims.width * scale) / 2,
            y: (height - imgDims.height * scale) / 2,
            width: imgDims.width * scale,
            height: imgDims.height * scale,
          });
        }
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(pdfBlob, 'converted_images.pdf');
      
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('An error occurred while converting the images to PDF');
    } finally {
      setIsConverting(false);
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

  // Clean up when component unmounts
  const cleanUp = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container-custom py-10"
      onAnimationComplete={cleanUp}
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">JPG to PDF Converter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert your JPG, PNG, or other image files to PDF documents. Add multiple images and 
          arrange them in the order you want them to appear in the PDF.
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
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WEBP and GIF files
            </p>
          </div>

          {/* Image list */}
          {images.length > 0 && (
            <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Uploaded Images ({images.length})</h3>
                <p className="text-sm text-gray-500">Drag and drop images to reorder</p>
              </div>
              <div className="divide-y">
                {images.map((image, index) => (
                  <div key={image.id} className="p-4 flex items-center">
                    <img 
                      src={image.preview} 
                      alt={image.file.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div className="flex-grow">
                      <p className="font-medium truncate">{image.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(image.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                        title="Move up"
                      >
                        <FiArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className={`p-1 rounded hover:bg-gray-100 ${index === images.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                        title="Move down"
                      >
                        <FiArrowDown size={18} />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
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

          {/* Convert button */}
          <button
            onClick={convertToPdf}
            disabled={isConverting || images.length === 0}
            className={`w-full py-3 px-4 rounded-md font-medium text-white ${
              isConverting || images.length === 0 ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isConverting ? 'Converting...' : 'Convert to PDF'}
          </button>

          {/* Progress bar */}
          {isConverting && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Converting... {progress}%</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Preview/Info section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Convert Images to PDF</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Upload one or more images by dragging & dropping or selecting files</li>
              <li>Arrange the images in the order you want them to appear in the PDF</li>
              <li>Click "Convert to PDF" to generate your PDF document</li>
              <li>Download the PDF file when the conversion is complete</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Convert multiple image formats (JPG, PNG, etc.) to PDF</li>
              <li>Reorder images by moving them up or down</li>
              <li>Each image is placed on a separate page in the PDF</li>
              <li>Fast processing entirely in your browser</li>
              <li>Your images are never uploaded to a server</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-800 font-medium">Privacy Note</p>
            <p className="text-blue-700 text-sm">
              All processing is done locally in your browser. Your images are not uploaded to any server,
              ensuring your data remains private and secure.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JpgToPdf; 