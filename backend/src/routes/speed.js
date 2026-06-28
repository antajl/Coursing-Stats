export async function handleSpeed(path, url, db, corsHeaders) {
  // GET /api/speed-records
  if (path === '/api/speed-records') {
    const breed = url.searchParams.get('breed') || '';
    const sex = url.searchParams.get('sex') || '';
    const search = url.searchParams.get('search') || '';
    const year = url.searchParams.get('year') || '';
    const limit = url.searchParams.get('limit') || '100';

    let query = 'SELECT * FROM speed_records WHERE 1=1';
    const params = [];

    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }

    if (sex) {
      query += ' AND sex = ?';
      params.push(sex);
    }

    if (year) {
      query += ' AND date LIKE ?';
      params.push(`%.${year}`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR breed LIKE ? OR date LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY speed_km_h DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results, { headers: corsHeaders });
  }

  // GET /api/coursing-records
  if (path === '/api/coursing-records') {
    const breed = url.searchParams.get('breed') || '';
    const search = url.searchParams.get('search') || '';
    const year = url.searchParams.get('year') || '';
    const limit = url.searchParams.get('limit') || '100';

    let query = 'SELECT * FROM coursing_records WHERE 1=1';
    const params = [];

    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }

    if (year) {
      query += ' AND date LIKE ?';
      params.push(`%.${year}`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR breed LIKE ? OR date LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY time_seconds ASC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results, { headers: corsHeaders });
  }

  return null;
}
