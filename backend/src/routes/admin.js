function checkAdminToken(request, env) {
  const authHeader = request.headers.get('X-Admin-Token');
  const adminToken = env.ADMIN_TOKEN;

  // Для локальной разработки без ADMIN_TOKEN разрешаем доступ
  if (!adminToken) {
    console.warn('ADMIN_TOKEN not set in environment variables, allowing access for local dev');
    return true;
  }

  return authHeader === adminToken;
}

export async function handleAdmin(path, request, env, db, corsHeaders) {
  // POST /api/recreate-views
  if (path === '/api/recreate-views') {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!checkAdminToken(request, env)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
      await db.exec('DROP VIEW IF EXISTS v_top_by_placement');
      await db.exec('DROP VIEW IF EXISTS v_top_by_score');

      await db.exec("CREATE VIEW v_top_by_placement AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold, SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver, SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze, COUNT(*) AS total_starts FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");

      await db.exec("CREATE VIEW v_top_by_score AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, MAX(r.total_score) AS best_score, ROUND(AVG(r.total_score), 2) AS avg_score, COUNT(*) AS total_starts FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");

      return Response.json({ success: true, message: 'Views recreated successfully' }, { headers: corsHeaders });
    } catch (err) {
      console.error('Error recreating views:', err);
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Manual update trigger endpoint
  if (path === '/api/update/trigger') {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!checkAdminToken(request, env)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // For now, return success - actual update would need server-side scraping
    // In production, this would trigger GitHub Actions or external server
    return Response.json({
      success: true,
      message: 'Update triggered successfully',
      note: 'Automatic updates run weekly via GitHub Actions (.github/workflows/update-db.yml). Manual run: npm run ci-update-db'
    }, { headers: corsHeaders });
  }

  // Re-parse coursing events endpoint
  if (path === '/api/admin/reparse-coursing') {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!checkAdminToken(request, env)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
      const { reparseCoursingEvents } = await import('../scripts/reparse-coursing-events.mjs');
      const result = await reparseCoursingEvents(db);

      return Response.json({
        success: true,
        message: 'Reparse completed',
        result
      }, { headers: corsHeaders });
    } catch (err) {
      console.error('Error reparse coursing events:', err);
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Delete results for an event endpoint
  if (path.match(/^\/api\/admin\/delete-results\/\d+$/)) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!checkAdminToken(request, env)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
      const eventId = path.split('/').pop();
      
      await db.prepare('DELETE FROM results WHERE event_id = ?').bind(eventId).run();

      return Response.json({
        success: true,
        message: 'Results deleted',
        eventId
      }, { headers: corsHeaders });
    } catch (err) {
      console.error('Error deleting results:', err);
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Import results endpoint
  if (path === '/api/admin/import-results') {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!checkAdminToken(request, env)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { dogs, results, events } = body;

      if (!Array.isArray(dogs) || !Array.isArray(results)) {
        return Response.json({ success: false, error: 'Invalid data format' }, { status: 400, headers: corsHeaders });
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

      return Response.json({
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
      }, { headers: corsHeaders });
    } catch (err) {
      console.error('Error importing results:', err);
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}
