// Local Dev Server for my.coursing-stats.ru (rkf-tracker/web)
// Zero external dependencies — runs on standard Node.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 4200;
const WEB_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Local CORS proxy for RKF Online API
  if (pathname.startsWith('/api/rkf/')) {
    const targetPath = pathname.replace(/^\/api\/rkf/, '/api') + parsedUrl.search;
    const authHeader = req.headers['authorization'] || '';

    const proxyReq = https.request({
      hostname: 'rkf.online',
      port: 443,
      path: targetPath,
      method: req.method,
      headers: {
        'authorization': authHeader,
        'accept': 'application/json',
        'content-type': req.headers['content-type'] || 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStats-Tracker/1.0'
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static files
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(WEB_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[my.coursing-stats.ru] Local test server running at http://localhost:${PORT}`);
  console.log(`[my.coursing-stats.ru] Web directory: ${WEB_DIR}`);
});
