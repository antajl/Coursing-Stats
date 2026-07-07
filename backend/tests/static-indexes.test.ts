import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Публичный сайт читает эти файлы напрямую с CDN (frontend/src/lib/staticData.ts),
 * без Worker/D1. Проверяем, что `npm run build-all-data` действительно генерирует
 * всё, что нужно static-data слою фронта, с ожидаемой формой.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_V1 = path.join(ROOT, 'data/v1');
const INDEXES = path.join(DATA_V1, 'indexes');

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_V1, relPath), 'utf-8')) as T;
}

const skipIfMissing = !fs.existsSync(INDEXES);

describe('static data indexes (data/v1/indexes)', () => {
  it.skipIf(skipIfMissing)('years.json has a non-empty years array', () => {
    const doc = readJson<{ years: number[] }>('indexes/years.json');
    expect(Array.isArray(doc.years)).toBe(true);
    expect(doc.years.length).toBeGreaterThan(0);
    expect(doc.years.every((y) => Number.isInteger(y))).toBe(true);
  });

  it.skipIf(skipIfMissing)('top-placement-all.json and top-score-all.json exist with items', () => {
    const placement = readJson<{ items: unknown[] }>('indexes/top-placement-all.json');
    const score = readJson<{ items: unknown[] }>('indexes/top-score-all.json');
    expect(Array.isArray(placement.items)).toBe(true);
    expect(Array.isArray(score.items)).toBe(true);
    expect(placement.items.length).toBeGreaterThan(0);
    expect(score.items.length).toBeGreaterThan(0);
  });

  it.skipIf(skipIfMissing)('top-speed-all.json items have best_speed and avg_speed', () => {
    const doc = readJson<{ items: Array<Record<string, unknown>> }>('indexes/top-speed-all.json');
    expect(Array.isArray(doc.items)).toBe(true);
    expect(doc.items.length).toBeGreaterThan(0);
    expect(doc.items[0]).toHaveProperty('best_speed');
    expect(doc.items[0]).toHaveProperty('avg_speed');
  });

  it.skipIf(skipIfMissing)('judges-summary.json has judges, judges-raw-rows.json is a flat array', () => {
    const summary = readJson<{ judges: unknown[] }>('indexes/judges-summary.json');
    const raw = readJson<unknown[]>('indexes/judges-raw-rows.json');
    expect(Array.isArray(summary.judges)).toBe(true);
    expect(summary.judges.length).toBeGreaterThan(0);
    expect(Array.isArray(raw)).toBe(true);
    expect(raw.length).toBeGreaterThan(0);
  });

  it.skipIf(skipIfMissing)('dog-profiles/{id}.json has coursing/racing stats and competitions', () => {
    const dogsDir = path.join(INDEXES, 'dog-profiles');
    expect(fs.existsSync(dogsDir)).toBe(true);
    const files = fs.readdirSync(dogsDir).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);

    const sample = readJson<{ dog: Record<string, unknown>; competitions: unknown[] }>(
      `indexes/dog-profiles/${files[0]}`,
    );
    expect(sample.dog).toHaveProperty('coursing_stats');
    expect(sample.dog).toHaveProperty('racing_stats');
    expect(sample.dog).toHaveProperty('titles');
    expect(Array.isArray(sample.competitions)).toBe(true);
  });

  it.skipIf(skipIfMissing)('sitemap.xml is generated into frontend/public', () => {
    const sitemapPath = path.join(ROOT, 'frontend/public/sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('coursing-stats.ru');
  });
});
