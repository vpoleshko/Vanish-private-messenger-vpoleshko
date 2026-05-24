import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      // libsodium-wrappers ESM tries to import ./libsodium.mjs which doesn't exist
      // redirect it to the CJS libsodium.js in the modules/ folder
      name: 'fix-libsodium',
      enforce: 'pre',
      resolveId(id, importer) {
        if (id === './libsodium.mjs' && importer?.includes('libsodium-wrappers')) {
          // libsodium-wrappers ESM imports ./libsodium.mjs but libsodium.mjs
          // lives in the separate 'libsodium' package, not in libsodium-wrappers
          return importer.replace(
            /libsodium-wrappers[/\\]dist[/\\]modules-esm[/\\][^/\\]+$/,
            'libsodium/dist/modules-esm/libsodium.mjs'
          ).replace(/\\/g, '/')
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws':  { target: 'ws://localhost:8000', ws: true },
    },
  },
})
