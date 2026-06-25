export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;
  
  // Check if D1 binding is available
  if (!env['pc-db']) {
    return new Response(JSON.stringify({ error: 'D1 database not available' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
  
  const db = env['pc-db'];
  
  // Handle different API endpoints
  try {
    if (path === '/api/events') {
      const year = url.searchParams.get('year');
      let query = 'SELECT * FROM events ORDER BY date_start DESC';
      let params = [];
      
      if (year) {
        query += ' WHERE year = ?';
        params.push(year);
      }
      
      const { results } = await db.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/breeds') {
      const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();
      const breeds = results.map(r => ({ breed: r.breed }));
      return new Response(JSON.stringify(breeds), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/years') {
      const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
      const years = results.map(r => ({ year: r.year }));
      return new Response(JSON.stringify(years), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/top/placement') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      
      let query = `
        SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year,
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
          COUNT(*) AS total_starts
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
      `;
      const params = [];
      
      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }
      if (year) {
        query += ' AND e.year = ?';
        params.push(year);
      }
      
      query += ' GROUP BY d.id, e.year HAVING COUNT(*) >= ? ORDER BY e.year DESC, gold DESC, silver DESC, bronze DESC LIMIT ? OFFSET ?';
      params.push(minStarts, limit, offset);
      
      const { results } = await db.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/top/score') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      
      let query = `
        SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year,
          MAX(r.total_score) AS best_score,
          ROUND(AVG(r.total_score), 2) AS avg_score,
          COUNT(*) AS total_starts
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
      `;
      const params = [];
      
      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }
      if (year) {
        query += ' AND e.year = ?';
        params.push(year);
      }
      
      query += ' GROUP BY d.id, e.year HAVING COUNT(*) >= ? ORDER BY e.year DESC, best_score DESC LIMIT ? OFFSET ?';
      params.push(minStarts, limit, offset);
      
      const { results } = await db.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/top/speed') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      
      let query = `
        SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year,
          MAX(CAST(JSON_EXTRACT(r.raw_scores_json, '$.heat1.speed') AS REAL)) AS best_speed,
          ROUND(AVG(CAST(JSON_EXTRACT(r.raw_scores_json, '$.heat1.speed') AS REAL)), 2) AS avg_speed,
          COUNT(*) AS total_starts
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status = 'finished' AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
      `;
      const params = [];
      
      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }
      if (year) {
        query += ' AND e.year = ?';
        params.push(year);
      }
      
      query += ' GROUP BY d.id, e.year HAVING COUNT(*) >= ? ORDER BY e.year DESC, best_speed DESC LIMIT ? OFFSET ?';
      params.push(minStarts, limit, offset);
      
      const { results } = await db.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path.startsWith('/api/dogs/')) {
      const dogId = path.split('/')[3];
      
      if (path.endsWith('/events')) {
        const { results } = await db.prepare(`
          SELECT e.*, r.placement, r.total_score, r.status
          FROM results r
          JOIN events e ON r.event_id = e.id
          WHERE r.dog_id = ?
          ORDER BY e.date_start DESC
        `).bind(dogId).all();
        
        return new Response(JSON.stringify(results), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
      
      const { results } = await db.prepare('SELECT * FROM dogs WHERE id = ?').bind(dogId).all();
      if (results.length === 0) {
        return new Response(JSON.stringify({ error: 'Dog not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
      
      const dog = results[0];
      
      // Calculate stats
      const placementStats = await db.prepare(`
        SELECT e.year,
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
          COUNT(*) AS total_starts
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
        GROUP BY e.year
      `).bind(dogId).all();
      
      const scoreStats = await db.prepare(`
        SELECT e.year,
          MAX(r.total_score) AS best_score,
          ROUND(AVG(r.total_score), 2) AS avg_score,
          COUNT(*) AS total_starts
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
        GROUP BY e.year
      `).bind(dogId).all();
      
      const racingStats = await db.prepare(`
        SELECT e.year,
          MAX(JSON_EXTRACT(r.raw_scores_json, '$.speed')) AS best_speed,
          ROUND(AVG(JSON_EXTRACT(r.raw_scores_json, '$.speed')), 2) AS avg_speed,
          COUNT(*) AS total_starts
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
        GROUP BY e.year
      `).bind(dogId).all();
      
      return new Response(JSON.stringify({
        ...dog,
        coursing_stats: placementStats.results || [],
        score_stats: scoreStats.results || [],
        racing_stats: racingStats.results || []
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    // For other endpoints, proxy to Worker
    const workerUrl = `https://procoursing-stats.antajltube.workers.dev${path}${search}`;
    const proxyRequest = new Request(workerUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const response = await fetch(proxyRequest);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }
    
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
