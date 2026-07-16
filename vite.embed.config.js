import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/cark-widget.js'),
      name: 'CarkWidget',
      formats: ['iife'],
      fileName: () => 'cark-widget.v1.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [
    {
      name: 'legacy-widget-alias',
      closeBundle() {
        copyFileSync(resolve(__dirname, 'dist', 'cark-widget.v1.js'), resolve(__dirname, 'dist', 'cark-widget.js'));
      },
    },
  ],
});
