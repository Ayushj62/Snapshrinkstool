import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-container min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/remove-background" element={<ImageBgRemover />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/merge-pdf" element={<PdfMerger />} />
            <Route path="/compress-pdf" element={<PdfCompressor />} />
            <Route path="/image-resizer" element={<ImageResizer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default App; 