export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
    };
    
    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // API endpoints
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, url, corsHeaders);
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

async function handleAPI(request, env, url, corsHeaders) {
  const path = url.pathname;
  const db = env.DB;
  
  try {
    // GET /api/top/placement?breed=&year=&minStarts=
    if (path === '/api/top/placement') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = url.searchParams.get('minStarts') || '0';
      
      let query = `
        SELECT * FROM v_top_by_placement
        WHERE total_starts >= ?
      `;
      const params = [minStarts];
      
      if (breed) {
        query += ' AND breed = ?';
        params.push(breed);
      }
      if (year) {
        query += ' AND year = ?';
        params.push(year);
      }
      
      const { results } = await db.prepare(query).bind(...params).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/top/score?breed=&year=&minStarts=
    if (path === '/api/top/score') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = url.searchParams.get('minStarts') || '0';
      
      let query = `
        SELECT * FROM v_top_by_score
        WHERE total_starts >= ?
      `;
      const params = [minStarts];
      
      if (breed) {
        query += ' AND breed = ?';
        params.push(breed);
      }
      if (year) {
        query += ' AND year = ?';
        params.push(year);
      }
      
      const { results } = await db.prepare(query).bind(...params).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/dogs/:id
    if (path.startsWith('/api/dogs/')) {
      const dogId = path.split('/')[3];
      const query = `
        SELECT d.*, r.*, e.*
        FROM dogs d
        JOIN results r ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE d.id = ?
        ORDER BY e.date_start DESC
      `;
      const { results } = await db.prepare(query).bind(dogId).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/breeds
    if (path === '/api/breeds') {
      const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/years
    if (path === '/api/years') {
      const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/events
    if (path === '/api/events') {
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
    
    return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
