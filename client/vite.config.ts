import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // This is the correct setup for a monorepo where Vite
  // runs from the root but the client code is in a subfolder.
  root: 'client',

  build: {
    // This tells Vite to put the build output in 'client/dist'.
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // This proxy is perfect for local development.
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});