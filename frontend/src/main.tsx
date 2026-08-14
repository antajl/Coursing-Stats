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

// ARIA audit in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    import('./lib/ariaAudit').then(({ auditAriaLabels }) => {
      const issues = auditAriaLabels()
      if (issues.length > 0) {
        console.group('ARIA Audit Issues')
        issues.forEach(issue => {
          console.warn(issue)
        })
        console.groupEnd()
      }
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
