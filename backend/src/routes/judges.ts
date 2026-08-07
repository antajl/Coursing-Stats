import { Hono } from 'hono';
import { tryStaticJudgesSummary, tryStaticJudgeDetails } from '../lib/static-api';

type Env = {
  ADMIN_API_TOKEN: string;
};

export function handleJudges(app: Hono<{ Bindings: Env }>) {
  // GET /api/judges
  app.get('/api/judges', async (c) => {
    const staticSummary = await tryStaticJudgesSummary();
    
    if (!staticSummary) {
      return c.json({ success: false, error: 'Judges summary not found' }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        judges: staticSummary.judges,
        availableBreeds: staticSummary.availableBreeds,
      },
    });
  });

  // GET /api/judges/:id/details
  app.get('/api/judges/:id/details', async (c) => {
    const judgeName = decodeURIComponent(c.req.param('id'));
    const staticDetail = await tryStaticJudgeDetails(judgeName);
    
    if (!staticDetail) {
      return c.json({ success: false, error: 'Judge details not found' }, 404);
    }
    
    return c.json({ success: true, data: staticDetail });
  });
}
