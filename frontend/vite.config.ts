import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_V1_ROOT = path.resolve(__dirname, '../data/v1')

const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

/**
 * В dev/preview отдаёт repo `data/v1` по пути `/data/v1/*`, как это делает
 * Cloudflare Pages в проде. Так фронтенд читает JSON напрямую, без Worker/D1.
 */
function serveDataV1(): Plugin {
  const middleware = (
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse,
    next: () => void,
  ) => {
    const url = req.url?.split('?')[0] ?? ''
    if (!url.startsWith('/data/v1/')) return next()

    const relativePath = decodeURIComponent(url.slice('/data/v1/'.length))
    const filePath = path.join(DATA_V1_ROOT, relativePath)

    if (!filePath.startsWith(DATA_V1_ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }

    const ext = path.extname(filePath)
    res.setHeader('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream')
    fs.createReadStream(filePath).pipe(res)
  }

  return {
    name: 'serve-data-v1',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

// https://vite.dev/config/
//
// Не использовать manualChunks для react-router/lucide: на Vite 8/rolldown
// это давало битый граф (vendor-router импортировал vendor-icons) → белый экран.
export default defineConfig({
  plugins: [react(), serveDataV1()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxying request to:', proxyReq.path)
          })
        },
      },
    },
  },
})
