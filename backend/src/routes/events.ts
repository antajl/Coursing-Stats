import { Hono } from 'hono';
import { tryStaticCompetition, tryStaticManifestStats } from '../lib/static-api';

type Env = {
  ADMIN_API_TOKEN: string;
};

export function handleCompetitions(app: Hono<{ Bindings: Env }>) {
  // GET /api/competitions/:id
  app.get('/api/competitions/:id', async (c) => {
    const eventId = c.req.param('id');
    const staticComp = await tryStaticCompetition(eventId);
    
    if (!staticComp) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }
    
    return c.json({ success: true, data: staticComp.event });
  });

  // GET /api/competitions/:id/results
  app.get('/api/competitions/:id/results', async (c) => {
    const eventId = c.req.param('id');
    const staticComp = await tryStaticCompetition(eventId);
    
    if (!staticComp) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }
    
    return c.json({ success: true, data: staticComp.results });
  });

  // GET /api/stats
  app.get('/api/stats', async (c) => {
    const staticStats = await tryStaticManifestStats();
    
    if (!staticStats) {
      return c.json({ success: false, error: 'Stats not found' }, 404);
    }
    
    return c.json({ success: true, data: staticStats });
  });
}
