import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';

interface LoadingScreenProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isLoading, 
  onLoadingComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  
  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Initialize the 3D scene
  useEffect(() => {
    if (!canvasRef.current || sceneInitialized) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f7ff, 10, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    // Create glowing sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f7ff,
      emissive: 0x00f7ff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphereRef.current = sphere;
    
    // Add particles for cosmic effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;
    
    // Animation loop
    const animate = () => {
      if (!sphereRef.current || !particlesRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      // Rotate sphere
      sphereRef.current.rotation.y += 0.005;
      
      // Rotate particles
      particlesRef.current.rotation.y += 0.0005;
      particlesRef.current.rotation.x += 0.0002;
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      // Update camera
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      
      // Update renderer
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    setSceneInitialized(true);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sphereRef.current) {
        sphereRef.current.geometry.dispose();
        (sphereRef.current.material as THREE.Material).dispose();
      }
      
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
    };
  }, [canvasRef.current]);
  
  // Handle loading progress animation
  useEffect(() => {
    if (isLoading) {
      gsap.to({}, {
        duration: 3,
        onUpdate: function() {
          const progressValue = Math.min(this.progress() * 100, 100);
          setLoadingProgress(progressValue);
        },
        onComplete: function() {
          // After animation completes, wait a bit then trigger onLoadingComplete
          setTimeout(() => {
            onLoadingComplete?.();
            // Hide the HTML loader when React takes over
            if (window.hideInitialLoader) {
              window.hideInitialLoader();
            }
          }, 500);
        }
      });
    }
  }, [isLoading, onLoadingComplete]);
  
  // Exit animation when loading is complete
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Additional cleanup if needed
        }
      });
    }
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: "linear-gradient(to bottom, #0f172a, #020617)"
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600"
        >
          Image & PDF Toolkit
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-white/70"
        >
          Your premium toolkit for document processing
        </motion.p>
        
        {/* Loading bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Loading percentage */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-white/50 text-sm"
        >
          {Math.round(loadingProgress)}% Complete
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;

// Declare the hideInitialLoader function on the window object
declare global {
  interface Window {
    hideInitialLoader?: () => void;
  }
} 