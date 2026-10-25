/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single-page app: the marketing site lives at `/`, the nine plant-operations
// modules at `/dashboard`, `/analytics`, … — the same clean URLs the legacy
// server exposed, so old bookmarks keep working (see src/app/routes.tsx).
export default defineConfig({
  plugins: [react()],
  // Emit *root-absolute* asset URLs (`/assets/…`). The nine console modules
  // are served from clean URLs (`/dashboard`, `/analytics`, …) and static
  // hosts rewrite those routes to index.html. Root-absolute asset paths
  // resolve identically from the landing route and every rewritten console
  // route, so the stylesheet can never 404 and leave the console painted on a
  // bare `#031B30` background. (A relative `./` base is unsafe here: on a
  // rewritten route it can resolve against `/dashboard/assets/…`.)
  base: '/',
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
