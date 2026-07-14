import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    // Separate from vite.embed.config.js's outDir ('dist', which the backend
    // serves at /dist/cark-widget.js for embeds) so the two builds never fight.
    outDir: 'dist-app',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        superAdmin: resolve(__dirname, 'super-admin.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
