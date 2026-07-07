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

export function handleAdminEvents(app: Hono<{ Bindings: Env }>) {
  // GET /api/admin/events - Get all events for admin
  app.get('/api/admin/events', async (c) => {
    const db = c.env.DB;
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const year = c.req.query('year');
      let query = `
        SELECT id, year, date_start, date_end, rank_label, event_type,
               competition_kind, competition_type, title, host_club,
               region, location, catalog_url, results_url, confirmed, judges
        FROM events
        WHERE year < 2026
      `;
      const params = [];

      if (year) {
        query += ' AND year = ?';
        params.push(year);
      }

      query += ' ORDER BY date_start ASC';

      const { results } = await db.prepare(query).bind(...params).all();
      return c.json({ success: true, data: results });
    } catch (err: any) {
      console.error('Error fetching events:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT /api/admin/events/:id - Update event (только переданные поля)
  app.put('/api/admin/events/:id', async (c) => {
    const db = c.env.DB;
    const env = c.env;
    const eventId = c.req.param('id');

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const EDITABLE_EVENT_FIELDS = [
      'date_start',
      'date_end',
      'rank_label',
      'location',
      'host_club',
      'title',
      'full_title',
      'protocol_location',
      'event_date',
      'judges',
      'results_url',
    ] as const;

    try {
      const body = await c.req.json();

      const existing = await db
        .prepare('SELECT id FROM events WHERE id = ?')
        .bind(eventId)
        .first();

      if (!existing) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const sets: string[] = [];
      const values: unknown[] = [];

      for (const field of EDITABLE_EVENT_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          sets.push(`${field} = ?`);
          const val = body[field];
          values.push(val === '' || val === undefined ? null : val);
        }
      }

      if (sets.length === 0) {
        return c.json({ success: false, error: 'No fields to update' }, 400);
      }

      await db
        .prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`)
        .bind(...values, eventId)
        .run();

      return c.json({ success: true, message: 'Event updated' });
    } catch (err: any) {
      console.error('Error updating event:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
