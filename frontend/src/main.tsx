import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/reloadOnChunkError'
import './index.css'
import App from './App'
import { initSentry } from './sentry'

// Меняет content-hash entry при каждом намеренном bust деплоя (не убирать зря).
void 'cs-asset-bust-2026-07-22c'

initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
