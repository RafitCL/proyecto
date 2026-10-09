// Configuración de Vite (bundler + servidor de desarrollo).
// POR QUÉ EXISTE: aquí conectamos el plugin de React (JSX -> JS, Fast Refresh)
// y añadimos un proxy inverso.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // PROXY: en desarrollo, las peticiones a /api se reenvían en silencio al
    // backend. Evita escribir la URL completa en cada fetch y, sobre todo,
    // evita problemas de CORS porque el navegador ve la MISMA origen
    // (localhost:5173) para HTML y API. En producción no hace falta: el
    // backend y el build estático se sirven desde el mismo dominio.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
