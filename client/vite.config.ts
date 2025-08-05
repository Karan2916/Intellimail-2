import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // === MONOREPO SETUP (Required for build & styling) ===
  // This tells Vite your frontend code is in the 'client' folder.
  root: 'client',
  build: {
    // The build output will be placed in 'client/dist'.
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // === LOCAL DEVELOPMENT SETUP (Your existing proxy) ===
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to your local backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});