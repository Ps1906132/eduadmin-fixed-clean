import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// CATATAN KEAMANAN:
// GEMINI_API_KEY diakses di client melalui prefix VITE_ (lihat .env.example).
// Untuk production: batasi domain API key di Google AI Studio Console.
// Pertimbangkan backend proxy agar API key tidak terekspos di bundle.

// Validate environment in production
const validateEnv = () => {
  if (process.env.NODE_ENV === 'production') {
    const required = ['VITE_API_URL']; // GEMINI_API_KEY is now backend only
    required.forEach(v => {
      if (!process.env[v]) {
        console.warn(`⚠️ Warning: Missing required environment variable ${v}`);
      }
    });
  }
};

validateEnv();

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    sourcemap: false, // Production security
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-icons': ['lucide-react'],
          'animation-vendor': ['framer-motion'],
          // Split dashboard components for better loading
          'dashboards': [
            './src/components/DashboardSuperAdmin',
            './src/components/DashboardOrangTua',
            './src/components/DashboardGuruMapel'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  test: {
    // Vitest configuration — Fase 5: Testing
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/rbac/**'],
      reporter: ['text', 'json-summary'],
    },
  },
});
