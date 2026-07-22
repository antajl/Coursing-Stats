/**
 * После деплоя старый index.html может ссылаться на уже удалённые/битые /assets/*.js.
 * Один мягкий reload подтягивает свежий HTML (no-cache) с новыми хэшами — без Ctrl+F5.
 */
const RELOAD_KEY = 'cs:asset-reload'
const RELOAD_COOLDOWN_MS = 15_000

function reloadOnce(): void {
  try {
    const now = Date.now()
    const prev = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (prev && now - prev < RELOAD_COOLDOWN_MS) return
    sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch {
    // sessionStorage может быть недоступен — всё равно пробуем reload
  }
  window.location.reload()
}

function isChunkLoadFailure(message: string): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|MIME type of ["']text\/html/i.test(
    message,
  )
}

/** Vite: ошибка preload/lazy chunk после деплоя. */
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadOnce()
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const message = String(
    (reason && typeof reason === 'object' && 'message' in reason
      ? (reason as { message: unknown }).message
      : reason) ?? '',
  )
  if (isChunkLoadFailure(message)) {
    reloadOnce()
  }
})
