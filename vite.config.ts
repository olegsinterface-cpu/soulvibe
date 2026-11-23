import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // На GitHub Pages сайт открывается по подпути /<репозиторий>/ — его передаёт сборка (BASE_PATH)
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { port: 5173 },
})
