/**
 * Splits glued bilingual ("RU / LAT") and duplicated ("X / X") dog names in
 * data/v1/competitions/*.json and data/v1/dogs/by-id/*.json cleanly.
 * Run: npx tsx backend/scripts/ops/normalize-slash-dog-names.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DATA_V1 = path.join(ROOT, 'data/v1');

function cleanNorm(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

const CYR_TO_LAT_HOMOGLYPHS: Record<string, string> = {
  А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', Х: 'X',
  а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', х: 'x',
};

/** Fix occasional stray Cyrillic lookalikes inside otherwise Latin names (e.g. OSСAR -> OSCAR). */
function normalizeStrayCyrillicHomoglyphs(s: string): string {
  const cyrMatches = s.match(/[а-яё]/gi) ?? [];
  const latMatches = s.match(/[a-z]/gi) ?? [];
  if (cyrMatches.length === 0 || latMatches.length < 4 || cyrMatches.length > 2) return s;
  if (!cyrMatches.every((ch) => ch in CYR_TO_LAT_HOMOGLYPHS)) return s;
  return s.replace(/[а-яё]/gi, (ch) => CYR_TO_LAT_HOMOGLYPHS[ch] ?? ch);
}

/** Split on `/` only outside parentheses so coat tags like `(Г/Ш)` stay intact. */
function splitOutsideParens(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '(') depth += 1;
    else if (ch === ')' && depth > 0) depth -= 1;
    else if (ch === '/' && depth === 0) {
      parts.push(s.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(s.slice(start));
  return parts;
}

function dedupeKey(s: string): string {
  return cleanNorm(s)
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[’'`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitBilingualSlashNames(
  nameLat: string | null | undefined,
  nameRu: string | null | undefined,
): { name_lat: string; name_ru: string; changed: boolean } {
  const origLat = typeof nameLat === 'string' ? nameLat : '';
  const origRu = typeof nameRu === 'string' ? nameRu : '';

  if (!origLat.includes('/') && !origRu.includes('/')) {
    return { name_lat: origLat, name_ru: origRu, changed: false };
  }

  const rawParts = [...splitOutsideParens(origLat), ...splitOutsideParens(origRu)]
    .map(cleanNorm)
    .map(normalizeStrayCyrillicHomoglyphs)
    .filter(Boolean);

  if (rawParts.length === 0) {
    return { name_lat: origLat, name_ru: origRu, changed: false };
  }

  const ruByKey = new Map<string, string>();
  const latByKey = new Map<string, string>();

  for (const part of rawParts) {
    const hasCyr = /[а-яё]/i.test(part);
    const hasLat = /[a-z]/i.test(part);
    const key = dedupeKey(part);

    if (hasCyr && !hasLat) {
      if (!ruByKey.has(key)) ruByKey.set(key, part);
    } else if (hasLat && !hasCyr) {
      if (!latByKey.has(key)) latByKey.set(key, part);
    } else if (hasCyr && hasLat) {
      // Mixed single chunk (e.g. kennel prefix + English token) -> can't safely split without risking corruption
      return { name_lat: origLat, name_ru: origRu, changed: false };
    }
  }

  // Only split deterministically when at most 1 Cyrillic and 1 Latin variant exist
  if (ruByKey.size > 1 || latByKey.size > 1 || (ruByKey.size === 0 && latByKey.size === 0)) {
    return { name_lat: origLat, name_ru: origRu, changed: false };
  }

  const nextRu = [...ruByKey.values()][0] ?? '';
  const nextLat = [...latByKey.values()][0] ?? '';

  if (!nextRu && !nextLat) {
    return { name_lat: origLat, name_ru: origRu, changed: false };
  }

  const finalLat = nextLat || nextRu;
  const finalRu = nextRu || (origRu.includes('/') ? '' : origRu);

  const changed = finalLat !== origLat || finalRu !== origRu;
  return { name_lat: finalLat, name_ru: finalRu, changed };
}

function walkJson(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkJson(full));
    else if (ent.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function main() {
  let byIdFixed = 0;
  for (const file of walkJson(path.join(DATA_V1, 'dogs/by-id'))) {
    const doc = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>;
    const res = splitBilingualSlashNames(doc.name_lat as string | undefined, doc.name_ru as string | undefined);
    if (!res.changed) continue;
    doc.name_lat = res.name_lat || null;
    doc.name_ru = res.name_ru || null;
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
    byIdFixed += 1;
  }

  let compFilesFixed = 0;
  let compRowsFixed = 0;
  for (const file of walkJson(path.join(DATA_V1, 'competitions'))) {
    const doc = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
      results?: Array<{ dog?: { name_lat?: string; name_ru?: string } }>;
    };
    if (!Array.isArray(doc.results)) continue;
    let dirty = false;
    for (const row of doc.results) {
      if (!row.dog) continue;
      const res = splitBilingualSlashNames(row.dog.name_lat, row.dog.name_ru);
      if (!res.changed) continue;
      row.dog.name_lat = res.name_lat;
      row.dog.name_ru = res.name_ru;
      dirty = true;
      compRowsFixed += 1;
    }
    if (dirty) {
      fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
      compFilesFixed += 1;
    }
  }

  console.log(`Normalized slash names: byId=${byIdFixed}, competitionsFiles=${compFilesFixed}, competitionRows=${compRowsFixed}`);
}

const isEntry = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isEntry) {
  main();
}
