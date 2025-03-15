import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, HashRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Pages
import HomePage from './pages/HomePage';
import ImageBgRemover from './pages/ImageBgRemover';
import JpgToPdf from './pages/JpgToPdf';
import PdfMerger from './pages/PdfMerger';
import PdfCompressor from './pages/PdfCompressor';
import ImageResizer from './pages/ImageResizer';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';

// Main App Component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate resource preloading with a loading delay
  useEffect(() => {
    // Start loading resources
    const loadResources = async () => {
      try {
        // Simulate resource loading with a minimum delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Set loading to false when resources are loaded
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading resources:', error);
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  const handleLoadingComplete = () => {
    // You can add any post-loading logic here
    console.log('Loading complete');
  };

  return (
    <>
      {/* Show loading screen while resources are loading */}
      <LoadingScreen 
        isLoading={isLoading} 
        onLoadingComplete={handleLoadingComplete} 
      />

      {/* Main application content */}
      <div className="app-container min-h-screen flex flex-col">
        <HashRouter>
          <Navbar />
          <main className="flex-grow">
            {/* Only render the main content when loading is complete */}
            {!isLoading && (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/image-resizer" element={<ImageResizer />} />
                <Route path="/image-bg-remover" element={<ImageBgRemover />} />
                <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
                <Route path="/pdf-compressor" element={<PdfCompressor />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </main>
          <Footer />
        </HashRouter>
      </div>
    </>
  );
};

export default App; 