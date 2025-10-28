import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2015',
    rollupOptions: {
      input: {
        ui: resolve(__dirname, 'src/ui/index.html'),
      },
      output: [
        {
          entryFileNames: 'ui/[name].js',
          chunkFileNames: 'ui/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'index.html') {
              return 'ui/index.html';
            }
            return 'ui/[name].[ext]';
          },
        }
      ],
    },
  },
  base: './',
  define: {
    global: 'globalThis',
  },
});
