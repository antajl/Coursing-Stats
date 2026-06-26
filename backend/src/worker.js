import { handleEvents } from './routes/events.js';
import { handleDogs } from './routes/dogs.js';
import { handleTop } from './routes/top.js';
import { handleAdmin } from './routes/admin.js';
import { handleSpeed } from './routes/speed.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin');

    console.log(`[${method}] ${path} - Origin: ${origin}`);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json; charset=utf-8',
    };

    // Handle OPTIONS requests for CORS preflight
    if (method === 'OPTIONS') {
      console.log('CORS preflight request');
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // API endpoints
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, url, corsHeaders);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

async function handleAPI(request, env, url, corsHeaders) {
  const db = env.DB;
  const path = url.pathname;

  console.log(`handleAPI: ${path}`);

  try {
    // Test endpoints
    if (path === '/api/test') {
      const { results } = await db.prepare('SELECT 1 as test').all();
      console.log('Test endpoint success');
      return Response.json({ test: results, db: !!db }, { headers: corsHeaders });
    }

    if (path === '/api/test-view') {
      const { results } = await db.prepare('SELECT * FROM v_top_by_placement LIMIT 5').all();
      return Response.json({ results, count: results.length }, { headers: corsHeaders });
    }

    // Try each route handler
    const handlers = [
      () => handleAdmin(path, request, env, db, corsHeaders),
      () => handleTop(path, url, db, corsHeaders),
      () => handleDogs(path, url, db, corsHeaders),
      () => handleEvents(path, url, db, corsHeaders),
      () => handleSpeed(path, url, db, corsHeaders),
    ];

    for (const handler of handlers) {
      const result = await handler();
      if (result) {
        console.log(`Handler returned response for ${path}`);
        return result;
      }
    }

    console.log(`No handler found for ${path}`);
    return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
