import { DEFAULT_SITE_URL } from './constants';

export class ApiClient {
  readonly cache: KVNamespace | null;
  readonly baseApiUrl: string;

  constructor(cache?: KVNamespace, siteUrl: string = DEFAULT_SITE_URL) {
    this.cache = cache || null;
    const origin = (siteUrl || DEFAULT_SITE_URL).replace(/\/$/, '');
    this.baseApiUrl = `${origin}/data/v1`;
  }

  async fetchJSON(url: string, ttl?: number, retries: number = 2): Promise<unknown> {
    // Try cache first (before any fetch)
    if (this.cache) {
      try {
        const cacheKey = `cache:${url}`;
        const cached = await this.cache.get(cacheKey, 'json');
        if (cached) return cached;
      } catch {
        // ignore cache read errors
      }
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          const text = await response.text();
          const data = JSON.parse(text);

          // Store in cache if TTL is provided
          if (this.cache && ttl) {
            const cacheKey = `cache:${url}`;
            await this.cache.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl });
          }

          return data;
        }

        // Non-OK response — retry immediately (no setTimeout, it's an anti-pattern in Workers)
        if (attempt < retries - 1) continue;
        return null;
      } catch {
        // Network error — retry immediately
        if (attempt < retries - 1) continue;
        return null;
      }
    }
    return null;
  }

  /** Same algorithm as backend/lib/cdn-packs.ts (256 packs). */
  cdnPackShardKey(id: string | number): string {
    const numId = Number(id);
    if (!Number.isNaN(numId) && Number.isFinite(numId) && numId > 0 && String(id).trim() === String(numId)) {
      return String(Math.abs(numId) % 256).padStart(3, '0');
    }
    const strId = String(id);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
      hash = (hash << 5) - hash + strId.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash) % 256).padStart(3, '0');
  }
}
