import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Vite = the dev server + build tool. Docs: https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Makes the app installable on phones/laptops ("Add to Home Screen") and cache-able offline.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'wascal-logo.png'],
      manifest: {
        name: 'WASCAL Project Tracker',
        short_name: 'WASCAL Tracker',
        description: 'Projects, deliverables and deadlines across WASCAL.',
        theme_color: '#0f2e57',
        background_color: '#f4f6f9',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'favicon.png', sizes: '64x64', type: 'image/png' }],
      },
    }),
  ],
  resolve: {
    // Lets you write `import { Button } from '@/ui'` instead of '../../../ui'.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5180 },
  preview: { port: 5180 },
});
