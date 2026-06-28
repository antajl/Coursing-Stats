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

    let query = 'SELECT * FROM speed_records WHERE 1=1';
    const params = [];

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

    let query = 'SELECT * FROM coursing_records WHERE 1=1';
    const params = [];

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
}
