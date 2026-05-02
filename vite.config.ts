import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      hotKeys: ['altKey'],
    }),
    react(),
  ],
  envPrefix: ['VITE_', 'OPENROUTER_'],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
