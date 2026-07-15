import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // La app se sirve desde una subcarpeta (p. ej. blackdeerbrand.com/TRDFinder/),
  // no desde la raíz del dominio, así que todas las rutas de assets deben ser relativas a esa base.
  base: '/TRDFinder/',
})
