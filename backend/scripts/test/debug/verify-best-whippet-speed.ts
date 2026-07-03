import * as XLSX from 'xlsx';

const URL =
  'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';

const buf = await fetch(URL).then((r) => r.arrayBuffer());
const wb = XLSX.read(buf);

const hits: { sheet: string; row: unknown[]; speed: number }[] = [];

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][];
  const headers = (data[0] ?? []) as string[];
  const breedIdx = headers.indexOf('Порода');
  const speedIdx = headers.indexOf('Лучшая скорость (км/ч)');
  if (breedIdx < 0 || speedIdx < 0) continue;

  for (let i = 1; i < data.length; i++) {
    const row = data[i] as unknown[];
    if (String(row[breedIdx]) !== 'Уиппет') continue;
    const speedRaw = row[speedIdx];
    const speed =
      typeof speedRaw === 'number' ? speedRaw : parseFloat(String(speedRaw).replace(',', '.'));
    if (!Number.isFinite(speed) || speed < 60) continue;
    hits.push({ sheet: sheetName, row, speed });
  }
}

hits.sort((a, b) => b.speed - a.speed);
console.log('Top whippet speeds >= 60 in spreadsheet:');
for (const h of hits.slice(0, 15)) {
  console.log(
    h.sheet,
    h.speed,
    'km/h ->',
    (1260 / h.speed).toFixed(2),
    's',
    '|',
    h.row.slice(0, 6),
  );
}

console.log('\nGlobal max speed any breed:');
let globalMax = 0;
let globalRow: unknown[] = [];
let globalSheet = '';
for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][];
  const headers = (data[0] ?? []) as string[];
  const speedIdx = headers.indexOf('Лучшая скорость (км/ч)');
  if (speedIdx < 0) continue;
  for (let i = 1; i < data.length; i++) {
    const row = data[i] as unknown[];
    const v = row[speedIdx];
    const speed = typeof v === 'number' ? v : parseFloat(String(v));
    if (speed > globalMax) {
      globalMax = speed;
      globalRow = row;
      globalSheet = sheetName;
    }
  }
}
console.log(
  globalSheet,
  globalMax,
  'km/h ->',
  (1260 / globalMax).toFixed(2),
  's',
  globalRow.slice(0, 5),
);
