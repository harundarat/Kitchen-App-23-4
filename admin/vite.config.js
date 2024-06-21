import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '0.0.0.0', // atau 'localhost'
    port: 4000
  },
  plugins: [react()],
})
