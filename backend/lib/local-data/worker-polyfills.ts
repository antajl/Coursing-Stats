/**
 * sql.js (emscripten) assumes `self.location.href` exists in WorkerGlobalScope.
 * Cloudflare Workers have no `location` — init crashes with "reading 'href'".
 */
export function applyWorkerPolyfills(baseUrl = 'https://coursing-stats.ru/'): void {
  if (typeof WorkerGlobalScope === 'undefined') return;

  const g = globalThis as typeof globalThis & { location?: { href: string } };
  if (!g.location?.href) {
    g.location = { href: baseUrl };
  }
}
