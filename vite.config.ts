
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: {
      // Configuración especial para Codespaces
      port: process.env.CODESPACES ? 443 : undefined,
      // Permitir conexiones desde cualquier origen en desarrollo
      clientPort: process.env.CODESPACES ? 443 : undefined,
    },
    // Configuración de CORS para desarrollo
    cors: true,
    // Configuración adicional para desarrollo local y Codespaces
    watch: {
      usePolling: !!process.env.CODESPACES, // Usar polling en Codespaces
      interval: 1000, // Intervalo de polling más conservador
    },
  },
  preview: {
    host: "::",
    port: 8080,
    strictPort: false,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimizaciones adicionales para prevenir el pestañeo
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs'],
        },
      },
    },
  },
}));
