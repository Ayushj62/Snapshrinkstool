import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';
import Resizer from 'react-image-file-resizer';
import { Link } from 'react-router-dom';

const ImageResizer = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [quality, setQuality] = useState<number>(80);
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [percentage, setPercentage] = useState<number>(50);
  
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setProcessedImage(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    setImage(file);
    setOriginalSize(file.size);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      setOriginalDimensions({ width: originalWidth, height: originalHeight });
      
      // Set initial dimensions based on original
      setDimensions({ width: originalWidth, height: originalHeight });
    };
    img.src = objectUrl;
    
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  // Update height when width changes (if maintaining aspect ratio)
  useEffect(() => {
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      
      if (resizeMode === 'pixels') {
        setDimensions(prev => ({
          ...prev,
          height: Math.round(prev.width / aspectRatio)
        }));
      }
    }
  }, [dimensions.width, maintainAspectRatio, originalDimensions, resizeMode]);

  // Update width when height changes (if maintaining aspect ratio)
  useEffect(() => {
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      
      if (resizeMode === 'pixels') {
        setDimensions(prev => ({
          ...prev,
          width: Math.round(prev.height * aspectRatio)
        }));
      }
    }
  }, [dimensions.height, maintainAspectRatio, originalDimensions, resizeMode]);

  // Update dimensions when percentage changes
  useEffect(() => {
    if (originalDimensions && resizeMode === 'percentage') {
      const newWidth = Math.round(originalDimensions.width * (percentage / 100));
      const newHeight = Math.round(originalDimensions.height * (percentage / 100));
      setDimensions({ width: newWidth, height: newHeight });
    }
  }, [percentage, originalDimensions, resizeMode]);

  // Handle width input change
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    if (isNaN(newWidth) || newWidth <= 0) return;
    
    setDimensions(prev => ({
      ...prev,
      width: newWidth
    }));
  };

  // Handle height input change
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value);
    if (isNaN(newHeight) || newHeight <= 0) return;
    
    setDimensions(prev => ({
      ...prev,
      height: newHeight
    }));
  };

  // Handle percentage input change
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseInt(e.target.value);
    if (isNaN(newPercentage) || newPercentage <= 0 || newPercentage > 100) return;
    
    setPercentage(newPercentage);
  };

  // Resize image
  const resizeImage = async () => {
    if (!image || !originalDimensions) {
      setError('Please upload an image first');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Resize the image
      const resizedImage = await new Promise<File>((resolve, reject) => {
        Resizer.imageFileResizer(
          image,
          dimensions.width,
          dimensions.height,
          image.type === 'image/jpeg' || image.type === 'image/jpg' ? 'JPEG' : 'PNG',
          quality,
          0,
          (uri) => {
            // Convert base64 to File
            fetch(uri as string)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], image.name, { type: image.type });
                resolve(file);
              })
              .catch(reject);
          },
          'base64'
        );
      });
      
      // Create a preview of the resized image
      const objectUrl = URL.createObjectURL(resizedImage);
      setProcessedImage(objectUrl);
      setProcessedSize(resizedImage.size);
      
    } catch (err) {
      console.error(err);
      setError('An error occurred while resizing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    
    // Generate filename
    const extension = image?.name.split('.').pop() || 'jpg';
    const fileName = `${image?.name.split('.')[0] || 'image'}-resized.${extension}`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Calculate size reduction percentage
  const getSizeReductionPercentage = (): number => {
    if (!originalSize || !processedSize) return 0;
    const percentage = 100 - (processedSize / originalSize) * 100;
    return Math.round(percentage * 10) / 10; // Round to 1 decimal place
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
        <h1 className="text-3xl font-bold mb-4">Image Resizer</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Resize your images to specific dimensions, reduce file size, and convert between formats.
          Perfect for web uploads, email attachments, or social media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          {/* Upload area */}
          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <FiUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: JPG, PNG, WebP
              </p>
              <p className="text-xs text-gray-400 mt-2">
                By uploading a file, you agree to our{' '}
                <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
                {' '}regarding data collection and processing.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview of original image */}
              <div className="relative border rounded-lg overflow-hidden shadow-sm">
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                      setProcessedImage(null);
                      setOriginalDimensions(null);
                    }}
                    className="bg-white p-1 rounded-full shadow hover:bg-gray-100 transition-colors"
                    aria-label="Remove image"
                  >
                    <FiX className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-medium">Original Image</h3>
                  <p className="text-sm text-gray-500">
                    {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height} pixels` : ''}
                    {originalSize ? ` - ${formatFileSize(originalSize)}` : ''}
                  </p>
                </div>
                <div className="p-2">
                  <div className="bg-gray-100 rounded-md overflow-hidden flex justify-center">
                    <img 
                      ref={imageRef}
                      src={preview} 
                      alt="Original" 
                      className="max-w-full h-auto max-h-64 object-contain" 
                    />
                  </div>
                </div>
              </div>

              {/* Resize options */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-medium">Resize Options</h3>
                </div>
                <div className="p-4 space-y-6">
                  {/* Resize mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resize Mode
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="resize-mode"
                          checked={resizeMode === 'pixels'}
                          onChange={() => setResizeMode('pixels')}
                          className="mr-2"
                        />
                        <span>Custom dimensions (pixels)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="resize-mode"
                          checked={resizeMode === 'percentage'}
                          onChange={() => setResizeMode('percentage')}
                          className="mr-2"
                        />
                        <span>Scale by percentage</span>
                      </label>
                    </div>
                  </div>

                  {/* Dimensions inputs */}
                  {resizeMode === 'pixels' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          id="width"
                          value={dimensions.width}
                          onChange={handleWidthChange}
                          min="1"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          id="height"
                          value={dimensions.height}
                          onChange={handleHeightChange}
                          min="1"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={maintainAspectRatio}
                            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Maintain aspect ratio</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
                        Resize to {percentage}% of original size
                      </label>
                      <input
                        type="range"
                        id="percentage"
                        value={percentage}
                        onChange={handlePercentageChange}
                        min="1"
                        max="100"
                        className="block w-full"
                      />
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <span>1%</span>
                        <span>{percentage}%</span>
                        <span>100%</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        New dimensions: {dimensions.width} × {dimensions.height} pixels
                      </p>
                    </div>
                  )}

                  {/* Image quality */}
                  <div>
                    <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                      Image Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      id="quality"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      min="1"
                      max="100"
                      className="block w-full"
                    />
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>Low quality<br/>(smaller file)</span>
                      <span>High quality<br/>(larger file)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resize button */}
              <button
                onClick={resizeImage}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  isProcessing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Resize Image'}
              </button>
            </div>
          )}
        </div>

        {/* Results section */}
        <div>
          {processedImage ? (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-medium">Resized Image</h3>
                  <p className="text-sm text-gray-500">
                    {dimensions.width} × {dimensions.height} pixels - {formatFileSize(processedSize)}
                  </p>
                </div>
                <div className="p-2">
                  <div className="bg-gray-100 rounded-md overflow-hidden flex justify-center">
                    <img
                      src={processedImage}
                      alt="Resized"
                      className="max-w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  {getSizeReductionPercentage() > 0 ? (
                    <FiMinimize className="text-green-500 mr-2" size={24} />
                  ) : (
                    <FiMaximize className="text-blue-500 mr-2" size={24} />
                  )}
                  <h3 className="font-medium text-green-800">Image Processed Successfully!</h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original size:</span>
                    <span className="font-medium">{formatFileSize(originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New size:</span>
                    <span className="font-medium">{formatFileSize(processedSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {getSizeReductionPercentage() > 0 ? 'Reduction:' : 'Increase:'}
                    </span>
                    <span className={`font-medium ${getSizeReductionPercentage() > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                      {Math.abs(getSizeReductionPercentage())}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={downloadImage}
                  className="w-full py-2 px-4 rounded-md font-medium text-white bg-secondary-600 hover:bg-secondary-700 flex items-center justify-center"
                >
                  <FiDownload className="mr-2" />
                  Download Resized Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-10 text-center h-full flex flex-col items-center justify-center">
              <FiMaximize className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">
                Resized image will appear here
              </p>
              <p className="text-sm text-gray-400">
                Upload an image and adjust resize settings, then click "Resize Image"
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImageResizer; 