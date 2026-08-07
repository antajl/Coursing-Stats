import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { fetchArchiveWin1251 } from '../../../lib/fetch-archive-win1251';
import { fetchWin1251 } from '../../../lib/fetch-win1251';
import { parseCoursingHTML } from '../../../parsers/coursing/index';
import { parseBzmpHTML } from '../../../parsers/bzmp/index';
import { parseRacingHTML } from '../../../parsers/racing/index';
import { extractDogNames, normalizeDogName, normalizeBreed } from '../../../parsers/coursing/utils';
import { findEventFile } from '../../../lib/local-data/find-event-file';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const DOGS_INDEX_PATH = path.join(ROOT, 'data/v1/indexes/dogs-index.json');
const WAREHOUSE_EVENTS_ROOT = path.join(ROOT, 'data/source/procoursing/events');

let dogsIndexCache: Map<number, { name_lat: string; name_ru: string; breed: string }> | null = null;

async function loadDogsIndex(): Promise<Map<number, { name_lat: string; name_ru: string; breed: string }>> {
  if (dogsIndexCache) return dogsIndexCache;

  try {
    const content = await fs.readFile(DOGS_INDEX_PATH, 'utf-8');
    const dogs = JSON.parse(content);
    dogsIndexCache = new Map(
      dogs.map((d: any) => [d.id, { name_lat: d.name_lat, name_ru: d.name_ru, breed: d.breed }])
    );
    return dogsIndexCache;
  } catch (err) {
    console.error('Error loading dogs index:', err);
    return new Map();
  }
}

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

function warehouseEventDir(eventId: number): string {
  return path.join(WAREHOUSE_EVENTS_ROOT, String(eventId));
}

function warehouseHtmlPath(eventId: number): string {
  return path.join(warehouseEventDir(eventId), 'source', 'results.html');
}

