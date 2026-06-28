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

// Register all Hono routes
handleSpeed(app);
handleCompetitions(app);
handleDogs(app);
handleTop(app);
handleJudges(app);
handleAdmin(app);

// SPA fallback
app.get('*', async (c) => {
  return c.text('SPA served from Cloudflare Pages');
});

export default app;
