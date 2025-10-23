import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚙️ Cấu hình proxy đến backend Node (port 5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',  // tất cả request /api sẽ chuyển đến backend
    },
  },
})
