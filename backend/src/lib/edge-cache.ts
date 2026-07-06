import type { MiddlewareHandler } from 'hono';

interface CacheRule {
  test: (pathname: string) => boolean;
  maxAge: number;
}

const CACHE_RULES: CacheRule[] = [
  { test: (p) => p === '/sitemap.xml', maxAge: 86_400 },
  { test: (p) => p === '/api/years' || p === '/api/breeds' || p === '/api/stats', maxAge: 86_400 },
  { test: (p) => p.startsWith('/api/top/'), maxAge: 3_600 },
  { test: (p) => p.startsWith('/api/judges'), maxAge: 21_600 },
  { test: (p) => /^\/api\/dogs\/\d+/.test(p), maxAge: 3_600 },
  { test: (p) => p.startsWith('/api/competitions'), maxAge: 900 },
  { test: (p) => p.startsWith('/api/speed-records'), maxAge: 1_800 },
  { test: (p) => p.startsWith('/api/coursing-records'), maxAge: 1_800 },
];

function cacheMaxAge(pathname: string): number | null {
  if (pathname.startsWith('/api/admin') || pathname === '/api/dogs') {
    return null;
  }
  for (const rule of CACHE_RULES) {
    if (rule.test(pathname)) return rule.maxAge;
  }
  return null;
}

/** Кэш ответов на edge Cloudflare — повторные GET не ходят в D1 */
export const edgeCache: MiddlewareHandler = async (c, next) => {
  if (c.req.method !== 'GET') {
    return next();
  }

  const url = new URL(c.req.url);
  const maxAge = cacheMaxAge(url.pathname);
  if (maxAge === null) {
    return next();
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  await next();

  if (c.res.status !== 200) {
    return;
  }

  const headers = new Headers(c.res.headers);
  headers.set('Cache-Control', `public, max-age=${maxAge}`);

  const body = await c.res.clone().arrayBuffer();
  const toCache = new Response(body, {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  });

  c.res = toCache.clone();

  const ctx = c.executionCtx;
  if (ctx) {
    ctx.waitUntil(cache.put(cacheKey, toCache));
  } else {
    await cache.put(cacheKey, toCache);
  }
};
