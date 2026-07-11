import { Hono } from 'hono';
import { appendBreedFilter } from '../lib/breed-mapping';
import { RACING_EXCLUDED_STATUSES_SQL } from '../lib/racing-status';
import { tryStaticTopPlacement, tryStaticTopScore } from '../lib/static-api';

type Env = {
  DB: any;
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
  // GET /api/top/placement?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/placement', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'gold';
    const pagination = parsePagination(c);

    let params: unknown[] = [];

    let query;
    let orderBy = 'gold DESC, silver DESC, bronze DESC';
    if (sortBy === 'silver') {
      orderBy = 'silver DESC, gold DESC, bronze DESC';
    } else if (sortBy === 'bronze') {
      orderBy = 'bronze DESC, gold DESC, silver DESC';
    } else if (sortBy === 'total') {
      orderBy = '(gold + silver + bronze) DESC, gold DESC, silver DESC, bronze DESC';
    }

    if (year) {
      if (!breed && minStarts === 0) {
        const staticResult = await tryStaticTopPlacement(year, sortBy, pagination);
        if (staticResult) return c.json(staticResult);
      }

      query = 'SELECT *, year AS year_from, year AS year_to FROM v_top_by_placement WHERE year = ?';
      params.push(year);

      if (breed) {
        ({ query, params } = appendBreedFilter(query, params, breed, 'breed'));
      }
      if (minStarts > 0) {
        query += ' AND total_starts >= ?';
        params.push(minStarts);
      }
      query += ` ORDER BY ${orderBy}`;
    } else {
      query = `
        SELECT
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
          CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
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
        ({ query, params } = appendBreedFilter(query, params, breed));
      }

      query += ' GROUP BY d.id';

      if (minStarts > 0) {
        query += ' HAVING total_starts >= ?';
        params.push(minStarts);
      }

      query += ` ORDER BY ${orderBy}`;
    }

    const result = await queryWithPagination(db, query, params, pagination);
    return c.json(result);
  });

  // GET /api/top/score?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/score', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'best_judge_score';
    const pagination = parsePagination(c);

    let params: unknown[] = [];

    let query;
    let orderBy = 'best_judge_score DESC, avg_judge_score DESC, total_starts DESC, best_score DESC';
    if (sortBy === 'best_score') {
      orderBy = 'best_score DESC, best_judge_score DESC, avg_judge_score DESC, total_starts DESC';
    } else if (sortBy === 'avg_judge_score') {
      orderBy = 'avg_judge_score DESC, best_judge_score DESC, total_starts DESC, best_score DESC';
    }

    if (year) {
      if (!breed && minStarts === 0) {
        const staticResult = await tryStaticTopScore(year, sortBy, pagination);
        if (staticResult) return c.json(staticResult);
      }

      query = 'SELECT *, year AS year_from, year AS year_to FROM v_top_by_score WHERE year = ?';
      params.push(year);

      if (breed) {
        ({ query, params } = appendBreedFilter(query, params, breed, 'breed'));
      }
      if (minStarts > 0) {
        query += ' AND total_starts >= ?';
        params.push(minStarts);
      }
      query += ` ORDER BY ${orderBy}`;
    } else {
      query = `
        SELECT
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
          CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
          MAX(r.total_score) AS best_score,
          COUNT(*) AS total_starts,
          MAX(
            (SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL))
             FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h,
                  json_each(json_extract(h.value, '$.judges')) AS j
             WHERE json_extract(j.value, '$.sum') IS NOT NULL)
          ) AS best_judge_score,
          ROUND(
            (SELECT AVG(CAST(json_extract(j.value, '$.sum') AS REAL))
             FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h,
                  json_each(json_extract(h.value, '$.judges')) AS j
             WHERE json_extract(j.value, '$.sum') IS NOT NULL)
          , 2) AS avg_judge_score
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
      `;

      if (breed) {
        ({ query, params } = appendBreedFilter(query, params, breed));
      }

      query += ' GROUP BY d.id';

      if (minStarts > 0) {
        query += ' HAVING total_starts >= ?';
        params.push(minStarts);
      }

      query += ` ORDER BY ${orderBy}`;
    }

    const result = await queryWithPagination(db, query, params, pagination);
    return c.json(result);
  });

  // GET /api/top/speed?breed=&year=&minStarts=&sortBy=&limit=&offset=
  app.get('/api/top/speed', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';
    const minStarts = parseInt(c.req.query('minStarts')) || 0;
    const sortBy = c.req.query('sortBy') || 'best_speed';
    const pagination = parsePagination(c);

    let params: unknown[] = [];

    let query = `
      SELECT
        d.id AS dog_id,
        d.name_lat,
        d.name_ru,
        d.breed,
        CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
        CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
        MAX(
          CASE
            WHEN json_extract(r.raw_scores_json, '$.format') = 'racing' THEN (
              SELECT MAX(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
              FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
              WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
            )
            ELSE NULL
          END
        ) AS best_speed,
        ROUND(AVG(
          CASE
            WHEN json_extract(r.raw_scores_json, '$.format') = 'racing' THEN (
              SELECT AVG(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
              FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
              WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
            )
            ELSE NULL
          END
        ), 2) AS avg_speed,
        COUNT(*) AS total_starts
      FROM results r
      JOIN dogs d ON d.id = r.dog_id
      JOIN events e ON r.event_id = e.id
      WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
        AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
    `;

    if (year) {
      query += ' AND e.year = ?';
      params.push(year);
    }

    if (breed) {
      ({ query, params } = appendBreedFilter(query, params, breed));
    }

    query += ' GROUP BY d.id HAVING best_speed IS NOT NULL';

    if (minStarts > 0) {
      query += ' AND total_starts >= ?';
      params.push(minStarts);
    }

    let orderBy = 'best_speed DESC';
    if (sortBy === 'avg_speed') {
      orderBy = 'avg_speed DESC, best_speed DESC';
    }

    query += ` ORDER BY ${orderBy}`;

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
