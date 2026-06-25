export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;
  
  // Check if D1 binding is available
  if (!env.pc_db) {
    return new Response(JSON.stringify({ error: 'D1 database not available' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
  
  const db = env.pc_db;
  
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
      const breeds = results.map(r => r.breed);
      return new Response(JSON.stringify(breeds), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    if (path === '/api/years') {
      const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
      const years = results.map(r => r.year);
      return new Response(JSON.stringify(years), {
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
