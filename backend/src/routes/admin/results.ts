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

export function handleAdminResults(app: Hono<{ Bindings: Env }>) {
  // POST /api/admin/delete-results/:id
  app.post('/api/admin/delete-results/:id', async (c) => {
    const db = c.env.DB;
    const env = c.env;
    const eventId = c.req.param('id');

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      await db.prepare('DELETE FROM results WHERE event_id = ?').bind(eventId).run();

      return c.json({
        success: true,
        message: 'Results deleted',
        eventId
      });
    } catch (err: any) {
      console.error('Error deleting results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/import-results
  app.post('/api/admin/import-results', async (c) => {
    const db = c.env.DB;
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const { dogs, results, events } = body;

      if (!Array.isArray(dogs) || !Array.isArray(results)) {
        return c.json({ success: false, error: 'Invalid data format' }, 400);
      }

      // Update events with judges and track_schemes
      let eventsUpdated = 0;
      if (Array.isArray(events) && events.length > 0) {
        for (const eventUpdate of events) {
          try {
            await db.prepare(`
              UPDATE events
              SET judges = ?, track_schemes = ?
              WHERE results_url = ?
            `).bind(
              eventUpdate.judges,
              eventUpdate.track_schemes ? JSON.stringify(eventUpdate.track_schemes) : null,
              eventUpdate.results_url
            ).run();
            eventsUpdated++;
          } catch (err) {
            console.error('Error updating event:', eventUpdate, err);
          }
        }
      }

      // Insert dogs
      let dogsInserted = 0;
      for (const dog of dogs) {
        try {
          await db.prepare(`
            INSERT OR IGNORE INTO dogs (name_lat, breed, name_ru, pedigree_url)
            VALUES (?, ?, ?, ?)
          `).bind(dog.name_lat, dog.breed, dog.name_ru, dog.pedigree_url).run();
          dogsInserted++;
        } catch (err) {
          console.error('Error inserting dog:', dog, err);
        }
      }

      // Insert results in batches
      let resultsInserted = 0;
      const BATCH_SIZE = 100;

      for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const batch = results.slice(i, i + BATCH_SIZE);

        for (const result of batch) {
          try {
            // Get dog_id
            const dogRow = await db.prepare(`
              SELECT id FROM dogs WHERE name_lat = ? AND breed = ?
            `).bind(result.name_lat, result.breed).first();

            if (!dogRow) {
              console.error('Dog not found:', result.name_lat, result.breed);
              continue;
            }

            // Get event_id from results_url
            const eventRow = await db.prepare(`
              SELECT id FROM events WHERE results_url = ?
            `).bind(result.results_url).first();

            if (!eventRow) {
              console.error('Event not found for results_url:', result.results_url);
              continue;
            }

            await db.prepare(`
              INSERT INTO results (
                dog_id, event_id, breed_class, placement, total_score, judge_count,
                qualification, vc, status, raw_scores_json, raw_text, judges, status_reason
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              dogRow.id,
              eventRow.id,
              result.breed_class,
              result.placement,
              result.total_score,
              result.judge_count,
              result.qualification,
              result.vc,
              result.status,
              result.raw_scores_json,
              result.raw_text,
              result.judges,
              result.status_reason
            ).run();

            resultsInserted++;
          } catch (err) {
            console.error('Error inserting result:', result, err);
          }
        }
      }

      return c.json({
        success: true,
        message: 'Import completed',
        stats: {
          dogsInserted,
          resultsInserted,
          eventsUpdated,
          totalDogs: dogs.length,
          totalResults: results.length,
          totalEvents: events ? events.length : 0
        }
      });
    } catch (err: any) {
      console.error('Error importing results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // GET /api/admin/events/:id/results - Get results for an event
  app.get('/api/admin/events/:id/results', async (c) => {
    const db = c.env.DB;
    const env = c.env;
    const eventId = c.req.param('id');

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const { results } = await db.prepare(`
        SELECT
          r.id, r.event_id, r.dog_id, r.breed_class, r.catalog_no,
          r.placement, r.total_score, r.qualification, r.vc, r.status,
          r.raw_scores_json, r.breed_class, r.status_reason, r.judges,
          d.name_lat, d.name_ru, d.breed
        FROM results r
        JOIN dogs d ON r.dog_id = d.id
        WHERE r.event_id = ?
        ORDER BY r.placement ASC
      `).bind(eventId).all();

      return c.json({ success: true, data: results });
    } catch (err: any) {
      console.error('Error fetching results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT /api/admin/results/:id - Update result
  app.put('/api/admin/results/:id', async (c) => {
    const db = c.env.DB;
    const env = c.env;
    const resultId = c.req.param('id');

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const EDITABLE_RESULT_FIELDS = [
      'breed_class',
      'placement',
      'total_score',
      'qualification',
      'vc',
      'status',
      'status_reason',
      'raw_scores_json',
    ] as const;

    try {
      const body = await c.req.json();

      const existing = await db
        .prepare('SELECT id FROM results WHERE id = ?')
        .bind(resultId)
        .first();

      if (!existing) {
        return c.json({ success: false, error: 'Result not found' }, 404);
      }

      const sets: string[] = [];
      const values: unknown[] = [];

      for (const field of EDITABLE_RESULT_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          sets.push(`${field} = ?`);
          let val = body[field];
          if (field === 'raw_scores_json' && val !== null && typeof val === 'object') {
            val = JSON.stringify(val);
          }
          values.push(val === '' || val === undefined ? null : val);
        }
      }

      if (sets.length === 0) {
        return c.json({ success: false, error: 'No fields to update' }, 400);
      }

      await db
        .prepare(`UPDATE results SET ${sets.join(', ')} WHERE id = ?`)
        .bind(...values, resultId)
        .run();

      return c.json({ success: true, message: 'Result updated' });
    } catch (err: any) {
      console.error('Error updating result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/results - Create new result
  app.post('/api/admin/results', async (c) => {
    const db = c.env.DB;
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const { event_id, dog_id, breed_class, placement, total_score, qualification, vc, status } = body;

      const result = await db.prepare(`
        INSERT INTO results (event_id, dog_id, breed_class, placement, total_score, qualification, vc, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(event_id, dog_id, breed_class, placement, total_score, qualification, vc, status).run();

      return c.json({ success: true, message: 'Result created', id: result.meta.last_row_id });
    } catch (err: any) {
      console.error('Error creating result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE /api/admin/results/:id - Delete result
  app.delete('/api/admin/results/:id', async (c) => {
    const db = c.env.DB;
    const env = c.env;
    const resultId = c.req.param('id');

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      await db.prepare('DELETE FROM results WHERE id = ?').bind(resultId).run();
      return c.json({ success: true, message: 'Result deleted' });
    } catch (err: any) {
      console.error('Error deleting result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
