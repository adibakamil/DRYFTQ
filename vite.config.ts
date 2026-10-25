/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single-page app: the marketing site lives at `/`, the nine plant-operations
// modules at `/dashboard`, `/analytics`, … — the same clean URLs the legacy
// server exposed, so old bookmarks keep working (see src/app/routes.tsx).
export default defineConfig({
  plugins: [react()],
  // Emit *relative* asset URLs (`./assets/…`) instead of root-absolute
  // (`/assets/…`). The nine console modules are served from clean URLs
  // (`/dashboard`, `/analytics`, …) and several static hosts rewrite
  // document-relative URLs for those routes while leaving root-absolute
  // ones pointing at the wrong depth — which 404s the stylesheet and leaves
  // the console painted on a bare `#031B30` background. Relative paths
  // resolve correctly at any route depth on any host, and work when the
  // bundle is opened from a sub-path or the filesystem.
  base: './',
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
