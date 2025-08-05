import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // NOTE: The 'root' property has been removed.
  // Render's "Root Directory" setting now handles this.
  
  build: {
    // Vite will run inside the 'client' folder, so the output
    // will correctly be placed in 'client/dist'.
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // Your server proxy for local development is still fine.
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