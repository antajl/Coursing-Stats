import { Hono } from 'hono';
import { tryStaticTopPlacement, tryStaticTopScore } from '../lib/static-api';
import { loadStaticDataJson } from '../../lib/local-data/static-data';

type Env = {
  ADMIN_API_TOKEN: string;
};

function parsePagination(c: any) {
  const limitStr = c.req.query('limit');
  if (!limitStr || limitStr === '') return null;
  const limit = parseInt(limitStr, 10);
  if (isNaN(limit)) return null;
  const validLimit = Math.min(Math.max(limit, 1), 500);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);
  return { limit: validLimit, offset };
}

export function handleTop(app: Hono<{ Bindings: Env }>) {
  // GET /api/top/placement?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/placement', async (c) => {
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'gold';
    const pagination = parsePagination(c);

    const staticYear = year || 'all';
    const staticResult = await tryStaticTopPlacement(staticYear, sortBy, pagination);
    
    if (!staticResult) {
      return c.json({ success: false, error: 'Placement data not found' }, 404);
    }
    
    // Filter by breed if specified
    let items = staticResult.data;
    if (breed && Array.isArray(items)) {
      items = items.filter((item: any) => item.breed === breed);
    }
    
    // Filter by minStarts if specified
    if (minStarts > 0 && Array.isArray(items)) {
      items = items.filter((item: any) => (item.total_starts || 0) >= minStarts);
    }
    
    return c.json({ success: true, data: items });
  });

  // GET /api/top/score?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/score', async (c) => {
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'rating_score';
    const pagination = parsePagination(c);

    const staticYear = year || 'all';
    const staticResult = await tryStaticTopScore(staticYear, sortBy, pagination);
    
    if (!staticResult) {
      return c.json({ success: false, error: 'Score data not found' }, 404);
    }
    
    // Filter by breed if specified
    let items = staticResult.data;
    if (breed && Array.isArray(items)) {
      items = items.filter((item: any) => item.breed === breed);
    }
    
    // Filter by minStarts if specified
    if (minStarts > 0 && Array.isArray(items)) {
      items = items.filter((item: any) => (item.total_starts || 0) >= minStarts);
    }
    
    return c.json({ success: true, data: items });
  });

  // GET /api/top/speed?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/speed', async (c) => {
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'best_speed';
    const pagination = parsePagination(c);

    const staticYear = year || 'all';
    const indexName = `top-speed-${staticYear}.json`;
    const speedData = await loadStaticDataJson<any>(indexName);
    
    if (!speedData?.items) {
      return c.json({ success: false, error: 'Speed data not found' }, 404);
    }
    
    // Filter by breed if specified
    let items = speedData.items;
    if (breed) {
      items = items.filter((item: any) => item.breed === breed);
    }
    
    // Filter by minStarts if specified
    if (minStarts > 0) {
      items = items.filter((item: any) => (item.total_starts || 0) >= minStarts);
    }
    
    // Sort by sortBy
    if (sortBy === 'avg_speed') {
      items.sort((a: any, b: any) => (b.avg_speed || 0) - (a.avg_speed || 0));
    } else {
      items.sort((a: any, b: any) => (b.best_speed || 0) - (a.best_speed || 0));
    }
    
    // Apply pagination if specified
    if (pagination) {
      const start = pagination.offset;
      const end = start + pagination.limit;
      const paginatedItems = items.slice(start, end);
      
      return c.json({
        success: true,
        data: {
          items: paginatedItems,
          total: items.length,
          limit: pagination.limit,
          offset: pagination.offset,
        }
      });
    }
    
    return c.json({ success: true, data: items });
  });

  // GET /api/years
  app.get('/api/years', async (c) => {
    const yearsData = await loadStaticDataJson<{ years?: number[] }>('indexes/years.json');
    
    if (!yearsData?.years) {
      return c.json({ success: false, error: 'Years data not found' }, 404);
    }
    
    return c.json({ success: true, data: yearsData.years });
  });
}
