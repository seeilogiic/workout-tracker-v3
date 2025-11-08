import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Plugin to copy index.html to 404.html for GitHub Pages SPA routing
// GitHub Pages will serve 404.html for any route that doesn't exist,
// allowing React Router to handle client-side routing
const copy404Plugin = () => {
  return {
    name: 'copy-404',
    closeBundle() {
      const outDir = process.env.NODE_ENV === 'production' ? 'dist' : 'dist'
      const indexPath = join(outDir, 'index.html')
      const notFoundPath = join(outDir, '404.html')
      try {
        copyFileSync(indexPath, notFoundPath)
        console.log('✓ Copied index.html to 404.html for GitHub Pages SPA routing')
      } catch (err) {
        console.warn('⚠ Could not copy index.html to 404.html:', err)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copy404Plugin()],
  base: process.env.NODE_ENV === 'production' ? '/workout-tracker-v3/' : '/',
})
