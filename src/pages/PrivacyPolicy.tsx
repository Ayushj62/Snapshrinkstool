import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container-custom py-10"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. No Data Collection</h2>
            <p className="mb-4">
              Our application does not collect any personal information or data when you use our Image & PDF Toolkit. Your privacy is our top priority.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All processing is done completely in your browser</li>
              <li>Your files are never uploaded to any server</li>
              <li>We do not use cookies or tracking technologies</li>
              <li>We do not store any information about your usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Local Processing</h2>
            <p className="mb-4">
              Here's how our tools work:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Files are processed entirely in your browser</li>
              <li>Processing happens on your device, not on our servers</li>
              <li>Your files never leave your computer</li>
              <li>Once you close your browser tab, all processed data is automatically removed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
            <p className="mb-4">
              We utilize the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Background removal API (remove.bg) - Only if you choose to use the API option</li>
              <li>TensorFlow.js (local AI processing library)</li>
            </ul>
            <p className="mt-4">
              When using the remove.bg API option, your image will be sent to their servers for processing. Please refer to their privacy policy for details on how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
            <p className="mb-4">
              Since we don't collect any data, there is no need to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal information</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="mt-4">
              Your privacy is automatically protected by our no-collection design.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:ayushjaiswal0970@gmail.com" className="text-primary-600 hover:text-primary-700">
                ayushjaiswal0970@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <div className="mt-8 text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy; 