import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleSpeed(app: Hono<{ Bindings: Env }>) {
  // GET /api/speed-records
  app.get('/api/speed-records', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const sex = c.req.query('sex') || '';
    const search = c.req.query('search') || '';
    const year = c.req.query('year') || '';
    const limit = c.req.query('limit') || '1000';
    const dogId = c.req.query('dog_id') || '';

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
    const limit = c.req.query('limit') || '1000';
    const dogId = c.req.query('dog_id') || '';

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
      ORDER BY speed_km_h DESC
    `;
    const { results: speedRecords } = await db.prepare(speedQuery).bind(name, breed).all();

    // Получаем записи бегов для собаки
    const coursingQuery = `
      SELECT * FROM coursing_records 
      WHERE name = ? AND breed = ? 
      ORDER BY time_seconds ASC
    `;
    const { results: coursingRecords } = await db.prepare(coursingQuery).bind(name, breed).all();

    // Вычисляем статистику
    const speedStats = {
      total: speedRecords.length,
      bestSpeed: speedRecords.length > 0 ? Math.max(...speedRecords.map(r => r.speed_km_h)) : 0,
      avgSpeed: speedRecords.length > 0 ? speedRecords.reduce((sum, r) => sum + r.speed_km_h, 0) / speedRecords.length : 0,
    };

    const coursingStats = {
      total: coursingRecords.length,
      bestTime: coursingRecords.length > 0 ? Math.min(...coursingRecords.map(r => r.time_seconds)) : 0,
      avgTime: coursingRecords.length > 0 ? coursingRecords.reduce((sum, r) => sum + r.time_seconds, 0) / coursingRecords.length : 0,
    };

    return c.json({
      success: true,
      data: {
        name,
        breed,
        speedRecords,
        coursingRecords,
        speedStats,
        coursingStats,
      },
    });
  });
}
