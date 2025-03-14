import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Main App Component
const App: React.FC = () => {
  return (
    <div className="app-container min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/remove-background" element={<ImageBgRemover />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/merge-pdf" element={<PdfMerger />} />
            <Route path="/compress-pdf" element={<PdfCompressor />} />
            <Route path="/image-resizer" element={<ImageResizer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default App; 