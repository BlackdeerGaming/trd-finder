import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En cPanel la app se sirve desde una subcarpeta (p. ej. blackdeerbrand.com/TRDFinder/),
  // así que los assets deben apuntar a esa base. En Vercel (variable VERCEL definida
  // automáticamente en el build) el sitio vive en la raíz del dominio, así que ahí usamos '/'.
  base: process.env.VERCEL ? '/' : '/TRDFinder/',
})
