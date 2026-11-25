// Live RKF Competition Calendar Sync (info.rkf.online -> KV_STORAGE)
import * as XLSX from 'xlsx';
import competitions2026 from '../data/competitions-2026.json';
import type { CompetitionEvent } from './competition-tracker.js';

const DEFAULT_ARTICLE_URL = 'https://info.rkf.online/article/fb2b53ca-bdf2-5e35-bea2-2e973592e2d7';
const CALENDAR_KV_KEY = 'calendar:2026:v1';

interface StoredCalendarSnapshot {
  events: CompetitionEvent[];
  updatedAt: string;
  count: number;
}

const HEADER_MAP: Record<string, string[]> = {
  startDate: ['дата начала', 'дата', 'период', 'сроки', 'date'],
  endDate: ['дата окончания', 'по'],
  rank: ['ранг', 'статус состязания', 'ранг мероприятия'],
  discipline: ['дисциплина', 'вид состязаний', 'вид спорта', 'вид'],
  location: ['место проведения', 'город', 'место', 'субъект', 'регион'],
  club: ['организация', 'организатор', 'клуб', 'федерация', 'наименование клуба'],
  reglament: ['регламент', 'согласован'],
  summary: ['сводка', 'статус', 'входящий', 'вх.№', 'вх.'],
  decision: ['решения комиссии', 'решение'],
  notes: ['примечания', 'примечание'],
  judges: ['руководитель', 'судья', 'судьи', 'эксперт'],
};

function extractFirstAttachmentUrl(html: string): string | null {
  const match = html.match(/\/attachment\/[a-zA-Z0-9_-]+/);
  return match ? `https://info.rkf.online${match[0]}` : null;
}

function formatExcelDate(val: unknown): string {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (typeof val === 'number' || (!Number.isNaN(num) && num > 40000 && num < 60000)) {
    const parsed = XLSX.SSF.parse_date_code(num);
    if (parsed) {
      const d = String(parsed.d).padStart(2, '0');
      const m = String(parsed.m).padStart(2, '0');
      return `${d}.${m}.${parsed.y}`;
    }
  }
  return String(val).trim();
}

function buildDisplayDate(startVal: unknown, endVal: unknown): string {
  const s = formatExcelDate(startVal);
  const e = formatExcelDate(endVal);
  if (!s && !e) return '';
  if (!e || s === e) return s;
  const sParts = s.split('.');
  const eParts = e.split('.');
  if (sParts.length === 3 && eParts.length === 3 && sParts[1] === eParts[1] && sParts[2] === eParts[2]) {
    return `${sParts[0]}-${eParts[0]}.${sParts[1]}.${sParts[2]}`;
  }
  return `${s} — ${e}`;
}

function resolveApprovalStatus(reglament = '', summary = '', decision = ''): string {
  const text = `${reglament} ${summary} ${decision}`.toLowerCase();
  if (text.includes('отклон') || text.includes('отказ')) return 'REJECTED';
  if (text.includes('отмен')) return 'CANCELLED';
  if (text.includes('задержан')) return 'DELAYED';
  if (text.includes('утвержден') || text.includes('в графике') || text.includes('согласован')) {
    return 'APPROVED';
  }
  return 'PENDING';
}

function generateEventId(date: string, discipline: string, club: string, location: string): string {
  const seed = `${date}|${discipline}|${club}|${location}`.toLowerCase().replace(/\s+/g, '_');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return 'ev_' + Math.abs(hash).toString(36);
}

