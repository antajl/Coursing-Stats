export async function handleCompetitions(path, url, db, corsHeaders) {
  // GET /api/competitions
  if (path === '/api/competitions') {
    const breed = url.searchParams.get('breed') || '';
    const year = url.searchParams.get('year') || '';

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY date_start DESC';

    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results, { headers: corsHeaders });
  }

  // GET /api/competitions/:id
  if (path.match(/^\/api\/competitions\/\d+$/) && !path.endsWith('/results')) {
    const eventId = path.split('/')[3];
    const { results } = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).all();

    if (results.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders });
    }

    return Response.json(results[0], { headers: corsHeaders });
  }

  // GET /api/competitions/:id/results
  if (path.match(/^\/api\/competitions\/\d+\/results$/)) {
    const eventId = path.split('/')[3];
    const { results } = await db.prepare(`
      SELECT r.*, d.name_lat, d.name_ru, d.breed
      FROM results r
      JOIN dogs d ON d.id = r.dog_id
      WHERE r.event_id = ?
      ORDER BY r.placement ASC
    `).bind(eventId).all();

    return Response.json(results, { headers: corsHeaders });
  }

  return null;
}
