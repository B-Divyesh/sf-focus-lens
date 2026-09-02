import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  publicDir: resolve(import.meta.dirname, 'public'),
  build: {
    outDir: resolve(import.meta.dirname, '../dist/site'),
    emptyOutDir: false,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: { input: resolve(import.meta.dirname, 'index.html') }
  }
});
