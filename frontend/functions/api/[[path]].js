export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '/api');
  const search = url.search;
  
  // Proxy to Worker API
  const workerUrl = `https://procoursing-stats.antajltube.workers.dev${path}${search}`;
  
  const proxyRequest = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  try {
    const response = await fetch(proxyRequest);
    
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
    };
    
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }
    
    // Return proxied response with CORS headers
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
