/**
 * Анализ листа бегов 350 м: цвета строк и примечания в колонке «Дата».
 *
 * Usage: npx tsx backend/scripts/speed/analyze-coursing-xlsx.ts
 */

import * as XLSX from 'xlsx';
import {
  commentTextFromDateCell,
  parseCoursingCommentHistory,
  rgbFromCellStyle,
  statusFromCoursingNameCell,
} from './coursing-sheet-status';
import { dedupeCoursingRecords, parseCoursingRecordsFromWorkbook } from './parse-coursing-xlsx';

const GOOGLE_SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0';

const SPOTLIGHT = ['Драми', 'Зизи', 'Таир', 'Винни', 'Агния'];

function normRgb(cell: XLSX.Cell | undefined): string {
  return rgbFromCellStyle(cell) ?? '(none)';
}

async function main() {
  const response = await fetch(GOOGLE_SHEETS_URL);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  const buffer = await response.arrayBuffer();

  const workbook = XLSX.read(buffer, { cellStyles: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const range = XLSX.utils.decode_range(worksheet['!ref']!);

  // Find header row and date column
  let headerRow = range.s.r;
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      if (worksheet[XLSX.utils.encode_cell({ r: row, c: col })]?.v) {
        headerRow = row;
        break;
      }
    }
    if (headerRow !== range.s.r || worksheet[XLSX.utils.encode_cell({ r: headerRow, c: range.s.c })]?.v) break;
  }

  const headers: string[] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: headerRow, c: col })];
    headers.push(cell?.v ? String(cell.v) : '');
  }
  const nameColRel = headers.findIndex((h) => h === 'Кличка');
  const dateColRel = headers.findIndex((h) => h === 'Дата');
  const absNameCol = range.s.c + nameColRel;
  const absDateCol = range.s.c + dateColRel;

  const colorStats = new Map<string, { total: number; withComment: number; statuses: Record<string, number> }>();
  const rows: {
    name: string;
    rgb: string;
    hasComment: boolean;
    status: string;
    historyLen: number;
  }[] = [];

  for (let row = headerRow + 1; row <= range.e.r; row++) {
    const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absNameCol })];
    const dateCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absDateCol })];
    const name = nameCell?.v ? String(nameCell.v).trim() : '';
    if (!name) continue;

    const rgb = normRgb(nameCell);
    const comment = commentTextFromDateCell(dateCell);
    const hasComment = Boolean(comment);
    const status = statusFromCoursingNameCell(nameCell, dateCell);
    const historyLen = parseCoursingCommentHistory(comment).length;

    rows.push({ name, rgb, hasComment, status, historyLen });

    const bucket = colorStats.get(rgb) ?? { total: 0, withComment: 0, statuses: {} };
    bucket.total++;
    if (hasComment) bucket.withComment++;
    bucket.statuses[status] = (bucket.statuses[status] ?? 0) + 1;
    colorStats.set(rgb, bucket);
  }

  console.log('=== Color distribution (name cell fill) ===');
  for (const [rgb, stat] of [...colorStats.entries()].sort((a, b) => b[1].total - a[1].total)) {
    console.log(
      `${rgb}: ${stat.total} rows, ${stat.withComment} with comment, statuses=${JSON.stringify(stat.statuses)}`
    );
  }

  console.log('\n=== Spotlight dogs ===');
  const records = dedupeCoursingRecords(parseCoursingRecordsFromWorkbook(workbook));
  for (const spotlight of SPOTLIGHT) {
    const record = records.find((r) => r.name === spotlight);
    const row = rows.find((r) => r.name === spotlight);
    let dateCellObj: XLSX.Cell | undefined;
    for (let r = headerRow + 1; r <= range.e.r; r++) {
      const nc = worksheet[XLSX.utils.encode_cell({ r, c: absNameCol })];
      if (nc?.v === spotlight) {
        dateCellObj = worksheet[XLSX.utils.encode_cell({ r, c: absDateCol })];
        break;
      }
    }
    console.log(`\n--- ${spotlight} ---`);
    console.log('row:', row);
    console.log('parsed:', record ? JSON.stringify(record, null, 2) : 'NOT FOUND');
    if (dateCellObj) {
      console.log('date cell keys:', Object.keys(dateCellObj));
      console.log('date cell.c:', dateCellObj.c);
      console.log('comment text:', commentTextFromDateCell(dateCellObj));
    }
  }

  const withHistory = records.filter((r) => r.history.length > 0);
  console.log(`\n=== Summary ===`);
  console.log(`Total parsed: ${records.length}`);
  console.log(`With history from comments: ${withHistory.length}`);
  console.log(`Status counts:`, records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
