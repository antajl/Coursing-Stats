import { Hono } from 'hono';
import { loadDoninoCoursingRecords, loadDoninoSpeedRecords } from '../lib/static-api';

type Env = {
  ADMIN_API_TOKEN: string;
};

function filterDoninoRecords(
  records: Record<string, unknown>[],
  opts: {
    breed?: string;
    sex?: string;
    search?: string;
    year?: string;
    dogId?: string;
    limit: number;
    sortKey: string;
    sortAsc?: boolean;
  },
): Record<string, unknown>[] {
  let rows = records;

  if (opts.dogId) {
    rows = rows.filter((r) => String(r.dog_id ?? '') === opts.dogId);
  }
  if (opts.breed) {
    rows = rows.filter((r) => r.breed === opts.breed);
  }
  if (opts.sex) {
    rows = rows.filter((r) => r.sex === opts.sex);
  }
  if (opts.year) {
    rows = rows.filter((r) => String(r.date ?? '').includes(`.${opts.year}`));
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        String(r.name ?? '').toLowerCase().includes(q) ||
        String(r.breed ?? '').toLowerCase().includes(q) ||
        String(r.date ?? '').toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    const av = Number(a[opts.sortKey] ?? 0);
    const bv = Number(b[opts.sortKey] ?? 0);
    return opts.sortAsc ? av - bv : bv - av;
  });

  return rows.slice(0, opts.limit);
}

