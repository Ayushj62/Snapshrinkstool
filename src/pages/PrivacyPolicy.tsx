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
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              When you use our Image & PDF Toolkit, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Files you upload for processing (images and PDFs)</li>
              <li>Technical information about your device and browser</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process your files and provide the requested services</li>
              <li>To improve our services and user experience</li>
              <li>To send you important updates about our services</li>
              <li>To maintain and improve our website's security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Processing</h2>
            <p className="mb-4">
              Your uploaded files are processed as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Files are processed in your browser for immediate operations</li>
              <li>Processed files are temporarily stored for service delivery</li>
              <li>We implement security measures to protect your data</li>
              <li>Files are automatically deleted after processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Analytics providers to improve our services</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:ayushjaiswal0970@gmail.com" className="text-primary-600 hover:text-primary-700">
                ayushjaiswal0970@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
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