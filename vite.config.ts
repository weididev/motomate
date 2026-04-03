import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // Yeh relative path ke liye sabse zaroori hai
  plugins: [react(), tailwindcss()],
})
