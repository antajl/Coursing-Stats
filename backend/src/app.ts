import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleCompetitions } from './routes/events';
import { handleDogs } from './routes/dogs';
import { handleTop } from './routes/top';
import { handleAdmin } from './routes/admin';
import { handleSpeed } from './routes/speed';
import { handleJudges } from './routes/judges';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// Set UTF-8 encoding for all JSON responses
app.use('*', async (c, next) => {
  await next();
  c.header('Content-Type', 'application/json; charset=utf-8');
});

// Register all Hono routes
handleSpeed(app);
handleCompetitions(app);
handleDogs(app);
handleTop(app);
handleJudges(app);
handleAdmin(app);

// SPA fallback (не перехватывать несуществующие API-маршруты)
app.all('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }
  return c.text('SPA served from Cloudflare Pages');
});

export default app;
