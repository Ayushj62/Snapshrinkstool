import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiArrowUp, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-900 text-gray-400 relative overflow-visible">
      {/* Grid background overlay */}
      <div className="absolute inset-0 grid-bg opacity-5"></div>
      
      {/* Blurred gradient accent */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-primary-600/5 blur-3xl"></div>
      <div className="absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-secondary-500/5 blur-3xl"></div>
      
      <div className="container-custom py-16 relative z-10">
        {/* Scroll to top button */}
        <div className="fixed bottom-8 right-8 z-50">
          <motion.button
            onClick={scrollToTop}
            className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to top"
          >
            <FiArrowUp size={20} />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <svg 
                className="w-8 h-8 text-primary-500" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <circle cx="10" cy="13" r="2"/>
                <path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/>
              </svg>
              <span className="text-xl font-bold text-white">Image<span className="text-primary-500">&</span>PDF</span>
            </Link>
            <p className="mt-4 text-gray-400">Free online tools to edit images and PDFs with ease. No registration required.</p>
            <div className="flex mt-6 space-x-4">
              <a href="https://github.com/Ayushj62" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
              <a href="https://x.com/AyushJa?t=kjzFbuZUu5N1e8WtAxS4fw&s=08" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://www.instagram.com/the_ayush_jaiswal67/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/ayush-warsh-646562251/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Image Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/remove-background" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Remove Background
                </Link>
              </li>
              <li>
                <Link to="/image-resizer" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Resize Image
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/jpg-to-pdf" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link to="/merge-pdf" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/compress-pdf" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2"></span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; {currentYear} Image&PDF Toolkit. All rights reserved.</p>
          <p className="mt-2 text-sm text-gray-500">
            <a 
              href="https://www.instagram.com/the_ayush_jaiswal67/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              Developed by Ayush Warsh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 