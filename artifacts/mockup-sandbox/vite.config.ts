/* import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
   plugins: [react()],
   resolve: {
     alias: {
       "@": path.resolve(_dirname, "./src"),
     },
   },
   build: {
     outDir: 'dist',
   }
 });
*/

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
