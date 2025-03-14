import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiImage, 
  FiFileText, 
  FiCopy, 
  FiZap, 
  FiMaximize, 
  FiShare2,
  FiChevronRight,
  FiArrowRight,
  FiGithub
} from 'react-icons/fi';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut" 
    } 
  }
};

// Features data
const features = [
  {
    id: 1,
    title: 'Remove Background',
    description: 'Remove backgrounds from images with one click. Add custom backgrounds in various colors.',
    icon: <FiImage />,
    iconColor: 'bg-pink-500',
    path: '/remove-background'
  },
  {
    id: 2,
    title: 'JPG to PDF',
    description: 'Convert your JPG images to PDF files instantly. Multiple images can be combined into one PDF.',
    icon: <FiFileText />,
    iconColor: 'bg-blue-500',
    path: '/jpg-to-pdf'
  },
  {
    id: 3,
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document. Rearrange pages as needed.',
    icon: <FiCopy />,
    iconColor: 'bg-purple-500',
    path: '/merge-pdf'
  },
  {
    id: 4,
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality. Perfect for email attachments.',
    icon: <FiZap />,
    iconColor: 'bg-green-500',
    path: '/compress-pdf'
  },
  {
    id: 5,
    title: 'Image Resizer',
    description: 'Resize images to your desired dimensions. Adjust file size up or down.',
    icon: <FiMaximize />,
    iconColor: 'bg-yellow-500',
    path: '/image-resizer'
  },
  {
    id: 6,
    title: 'More Tools Coming',
    description: "We're constantly adding new tools to help with your document and image needs.",
    icon: <FiShare2 />,
    iconColor: 'bg-red-500',
    path: '/'
  }
];

const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen overflow-hidden bg-gray-50"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-600 to-primary-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 to-secondary-500/30"></div>
        
        {/* Animated Glow Orbs - decorative elements */}
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-primary-400/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-secondary-400/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1 rounded-full text-sm bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                Free • Secure • Client-side Processing
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Image & PDF Toolkit
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Edit, convert, and manipulate your images and PDFs online with our free, easy-to-use tools. 
              <span className="block mt-2 text-white/80 text-base md:text-lg">No registration required. 100% secure browser-based processing.</span>
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link 
                to="/remove-background" 
                className="relative group px-6 py-3 rounded-md font-medium shadow-lg transition-all duration-300 bg-white text-primary-600 hover:shadow-lg"
              >
                <span className="flex items-center">
                  Remove Background
                  <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              <Link 
                to="/jpg-to-pdf" 
                className="relative group px-6 py-3 rounded-md font-medium shadow-lg transition-all duration-300 gradient-border bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              >
                <span className="flex items-center">
                  Convert JPG to PDF
                  <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" fillOpacity="1" className="text-gray-50" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs text-primary-600 bg-primary-50 mb-3">POWERFUL TOOLS</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Premium Tools<span className="text-primary-500">.</span></h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              All tools are completely free to use. Your files are processed in your browser, 
              ensuring your data stays private and secure.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div 
                key={feature.id}
                variants={itemVariants}
                className="tool-card feature-card"
              >
                <div className={`feature-icon ${feature.iconColor}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
                <Link 
                  to={feature.path} 
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Try it now
                  <FiChevronRight className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-noise"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs text-secondary-600 bg-secondary-50 mb-3">SIMPLE PROCESS</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works<span className="text-secondary-500">.</span></h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Our tools are designed to be simple, fast, and effective. No technical expertise required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Upload Files</h3>
              <p className="text-gray-700">
                Select the files you want to edit from your device or drag and drop them directly.
              </p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Process Online</h3>
              <p className="text-gray-700">
                Our system automatically processes your files in the browser. No uploads to our servers.
              </p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Download Results</h3>
              <p className="text-gray-700">
                Download your processed files immediately. That's it! No registration required.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-primary-600"></div>
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        
        {/* Animated glow effects */}
        <div className="absolute top-1/3 left-10 w-40 h-40 rounded-full bg-white/5 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="container-custom relative z-10 text-center">
          <motion.div 
            className="max-w-3xl mx-auto glass rounded-2xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to Get Started<span className="text-primary-300">?</span>
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Our tools are 100% free, with no hidden fees or subscriptions.
              <span className="block mt-2 text-white/70 text-base">Try our premium-quality tools now!</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link 
                to="/remove-background" 
                className="inline-flex items-center px-6 py-3 rounded-md font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-white text-primary-600 hover:bg-gray-100"
              >
                <FiImage className="mr-2" />
                Try Image Background Remover
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-xl font-bold">Image<span className="text-primary-500">&</span>PDF</span>
              <span className="ml-4 text-sm text-gray-400">© {new Date().getFullYear()} All rights reserved</span>
            </div>
            <div className="flex items-center">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
              <span className="mx-4 text-gray-600">|</span>
              <span className="text-sm text-gray-400">Made with ❤️ by <span className="text-primary-400">Claude</span></span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default HomePage; 