import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The parity harness: React examples at /react/<item>/<Example> and element examples at /elements/<item>/<Example>, in
// the same frame as the docs site's /preview/<item>/<example>. `@` points at registry/, as in the docs site. It serves
// apps/www/public, so /conare-ds (fonts), /r (the registry JSON) and /elements (the prebuilt modules) are the ones the
// registry build wrote. scripts/check-parity.mjs builds and serves it.
const registry = fileURLToPath(new URL('../../registry', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../www/public', import.meta.url)),
  resolve: { alias: { '@': registry } },
  plugins: [react(), tailwindcss()],
  appType: 'spa',
  server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
  build: { outDir: 'dist', emptyOutDir: true },
})
