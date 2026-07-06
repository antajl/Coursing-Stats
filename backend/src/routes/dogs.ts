import { Hono } from 'hono';
import { canonicalBreed } from '../lib/breed-mapping';
import { aggregateQualificationTitles } from '../lib/qualification-titles';
import { RACING_EXCLUDED_STATUSES_SQL } from '../lib/racing-status';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleDogs(app: Hono<{ Bindings: Env }>) {
  // GET /api/dogs — список собак (для админки; до маршрута /api/dogs/:id)
  app.get('/api/dogs', async (c) => {
    const db = c.env.DB;
    const search = c.req.query('search') || '';
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '5000', 10) || 5000, 1), 10000);

    let query = 'SELECT id, name_lat, name_ru, breed FROM dogs WHERE 1=1';
    const params: (string | number)[] = [];

    if (search) {
      query += ' AND (name_lat LIKE ? OR name_ru LIKE ? OR breed LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    query += ' ORDER BY name_lat ASC LIMIT ?';
    params.push(limit);

    const { results } = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/dogs/:id
  app.get('/api/dogs/:id', async (c) => {
    const db = c.env.DB;
    const dogId = c.req.param('id');

    // Get dog basic info
    const dogQuery = `
      SELECT
        id, name_lat, name_ru, breed, sex, owner
      FROM dogs
      WHERE id = ?
    `;

    const { results } = await db.prepare(dogQuery).bind(dogId).all();

    if (results.length === 0) {
      return c.json({ success: false, error: 'Dog not found' }, 404);
    }

    const dogData = results[0];

    // Get coursing statistics (coursing + bzmp)
    const coursingQuery = `
      SELECT
        COUNT(r.id) AS total_starts,
        MAX(r.total_score) AS best_score,
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
        , 2) AS avg_judge_score,
        SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
        SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
        SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
        (
          SELECT r2.event_id
          FROM results r2
          WHERE r2.dog_id = ? AND r2.status = 'finished'
            AND r2.total_score = (
              SELECT MAX(r3.total_score)
              FROM results r3
              JOIN events e3 ON r3.event_id = e3.id
              WHERE r3.dog_id = ? AND r3.status = 'finished'
                AND e3.event_type IN ('coursing', 'bzmp')
            )
          LIMIT 1
        ) AS best_score_event_id,
        (
          SELECT r4.event_id
          FROM results r4
          JOIN events e4 ON r4.event_id = e4.id
          WHERE r4.dog_id = ? AND r4.status = 'finished'
            AND e4.event_type IN ('coursing', 'bzmp')
            AND (
              SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL))
              FROM json_each(json_extract(r4.raw_scores_json, '$.heats')) AS h,
                   json_each(json_extract(h.value, '$.judges')) AS j
              WHERE json_extract(j.value, '$.sum') IS NOT NULL
            ) = (
              SELECT MAX(
                (SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL))
                 FROM json_each(json_extract(r5.raw_scores_json, '$.heats')) AS h,
                      json_each(json_extract(h.value, '$.judges')) AS j
                 WHERE json_extract(j.value, '$.sum') IS NOT NULL)
              )
              FROM results r5
              JOIN events e5 ON r5.event_id = e5.id
              WHERE r5.dog_id = ? AND r5.status = 'finished'
                AND e5.event_type IN ('coursing', 'bzmp')
            )
          LIMIT 1
        ) AS best_judge_score_event_id,
        (
          SELECT r6.event_id
          FROM results r6
          JOIN events e6 ON r6.event_id = e6.id
          WHERE r6.dog_id = ? AND r6.status = 'finished'
            AND e6.event_type IN ('coursing', 'bzmp')
            AND (
              SELECT ROUND(AVG(CAST(json_extract(j.value, '$.sum') AS REAL)), 2)
              FROM json_each(json_extract(r6.raw_scores_json, '$.heats')) AS h,
                   json_each(json_extract(h.value, '$.judges')) AS j
              WHERE json_extract(j.value, '$.sum') IS NOT NULL
            ) = (
              SELECT MAX(
                (SELECT ROUND(AVG(CAST(json_extract(j.value, '$.sum') AS REAL)), 2)
                 FROM json_each(json_extract(r7.raw_scores_json, '$.heats')) AS h,
                      json_each(json_extract(h.value, '$.judges')) AS j
                 WHERE json_extract(j.value, '$.sum') IS NOT NULL)
              )
              FROM results r7
              JOIN events e7 ON r7.event_id = e7.id
              WHERE r7.dog_id = ? AND r7.status = 'finished'
                AND e7.event_type IN ('coursing', 'bzmp')
            )
          LIMIT 1
        ) AS avg_judge_score_event_id
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.dog_id = ? AND r.status = 'finished'
        AND e.event_type IN ('coursing', 'bzmp')
    `;

    const { results: coursingResults } = await db.prepare(coursingQuery).bind(dogId, dogId, dogId, dogId, dogId, dogId, dogId).all();
    dogData.coursing_stats = coursingResults[0] || {
      total_starts: 0,
      best_score: null,
      best_judge_score: null,
      avg_judge_score: null,
      gold: 0,
      silver: 0,
      bronze: 0,
    };

    // Get racing statistics
    const racingQuery = `
      SELECT
        COUNT(r.id) AS total_starts,
        SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
        SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
        SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
        (
          SELECT r2.event_id
          FROM results r2
          JOIN events e ON r2.event_id = e.id
          WHERE r2.dog_id = ? AND e.event_type = 'racing' AND r2.raw_scores_json IS NOT NULL
            AND r2.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
            AND (
              SELECT MAX(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
              FROM json_each(json_extract(r2.raw_scores_json, '$.heats')) AS h
              WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
            ) = (
              SELECT MAX(
                (SELECT MAX(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
                 FROM json_each(json_extract(r3.raw_scores_json, '$.heats')) AS h
                 WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL)
              )
              FROM results r3
              JOIN events e3 ON r3.event_id = e3.id
              WHERE r3.dog_id = ? AND e3.event_type = 'racing' AND r3.raw_scores_json IS NOT NULL
                AND r3.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
            )
          LIMIT 1
        ) AS best_speed_event_id,
        (
          SELECT r4.event_id
          FROM results r4
          JOIN events e4 ON r4.event_id = e4.id
          WHERE r4.dog_id = ? AND e4.event_type = 'racing' AND r4.raw_scores_json IS NOT NULL
            AND r4.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
            AND (
              SELECT ROUND(AVG(CAST(json_extract(h.value, '$.speed_kmh') AS REAL)), 2)
              FROM json_each(json_extract(r4.raw_scores_json, '$.heats')) AS h
              WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
            ) = (
              SELECT MAX(
                (SELECT ROUND(AVG(CAST(json_extract(h.value, '$.speed_kmh') AS REAL)), 2)
                 FROM json_each(json_extract(r5.raw_scores_json, '$.heats')) AS h
                 WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL)
              )
              FROM results r5
              JOIN events e5 ON r5.event_id = e5.id
              WHERE r5.dog_id = ? AND e5.event_type = 'racing' AND r5.raw_scores_json IS NOT NULL
                AND r5.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
            )
          LIMIT 1
        ) AS avg_speed_event_id
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.dog_id = ? AND r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL} AND e.event_type = 'racing'
    `;

    const { results: racingCountResults } = await db.prepare(racingQuery).bind(dogId, dogId, dogId, dogId, dogId).all();
    dogData.racing_stats = {
      total_starts: racingCountResults[0]?.total_starts || 0,
      gold: racingCountResults[0]?.gold || 0,
      silver: racingCountResults[0]?.silver || 0,
      bronze: racingCountResults[0]?.bronze || 0,
      best_speed: null,
      avg_speed: null,
      best_speed_event_id: racingCountResults[0]?.best_speed_event_id || null,
      avg_speed_event_id: racingCountResults[0]?.avg_speed_event_id || null
    };

    // Get speed data from racing events
    if (dogData.racing_stats.total_starts > 0) {
      const speedQuery = `
        SELECT raw_scores_json
        FROM results
        JOIN events ON results.event_id = events.id
        WHERE results.dog_id = ? AND events.event_type = 'racing' AND results.raw_scores_json IS NOT NULL
          AND results.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
      `;

      const { results: speedResults } = await db.prepare(speedQuery).bind(dogId).all();

      // Extract speeds from raw_scores_json (new format with heats array)
      const speeds = [];
      for (const row of speedResults) {
        try {
          const scores = JSON.parse(row.raw_scores_json);
          if (scores.heats && Array.isArray(scores.heats)) {
            for (const heat of scores.heats) {
              if (heat.speed_kmh) {
                speeds.push(parseFloat(heat.speed_kmh));
              }
            }
          }
        } catch (e) {
          console.error('Error parsing raw_scores_json:', e);
        }
      }

      // Calculate best and average speed (already in km/h)
      if (speeds.length > 0) {
        const bestSpeed = Math.max(...speeds);
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        dogData.racing_stats.best_speed = bestSpeed.toFixed(2);
        dogData.racing_stats.avg_speed = avgSpeed.toFixed(2);
      }
    }

    const { results: qualificationRows } = await db.prepare(`
      SELECT qualification
      FROM results
      WHERE dog_id = ? AND status = 'finished'
        AND qualification IS NOT NULL AND TRIM(qualification) != ''
    `).bind(dogId).all();

    dogData.titles = aggregateQualificationTitles(qualificationRows);

    return c.json({ success: true, data: dogData });
  });

  // GET /api/dogs/:id/competitions
  app.get('/api/dogs/:id/competitions', async (c) => {
    const db = c.env.DB;
    const dogId = c.req.param('id');

    const eventsQuery = `
      SELECT
        e.id AS event_id,
        e.date_start,
        e.date_end,
        e.title,
        e.event_type,
        e.competition_kind,
        e.results_url,
        e.location,
        r.placement,
        r.total_score,
        r.status
      FROM events e
      JOIN results r ON e.id = r.event_id
      WHERE r.dog_id = ? AND r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
      ORDER BY e.date_start DESC
    `;

    const { results } = await db.prepare(eventsQuery).bind(dogId).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/breeds
  app.get('/api/breeds', async (c) => {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();

    const mappedBreeds = results.map((r: { breed: string }) => ({
      breed: canonicalBreed(r.breed),
    }));

    const uniqueBreeds = Array.from(
      new Set(mappedBreeds.map((b: { breed: string }) => b.breed))
    ).sort().map((breed) => ({ breed }));

    return c.json({ success: true, data: uniqueBreeds });
  });
}
