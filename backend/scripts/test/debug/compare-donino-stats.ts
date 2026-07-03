/**
 * Сравнение парсинга рекордов Донино с Google Sheets и расчёта времени на 350м.
 * npx tsx backend/scripts/test/debug/compare-donino-stats.ts
 */
import * as XLSX from 'xlsx';

const SPEED_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';
const COURSING_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0';

function timeFromSpeed(speed: number): number {
  return 1260 / speed;
}

function avgTimeFromSpeeds(speeds: number[]): number {
  const valid = speeds.filter((s) => s > 0);
  if (!valid.length) return 0;
  const times = valid.map(timeFromSpeed);
  return times.reduce((a, b) => a + b, 0) / times.length;
}

function parseSpeedSheet(buffer: ArrayBuffer) {
  const wb = XLSX.read(buffer);
  const records: { breed: string; name: string; sex: string; speed: number }[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    if (sheetName.toLowerCase().includes('старые')) continue;

    let headerRow = 0;
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c: col })];
      headers.push(cell?.v?.toString() ?? '');
    }
    console.log(`\n[speed] Sheet "${sheetName}" headers:`, headers.filter(Boolean).join(' | '));

    for (let row = headerRow + 1; row <= Math.min(range.e.r, headerRow + 5); row++) {
      const rowData: Record<string, unknown> = {};
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell?.v !== undefined) rowData[headers[col - range.s.c]] = cell.v;
      }
      if (Object.keys(rowData).length) console.log('  sample row:', rowData);
    }

    for (let row = headerRow + 1; row <= range.e.r; row++) {
      const record: Record<string, unknown> = {};
      let has = false;
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        const h = headers[col - range.s.c];
        if (cell?.v !== undefined) {
          record[h] = cell.v;
          has = true;
        }
      }
      if (!has) continue;
      const speedRaw = record['Лучшая скорость (км/ч)'] ?? record['лучшая скорость (км/ч)'] ?? 0;
      let speed = 0;
      if (typeof speedRaw === 'number') speed = speedRaw;
      else if (typeof speedRaw === 'string') {
        const low = speedRaw.toLowerCase();
        if (low !== 'новый результат' && low !== 'улучшение личного рекорда') {
          speed = parseFloat(speedRaw.replace(',', '.')) || 0;
        }
      }
      const breed = String(record['Порода'] ?? '');
      const name = String(record['Кличка'] ?? '');
      const sex = String(record['Пол'] ?? '');
      if (breed && name && speed > 0) records.push({ breed, name, sex, speed });
    }
  }
  return records;
}

function parseCoursingSheet(buffer: ArrayBuffer) {
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const headers: string[] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    headers.push(ws[XLSX.utils.encode_cell({ r: 0, c: col })]?.v?.toString() ?? '');
  }
  console.log('\n[coursing] headers:', headers.filter(Boolean).join(' | '));

  const records: { breed: string; name: string; time: number }[] = [];
  for (let row = 1; row <= Math.min(5, range.e.r); row++) {
    const rowData: Record<string, unknown> = {};
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell?.v !== undefined) rowData[headers[col - range.s.c]] = cell.v;
    }
    console.log('  sample row:', rowData);
  }

  for (let row = 1; row <= range.e.r; row++) {
    const record: Record<string, unknown> = {};
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell?.v !== undefined) record[headers[col - range.s.c]] = cell.v;
    }
    const timeRaw = record['Время'] ?? record['время'] ?? 0;
    let time = 0;
    if (typeof timeRaw === 'number') time = timeRaw;
    else if (typeof timeRaw === 'string') time = parseFloat(timeRaw.replace(',', '.')) || 0;
    const breed = String(record['Порода'] ?? '');
    const name = String(record['Кличка'] ?? '');
    if (breed && name && time > 0) records.push({ breed, name, time });
  }
  return records;
}

function breedStatsSpeed(records: { breed: string; speed: number }[]) {
  const byBreed = new Map<string, number[]>();
  for (const r of records) {
    if (!byBreed.has(r.breed)) byBreed.set(r.breed, []);
    byBreed.get(r.breed)!.push(r.speed);
  }
  return [...byBreed.entries()]
    .map(([breed, speeds]) => {
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxSpeed = Math.max(...speeds);
      return {
        breed,
        count: speeds.length,
        avgSpeed: avgSpeed.toFixed(1),
        maxSpeed: maxSpeed.toFixed(0),
        avgTime_wrong: (1260 / avgSpeed).toFixed(2),
        bestTime: (1260 / maxSpeed).toFixed(2),
        avgTime_correct: avgTimeFromSpeeds(speeds).toFixed(2),
      };
    })
    .sort((a, b) => a.breed.localeCompare(b.breed));
}

function breedStatsCoursing(records: { breed: string; time: number }[]) {
  const byBreed = new Map<string, number[]>();
  for (const r of records) {
    if (!byBreed.has(r.breed)) byBreed.set(r.breed, []);
    byBreed.get(r.breed)!.push(r.time);
  }
  return [...byBreed.entries()]
    .map(([breed, times]) => ({
      breed,
      count: times.length,
      avgTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
      bestTime: Math.min(...times).toFixed(2),
    }))
    .sort((a, b) => a.breed.localeCompare(b.breed));
}

const speedBuf = await fetch(SPEED_SHEET_URL).then((r) => r.arrayBuffer());
const coursingBuf = await fetch(COURSING_SHEET_URL).then((r) => r.arrayBuffer());

const speedRecords = parseSpeedSheet(speedBuf);
const coursingRecords = parseCoursingSheet(coursingBuf);

console.log(`\n=== SPEED sheet: ${speedRecords.length} records with speed > 0 ===`);
console.log('Уиппет stats (current formula 1260/avgSpeed vs avg of 1260/speed):');
const whip = speedRecords.filter((r) => r.breed === 'Уиппет');
const whipSpeeds = whip.map((r) => r.speed);
const avgS = whipSpeeds.reduce((a, b) => a + b, 0) / whipSpeeds.length;
console.log({
  count: whip.length,
  avgSpeed: avgS.toFixed(1),
  maxSpeed: Math.max(...whipSpeeds).toFixed(0),
  avgTime_currentFormula: (1260 / avgS).toFixed(2),
  avgTime_meanOfTimes: avgTimeFromSpeeds(whipSpeeds).toFixed(2),
  bestTime: (1260 / Math.max(...whipSpeeds)).toFixed(2),
});

console.log('\nTop breeds speed stats:');
console.table(breedStatsSpeed(speedRecords).filter((b) => b.breed === 'Уиппет' || b.breed === 'Гальго'));

console.log(`\n=== COURSING sheet (user URL): ${coursingRecords.length} records ===`);
console.table(breedStatsCoursing(coursingRecords).slice(0, 8));
