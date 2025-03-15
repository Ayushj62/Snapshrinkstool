import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface DataConsentDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const DataConsentDialog = ({ isOpen, onAccept, onDecline }: DataConsentDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full relative"
          >
            <button
              onClick={onDecline}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Data Collection Consent</h2>
            
            <p className="text-gray-600 mb-4">
              We collect anonymous usage data to improve our services. This includes:
            </p>

            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>File information (name, type, size)</li>
              <li>Tool usage statistics</li>
              <li>Browser and device information</li>
              <li>Language preferences</li>
            </ul>

            <p className="text-gray-600 mb-6">
              Your data is collected anonymously and cannot be used to identify you.
              You can opt out at any time.
            </p>

            <div className="flex gap-4">
              <button
                onClick={onAccept}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={onDecline}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
              >
                Decline
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataConsentDialog; 