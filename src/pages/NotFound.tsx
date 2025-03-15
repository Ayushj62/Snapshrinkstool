import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container-custom py-20 flex flex-col items-center justify-center min-h-[70vh]"
    >
      <div className="bg-red-500/10 p-4 rounded-full mb-6 animate-pulse">
        <FiAlertTriangle className="text-red-500 w-16 h-16" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-3 text-center">Page Not Found</h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>

      <div className="space-y-4 w-full max-w-md">
        <Link
          to="/"
          className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-colors w-full"
        >
          <FiHome className="mr-2" />
          Return to Home
        </Link>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          If you believe this is an error, please contact our support.
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound; 