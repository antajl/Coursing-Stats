export async function handleSpeed(path, url, db, corsHeaders) {
  // GET /api/speed-records
  if (path === '/api/speed-records') {
    const breed = url.searchParams.get('breed') || '';
    const sex = url.searchParams.get('sex') || '';
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

    query += ' ORDER BY speed_km_h DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results, { headers: corsHeaders });
  }

  return null;
}
