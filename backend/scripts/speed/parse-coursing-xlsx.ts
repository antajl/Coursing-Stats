import * as XLSX from 'xlsx';
import { convertExcelDate } from './parse-speed-xlsx';
import {
  commentTextFromDateCell,
  parseCoursingCommentHistory,
  statusFromCoursingNameCell,
} from './coursing-sheet-status';
import { findSportDogId, resolveDoninoDog } from './match-donino-dog';

export interface ParsedCoursingRecord {
  breed: string;
  name: string;
  time_seconds: number;
  date: string;
  track_length: number;
  status: string;
  history: { time_seconds: number; date: string }[];
  dog_id?: number | null;
  aliases?: string[];
}

function parseTimeValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(',', '.')) || 0;
  return 0;
}

function findHeaderRow(worksheet: XLSX.WorkSheet, range: XLSX.Range): number {
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell?.v) return row;
    }
  }
  return range.s.r;
}

function readHeaders(worksheet: XLSX.WorkSheet, range: XLSX.Range, headerRow: number): string[] {
  const headers: string[] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: headerRow, c: col })];
    headers.push(cell?.v ? String(cell.v) : '');
  }
  return headers;
}

function colIndex(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const idx = headers.indexOf(name);
    if (idx !== -1) return idx;
  }
  for (const name of names) {
    const idx = headers.findIndex((h) => String(h).toLowerCase() === name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseCoursingRecordsFromWorkbook(workbook: XLSX.WorkBook): ParsedCoursingRecord[] {
  const records: ParsedCoursingRecord[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet['!ref']) continue;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headerRow = findHeaderRow(worksheet, range);
    const headers = readHeaders(worksheet, range, headerRow);

    const breedCol = colIndex(headers, 'Порода', 'breed');
    const nameCol = colIndex(headers, 'Кличка', 'кличка', 'name');
    const timeCol = colIndex(headers, 'Время', 'время', 'time');
    const dateCol = colIndex(headers, 'Дата', 'дата', 'date');

    if (breedCol < 0 || nameCol < 0 || timeCol < 0 || dateCol < 0) continue;

    const absBreedCol = range.s.c + breedCol;
    const absNameCol = range.s.c + nameCol;
    const absTimeCol = range.s.c + timeCol;
    const absDateCol = range.s.c + dateCol;

    for (let row = headerRow + 1; row <= range.e.r; row++) {
      const breedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absBreedCol })];
      const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absNameCol })];
      const timeCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absTimeCol })];
      const dateCell = worksheet[XLSX.utils.encode_cell({ r: row, c: absDateCol })];

      const breed = breedCell?.v ? String(breedCell.v).trim() : '';
      const name = nameCell?.v ? String(nameCell.v).trim() : '';
      const time_seconds = parseTimeValue(timeCell?.v);
      const date = convertExcelDate(dateCell?.v);

      if (!breed || !name || time_seconds <= 0 || !date) continue;

      const history = parseCoursingCommentHistory(commentTextFromDateCell(dateCell));
      const status = statusFromCoursingNameCell(nameCell, dateCell);
      const identity = resolveDoninoDog(name, breed);

      records.push({
        breed,
        name: identity.canonicalName,
        time_seconds,
        date,
        track_length: 350,
        status,
        history,
        dog_id: identity.sportDogId || undefined,
        aliases: identity.aliases.length > 0 ? identity.aliases : undefined,
      });
    }
  }

  return records;
}

export function dedupeCoursingRecords(records: ParsedCoursingRecord[]): ParsedCoursingRecord[] {
  const byDog = new Map<string, ParsedCoursingRecord[]>();

  for (const r of records) {
    const key = `${r.name}_${r.breed}`;
    if (!byDog.has(key)) byDog.set(key, []);
    byDog.get(key)!.push(r);
  }

  const result: ParsedCoursingRecord[] = [];

  for (const dogRecords of byDog.values()) {
    const runMap = new Map<string, { time_seconds: number; date: string }>();
    const allAliases = new Set<string>();
    let dogId: number | undefined;

    for (const rec of dogRecords) {
      if (rec.dog_id) dogId = rec.dog_id;
      if (rec.aliases) {
        for (const a of rec.aliases) allAliases.add(a);
      }
      if (rec.time_seconds > 0 && rec.date) {
        runMap.set(`${rec.time_seconds}_${rec.date}`, {
          time_seconds: rec.time_seconds,
          date: rec.date,
        });
      }
      for (const h of rec.history || []) {
        if (h.time_seconds > 0 && h.date) {
          runMap.set(`${h.time_seconds}_${h.date}`, {
            time_seconds: h.time_seconds,
            date: h.date,
          });
        }
      }
    }

    const allRuns = [...runMap.values()];
    allRuns.sort((a, b) => a.time_seconds - b.time_seconds || a.date.localeCompare(b.date));
    const bestRun = allRuns[0];
    if (!bestRun) continue;

    const history = allRuns
      .slice(1)
      .sort((a, b) => a.date.localeCompare(b.date));

    const baseRec =
      dogRecords.find(
        (r) => r.time_seconds === bestRun.time_seconds && r.date === bestRun.date
      ) || dogRecords[0];

    const status = history.length > 0 ? 'improved' : (baseRec.status || 'normal');
    const identity = resolveDoninoDog(baseRec.name, baseRec.breed);
    if (!dogId && identity.sportDogId) dogId = identity.sportDogId;
    for (const a of identity.aliases) allAliases.add(a);

    result.push({
      breed: baseRec.breed,
      name: baseRec.name,
      time_seconds: bestRun.time_seconds,
      date: bestRun.date,
      track_length: 350,
      status,
      history,
      dog_id: dogId || undefined,
      aliases: allAliases.size > 0 ? [...allAliases] : undefined,
    });
  }

  return result.sort((a, b) => a.time_seconds - b.time_seconds);
}
