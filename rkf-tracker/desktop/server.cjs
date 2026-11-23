const http = require('http');
let config = {};
try {
  config = require('./config.json');
} catch (e) {
  try {
    config = require('./config.example.json');
  } catch (_) {}
}
const { runUpdate, setReceivedStatus } = require('./update.cjs');

const PORT = config.port || 4199;
let lastUpdateTime = 0;
let cachedResult = null;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/refresh' || (req.url === '/api/status' && req.method === 'GET')) {
    const now = Date.now();
    // Cache for 60 seconds to prevent spamming RKF
    if (cachedResult && (now - lastUpdateTime < 60000) && req.url !== '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, count: cachedResult.sortedApps.length, cached: true }));
      return;
    }

    try {
      const result = await runUpdate();
      lastUpdateTime = Date.now();
      cachedResult = result;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, count: result.sortedApps.length }));
    } catch (err) {
      const isAuth = err.message && err.message.includes('AUTH_EXPIRED');
      const statusCode = isAuth ? 401 : 502;
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: false,
        error: err.message,
        isAuthError: isAuth
      }));
    }
    return;
  }

  if (req.url === '/api/toggle-received' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { barcode, isReceived } = JSON.parse(body || '{}');
        if (barcode) {
          setReceivedStatus(barcode, !!isReceived);
          cachedResult = await runUpdate();
          lastUpdateTime = Date.now();
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`RKF Tracker Local Server запущен на http://127.0.0.1:${PORT}`);
});
