// vite.config.js
import { defineConfig } from 'vite'
import react     from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request starting with "/api" will be forwarded to your backend
      '/api': {
        target: 'http://localhost:5000', // wherever your Express server runs
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
