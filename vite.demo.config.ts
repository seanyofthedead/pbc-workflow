import { copyFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Builds a single, self-contained demo HTML file (all JS + CSS inlined) from
// the real app via the `demo.html` / `src/demo-main.tsx` entry. Output lands in
// `dist-demo/` and is copied to `pbc-workflow-demo.html` at the repo root so it
// can be opened or shared directly — no server, no install, no backend.
// Run with: npm run build:demo
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    {
      name: 'emit-demo-to-repo-root',
      closeBundle() {
        copyFileSync('dist-demo/demo.html', 'pbc-workflow-demo.html')
      },
    },
  ],
  build: {
    outDir: 'dist-demo',
    rollupOptions: {
      input: 'demo.html',
    },
  },
})
