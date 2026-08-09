import { Hono } from 'hono';
import { canonicalBreed } from '../lib/breed-mapping';
import { loadStaticDataJson } from '../../lib/local-data/static-data';
import { cdnPackShardKey, dogProfilePackPath } from '../../lib/cdn-packs';

type Env = {
  ADMIN_API_TOKEN: string;
};

async function loadDogProfileDoc(dogId: string): Promise<{
  dog?: Record<string, unknown>
  competitions?: unknown[]
} | null> {
  const pack = await loadStaticDataJson<{ byId?: Record<string, unknown> }>(
    dogProfilePackPath(cdnPackShardKey(dogId)),
  )
  const fromPack = pack?.byId?.[String(dogId)] as
    | { dog?: Record<string, unknown>; competitions?: unknown[] }
    | undefined
  if (fromPack?.dog) return fromPack
  return loadStaticDataJson(`indexes/dog-profiles/${dogId}.json`)
}

export function handleDogs(app: Hono<{ Bindings: Env }>) {
  // GET /api/dogs — список собак (для админки; до маршрута /api/dogs/:id)
  app.get('/api/dogs', async (c) => {
    const search = c.req.query('search') || '';
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '5000', 10) || 5000, 1), 10000);

    // Load all dogs from data/v1/dogs/by-id
    const dogs: any[] = [];
    const dogsPath = 'dogs/by-id';
    
    // Simple implementation - load all and filter
    // For production, this should be optimized with an index
    for (const file of await loadStaticDataJson<any>(dogsPath)) {
      if (typeof file !== 'object') continue;
      // This is a simplified approach - in reality we'd need to list files
    }
    
    // For now, return empty - need to implement proper file listing
    return c.json({ success: true, data: [] });
  });

  // GET /api/dogs/:id
  app.get('/api/dogs/:id', async (c) => {
    const dogId = c.req.param('id');
    
    const dogProfile = await loadDogProfileDoc(dogId);
    
    if (!dogProfile?.dog) {
      return c.json({ success: false, error: 'Dog not found' }, 404);
    }
    
    return c.json({ success: true, data: dogProfile.dog });
  });

  // GET /api/dogs/:id/competitions
  app.get('/api/dogs/:id/competitions', async (c) => {
    const dogId = c.req.param('id');
    
    const dogProfile = await loadDogProfileDoc(dogId);
    
    if (!dogProfile?.competitions) {
      return c.json({ success: false, error: 'Dog not found' }, 404);
    }
    
    return c.json({ success: true, data: dogProfile.competitions });
  });

  // GET /api/breeds
  app.get('/api/breeds', async (c) => {
    const breedsData = await loadStaticDataJson<{ breeds?: string[] }>('breeds.json');
    
    if (!breedsData?.breeds) {
      return c.json({ success: false, error: 'Breeds not found' }, 404);
    }
    
    const mappedBreeds = breedsData.breeds.map((breed) => ({
      breed: canonicalBreed(breed),
    }));

    const uniqueBreeds = Array.from(
      new Set(mappedBreeds.map((b) => b.breed))
    ).sort().map((breed) => ({ breed }));

    return c.json({ success: true, data: uniqueBreeds });
  });
}
