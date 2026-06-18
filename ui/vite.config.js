import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O proxy encaminha /api/* para o motor (FastAPI em :8000). Sem o motor no ar, as
// telas caem no dado de exemplo (ver src/api.js).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
