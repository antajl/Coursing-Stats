import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { edgeCache } from './lib/edge-cache';
import { handleCompetitions } from './routes/events';
import { handleDogs } from './routes/dogs';
import { handleTop } from './routes/top';
import { handleAdmin } from './routes/admin';
import { handleSpeed } from './routes/speed';
import { handleJudges } from './routes/judges';
import { handleSitemap } from './routes/sitemap';
import type { DataStoreEnv } from '../lib/local-data/types';

const app = new Hono<{ Bindings: DataStoreEnv }>();

// CORS middleware
app.use('*', cors());

// Edge cache для GET — на проде Cloudflare; локально no-op без caches API
app.use('*', edgeCache);

// UTF-8 для JSON API (не трогаем sitemap.xml и прочие не-JSON ответы)
app.use('*', async (c, next) => {
  await next();
  if (c.req.path.startsWith('/api/') && !c.res.headers.get('Content-Type')) {
    c.header('Content-Type', 'application/json; charset=utf-8');
  }
});

// Register all Hono routes
handleSpeed(app);
handleCompetitions(app);
handleDogs(app);
handleTop(app);
handleJudges(app);
handleAdmin(app);
handleSitemap(app);

// SPA fallback (не перехватывать несуществующие API-маршруты)
app.all('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }
  return c.text('SPA served from Cloudflare Pages');
});

export default app;
