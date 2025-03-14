import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiSend } from 'react-icons/fi';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Mouse movement tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // Create stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0x00f7ff,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = -Math.random() * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (stars) {
        stars.rotation.y += 0.0002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Canvas background */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
      />

      {/* Particle cursor */}
      <motion.div
        className="fixed w-4 h-4 bg-[#00f7ff] rounded-full pointer-events-none z-50"
        style={{
          x: smoothX,
          y: smoothY,
          boxShadow: '0 0 20px #00f7ff'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Profile section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00f7ff] to-[#bd00ff] rounded-full blur-xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <img
              src="/images/Ayush profile.jpg"
              alt="Ayush Warsh"
              className="relative w-full h-full rounded-full object-cover border-4 border-[#00f7ff] shadow-lg hover:shadow-[#00f7ff]/50 transition-shadow duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00f7ff] to-[#bd00ff]">
            Ayush Warsh
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Full Stack Developer & AI Enthusiast
          </p>
        </motion.div>

        {/* Social media links */}
        <motion.div 
          className="flex justify-center space-x-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="https://github.com/Ayushj62"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-gray-400 hover:text-[#00f7ff] transition-colors"
          >
            <FiGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/ayush-warsh-646562251/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-gray-400 hover:text-[#00f7ff] transition-colors"
          >
            <FiLinkedin />
          </a>
          <a
            href="https://x.com/AyushJa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-gray-400 hover:text-[#00f7ff] transition-colors"
          >
            <FiTwitter />
          </a>
        </motion.div>

        {/* Contact form */}
        <motion.div
          className="max-w-2xl mx-auto bg-[#0a0a1a]/50 backdrop-blur-lg rounded-2xl p-8 shadow-[0_0_50px_rgba(0,247,255,0.1)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0a1a] border border-[#00f7ff]/30 rounded-lg focus:outline-none focus:border-[#00f7ff] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0a1a] border border-[#00f7ff]/30 rounded-lg focus:outline-none focus:border-[#00f7ff] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0a1a] border border-[#00f7ff]/30 rounded-lg focus:outline-none focus:border-[#00f7ff] text-white h-32"
                required
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00f7ff] to-[#bd00ff] text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSend />
              <span>Send Message</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 