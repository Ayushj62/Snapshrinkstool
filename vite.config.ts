import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Set the base URL to the current directory for relative asset paths
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Prevent the build from failing on warnings
    chunkSizeWarningLimit: 1600,
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Ensure proper asset loading
    assetsInlineLimit: 4096, // 4KB
    // Optimize output
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-lib': ['pdf-lib'],
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow-models/body-pix'],
        },
      },
    },
  },
}); 