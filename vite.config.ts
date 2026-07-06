import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  preview: {
    port: 5173,
  },
  plugins: [
    vue(),
  ],
})
