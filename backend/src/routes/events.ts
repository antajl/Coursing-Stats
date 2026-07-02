import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleCompetitions(app: Hono<{ Bindings: Env }>) {
  // GET /api/competitions
  app.get('/api/competitions', async (c) => {
    const db = c.env.DB;
    const breed = c.req.query('breed') || '';
    const year = c.req.query('year') || '';

    let query = `
      SELECT
        id, year, date_start, date_end, rank_label, event_type,
        competition_kind, competition_type, title, host_club,
        region, location, catalog_url, results_url, confirmed
      FROM events WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY date_start DESC';

    const { results } = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  });

  // GET /api/competitions/:id
  app.get('/api/competitions/:id', async (c) => {
    const db = c.env.DB;
    const eventId = c.req.param('id');
    const { results } = await db.prepare(`
      SELECT
        id, year, date_start, date_end, rank_label, event_type,
        competition_kind, competition_type, title, host_club,
        region, location, catalog_url, results_url, confirmed,
        judges, track_schemes
      FROM events WHERE id = ?
    `).bind(eventId).all();

    if (results.length === 0) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }

    return c.json({ success: true, data: results[0] });
  });

  // GET /api/competitions/:id/results
  app.get('/api/competitions/:id/results', async (c) => {
    const db = c.env.DB;
    const eventId = c.req.param('id');
    const { results } = await db.prepare(`
      SELECT
        r.id, r.event_id, r.dog_id, r.breed_class, r.catalog_no,
        r.placement, r.total_score, r.qualification, r.vc, r.status,
        r.raw_scores_json, r.breed_class, r.status_reason, r.judges,
        d.name_lat, d.name_ru, d.breed
      FROM results r
      JOIN dogs d ON d.id = r.dog_id
      WHERE r.event_id = ?
      ORDER BY r.placement ASC
    `).bind(eventId).all();

    return c.json({ success: true, data: results });
  });
}
