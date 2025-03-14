import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiImage, FiX } from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

// Hardcoded API key - no need for users to enter one
const REMOVE_BG_API_KEY = 'owBRyicev2XPYHZimfQfTbr7';

// Component for handling file uploads with drag and drop
const ImageBgRemover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  
  // Refs for the canvases we'll use
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load the ML model when component mounts (as fallback)
  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        // Load the TensorFlow.js model
        await tf.ready();
        const loadedModel = await bodyPix.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2
        });
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setError('Failed to load the fallback AI model. Using remove.bg API only.');
        setIsModelLoading(false);
      }
    }
    
    loadModel();
    
    // Cleanup function
    return () => {
      // Clean up any resources if needed
    };
  }, []);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check if file size is too large
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }
    
    setFile(file);
    
    // Create preview of original image
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setProcessedImage(null); // Reset processed image when a new one is uploaded
    };
    reader.readAsDataURL(file);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  // Process image with remove.bg API
  const removeBackgroundWithAPI = async () => {
    if (!originalImage || !file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image_file', file);
      
      // Add parameters based on background type
      if (bgType === 'color') {
        formData.append('bg_color', bgColor.replace('#', ''));
      }
      
      // Make API request to remove.bg
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to remove background with API';
        
        // Try to get more specific error information
        if (response.status === 403) {
          errorMsg = 'API error: Invalid or expired access';
        } else if (response.status === 402) {
          errorMsg = 'API error: Service credit limit reached';
        }
        
        const errorResponse = await response.json().catch(() => ({}));
        if (errorResponse.errors && errorResponse.errors.length > 0) {
          errorMsg = `API error: ${errorResponse.errors[0].title || errorMsg}`;
        }
        
        throw new Error(errorMsg);
      }
      
      // Get image data as blob
      const imageBlob = await response.blob();
      
      // Create object URL from the blob
      const processedImageUrl = URL.createObjectURL(imageBlob);
      
      // If we need to apply a custom background image
      if (bgType === 'image' && customBgImage) {
        applyCustomBackground(processedImageUrl, customBgImage);
      } else {
        setProcessedImage(processedImageUrl);
      }
      
      setIsProcessing(false);
    } catch (err) {
      console.error('Error with remove.bg API:', err);
      setIsProcessing(false);
      setError((err as Error).message || 'An error occurred while processing with remove.bg API');
      
      // Fall back to local model if API fails and model is loaded
      if (model) {
        setError(`API failed. Trying with local AI model instead...`);
        setTimeout(() => {
          removeBackgroundWithLocalModel();
        }, 1000);
      }
    }
  };

  // Process the image to remove background using TensorFlow.js
  const removeBackgroundWithLocalModel = async () => {
    if (!originalImage || !model || !originalCanvasRef.current || !maskCanvasRef.current || !canvasRef.current) {
      if (!model) {
        setError('Background removal model is not ready. Please try again later.');
      }
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Load the image into an HTML Image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage;
      });
      
      // Get dimensions while preserving aspect ratio and reasonable size
      let width = img.width;
      let height = img.height;
      
      // Resize if too large to improve performance
      const MAX_DIMENSION = 800;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Set canvas dimensions
      const originalCanvas = originalCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const outputCanvas = canvasRef.current;
      
      originalCanvas.width = width;
      originalCanvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;
      outputCanvas.width = width;
      outputCanvas.height = height;
      
      // Draw the image on the original canvas
      const originalCtx = originalCanvas.getContext('2d');
      if (!originalCtx) return;
      originalCtx.drawImage(img, 0, 0, width, height);

      // Create a mask directly using BodyPix
      let segmentation;
      
      try {
        // First try person segmentation
        segmentation = await model.segmentPerson(originalCanvas, {
          flipHorizontal: false,
          internalResolution: 'high',
          segmentationThreshold: 0.5
        });
      } catch (error) {
        console.error('Error with person segmentation:', error);
        throw new Error('Failed to process the image with AI. Please try another image.');
      }
      
      // Check if segmentation returned any foreground pixels
      if (!segmentation.data.some(value => value === 1)) {
        throw new Error('No foreground objects detected. Please try another image.');
      }
      
      // Draw the mask using BodyPix helper
      const mask = bodyPix.toMask(
        segmentation,
        { r: 0, g: 0, b: 0, a: 0 },   // Foreground color (transparent)
        { r: 255, g: 255, b: 255, a: 255 }  // Background color (white)
      );

      // Draw the mask on the mask canvas
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;
      
      const imageData = new ImageData(mask.data, mask.width, mask.height);
      maskCtx.putImageData(imageData, 0, 0);
      
      // Apply the selected background
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return;
      
      // Apply the background based on the selected type
      if (bgType === 'color') {
        // Fill the background with the selected color
        outputCtx.fillStyle = bgColor;
        outputCtx.fillRect(0, 0, width, height);
      } else if (bgType === 'image' && customBgImage) {
        // Use custom background image
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve;
          bgImg.onerror = reject;
          bgImg.src = customBgImage;
        });
        
        outputCtx.drawImage(bgImg, 0, 0, width, height);
      } else {
        // For transparent background, start with clear canvas
        outputCtx.clearRect(0, 0, width, height);
      }
      
      // Draw the original image
      outputCtx.drawImage(originalCanvas, 0, 0);
      
      // Use composite operation to keep only the foreground
      outputCtx.globalCompositeOperation = 'destination-in';
      
      // Invert the mask since we want to keep the foreground
      maskCtx.globalCompositeOperation = 'difference';
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, width, height);
      
      // Apply the inverted mask to keep only the foreground
      outputCtx.drawImage(maskCanvas, 0, 0);
      
      // Reset composite operation
      outputCtx.globalCompositeOperation = 'source-over';
      
      // Get the processed image URL
      const processedDataUrl = outputCanvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      
      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing image with local model:', err);
      setIsProcessing(false);
      setError('Background removal failed. Please try a different image.');
    }
  };

  // Main function to remove background - uses API by default
  const removeBackground = async () => {
    await removeBackgroundWithAPI();
  };

  // Apply custom background image to a transparent PNG
  const applyCustomBackground = (foregroundImageUrl: string, backgroundImageUrl: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const foregroundImg = new Image();
    foregroundImg.crossOrigin = 'anonymous';
    
    foregroundImg.onload = () => {
      canvas.width = foregroundImg.width;
      canvas.height = foregroundImg.height;
      
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      backgroundImg.onload = () => {
        // Draw background image (stretched to match foreground dimensions)
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
        
        // Draw foreground image with transparent background
        ctx.drawImage(foregroundImg, 0, 0);
        
        // Get the combined image as data URL
        const combinedImageUrl = canvas.toDataURL('image/png');
        setProcessedImage(combinedImageUrl);
      };
      
      backgroundImg.src = backgroundImageUrl;
    };
    
    foregroundImg.src = foregroundImageUrl;
  };

  // Handle custom background image upload
  const onBgImageDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setCustomBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);
  
  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps } = useDropzone({ 
    onDrop: onBgImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `${file?.name?.split('.')[0]}-nobg.png` || 'image-nobg.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-3xl font-bold mb-4">Image Background Remover</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Remove the background from any image with one click. 
          You can make it transparent, add a solid color background, or use a custom image as background.
        </p>
        
        {isModelLoading && (
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading backup AI model...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload and Options Section */}
        <div>
          {!originalImage ? (
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
                Supports JPG, PNG, WEBP and GIF files (max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview of original image */}
              <div className="relative border rounded-lg overflow-hidden shadow-sm">
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    onClick={() => {
                      setFile(null);
                      setOriginalImage(null);
                      setProcessedImage(null);
                    }}
                    className="bg-white p-1 rounded-full shadow hover:bg-gray-100 transition-colors"
                    aria-label="Remove image"
                  >
                    <FiX className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Original Image</p>
                  <div className="bg-gray-100 rounded-md overflow-hidden">
                    <img src={originalImage} alt="Original" className="max-w-full h-auto mx-auto" />
                  </div>
                </div>
              </div>

              {/* Background options */}
              <div>
                <h3 className="text-lg font-medium mb-4">Background Options</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="bg-transparent" 
                      name="bgType" 
                      checked={bgType === 'transparent'} 
                      onChange={() => setBgType('transparent')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <label htmlFor="bg-transparent" className="text-gray-700">Transparent Background</label>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="bg-color" 
                        name="bgType" 
                        checked={bgType === 'color'} 
                        onChange={() => setBgType('color')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <label htmlFor="bg-color" className="text-gray-700">Solid Color Background</label>
                    </div>
                    
                    {bgType === 'color' && (
                      <div className="ml-6 mt-2">
                        <div 
                          className="w-10 h-10 rounded-md border shadow-sm cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        ></div>
                        
                        {showColorPicker && (
                          <div className="mt-2 relative">
                            <div className="absolute z-10">
                              <HexColorPicker 
                                color={bgColor} 
                                onChange={(color) => setBgColor(color)} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="bg-image" 
                        name="bgType" 
                        checked={bgType === 'image'} 
                        onChange={() => setBgType('image')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <label htmlFor="bg-image" className="text-gray-700">Image Background</label>
                    </div>
                    
                    {bgType === 'image' && (
                      <div className="ml-6 mt-2">
                        {!customBgImage ? (
                          <div 
                            {...getBgRootProps()} 
                            className="border border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input {...getBgInputProps()} />
                            <FiImage className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Upload a background image
                            </p>
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src={customBgImage} 
                              alt="Custom background" 
                              className="w-20 h-20 object-cover rounded-md" 
                            />
                            <button 
                              className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                              onClick={() => setCustomBgImage(null)}
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={removeBackground}
                disabled={isProcessing || isModelLoading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  isProcessing || isModelLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isProcessing ? 'Processing...' : isModelLoading ? 'Loading AI Model...' : 'Remove Background'}
              </button>
            </div>
          )}
        </div>

        {/* Processed Image Section */}
        <div>
          {processedImage ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Processed Image</p>
                  <div className="bg-gray-100 rounded-md overflow-hidden" style={bgType === 'transparent' ? { backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABDSURBVDiNY/z//z8DJYCJgUIw8AY0NjYyMjAwMBw/fpyRkZHxPwMDA4YBjIyMyOJYDYCpYiTVAEZSnCE+YKTYAGoBAKcnHBEM9z4vAAAAAElFTkSuQmCC")' } : {}}>
                    <img src={processedImage} alt="Processed" className="max-w-full h-auto mx-auto" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={downloadImage}
                className="w-full py-3 px-4 rounded-md font-medium text-white bg-secondary-600 hover:bg-secondary-700 flex items-center justify-center"
              >
                <FiDownload className="mr-2" />
                Download Image
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-10 text-center h-full flex flex-col items-center justify-center">
              <FiImage className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">
                Processed image will appear here
              </p>
              <p className="text-sm text-gray-400">
                Upload an image and click "Remove Background" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvases for image processing */}
      <div style={{ display: 'none' }}>
        <canvas ref={originalCanvasRef}></canvas>
        <canvas ref={maskCanvasRef}></canvas>
        <canvas ref={canvasRef}></canvas>
      </div>
    </motion.div>
  );
};

export default ImageBgRemover; 