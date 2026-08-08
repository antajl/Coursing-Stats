import { Hono } from 'hono';
import fs from 'node:fs/promises';
import { dataV1Path } from '../../../lib/local-data/paths';

type Env = {
  ADMIN_API_TOKEN: string;
};

type DogIndexEntry = {
  id: number;
  dog_key: string;
  name_lat: string;
  name_ru: string | null;
  breed: string;
};

let dogsIndexCache: { loadedAt: number; entries: DogIndexEntry[] } | null = null;
const CACHE_MS = 30_000;

function checkAdminToken(c: any, env: Env) {
  const authHeader = c.req.header('X-Admin-Token');
  const adminToken = env.ADMIN_API_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_API_TOKEN not set in environment variables, allowing access for local dev');
    return true;
  }

  return authHeader === adminToken;
}

async function loadDogsIndex(): Promise<DogIndexEntry[]> {
  const now = Date.now();
  if (dogsIndexCache && now - dogsIndexCache.loadedAt < CACHE_MS) {
    return dogsIndexCache.entries;
  }
  try {
    const raw = await fs.readFile(dataV1Path('indexes', 'dogs-index.json'), 'utf-8');
    const entries = JSON.parse(raw) as DogIndexEntry[];
    dogsIndexCache = { loadedAt: now, entries };
    return entries;
  } catch {
    return dogsIndexCache?.entries ?? [];
  }
}

/** Invalidate after creating dogs so search sees new ones. */
export function invalidateDogsIndexCache() {
  dogsIndexCache = null;
}

export function handleAdminDogs(app: Hono<{ Bindings: Env }>) {
  app.get('/api/admin/dogs/search', async (c) => {
    const env = c.env;
    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const q = (c.req.query('q') || '').trim().toLowerCase();
    if (q.length < 2) {
      return c.json({ success: true, data: [] });
    }

    try {
      const entries = await loadDogsIndex();
      const hits = entries
        .filter((d) => {
          const hay = `${d.name_lat || ''} ${d.name_ru || ''} ${d.breed || ''} ${d.dog_key || ''}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, 20)
        .map((d) => ({
          id: d.id,
          dog_key: d.dog_key,
          name_lat: d.name_lat,
          name_ru: d.name_ru,
          breed: d.breed,
        }));

      return c.json({ success: true, data: hits });
    } catch (err: any) {
      console.error('Error searching dogs:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
