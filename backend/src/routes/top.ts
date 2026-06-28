import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

function parsePagination(c: any) {
  const limitStr = c.req.query('limit');
  if (limitStr === null || limitStr === '') return null;
  const limit = Math.min(Math.max(parseInt(limitStr, 10) || 50, 1), 500);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);
  return { limit, offset };
}

async function queryWithPagination(db: any, query: string, params: any[], pagination: any) {
  if (!pagination) {
    const { results } = await db.prepare(query).bind(...params).all();
    return { success: true, data: results };
  }

  const countQuery = `SELECT COUNT(*) AS total FROM (${query})`;
  const { results: countRows } = await db.prepare(countQuery).bind(...params).all();
  const total = countRows[0]?.total ?? 0;

  const dataQuery = `${query} LIMIT ? OFFSET ?`;
  const { results } = await db
    .prepare(dataQuery)
    .bind(...params, pagination.limit, pagination.offset)
    .all();

  return {
    success: true,
    data: {
      items: results,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    }
  };
}

export function handleTop(app: Hono<{ Bindings: Env }>) {
  // GET /api/top/placement?breed=&year=&minStarts=&limit=&offset=
  app.get('/api/top/placement', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const pagination = parsePagination(c);

    const params = [];

    let query;
    if (year) {
      query = 'SELECT * FROM v_top_by_placement WHERE year = ?';
      params.push(year);

      if (breed) {
        query += ' AND breed = ?';
        params.push(breed);
      }
      if (minStarts > 0) {
        query += ' AND total_starts >= ?';
        params.push(minStarts);
      }
    } else {
      query = `
        SELECT
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
          COUNT(*) AS total_starts
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
      `;

      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }

      query += ' GROUP BY d.id';

      if (minStarts > 0) {
        query += ' HAVING total_starts >= ?';
        params.push(minStarts);
      }

      query += ' ORDER BY gold DESC, silver DESC, bronze DESC';
    }

    const result = await queryWithPagination(db, query, params, pagination);
    return c.json(result);
  });

  // GET /api/top/score?breed=&year=&minStarts=&limit=&offset=
  app.get('/api/top/score', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const pagination = parsePagination(c);

    const params = [];

    let query;
    if (year) {
      query = 'SELECT * FROM v_top_by_score WHERE year = ?';
      params.push(year);

      if (breed) {
        query += ' AND breed = ?';
        params.push(breed);
      }
      if (minStarts > 0) {
        query += ' AND total_starts >= ?';
        params.push(minStarts);
      }
    } else {
      query = `
        SELECT
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          MAX(r.total_score) AS best_score,
          ROUND(AVG(r.total_score), 2) AS avg_score,
          COUNT(*) AS total_starts
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
      `;

      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }

      query += ' GROUP BY d.id';

      if (minStarts > 0) {
        query += ' HAVING total_starts >= ?';
        params.push(minStarts);
      }

      query += ' ORDER BY best_score DESC';
    }

    const result = await queryWithPagination(db, query, params, pagination);
    return c.json(result);
  });

  // GET /api/top/speed?breed=&year=&minStarts=&limit=&offset=
  app.get('/api/top/speed', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const pagination = parsePagination(c);

    const params = [];

    let query = `
      SELECT
        d.id AS dog_id,
        d.name_lat,
        d.name_ru,
        d.breed,
        MAX(
          CASE
            WHEN json_extract(r.raw_scores_json, '$.heat1.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat1.speed') AS REAL)
            WHEN json_extract(r.raw_scores_json, '$.heat2.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat2.speed') AS REAL)
            WHEN json_extract(r.raw_scores_json, '$.heat3.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat3.speed') AS REAL)
            ELSE 0
          END
        ) AS best_speed,
        ROUND(AVG(
          CASE
            WHEN json_extract(r.raw_scores_json, '$.heat1.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat1.speed') AS REAL)
            WHEN json_extract(r.raw_scores_json, '$.heat2.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat2.speed') AS REAL)
            WHEN json_extract(r.raw_scores_json, '$.heat3.speed') IS NOT NULL THEN CAST(json_extract(r.raw_scores_json, '$.heat3.speed') AS REAL)
            ELSE NULL
          END
        ), 2) AS avg_speed,
        COUNT(*) AS total_starts
      FROM results r
      JOIN dogs d ON d.id = r.dog_id
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'finished' AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
    `;

    if (year) {
      query += ' AND e.year = ?';
      params.push(year);
    }

    if (breed) {
      query += ' AND d.breed = ?';
      params.push(breed);
    }

    query += ' GROUP BY d.id';

    if (minStarts > 0) {
      query += ' HAVING total_starts >= ?';
      params.push(minStarts);
    }

    query += ' ORDER BY best_speed DESC';

    const result = await queryWithPagination(db, query, params, pagination);
    return c.json(result);
  });

  // GET /api/years
  app.get('/api/years', async (c) => {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
    return c.json({ success: true, data: results });
  });
}
