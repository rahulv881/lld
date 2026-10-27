import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // the machine lives in the parent folder and is imported directly
    fs: { allow: ['..'] },
  },
})