function matchHeaderColumns(row: unknown[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (let c = 0; c < row.length; c++) {
    const cell = String(row[c] || '').toLowerCase().trim();
    if (!cell) continue;
    for (const [key, synonyms] of Object.entries(HEADER_MAP)) {
      if (result[key] === undefined && synonyms.some((s) => cell.includes(s))) {
        result[key] = c;
      }
    }
  }
  return result;
}

export function parseRkfCalendarBuffer(data: ArrayBuffer): CompetitionEvent[] {
  const workbook = XLSX.read(data, { type: 'array' });
  const allEvents: CompetitionEvent[] = [];
  const allowedDisciplines = ['курсинг', 'бега'];
  const nowIso = new Date().toISOString();

  for (const sheetName of workbook.SheetNames) {
    const lowerName = sheetName.toLowerCase();
    if (!allowedDisciplines.some((d) => lowerName.includes(d))) continue;

    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
    if (!rows || rows.length < 2) continue;

    let headerIndex = -1;
    let colIndices: Record<string, number> | null = null;
    for (let r = 0; r < Math.min(rows.length, 6); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      const mapping = matchHeaderColumns(row);
      if (mapping.startDate !== undefined || mapping.club !== undefined) {
        headerIndex = r;
        colIndices = mapping;
        break;
      }
    }
    if (headerIndex === -1 || !colIndices) continue;

    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const dateFormatted = buildDisplayDate(row[colIndices.startDate], colIndices.endDate !== undefined ? row[colIndices.endDate] : '');
      const rawClub = String(row[colIndices.club] || '').trim();
      const rawLocation = String(row[colIndices.location] || '').trim();
      if (!dateFormatted && !rawClub && !rawLocation) continue;

      const rawRank = colIndices.rank !== undefined ? String(row[colIndices.rank] || '').trim() : '';
      const rawDiscipline =
        colIndices.discipline !== undefined && row[colIndices.discipline]
          ? String(row[colIndices.discipline]).trim()
          : sheetName;
      const rawReglament = colIndices.reglament !== undefined ? String(row[colIndices.reglament] || '').trim() : '';
      const rawSummary = colIndices.summary !== undefined ? String(row[colIndices.summary] || '').trim() : '';
      const rawDecision = colIndices.decision !== undefined ? String(row[colIndices.decision] || '').trim() : '';
      const rawJudges = colIndices.judges !== undefined ? String(row[colIndices.judges] || '').trim() : '';
      const rawNotes = colIndices.notes !== undefined ? String(row[colIndices.notes] || '').trim() : '';

      allEvents.push({
        id: generateEventId(dateFormatted, rawDiscipline, rawClub, rawLocation),
        sheetName,
        dateRaw: dateFormatted,
        discipline: rawDiscipline,
        rank: rawRank,
        location: rawLocation,
        club: rawClub,
        status: resolveApprovalStatus(rawReglament, rawSummary, rawDecision),
        reglament: rawReglament,
        summary: rawSummary,
        decision: rawDecision,
        judges: rawJudges,
        notes: rawNotes,
        updatedAt: nowIso,
      });
    }
  }

  return allEvents;
}

export async function syncRkfCalendar(kv?: KVNamespace): Promise<StoredCalendarSnapshot> {
  const pageRes = await fetch(DEFAULT_ARTICLE_URL, {
    headers: { 'User-Agent': 'CoursingStats-Tracker/1.0' },
  });
  if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}: Failed to load RKF calendar article`);

  const html = await pageRes.text();
  const attachmentUrl = extractFirstAttachmentUrl(html);
  if (!attachmentUrl) throw new Error('RKF calendar attachment URL not found');

  const fileRes = await fetch(attachmentUrl, {
    headers: { 'User-Agent': 'CoursingStats-Tracker/1.0' },
  });
  if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}: Failed to download RKF calendar`);

  const buffer = await fileRes.arrayBuffer();
  const events = parseRkfCalendarBuffer(buffer);
  if (events.length === 0) throw new Error('Parsed 0 events from RKF calendar');

  const snapshot: StoredCalendarSnapshot = {
    events,
    updatedAt: new Date().toISOString(),
    count: events.length,
  };

  if (kv) {
    await kv.put(CALENDAR_KV_KEY, JSON.stringify(snapshot));
  }
  return snapshot;
}

export async function getLiveCompetitions(kv?: KVNamespace): Promise<{
  events: CompetitionEvent[];
  updatedAt: string | null;
  source: 'kv' | 'static';
}> {
  if (kv) {
    try {
      const raw = await kv.get(CALENDAR_KV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCalendarSnapshot;
        if (Array.isArray(parsed?.events) && parsed.events.length > 0) {
          return {
            events: parsed.events,
            updatedAt: parsed.updatedAt || null,
            source: 'kv',
          };
        }
      }
    } catch {
      // Fallback to static snapshot
    }
  }
  const staticEvents = competitions2026 as CompetitionEvent[];
  return {
    events: staticEvents,
    updatedAt: staticEvents[0]?.updatedAt || null,
    source: 'static',
  };
}
