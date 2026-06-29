import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleDogs(app: Hono<{ Bindings: Env }>) {
  // GET /api/dogs/:id
  app.get('/api/dogs/:id', async (c) => {
    const db = c.env.DB;
    const dogId = c.req.param('id');

    // Get dog basic info
    const dogQuery = `
      SELECT
        d.id AS dog_id,
        d.name_lat,
        d.name_ru,
        d.breed,
        d.sex,
        d.owner
      FROM dogs d
      WHERE d.id = ?
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
        ROUND(AVG(r.total_score), 2) AS avg_score,
        SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
        SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
        SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
        (
          SELECT e.results_url
          FROM results r2
          JOIN events e ON r2.event_id = e.id
          WHERE r2.dog_id = ? AND r2.status = 'finished'
            AND e.event_type IN ('coursing', 'bzmp')
          ORDER BY r2.total_score DESC
          LIMIT 1
        ) AS best_score_event_url
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.dog_id = ? AND r.status = 'finished'
        AND e.event_type IN ('coursing', 'bzmp')
    `;

    const { results: coursingResults } = await db.prepare(coursingQuery).bind(dogId, dogId).all();
    dogData.coursing_stats = coursingResults[0] || {
      total_starts: 0,
      best_score: null,
      avg_score: null,
      gold: 0,
      silver: 0,
      bronze: 0
    };

    // Get racing statistics
    const racingQuery = `
      SELECT
        COUNT(r.id) AS total_starts,
        (
          SELECT e.results_url
          FROM results r2
          JOIN events e ON r2.event_id = e.id
          WHERE r2.dog_id = ? AND e.event_type = 'racing' AND r2.raw_scores_json IS NOT NULL
          ORDER BY (
            SELECT MAX(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
            FROM json_each(json_extract(r2.raw_scores_json, '$.heats')) AS h
            WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
          ) DESC
          LIMIT 1
        ) AS best_speed_event_url
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.dog_id = ? AND r.status = 'finished' AND e.event_type = 'racing'
    `;

    const { results: racingCountResults } = await db.prepare(racingQuery).bind(dogId, dogId).all();
    dogData.racing_stats = {
      total_starts: racingCountResults[0]?.total_starts || 0,
      best_speed: null,
      avg_speed: null,
      best_speed_event_url: racingCountResults[0]?.best_speed_event_url || null
    };

    // Get speed data from racing events
    if (dogData.racing_stats.total_starts > 0) {
      const speedQuery = `
        SELECT r.raw_scores_json
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
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
      WHERE r.dog_id = ? AND r.status = 'finished'
      ORDER BY e.date_start DESC
    `;

    const { results } = await db.prepare(eventsQuery).bind(dogId).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/breeds
  app.get('/api/breeds', async (c) => {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();
    return c.json({ success: true, data: results });
  });
}
