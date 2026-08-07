import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

function checkAdminToken(c: any, env: Env) {
  const authHeader = c.req.header('X-Admin-Token');
  const adminToken = env.ADMIN_API_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_API_TOKEN not set in environment variables, allowing access for local dev');
    return true;
  }

  return authHeader === adminToken;
}

export function handleAdminViews(app: Hono<{ Bindings: Env }>) {
  // POST /api/recreate-views
  app.post('/api/recreate-views', async (c) => {
    const db = c.env.DB;
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      await db.exec('DROP VIEW IF EXISTS v_top_by_placement');
      await db.exec('DROP VIEW IF EXISTS v_top_by_score');

      await db.exec("CREATE VIEW v_top_by_placement AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold, SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver, SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze, COUNT(*) AS total_starts FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");

      await db.exec("CREATE VIEW v_top_by_score AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, MAX(r.total_score) AS best_score, COUNT(*) AS total_starts, MAX((SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL)) FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h, json_each(json_extract(h.value, '$.judges')) AS j WHERE json_extract(j.value, '$.sum') IS NOT NULL)) AS best_judge_score, ROUND((SELECT AVG(CAST(json_extract(j.value, '$.sum') AS REAL)) FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h, json_each(json_extract(h.value, '$.judges')) AS j WHERE json_extract(j.value, '$.sum') IS NOT NULL), 2) AS avg_judge_score FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");

      return c.json({ success: true, message: 'Views recreated successfully' });
    } catch (err: any) {
      console.error('Error recreating views:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/update/trigger
  app.post('/api/update/trigger', async (c) => {
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    return c.json({
      success: true,
      message: 'Update triggered successfully',
      note: 'Automatic updates run weekly via GitHub Actions (.github/workflows/update-db.yml). Manual run: npm run ci-update-db'
    });
  });

  // POST /api/admin/reparse-coursing
  app.post('/api/admin/reparse-coursing', async (c) => {
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    return c.json({
      success: true,
      message: 'Use CLI: npm run reparse-coursing, then wrangler d1 execute pc-db --remote --file=./data/updates/reparse-coursing.sql',
    });
  });
}
