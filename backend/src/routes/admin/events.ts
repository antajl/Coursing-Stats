import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { allocateNextEventId } from '../../../lib/local-data/allocate-next-event-id';
import { ensureEventDogs } from '../../../lib/local-data/ensure-event-dogs';
import { findEventFile } from '../../../lib/local-data/find-event-file';
import { DATA_V1_ROOT, dataV1Path } from '../../../lib/local-data/paths';
import { competitionRelPath } from '../../../scripts/export/d1-export-utils';
import { invalidateDogsIndexCache } from './dogs';

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
  const competitionsRoot = dataV1Path('competitions');
  const years = await fs.readdir(competitionsRoot);
  const events: any[] = [];
  
  for (const year of years) {
    const yearPath = path.join(competitionsRoot, year);
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
        : events;
      
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
        judges: e.judges,
        admin_verified_at: e.admin_verified_at ?? null,
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

  // GET /api/admin/events/:id - Get single event for admin
  app.get('/api/admin/events/:id', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const eventFile = await findEventFile(eventId);

      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { data } = eventFile;
      return c.json({ success: true, data });
    } catch (err: any) {
      console.error('Error fetching event:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/events — create a new empty competition document
  app.post('/api/admin/events', async (c) => {
    const env = c.env;
    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
      const dateStart = String(body.date_start || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart)) {
        return c.json({ success: false, error: 'date_start required (YYYY-MM-DD)' }, 400);
      }

      const eventTypeRaw = String(body.event_type || 'coursing').toLowerCase();
      const eventType =
        eventTypeRaw === 'racing' || eventTypeRaw === 'bzmp' || eventTypeRaw === 'coursing'
          ? eventTypeRaw
          : 'coursing';

      const title = String(body.title || '').trim() || null;
      const rankLabel = String(body.rank_label || '').trim() || title || 'Новое событие';
      const location = String(body.location || '').trim() || null;
      const hostClub = String(body.host_club || '').trim() || null;
      const year = Number(String(dateStart).slice(0, 4));

      const eventId = await allocateNextEventId();
      const existing = await findEventFile(eventId);
      if (existing) {
        return c.json({ success: false, error: `Event id ${eventId} already exists` }, 409);
      }

      const event = {
        id: eventId,
        year,
        date_start: dateStart,
        date_end: body.date_end ? String(body.date_end) : null,
        rank_label: rankLabel,
        event_type: eventType,
        competition_kind: String(body.competition_kind || '').trim() || null,
        competition_type: String(body.competition_type || '').trim() || null,
        title,
        host_club: hostClub,
        region: null,
        location,
        catalog_url: String(body.catalog_url || '').trim() || null,
        results_url: String(body.results_url || '').trim() || null,
        confirmed: 0,
        last_modified: null,
        scraped_at: null,
        telegram_url: null,
        full_title: null,
        event_date: dateStart,
        protocol_location: null,
        judges: String(body.judges || '').trim() || null,
        track_schemes: [],
        admin_verified_at: null,
      };

      const rel = competitionRelPath(event as any, eventId);
      const filePath = path.join(DATA_V1_ROOT, ...rel.split('/'));
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      const exportedAt = new Date().toISOString();
      const data = {
        schema: 'coursing-stats/competition-v1',
        exported_at: exportedAt,
        source: 'admin-create',
        event_id: eventId,
        event,
        result_count: 0,
        results: [],
      };

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({ success: true, message: 'Event created', data, id: eventId }, 201);
    } catch (err: any) {
      console.error('Error creating event:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT /api/admin/events/:id/document — full event+results save + ensure dogs
  app.put('/api/admin/events/:id/document', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      if (!body || typeof body !== 'object') {
        return c.json({ success: false, error: 'Body required' }, 400);
      }
      if (!body.event || typeof body.event !== 'object') {
        return c.json({ success: false, error: 'event object required' }, 400);
      }
      if (!Array.isArray(body.results)) {
        return c.json({ success: false, error: 'results array required' }, 400);
      }

      const eventFile = await findEventFile(eventId);
      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { filePath, data } = eventFile;
      const prevEvent = (data.event || {}) as Record<string, unknown>;
      const nextEvent = { ...body.event, id: eventId };
      // Preserve identity fields the UI may not send
      if (nextEvent.year == null) nextEvent.year = prevEvent.year;
      if (nextEvent.event_type == null) nextEvent.event_type = prevEvent.event_type;

      const exportedAt = new Date().toISOString();
      const competitionRelPath = path
        .relative(DATA_V1_ROOT, filePath)
        .split(path.sep)
        .join('/');

      // Assign positive result ids for new/negative rows
      let maxResultId = 0;
      for (const r of body.results as any[]) {
        const id = Number(r?.id);
        if (Number.isFinite(id) && id > maxResultId) maxResultId = id;
      }
      // Also consider ids already in file in case client dropped some
      for (const r of (data.results as any[]) || []) {
        const id = Number(r?.id);
        if (Number.isFinite(id) && id > maxResultId) maxResultId = id;
      }
      const normalizedResults = (body.results as any[]).map((r) => {
        const id = Number(r?.id);
        if (!Number.isFinite(id) || id <= 0) {
          maxResultId += 1;
          return { ...r, id: maxResultId, event_id: eventId };
        }
        return { ...r, event_id: eventId };
      });

      const ensured = await ensureEventDogs({
        dogsByIdDir: dataV1Path('dogs', 'by-id'),
        dogsByKeyDir: dataV1Path('dogs', 'by-key'),
        eventId,
        competitionRelPath,
        results: normalizedResults,
        exportedAt,
      });

      if (ensured.createdDogs.length > 0) {
        invalidateDogsIndexCache();
      }

      data.event = nextEvent;
      data.results = ensured.results;
      data.result_count = ensured.results.length;
      data.exported_at = exportedAt;
      data.event_id = eventId;

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({
        success: true,
        message: 'Document saved',
        data,
        createdDogs: ensured.createdDogs,
        linkedExisting: ensured.linkedExisting,
      });
    } catch (err: any) {
      console.error('Error saving event document:', err);
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
      'catalog_url',
      'admin_verified_at',
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
