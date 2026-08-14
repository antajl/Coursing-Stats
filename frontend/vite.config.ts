import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { homePhotosPlugin } from './vite-plugin-home-photos'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_V1_ROOT = path.resolve(__dirname, '../data/v1')

const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

/**
 * Баннеры Telegram-бота живут в repo `public/bot` (webp).
 * Vite publicDir = `frontend/public`, поэтому перед сборкой синхронизируем
 * webp туда — иначе /bot/* на Pages отдаёт SPA HTML и sendPhoto ломается.
 */
function syncBotBanners(): Plugin {
  const srcRoot = path.resolve(__dirname, '../public/bot')
  const destRoot = path.resolve(__dirname, 'public/bot')

  const sync = () => {
    if (!fs.existsSync(srcRoot)) return
    fs.mkdirSync(path.join(destRoot, 'banners'), { recursive: true })
    for (const name of ['banner.webp']) {
      const from = path.join(srcRoot, name)
      if (fs.existsSync(from)) fs.copyFileSync(from, path.join(destRoot, name))
    }
    const bannersDir = path.join(srcRoot, 'banners')
    if (!fs.existsSync(bannersDir)) return
    for (const name of fs.readdirSync(bannersDir)) {
      if (!name.endsWith('.webp')) continue
      fs.copyFileSync(path.join(bannersDir, name), path.join(destRoot, 'banners', name))
    }
  }

  return {
    name: 'sync-bot-banners',
    buildStart() {
      sync()
    },
    configureServer() {
      sync()
    },
  }
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
// build-stamp в имени чанков меняет URL на каждый CI → сброс отравленного
// immutable/HTML-кэша под /assets/*.js (см. docs/16-TROUBLESHOOTING.md).
// Banner alone is NOT enough: Rolldown content-hash ignores it.
const buildStamp = process.env.GITHUB_SHA?.slice(0, 8) || String(Date.now())

export default defineConfig(({ mode }) => {
  const plugins: Plugin[] = [
    react(),
    syncBotBanners(),
    serveDataV1(),
    homePhotosPlugin({
      publicHomeDir: path.resolve(__dirname, 'public/assets/home'),
      outFile: path.resolve(__dirname, 'src/lib/homePhotos.generated.ts'),
    }),
  ]

  // Add bundle analyzer in analyze mode
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: './dist/bundle-stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    )
  }

  return {
    plugins,
  cacheDir: './.vite', // Avoid node_modules/.vite for PnP compatibility
  build: {
    rollupOptions: {
      output: {
        // Stamp in filename (not only banner): Rolldown content-hash ignores banner,
        // so poisoned /assets/* caches need a new URL every CI deploy.
        entryFileNames: `assets/[name]-${buildStamp}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildStamp}-[hash].js`,
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Code splitting to separate heavy libraries
        manualChunks: (id) => {
          // Separate xlsx library into its own chunk
          if (id.includes('xlsx-js-style')) {
            return 'xlsx-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase from default 500KB to account for xlsx chunk
    // CSS minification - use esbuild instead of lightningcss to avoid native module issues
    cssMinify: 'esbuild',
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
    headers: {
      // Dev CSP: worker-src must allow blob: — Vite HMR reconnects via blob Worker
      // after "server connection lost". Without it React ends up with Invalid hook call.
      // connect-src: ws/wss for HMR websocket (same-origin + explicit for some browsers).
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://coursing-stats.ru https://www.googletagmanager.com; " +
        "style-src 'self' 'unsafe-inline' https://coursing-stats.ru https://fonts.googleapis.com; " +
        "img-src 'self' data: blob: https://coursing-stats.ru https://*.googleusercontent.com https://*.gstatic.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' ws: wss: https://coursing-stats.ru https://api.telegram.org https://coursing-stats-antajl.aws-eu-west-1.turso.io https://auth-worker.antajltube.workers.dev https://www.googletagmanager.com; " +
        "frame-src 'self' https://coursing-stats.ru https://t.me; " +
        "frame-ancestors 'self' https://coursing-stats.ru; " +
        "worker-src 'self' blob:; " +
        "form-action 'self'; " +
        "upgrade-insecure-requests;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
})
