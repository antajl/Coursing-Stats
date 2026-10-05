import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/reloadOnChunkError'
import './index.css'
import App from './App'
import { initSentry } from './sentry'
import { preloadOptimizedFonts } from './lib/fontOptimization'

// Меняет content-hash entry при каждом намеренном bust деплоя (не убирать зря).
void 'cs-asset-bust-2026-07-22d'

// Preload fonts early for faster rendering
preloadOptimizedFonts()

initSentry()

// Development accessibility tools (accessible on-demand via console: window.__AUDIT__)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __AUDIT__: Record<string, unknown> }).__AUDIT__ = {
    colorContrast: () => import('./lib/colorContrastAudit').then(m => m.runAudit()),
    aria: () => import('./lib/ariaAudit').then(m => m.auditAriaLabels()),
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