export function handleSpeed(app: Hono<{ Bindings: Env }>) {
  // GET /api/speed-records/top-by-breed — лучший результат в каждой породе, затем топ-N пород
  app.get('/api/speed-records/top-by-breed', async (c) => {
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '3', 10) || 3, 1), 20);

    const staticRecords = await loadDoninoSpeedRecords();
    if (!staticRecords?.length) {
      return c.json({ success: false, error: 'Speed records not found' }, 404);
    }

    // Group by breed and get best from each
    const breedMap = new Map<string, any>();
    for (const record of staticRecords) {
      const breed = String(record.breed);
      if (!breedMap.has(breed) || Number(record.speed_km_h) > Number(breedMap.get(breed).speed_km_h)) {
        breedMap.set(breed, record);
      }
    }

    const topBreeds = Array.from(breedMap.values())
      .sort((a, b) => b.speed_km_h - a.speed_km_h)
      .slice(0, limit);

    return c.json({ success: true, data: topBreeds });
  });

  // GET /api/coursing-records/top-by-breed — лучшее время в каждой породе, затем топ-N пород
  app.get('/api/coursing-records/top-by-breed', async (c) => {
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '3', 10) || 3, 1), 20);

    const staticRecords = await loadDoninoCoursingRecords();
    if (!staticRecords?.length) {
      return c.json({ success: false, error: 'Coursing records not found' }, 404);
    }

    // Group by breed and get best from each
    const breedMap = new Map<string, any>();
    for (const record of staticRecords) {
      const breed = String(record.breed);
      if (!breedMap.has(breed) || Number(record.time_seconds) < Number(breedMap.get(breed).time_seconds)) {
        breedMap.set(breed, record);
      }
    }

    const topBreeds = Array.from(breedMap.values())
      .sort((a, b) => a.time_seconds - b.time_seconds)
      .slice(0, limit);

    return c.json({ success: true, data: topBreeds });
  });

  // GET /api/speed-records
  app.get('/api/speed-records', async (c) => {
    const breed = c.req.query('breed') || '';
    const sex = c.req.query('sex') || '';
    const search = c.req.query('search') || '';
    const year = c.req.query('year') || '';
    const limit = parseInt(c.req.query('limit') || '1000', 10);
    const dogId = c.req.query('dog_id') || '';

    const staticRecords = await loadDoninoSpeedRecords();
    if (!staticRecords?.length) {
      return c.json({ success: false, error: 'Speed records not found' }, 404);
    }

    const filtered = filterDoninoRecords(staticRecords, {
      breed,
      sex,
      search,
      year,
      dogId,
      limit,
      sortKey: 'speed_km_h',
    });
    return c.json({ success: true, data: filtered });
  });

  // GET /api/coursing-records
  app.get('/api/coursing-records', async (c) => {
    const breed = c.req.query('breed') || '';
    const search = c.req.query('search') || '';
    const year = c.req.query('year') || '';
    const limit = parseInt(c.req.query('limit') || '1000', 10);
    const dogId = c.req.query('dog_id') || '';

    const staticRecords = await loadDoninoCoursingRecords();
    if (!staticRecords?.length) {
      return c.json({ success: false, error: 'Coursing records not found' }, 404);
    }

    const filtered = filterDoninoRecords(staticRecords, {
      breed,
      search,
      year,
      dogId,
      limit,
      sortKey: 'time_seconds',
      sortAsc: true,
    });
    return c.json({ success: true, data: filtered });
  });

  // GET /api/donino-dog/:name/:breed
  app.get('/api/donino-dog/:name/:breed', async (c) => {
    const name = c.req.param('name');
    const breed = c.req.param('breed');

    if (!name || !breed) {
      return c.json({ success: false, error: 'Name and breed are required' }, 400);
    }

    const speedRecords = await loadDoninoSpeedRecords();
    const coursingRecords = await loadDoninoCoursingRecords();

    if (!speedRecords?.length || !coursingRecords?.length) {
      return c.json({ success: false, error: 'Records not found' }, 404);
    }

    const dogSpeedRecords = speedRecords.filter((r: any) => r.name === name && r.breed === breed);
    const dogCoursingRecords = coursingRecords.filter((r: any) => r.name === name && r.breed === breed);

    // Вычисляем статистику скорости
    const speedStats = {
      total: dogSpeedRecords.length,
      bestSpeed: dogSpeedRecords.length > 0 ? Math.max(...dogSpeedRecords.map((r: any) => r.speed_km_h)) : 0,
      avgSpeed: dogSpeedRecords.length > 0 ? dogSpeedRecords.reduce((sum: number, r: any) => sum + r.speed_km_h, 0) / dogSpeedRecords.length : 0,
    };

    // Вычисляем статистику бегов
    const coursingStats = {
      total: dogCoursingRecords.length,
      bestTime: dogCoursingRecords.length > 0 ? Math.min(...dogCoursingRecords.map((r: any) => r.time_seconds)) : 0,
      avgTime: dogCoursingRecords.length > 0 ? dogCoursingRecords.reduce((sum: number, r: any) => sum + r.time_seconds, 0) / dogCoursingRecords.length : 0,
    };

    // Расчёт рейтинга по породе для скорости
    let speedBreedRank = 0;
    let speedBreedTotal = 0;
    let speedPercentile = 0;

    if (speedStats.bestSpeed > 0) {
      const breedSpeedDogs = speedRecords
        .filter((r: any) => r.breed === breed && r.speed_km_h > 0)
        .reduce((acc: Map<string, number>, r: any) => {
          const current = acc.get(r.name) || 0;
          acc.set(r.name, Math.max(current, r.speed_km_h));
          return acc;
        }, new Map());
      
      const sortedBreedSpeeds = Array.from(breedSpeedDogs.entries()).sort((a, b) => b[1] - a[1]);
      speedBreedTotal = sortedBreedSpeeds.length;
      const dogRank = sortedBreedSpeeds.findIndex(([n, s]) => s === speedStats.bestSpeed);
      speedBreedRank = dogRank >= 0 ? dogRank + 1 : 0;
      speedPercentile = speedBreedTotal > 0 ? ((speedBreedTotal - speedBreedRank) / speedBreedTotal) * 100 : 0;
    }

    // Расчёт рейтинга по породе для бегов
    let coursingBreedRank = 0;
    let coursingBreedTotal = 0;
    let coursingPercentile = 0;

    if (coursingStats.bestTime > 0) {
      const breedCoursingDogs = coursingRecords
        .filter((r: any) => r.breed === breed && r.time_seconds > 0)
        .reduce((acc: Map<string, number>, r: any) => {
          const current = acc.get(r.name) || Infinity;
          acc.set(r.name, Math.min(current, r.time_seconds));
          return acc;
        }, new Map());
      
      const sortedBreedCoursing = Array.from(breedCoursingDogs.entries()).sort((a, b) => a[1] - b[1]);
      coursingBreedTotal = sortedBreedCoursing.length;
      const dogRank = sortedBreedCoursing.findIndex(([n, t]) => t === coursingStats.bestTime);
      coursingBreedRank = dogRank >= 0 ? dogRank + 1 : 0;
      coursingPercentile = coursingBreedTotal > 0 ? ((coursingBreedTotal - coursingBreedRank) / coursingBreedTotal) * 100 : 0;
    }

    const sex = dogSpeedRecords.find((r: any) => r.sex)?.sex ?? null;

    return c.json({
      success: true,
      data: {
        name,
        breed,
        sex,
        speedRecords: dogSpeedRecords,
        coursingRecords: dogCoursingRecords,
        speedStats: {
          ...speedStats,
          breedRank: speedBreedRank,
          breedTotal: speedBreedTotal,
          percentile: speedPercentile,
        },
        coursingStats: {
          ...coursingStats,
          breedRank: coursingBreedRank,
          breedTotal: coursingBreedTotal,
          percentile: coursingPercentile,
        },
      },
    });
  });
}
