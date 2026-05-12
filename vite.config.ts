import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // এই অংশটুকু Render-এর এরর সমাধান করবে
      allowedHosts: [
        'shopnexa-gyon.onrender.com', // আপনার Render ডোমেইন
        '.onrender.com'               // সব Render সাবডোমেইন অ্যালাউ করার জন্য
      ],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: false,
    },
  };
});