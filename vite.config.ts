import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM environment mein __dirname define karne ka sahi tarika
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: './', // Android APK ke liye zaroori
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Yeh alias `@/` ko project ke root folder se map karega
      '@': path.resolve(__dirname, './')
    }
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000
  }
})
