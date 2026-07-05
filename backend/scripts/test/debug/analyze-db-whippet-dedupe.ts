import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecordDate } from '../../../../frontend/src/lib/recordDates.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');

function normDate(d: string): string {
  const p = parseRecordDate(d);
  if (!p) return String(d);
  const y = p.getFullYear();
  const m = String(p.getMonth() + 1).padStart(2, '0');
  const day = String(p.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const raw = execSync(
  `npx wrangler d1 execute pc-db --remote --command "SELECT name, sex, date, speed_km_h FROM speed_records WHERE breed='Уиппет'" --json`,
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 20_000_000 }
);
const parsed = JSON.parse(raw);
const rows: { name: string; sex: string; date: string; speed_km_h: number }[] =
  parsed[0]?.results ?? [];

console.log('DB rows whippet:', rows.length);

function stats(label: string, speeds: number[]) {
  const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const max = Math.max(...speeds);
  console.log(`${label}: n=${speeds.length} avgSp=${avg.toFixed(1)} avgT=${(1260/avg).toFixed(2)} bestT=${(1260/max).toFixed(2)}`);
}

stats('raw DB', rows.map((r) => r.speed_km_h));

// dedupe exact key (current frontend)
const exact = new Map<string, number>();
for (const r of rows) {
  exact.set(`${r.name}_${r.sex}_${r.date}_${r.speed_km_h}`, r.speed_km_h);
}
stats('exact dedupe', [...exact.values()]);

// normalized date dedupe
const norm = new Map<string, number>();
for (const r of rows) {
  norm.set(`${r.name}_${r.sex}_${normDate(r.date)}_${r.speed_km_h}`, r.speed_km_h);
}
stats('norm date dedupe', [...norm.values()]);

// best per dog per normalized date
const bestDay = new Map<string, number>();
for (const r of rows) {
  const k = `${r.name}_${r.sex}_${normDate(r.date)}`;
  bestDay.set(k, Math.max(bestDay.get(k) ?? 0, r.speed_km_h));
}
stats('best per dog-day', [...bestDay.values()]);

// best per dog overall
const bestDog = new Map<string, number>();
for (const r of rows) {
  const k = `${r.name}_${r.sex}`;
  bestDog.set(k, Math.max(bestDog.get(k) ?? 0, r.speed_km_h));
}
stats('best per dog', [...bestDog.values()]);
