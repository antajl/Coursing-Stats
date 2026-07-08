import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const COMPETITIONS_ROOT = path.join(ROOT, 'data/v1/competitions');

type Env = {
  ADMIN_API_TOKEN: string;
};

function checkAdminToken(c: any, env: Env) {
  const authHeader = c.req.header('X-Admin-Token');
  const adminToken = env.ADMIN_API_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_API_TOKEN not set in environment variables, allowing access for local dev');
    return true;
  }

  return authHeader === adminToken;
}

async function getCompetitionFiles() {
  const years = await fs.readdir(COMPETITIONS_ROOT);
  const events: any[] = [];
  
  for (const year of years) {
    const yearPath = path.join(COMPETITIONS_ROOT, year);
    const stat = await fs.stat(yearPath);
    if (!stat.isDirectory()) continue;
    
    try {
      const months = await fs.readdir(yearPath);
      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);
        if (!monthStat.isDirectory()) continue;
        
        const files = await fs.readdir(monthPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const filePath = path.join(monthPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          events.push(data.event);
        }
      }
    } catch (e) {
      // Skip if can't read
    }
  }
  
  return events;
}

async function findEventFile(eventId: number): Promise<{ filePath: string; data: any } | null> {
  const years = await fs.readdir(COMPETITIONS_ROOT);
  
  for (const year of years) {
    const yearPath = path.join(COMPETITIONS_ROOT, year);
    const stat = await fs.stat(yearPath);
    if (!stat.isDirectory()) continue;
    
    try {
      const months = await fs.readdir(yearPath);
      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);
        if (!monthStat.isDirectory()) continue;
        
        const files = await fs.readdir(monthPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          if (!file.startsWith(`${eventId}-`)) continue;
          
          const filePath = path.join(monthPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          return { filePath, data };
        }
      }
    } catch (e) {
      // Skip if can't read
    }
  }
  
  return null;
}

export function handleAdminEvents(app: Hono<{ Bindings: Env }>) {
  // GET /api/admin/events - Get all events for admin
  app.get('/api/admin/events', async (c) => {
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const year = c.req.query('year');
      const events = await getCompetitionFiles();
      
      const filtered = year 
        ? events.filter((e: any) => String(e.year) === year)
        : events.filter((e: any) => e.year < 2026);
      
      const mapped = filtered.map((e: any) => ({
        id: e.id,
        year: e.year,
        date_start: e.date_start,
        date_end: e.date_end,
        rank_label: e.rank_label,
        event_type: e.event_type,
        competition_kind: e.competition_kind,
        competition_type: e.competition_type,
        title: e.title,
        host_club: e.host_club,
        region: e.region,
        location: e.location,
        catalog_url: e.catalog_url,
        results_url: e.results_url,
        confirmed: e.confirmed,
        judges: e.judges
      }));
      
      mapped.sort((a: any, b: any) => {
        const aDate = a.date_start || '';
        const bDate = b.date_start || '';
        return aDate.localeCompare(bDate);
      });
      
      return c.json({ success: true, data: mapped });
    } catch (err: any) {
      console.error('Error fetching events:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT /api/admin/events/:id - Update event (только переданные поля)
  app.put('/api/admin/events/:id', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const EDITABLE_EVENT_FIELDS = [
      'date_start',
      'date_end',
      'rank_label',
      'location',
      'host_club',
      'title',
      'full_title',
      'protocol_location',
      'event_date',
      'judges',
      'results_url',
    ] as const;

    try {
      const body = await c.req.json();
      const eventFile = await findEventFile(eventId);

      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { filePath, data } = eventFile;
      
      // Update event fields
      for (const field of EDITABLE_EVENT_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          const val = body[field];
          data.event[field] = val === '' || val === undefined ? null : val;
        }
      }
      
      // Update exported_at timestamp
      data.exported_at = new Date().toISOString();

      // Write back to file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({ success: true, message: 'Event updated' });
    } catch (err: any) {
      console.error('Error updating event:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
