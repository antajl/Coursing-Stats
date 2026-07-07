import { Hono } from 'hono';
import { loadDoninoCoursingRecords, loadDoninoSpeedRecords } from '../lib/static-api';

type Env = {
  DB: any;
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
    const db = c.env.DB;
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '3', 10) || 3, 1), 20);

    const query = `
      SELECT * FROM (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY breed ORDER BY speed_km_h DESC, id ASC) AS rn
        FROM speed_records
      )
      WHERE rn = 1
      ORDER BY speed_km_h DESC
      LIMIT ?
    `;

    const { results } = await db.prepare(query).bind(limit).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/coursing-records/top-by-breed — лучшее время в каждой породе, затем топ-N пород
  app.get('/api/coursing-records/top-by-breed', async (c) => {
    const db = c.env.DB;
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '3', 10) || 3, 1), 20);

    const query = `
      SELECT * FROM (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY breed ORDER BY time_seconds ASC, id ASC) AS rn
        FROM coursing_records
      )
      WHERE rn = 1
      ORDER BY time_seconds ASC
      LIMIT ?
    `;

    const { results } = await db.prepare(query).bind(limit).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/speed-records
  app.get('/api/speed-records', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const sex = c.req.query('sex') || '';
    const search = c.req.query('search') || '';
    const year = c.req.query('year') || '';
    const limit = parseInt(c.req.query('limit') || '1000', 10);
    const dogId = c.req.query('dog_id') || '';

    const staticRecords = await loadDoninoSpeedRecords();
    if (staticRecords?.length) {
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
    }

    let query = 'SELECT * FROM speed_records WHERE 1=1';
    const params = [];

    if (dogId) {
      query += ' AND dog_id = ?';
      params.push(dogId);
    }

    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }

    if (sex) {
      query += ' AND sex = ?';
      params.push(sex);
    }

    if (year) {
      query += ' AND date LIKE ?';
      params.push(`%.${year}`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR breed LIKE ? OR date LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY speed_km_h DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/coursing-records
  app.get('/api/coursing-records', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const search = c.req.query('search') || '';
    const year = c.req.query('year') || '';
    const limit = parseInt(c.req.query('limit') || '1000', 10);
    const dogId = c.req.query('dog_id') || '';

    const staticRecords = await loadDoninoCoursingRecords();
    if (staticRecords?.length) {
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
    }

    let query = 'SELECT * FROM coursing_records WHERE 1=1';
    const params = [];

    if (dogId) {
      query += ' AND dog_id = ?';
      params.push(dogId);
    }

    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }

    if (year) {
      query += ' AND date LIKE ?';
      params.push(`%.${year}`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR breed LIKE ? OR date LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY time_seconds ASC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/donino-dog/:name/:breed
  app.get('/api/donino-dog/:name/:breed', async (c) => {
    const db = c.env.DB;
    const name = c.req.param('name');
    const breed = c.req.param('breed');

    if (!name || !breed) {
      return c.json({ success: false, error: 'Name and breed are required' }, 400);
    }

    // Получаем записи скорости для собаки
    const speedQuery = `
      SELECT * FROM speed_records 
      WHERE name = ? AND breed = ? 
      ORDER BY date DESC
    `;
    const { results: speedRecords } = await db.prepare(speedQuery).bind(name, breed).all();

    // Получаем записи бегов для собаки
    const coursingQuery = `
      SELECT * FROM coursing_records 
      WHERE name = ? AND breed = ? 
      ORDER BY date DESC
    `;
    const { results: coursingRecords } = await db.prepare(coursingQuery).bind(name, breed).all();

    // Вычисляем статистику скорости
    const speedStats = {
      total: speedRecords.length,
      bestSpeed: speedRecords.length > 0 ? Math.max(...speedRecords.map(r => r.speed_km_h)) : 0,
      avgSpeed: speedRecords.length > 0 ? speedRecords.reduce((sum, r) => sum + r.speed_km_h, 0) / speedRecords.length : 0,
    };

    // Вычисляем статистику бегов
    const coursingStats = {
      total: coursingRecords.length,
      bestTime: coursingRecords.length > 0 ? Math.min(...coursingRecords.map(r => r.time_seconds)) : 0,
      avgTime: coursingRecords.length > 0 ? coursingRecords.reduce((sum, r) => sum + r.time_seconds, 0) / coursingRecords.length : 0,
    };

    // Расчёт рейтинга по породе для скорости
    let speedBreedRank = 0;
    let speedBreedTotal = 0;
    let speedPercentile = 0;

    if (speedStats.bestSpeed > 0) {
      const breedSpeedQuery = `
        SELECT DISTINCT name, MAX(speed_km_h) as best_speed
        FROM speed_records
        WHERE breed = ? AND speed_km_h > 0
        GROUP BY name
        ORDER BY best_speed DESC
      `;
      const { results: breedSpeedDogs } = await db.prepare(breedSpeedQuery).bind(breed).all();
      
      speedBreedTotal = breedSpeedDogs.length;
      const dogRank = breedSpeedDogs.findIndex(d => d.best_speed === speedStats.bestSpeed);
      speedBreedRank = dogRank >= 0 ? dogRank + 1 : 0;
      speedPercentile = speedBreedTotal > 0 ? ((speedBreedTotal - speedBreedRank) / speedBreedTotal) * 100 : 0;
    }

    // Расчёт рейтинга по породе для бегов
    let coursingBreedRank = 0;
    let coursingBreedTotal = 0;
    let coursingPercentile = 0;

    if (coursingStats.bestTime > 0) {
      const breedCoursingQuery = `
        SELECT DISTINCT name, MIN(time_seconds) as best_time
        FROM coursing_records
        WHERE breed = ? AND time_seconds > 0
        GROUP BY name
        ORDER BY best_time ASC
      `;
      const { results: breedCoursingDogs } = await db.prepare(breedCoursingQuery).bind(breed).all();
      
      coursingBreedTotal = breedCoursingDogs.length;
      const dogRank = breedCoursingDogs.findIndex(d => d.best_time === coursingStats.bestTime);
      coursingBreedRank = dogRank >= 0 ? dogRank + 1 : 0;
      coursingPercentile = coursingBreedTotal > 0 ? ((coursingBreedTotal - coursingBreedRank) / coursingBreedTotal) * 100 : 0;
    }

    const sex = speedRecords.find((r) => r.sex)?.sex ?? null;

    return c.json({
      success: true,
      data: {
        name,
        breed,
        sex,
        speedRecords,
        coursingRecords,
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
