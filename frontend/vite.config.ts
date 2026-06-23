import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@url-checker/types': path.resolve(__dirname, 'src/types'),
      '@url-checker/api': path.resolve(__dirname, 'src/api'),
      '@url-checker/store': path.resolve(__dirname, 'src/store'),
      '@url-checker/components': path.resolve(__dirname, 'src/components'),
      '@url-checker/styles': path.resolve(__dirname, 'src/styles'),
      '@url-checker/utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
