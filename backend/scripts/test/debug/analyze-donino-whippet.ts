/**
 * npx tsx backend/scripts/test/debug/analyze-donino-whippet.ts
 */
import * as XLSX from 'xlsx';

const SPEED_URL =
  'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';

type Rec = { breed: string; name: string; sex: string; speed: number; date: string; sheet: string };

function parseSpeed(buffer: ArrayBuffer): Rec[] {
  const wb = XLSX.read(buffer);
  const records: Rec[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    if (sheetName.toLowerCase().includes('старые')) {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const breed = ws[XLSX.utils.encode_cell({ r: row, c: range.s.c })]?.v;
        const sex = ws[XLSX.utils.encode_cell({ r: row, c: range.s.c + 1 })]?.v ?? '';
        const name = ws[XLSX.utils.encode_cell({ r: row, c: range.s.c + 2 })]?.v ?? '';
        const speedRaw = ws[XLSX.utils.encode_cell({ r: row, c: range.s.c + 3 })]?.v ?? 0;
        let speed = typeof speedRaw === 'number' ? speedRaw : parseFloat(String(speedRaw)) || 0;
        if (breed && name && speed > 0) records.push({ breed: String(breed), name: String(name), sex: String(sex), speed, date: '', sheet: sheetName });
      }
      continue;
    }

    let headerRow = range.s.r;
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      headers.push(String(ws[XLSX.utils.encode_cell({ r: headerRow, c: col })]?.v ?? ''));
    }

    for (let row = headerRow + 1; row <= range.e.r; row++) {
      const record: Record<string, unknown> = {};
      let has = false;
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell?.v !== undefined) {
          record[headers[col - range.s.c]] = cell.v;
          has = true;
        }
      }
      if (!has) continue;
      const speedRaw = record['Лучшая скорость (км/ч)'] ?? 0;
      let speed = 0;
      if (typeof speedRaw === 'number') speed = speedRaw;
      else if (typeof speedRaw === 'string' && !/новый|улучшение/i.test(speedRaw)) {
        speed = parseFloat(speedRaw.replace(',', '.')) || 0;
      }
      const breed = String(record['Порода'] ?? '');
      const name = String(record['Кличка'] ?? '');
      const sex = String(record['Пол'] ?? '');
      const date = String(record['Дата'] ?? '');
      if (breed && name && speed > 0) {
        records.push({ breed, name, sex, speed, date, sheet: sheetName });
      }
    }
  }
  return records;
}

function dedupe(recs: Rec[]): Rec[] {
  const seen = new Set<string>();
  return recs.filter((r) => {
    const key = `${r.name}_${r.breed}_${r.sex}_${r.date}_${r.speed}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stats(label: string, speeds: number[]) {
  if (!speeds.length) return;
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);
  const times = speeds.map((s) => 1260 / s);
  const avgTimeMean = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\n${label} (n=${speeds.length})`);
  console.log(`  avg speed: ${avgSpeed.toFixed(1)} km/h, max: ${maxSpeed.toFixed(0)} km/h`);
  console.log(`  avg time [1260/avgSpeed]:     ${(1260 / avgSpeed).toFixed(2)} s  ← текущая формула UI`);
  console.log(`  avg time [mean(1260/speed)]:  ${avgTimeMean.toFixed(2)} s  ← среднее времени`);
  console.log(`  best time [1260/maxSpeed]:    ${(1260 / maxSpeed).toFixed(2)} s`);
}

const buffer = await fetch(SPEED_URL).then((r) => r.arrayBuffer());
const all = dedupe(parseSpeed(buffer));
const whip = all.filter((r) => r.breed === 'Уиппет');

console.log('=== Уиппет: записи по листам (до дедупа) ===');
const bySheet = new Map<string, number>();
for (const r of parseSpeed(buffer).filter((x) => x.breed === 'Уиппет')) {
  bySheet.set(r.sheet, (bySheet.get(r.sheet) ?? 0) + 1);
}
console.log(Object.fromEntries(bySheet));

stats('Все замеры', whip.map((r) => r.speed));

// Лучший результат на собаку
const bestPerDog = new Map<string, number>();
for (const r of whip) {
  const key = `${r.name}_${r.sex}`;
  bestPerDog.set(key, Math.max(bestPerDog.get(key) ?? 0, r.speed));
}
stats('Лучший на собаку (пол)', [...bestPerDog.values()]);

// Подозрительно низкие скорости (< 45)
const slow = whip.filter((r) => r.speed < 45);
console.log(`\nЗамеры < 45 км/ч: ${slow.length} из ${whip.length}`);
if (slow.length) console.log('  примеры:', slow.slice(0, 5).map((r) => `${r.name} ${r.speed} (${r.sheet})`));

// Coursing spreadsheet comparison
const COURSING_URL =
  'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0';
const cbuf = await fetch(COURSING_URL).then((r) => r.arrayBuffer());
const cwb = XLSX.read(cbuf);
const cws = cwb.Sheets[cwb.SheetNames[0]];
const crange = XLSX.utils.decode_range(cws['!ref'] || 'A1');
const ctimes: number[] = [];
for (let row = 1; row <= crange.e.r; row++) {
  const breed = cws[XLSX.utils.encode_cell({ r: row, c: 0 })]?.v;
  const time = cws[XLSX.utils.encode_cell({ r: row, c: 2 })]?.v;
  if (breed === 'Уиппет' && typeof time === 'number' && time > 0) ctimes.push(time);
}
if (ctimes.length) {
  console.log('\n=== COURSING sheet (user URL) Уиппет ===');
  console.log(`  n=${ctimes.length}, avg time=${(ctimes.reduce((a,b)=>a+b,0)/ctimes.length).toFixed(2)}s, best=${Math.min(...ctimes).toFixed(2)}s`);
  console.log(`  implied avg speed=${(1260/(ctimes.reduce((a,b)=>a+b,0)/ctimes.length)).toFixed(1)} km/h`);
}
