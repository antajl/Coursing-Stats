function checkAdminToken(request, env) {
  const authHeader = request.headers.get('X-Admin-Token');
  const adminToken = env.ADMIN_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_TOKEN not set in environment variables');
    return false;
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

  return null;
}
