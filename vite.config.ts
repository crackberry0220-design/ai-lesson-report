import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages는 Actions에서 VITE_BASE=/ai-lesson-report/ 로 빌드
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
