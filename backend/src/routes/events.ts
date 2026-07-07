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
        e.id, e.year, e.date_start, e.date_end, e.rank_label, e.event_type,
        e.competition_kind, e.competition_type, e.title, e.full_title, e.host_club,
        e.region, e.location, e.catalog_url, e.results_url, e.confirmed, e.judges,
        (SELECT COUNT(DISTINCT r.dog_id) FROM results r WHERE r.event_id = e.id) AS participants_count
      FROM events e WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND (year = ? OR substr(date_start, 1, 4) = ?)';
      params.push(year, year);
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
        competition_kind, competition_type, title, full_title, host_club,
        region, location, catalog_url, results_url, confirmed,
        judges, track_schemes, event_date, protocol_location, telegram_url
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

  // GET /api/stats
  app.get('/api/stats', async (c) => {
    const store = c.env.DATA_STORE;
    if (store?.stats) {
      const { results: breedCount } = await c.env.DB
        .prepare('SELECT COUNT(DISTINCT breed) as count FROM dogs')
        .all();
      return c.json({
        success: true,
        data: {
          ...store.stats,
          breeds: breedCount[0]?.count || 0,
          data_source: 'data/v1',
          snapshot_hash: store.snapshotHash ?? null,
        },
      });
    }

    const db = c.env.DB;

    const { results: eventCount } = await db.prepare('SELECT COUNT(*) as count FROM events').all();
    const { results: dogCount } = await db.prepare('SELECT COUNT(*) as count FROM dogs').all();
    const { results: resultCount } = await db.prepare('SELECT COUNT(*) as count FROM results').all();
    const { results: breedCount } = await db.prepare('SELECT COUNT(DISTINCT breed) as count FROM dogs').all();
    const { results: speedCount } = await db.prepare('SELECT COUNT(*) as count FROM speed_records').all();
    const { results: coursingCount } = await db.prepare('SELECT COUNT(*) as count FROM coursing_records').all();

    return c.json({
      success: true,
      data: {
        events: eventCount[0]?.count || 0,
        dogs: dogCount[0]?.count || 0,
        results: resultCount[0]?.count || 0,
        breeds: breedCount[0]?.count || 0,
        speed_records: speedCount[0]?.count || 0,
        coursing_records: coursingCount[0]?.count || 0,
      }
    });
  });
}
