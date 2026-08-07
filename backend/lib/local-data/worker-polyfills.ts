/**
 * sql.js (emscripten) reads `self.location.href` in WorkerGlobalScope.
 * Cloudflare Workers have no `location` — init crashes with "reading 'href'".
 */
export function applyWorkerPolyfills(baseUrl = 'https://coursing-stats.ru/'): void {
  const href = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const location = { href };

  const g = globalThis as typeof globalThis & { location?: { href: string } };
  if (!g.location?.href) {
    g.location = location;
  }

  if (typeof self !== 'undefined') {
    const s = self as typeof self & { location?: { href: string } };
    if (!s.location?.href) {
      s.location = location;
    }
  }
}
