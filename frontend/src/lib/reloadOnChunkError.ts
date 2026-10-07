/**
 * После деплоя старый/отравленный кэш /assets/*.js (HTML под MIME text/html)
 * валит lazy chunks → белый экран. Один reload с cache-bust подтягивает свежий HTML
 * (no-cache) с новыми stamp-хэшами.
 *
 * При загрузке страницы параметр _csrb сразу убирается из URL через history.replaceState,
 * чтобы адресная строка оставалась чистой.
 */
const RELOAD_KEY = 'cs:asset-reload'
const RELOAD_COOLDOWN_MS = 15_000

// Очищаем _csrb из адресной строки при инициализации, чтобы не засорять историю и ссылки
try {
  if (typeof window !== 'undefined' && window.location.search.includes('_csrb')) {
    const u = new URL(window.location.href)
    u.searchParams.delete('_csrb')
    const cleanUrl = u.pathname + (u.search ? u.search : '') + u.hash
    window.history.replaceState(window.history.state, '', cleanUrl)
  }
} catch {
  // ignore
}

function isBot(): boolean {
  if (typeof navigator === 'undefined') return false
  return /bot|google|yandex|bing|slurp|crawler|spider|facebookexternalhit|duckduckbot/i.test(
    navigator.userAgent || '',
  )
}

function reloadOnce(): void {
  if (isBot()) return

  try {
    const now = Date.now()
    const prev = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (prev && now - prev < RELOAD_COOLDOWN_MS) return
    sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch {
    // sessionStorage может быть недоступен — всё равно пробуем reload
  }
  try {
    const u = new URL(window.location.href)
    u.searchParams.set('_csrb', String(Date.now()))
    window.location.replace(u.href)
  } catch {
    window.location.reload()
  }
}

function isChunkLoadFailure(message: string): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to load module script|MIME type of ["']text\/html|reading ['"]default['"]/i.test(
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

window.addEventListener(
  'error',
  (event) => {
    const message = String(event.message || '')
    if (isChunkLoadFailure(message)) reloadOnce()
  },
  true,
)
