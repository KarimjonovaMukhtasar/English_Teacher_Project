import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tilchi-icon.svg'],
      manifest: {
        name: 'English Teacher Presentation System',
        short_name: 'TeacherPresenter',
        description: 'Interactive Presentation and Teaching Platform for English Teachers',
        theme_color: '#0891B2',
        background_color: '#ECFEFF',
        display: 'standalone',
        icons: [
          {
            src: '/tilchi-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-tanstack': ['@tanstack/react-store', '@tanstack/store'],
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-icons': ['lucide-react'],
          'vendor-db': ['dexie', 'dexie-react-hooks'],
          'vendor-peer': ['peerjs'],
        }
      }
    }
  }
});
