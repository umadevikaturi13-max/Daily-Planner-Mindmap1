/* import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
*/

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Add this for Tailwind 4 support
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Initialize Tailwind here
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    cssMinify: 'esbuild', // Change from lightningcss to esbuild to stop the "Unknown at rule" warnings
  }
});
