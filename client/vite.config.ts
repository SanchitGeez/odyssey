import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.VITE_API_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|use-sync-external-store)\//.test(id)) return 'react-vendor'
          if (/\/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(id)) return 'motion'
          if (id.includes('/node_modules/@radix-ui/')) return 'primitives'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/health': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
