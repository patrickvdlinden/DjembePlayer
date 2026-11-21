import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { syncAssets } from './scripts/sync-assets.mjs';

syncAssets();

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
});
