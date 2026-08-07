import * as XLSX from 'xlsx';
import { statusFromNameCell } from './speed-sheet-status';

export interface ParsedSpeedRecord {
  breed: string;
  sex: string;
  name: string;
  speed_km_h: number;
  date: string;
  screenshot_url?: string | null;
  status: string;
  track_type?: string | null;
  history?: { speed_km_h: number | string; date: string; track_type?: string | null }[];
}

export function convertExcelDate(dateValue: unknown): string {
  if (typeof dateValue === 'number') {
    const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    const year = excelDate.getFullYear();
    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
    const day = String(excelDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateValue === 'string') {
    if (/^\d{5}$/.test(dateValue)) {
      const excelDate = new Date(Math.round((parseInt(dateValue, 10) - 25569) * 86400 * 1000));
      const year = excelDate.getFullYear();
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const day = String(excelDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const normalized = dateValue.replace(/[;,\/\-]/g, '.');
    const parts = normalized.split('.');
    if (parts.length === 3) {
      const day = String(parts[0]).padStart(2, '0');
      const month = String(parts[1]).padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dateValue ? String(dateValue) : '';
}

function parseSpeedValue(value: unknown): number {
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (typeof value === 'number') return value;
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

function headerIndex(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const idx = headers.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseSpeedRecordsFromWorkbook(workbook: XLSX.WorkBook): ParsedSpeedRecord[] {
  const records: ParsedSpeedRecord[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet['!ref']) continue;

    const range = XLSX.utils.decode_range(worksheet['!ref']);

    if (sheetName === 'старые личные рекорды') {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const breedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c })];
        const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 2 })];
        const speedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 3 })];
        const dateCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 4 })];
        const screenshotCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 5 })];
        const sexCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 1 })];

        if (!breedCell?.v || !nameCell?.v) continue;

        const speed_km_h = parseSpeedValue(speedCell?.v);
        if (speed_km_h <= 0) continue;

        records.push({
          breed: String(breedCell.v),
          sex: sexCell?.v ? String(sexCell.v) : '',
          name: String(nameCell.v),
          speed_km_h,
          date: convertExcelDate(dateCell?.v),
          screenshot_url: screenshotCell?.v ? String(screenshotCell.v) : '',
          status: statusFromNameCell(nameCell, sheetName),
        });
      }
      continue;
    }

    const headerRow = findHeaderRow(worksheet, range);
    const headers = readHeaders(worksheet, range, headerRow);
    const breedOffset = headerIndex(headers, 'Порода', 'breed');
    const sexOffset = headerIndex(headers, 'Пол', 'sex');
    const nameOffset = headerIndex(headers, 'Кличка', 'кличка', 'name');
    const speedOffset = headerIndex(headers, 'Лучшая скорость (км/ч)', 'лучшая скорость (км/ч)', 'speed_km_h');
    const dateOffset = headerIndex(headers, 'Дата', 'дата', 'date');
    const screenshotOffset = headerIndex(headers, 'Скриншот', 'скриншот', 'screenshot_url');
    const trackTypeOffset = headerIndex(headers, 'Тип трассы', 'тип трассы', 'track_type');

    if (breedOffset === -1 || nameOffset === -1) continue;

    for (let row = headerRow + 1; row <= range.e.r; row++) {
      const breedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + breedOffset })];
      const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + nameOffset })];
      if (!breedCell?.v || !nameCell?.v) continue;

      const speedCell =
        speedOffset >= 0
          ? worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + speedOffset })]
          : undefined;
      const speed_km_h = parseSpeedValue(speedCell?.v);
      if (speed_km_h <= 0) continue;

      const sexCell =
        sexOffset >= 0
          ? worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + sexOffset })]
          : undefined;
      const dateCell =
        dateOffset >= 0
          ? worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + dateOffset })]
          : undefined;
      const screenshotCell =
        screenshotOffset >= 0
          ? worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + screenshotOffset })]
          : undefined;
      const trackTypeCell =
        trackTypeOffset >= 0
          ? worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + trackTypeOffset })]
          : undefined;

      records.push({
        breed: String(breedCell.v),
        sex: sexCell?.v ? String(sexCell.v) : '',
        name: String(nameCell.v),
        speed_km_h,
        date: convertExcelDate(dateCell?.v),
        screenshot_url: screenshotCell?.v ? String(screenshotCell.v) : '',
        status: statusFromNameCell(nameCell, sheetName),
        track_type: trackTypeCell?.v ? String(trackTypeCell.v) : null,
      });
    }
  }

  return records;
}

export function dedupeSpeedRecords(records: ParsedSpeedRecord[]): ParsedSpeedRecord[] {
  const uniqueRecords: ParsedSpeedRecord[] = [];
  const seenKeys = new Set<string>();

  for (const record of records) {
    const key = `${record.name}_${record.breed}_${record.sex}_${record.date}_${record.speed_km_h}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    uniqueRecords.push(record);
  }

  return uniqueRecords;
}

export function attachSpeedRecordHistory(records: ParsedSpeedRecord[]): ParsedSpeedRecord[] {
  const recordsByDog: Record<string, ParsedSpeedRecord[]> = {};

  for (const record of records) {
    const key = `${record.name}_${record.breed}`;
    if (!recordsByDog[key]) recordsByDog[key] = [];
    recordsByDog[key].push(record);
  }

  for (const dogRecords of Object.values(recordsByDog)) {
    dogRecords.sort((a, b) => {
      const parseDate = (d: string) => {
        if (!d) return 0;
        if (d.includes('-')) return new Date(d).getTime();
        const parts = d.split('.');
        if (parts.length !== 3) return 0;
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
      };
      return parseDate(b.date) - parseDate(a.date);
    });

    dogRecords.forEach((record, idx) => {
      record.history = dogRecords
        .filter((_, i) => i !== idx)
        .map((r) => ({ speed_km_h: r.speed_km_h, date: r.date, track_type: r.track_type }));
    });
  }

  return records;
}