function warehouseMetaPath(eventId: number): string {
  return path.join(warehouseEventDir(eventId), 'meta.json');
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readWarehouseMeta(eventId: number): Promise<any | null> {
  const metaPath = warehouseMetaPath(eventId);
  if (!(await fileExists(metaPath))) return null;
  const content = await fs.readFile(metaPath, 'utf-8');
  return JSON.parse(content);
}

async function writeWarehouseMeta(eventId: number, patch: Record<string, unknown>) {
  const dir = warehouseEventDir(eventId);
  await fs.mkdir(dir, { recursive: true });
  const metaPath = warehouseMetaPath(eventId);
  const now = new Date().toISOString();
  const existing = (await readWarehouseMeta(eventId)) ?? {};
  const merged = {
    ...existing,
    ...patch,
    event_id: eventId,
    added_at: (existing as any).added_at ?? now,
    updated_at: now,
  };
  await fs.writeFile(metaPath, JSON.stringify(merged, null, 2), 'utf-8');
}

async function saveWarehouseHtml(eventId: number, html: string, note?: string | null) {
  const htmlPath = warehouseHtmlPath(eventId);
  await fs.mkdir(path.dirname(htmlPath), { recursive: true });
  await fs.writeFile(htmlPath, html, 'utf-8');
  await writeWarehouseMeta(eventId, {
    source_note: note ?? null,
    files: { html: 'source/results.html' },
  });
}

async function parseByEventType(eventType: string | null | undefined, htmlContent: string) {
  if (eventType === 'bzmp') return await parseBzmpHTML(htmlContent);
  if (eventType === 'racing') return await parseRacingHTML(htmlContent);
  // default to coursing
  return await parseCoursingHTML(htmlContent);
}

function stringifyRawScores(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function extractNamesFromRawText(rawText: string | null | undefined): { name_lat: string; name_ru: string; breed: string } | null {
  if (!rawText) return null;
  try {
    const $ = cheerio.load(`<table><tr>${rawText}</tr></table>`);
    const $cells = $('tr').first().find('td');
    const nameCell = $cells.eq(5);
    const breedCell = $cells.eq(2);
    const names = extractDogNames(nameCell);
    const breed = normalizeBreed(breedCell.text());
    return {
      name_lat: names.name_lat || names.name_ru || '',
      name_ru: names.name_ru || names.name_lat || '',
      breed: breed || '',
    };
  } catch {
    return null;
  }
}

function findResultById(data: any, resultId: number): any {
  if (!data.results) return null;
  return data.results.find((r: any) => r.id === resultId);
}

function generateNextResultId(data: any): number {
  if (!data.results || data.results.length === 0) return 1;
  const maxId = Math.max(...data.results.map((r: any) => r.id || 0));
  return maxId + 1;
}

export function handleAdminResults(app: Hono<{ Bindings: Env }>) {
  // GET /api/admin/source/procoursing/:id - Check warehouse availability for event_id
  app.get('/api/admin/source/procoursing/:id', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const htmlPath = warehouseHtmlPath(eventId);
    const hasHtml = await fileExists(htmlPath);
    const meta = await readWarehouseMeta(eventId);

    return c.json({
      success: true,
      data: {
        event_id: eventId,
        has_html: hasHtml,
        html_path: hasHtml ? path.relative(ROOT, htmlPath).replace(/\\/g, '/') : null,
        meta: meta ?? null,
      },
    });
  });

  // POST /api/admin/source/procoursing/:id/html - Save HTML into warehouse
  app.post('/api/admin/source/procoursing/:id/html', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const html = body?.html;
      const note = body?.note ?? null;
      if (!html || typeof html !== 'string') {
        return c.json({ success: false, error: 'html string required' }, 400);
      }

      await saveWarehouseHtml(eventId, html, note);
      return c.json({ success: true, message: 'Saved', event_id: eventId });
    } catch (err: any) {
      console.error('Error saving procoursing source:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/delete-results/:id
  app.post('/api/admin/delete-results/:id', async (c) => {
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

      const { filePath, data } = eventFile;
      data.results = [];
      data.result_count = 0;
      data.exported_at = new Date().toISOString();

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({
        success: true,
        message: 'Results deleted',
        eventId
      });
    } catch (err: any) {
      console.error('Error deleting results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/import-results
  app.post('/api/admin/import-results', async (c) => {
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const { results, events } = body;

      if (!Array.isArray(results)) {
        return c.json({ success: false, error: 'Invalid data format' }, 400);
      }

      // Update events with judges and track_schemes
      let eventsUpdated = 0;
      if (Array.isArray(events) && events.length > 0) {
        for (const eventUpdate of events) {
          try {
            const eventFile = await findEventFile(eventUpdate.event_id);
            if (eventFile) {
              eventFile.data.event.judges = eventUpdate.judges;
              eventFile.data.event.track_schemes = eventUpdate.track_schemes;
              eventFile.data.exported_at = new Date().toISOString();
              await fs.writeFile(eventFile.filePath, JSON.stringify(eventFile.data, null, 2), 'utf-8');
              eventsUpdated++;
            }
          } catch (err) {
            console.error('Error updating event:', eventUpdate, err);
          }
        }
      }

      // Group results by event_id
      const resultsByEvent = new Map<number, any[]>();
      for (const result of results) {
        const eventId = result.event_id;
        if (!resultsByEvent.has(eventId)) {
          resultsByEvent.set(eventId, []);
        }
        resultsByEvent.get(eventId)!.push(result);
      }

      // Import results for each event
      let resultsInserted = 0;
      for (const [eventId, eventResults] of resultsByEvent) {
        const eventFile = await findEventFile(eventId);
        if (!eventFile) {
          console.error('Event not found:', eventId);
          continue;
        }

        const { filePath, data } = eventFile;
        
        for (const result of eventResults) {
          const newResult = {
            ...result,
            id: generateNextResultId(data),
            dog: result.dog || null
          };
          data.results.push(newResult);
          resultsInserted++;
        }
        
        data.result_count = data.results.length;
        data.exported_at = new Date().toISOString();
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      }

      return c.json({
        success: true,
        message: 'Import completed',
        stats: {
          resultsInserted,
          eventsUpdated,
          totalResults: results.length,
          totalEvents: events ? events.length : 0
        }
      });
    } catch (err: any) {
      console.error('Error importing results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // GET /api/admin/events/:id/results - Get results for an event
  app.get('/api/admin/events/:id/results', async (c) => {
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

      const dogsIndex = await loadDogsIndex();
      const { data } = eventFile;
      const results = (data.results || []).map((r: any) => {
        const dogData = r.dog_id ? dogsIndex.get(r.dog_id) : null;
        const rawNames = extractNamesFromRawText(r.raw_text);
        return {
          id: r.id,
          event_id: r.event_id,
          dog_id: r.dog_id,
          breed_class: r.breed_class,
          catalog_no: r.catalog_no,
          placement: r.placement,
          total_score: r.total_score,
          qualification: r.qualification,
          vc: r.vc,
          status: r.status,
          raw_scores_json: stringifyRawScores(r.raw_scores_json),
          status_reason: r.status_reason,
          judges: r.judges,
          name_lat: rawNames?.name_lat || dogData?.name_lat || r.dog?.name_lat || normalizeDogName(r.name_lat || '') || '',
          name_ru: rawNames?.name_ru || dogData?.name_ru || r.dog?.name_ru || normalizeDogName(r.name_ru || '') || '',
          breed: rawNames?.breed || dogData?.breed || r.dog?.breed || normalizeBreed(r.breed || '') || ''
        };
      });

      results.sort((a: any, b: any) => {
        const aPlacement = a.placement === null ? 999 : a.placement;
        const bPlacement = b.placement === null ? 999 : b.placement;
        return aPlacement - bPlacement;
      });

      return c.json({ success: true, data: results });
    } catch (err: any) {
      console.error('Error fetching results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT /api/admin/results/:id - Update result
  app.put('/api/admin/results/:id', async (c) => {
    const env = c.env;
    const resultId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const EDITABLE_RESULT_FIELDS = [
      'breed_class',
      'placement',
      'total_score',
      'qualification',
      'vc',
      'status',
      'status_reason',
      'raw_scores_json',
    ] as const;

    try {
      const body = await c.req.json();
      
      // Find the event file containing this result
      const eventId = body.event_id;
      if (!eventId) {
        return c.json({ success: false, error: 'event_id required' }, 400);
      }

      const eventFile = await findEventFile(eventId);
      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { filePath, data } = eventFile;
      const result = findResultById(data, resultId);

      if (!result) {
        return c.json({ success: false, error: 'Result not found' }, 404);
      }

      // Update result fields
      for (const field of EDITABLE_RESULT_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          const val = body[field];
          result[field] = val === '' || val === undefined ? null : val;
        }
      }

      data.exported_at = new Date().toISOString();
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({ success: true, message: 'Result updated' });
    } catch (err: any) {
      console.error('Error updating result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/results - Create new result
  app.post('/api/admin/results', async (c) => {
    const env = c.env;

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const { event_id, dog_id, breed_class, placement, total_score, qualification, vc, status, dog } = body;

      const eventFile = await findEventFile(event_id);
      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { filePath, data } = eventFile;
      const newId = generateNextResultId(data);

      const newResult = {
        id: newId,
        event_id,
        dog_id,
        breed_class,
        placement,
        total_score,
        qualification,
        vc,
        status,
        judge_count: 2,
        raw_scores_json: null,
        raw_text: '',
        judges: '',
        status_reason: null,
        dog: dog || null
      };

      data.results.push(newResult);
      data.result_count = data.results.length;
      data.exported_at = new Date().toISOString();

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      return c.json({
        success: true,
        message: 'Result created',
        id: newId,
      });
    } catch (err: any) {
      console.error('Error creating result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE /api/admin/results/:id - Delete result
  app.delete('/api/admin/results/:id', async (c) => {
    const env = c.env;
    const resultId = Number(c.req.param('id'));
    const eventId = Number(c.req.query('event_id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!eventId) {
      return c.json({ success: false, error: 'event_id query parameter required' }, 400);
    }

    try {
      const eventFile = await findEventFile(eventId);
      if (!eventFile) {
        return c.json({ success: false, error: 'Event not found' }, 404);
      }

      const { filePath, data } = eventFile;
      const resultIndex = data.results.findIndex((r: any) => r.id === resultId);

      if (resultIndex === -1) {
        return c.json({ success: false, error: 'Result not found' }, 404);
      }

      data.results.splice(resultIndex, 1);
      data.result_count = data.results.length;
      data.exported_at = new Date().toISOString();

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return c.json({ success: true, message: 'Result deleted' });
    } catch (err: any) {
      console.error('Error deleting result:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST /api/admin/verify-results/:id - Parse original results from URL or HTML for verification
  app.post('/api/admin/verify-results/:id', async (c) => {
    const env = c.env;
    const eventId = Number(c.req.param('id'));

    if (!checkAdminToken(c, env)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
      const body = await c.req.json();
      const { url, html, from_warehouse } = body;

      let htmlContent = html;

      const eventFile = await findEventFile(eventId);
      const eventType = eventFile?.data?.event?.event_type ?? null;

      // Load HTML from warehouse if requested (or if no URL/HTML provided)
      if ((from_warehouse || (!url && !htmlContent)) && !htmlContent) {
        const p = warehouseHtmlPath(eventId);
        if (!(await fileExists(p))) {
          return c.json({ success: false, error: 'No procoursing source in warehouse for this event_id' }, 404);
        }
        htmlContent = await fs.readFile(p, 'utf-8');
      }

      // Fetch HTML from URL if provided
      if (url && !htmlContent) {
        if (/procoursing\.ru/i.test(url) && !/web\.archive\.org/i.test(url)) {
          htmlContent = await fetchArchiveWin1251(url);
        } else {
          htmlContent = await fetchWin1251(url);
        }
        if (!htmlContent) {
          return c.json({ success: false, error: 'Failed to fetch original page' }, 500);
        }
      }

      if (!htmlContent) {
        return c.json({ success: false, error: 'URL or HTML content required' }, 400);
      }

      const parsed = await parseByEventType(eventType, htmlContent);
      
      // Map parsed results to match frontend Result interface
      const mappedResults = (parsed.results || []).map((r: any) => ({
        id: null, // Original results don't have IDs
        dog_id: null,
        catalog_no: r.catalog_no ?? null,
        name_lat: r.name_lat || '',
        name_ru: r.name_ru || '',
        breed: r.breed || '',
        breed_class: r.breed_class || '',
        placement: r.placement,
        total_score: r.total_score,
        qualification: r.qualification || '',
        vc: r.vc || '',
        status: r.status || '',
        raw_scores_json: r.raw_scores_json || null
      }));

      return c.json({
        success: true,
        data: mappedResults,
        meta: {
          telegram_url: parsed.telegram_url,
          full_title: parsed.full_title,
          event_date: parsed.event_date,
          protocol_location: parsed.protocol_location,
          judges: parsed.judges
        }
      });
    } catch (err: any) {
      console.error('Error verifying results:', err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
