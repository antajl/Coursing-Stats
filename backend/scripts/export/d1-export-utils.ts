import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export type Row = Record<string, unknown>;

export const MONTH_NAMES = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

export function parseExportArgs() {
  const args = process.argv.slice(2);
  return {
    local: args.includes('--local'),
    remote: !args.includes('--local'),
    fetchDonino: args.includes('--fetch-donino'),
    yearFilter: (() => {
      const i = args.indexOf('--year');
      return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null;
    })(),
  };
}

export function queryD1(sql: string, local: boolean): Row[] {
  const scope = local ? '--local' : '--remote';
  const escaped = sql.replace(/"/g, '\\"');
  const out = execSync(
    `npx wrangler d1 execute pc-db ${scope} --command="${escaped}" --json`,
    { cwd: ROOT, encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out) as Array<{ results?: Row[] }>;
  return parsed[0]?.results ?? [];
}

export function tryParseJson(value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim()) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function enrichEvent(event: Row): Row {
  const copy = { ...event };
  if (typeof copy.track_schemes === 'string') {
    copy.track_schemes = tryParseJson(copy.track_schemes);
  }
  if (typeof copy.judges === 'string' && copy.judges.trim().startsWith('[')) {
    copy.judges = tryParseJson(copy.judges);
  }
  return copy;
}

export function enrichResult(result: Row): Row {
  const copy = { ...result };
  if (typeof copy.raw_scores_json === 'string') {
    copy.raw_scores_json = tryParseJson(copy.raw_scores_json);
  }
  return copy;
}

export function slugify(text: string, maxLen = 48): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
  return base || 'item';
}

export function dogKey(nameLat: string, breed: string): string {
  const name = slugify(String(nameLat || 'unknown'), 40);
  const br = slugify(String(breed || 'unknown'), 24);
  return `${name}--${br}`;
}

export function monthFolder(dateStart: string | null | undefined): string {
  if (!dateStart || dateStart.length < 7) return '00-без-даты';
  const month = Number(dateStart.slice(5, 7));
  if (month < 1 || month > 12) return '00-без-даты';
  return `${String(month).padStart(2, '0')}-${MONTH_NAMES[month - 1]}`;
}

export function competitionRelPath(event: Row, eventId: number): string {
  const year = String(event.year ?? String(event.date_start ?? '').slice(0, 4));
  const month = monthFolder(String(event.date_start ?? ''));
  const titleBit = slugify(
    String(event.rank_label || event.title || event.full_title || 'sorevnovanie'),
  );
  return `competitions/${year}/${month}/${eventId}-${titleBit}.json`;
}

export function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function groupBy<T extends Row>(rows: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = String(row[key] ?? 'unknown');
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(row);
  }
  return map;
}
