import * as XLSX from 'xlsx';

export type SpeedRecordStatus = 'new' | 'improved' | 'normal' | 'old';

/** Заливка клички на листах Донино (см. docs/PARSING.md) */
const STATUS_BY_RGB: Record<string, SpeedRecordStatus> = {
  B6D7A8: 'new',
  '9FC5E8': 'improved',
};

const SHEETS_WITH_COLORS = new Set(['2026', '2025', 'старые личные рекорды']);

export function sheetHasHighlightColors(sheetName: string): boolean {
  return SHEETS_WITH_COLORS.has(sheetName);
}

export function rgbFromCellStyle(cell: XLSX.Cell | undefined): string | null {
  const raw = cell?.s?.fgColor?.rgb ?? cell?.s?.bgColor?.rgb;
  if (!raw || typeof raw !== 'string') return null;
  return raw.replace(/^#/, '').toUpperCase();
}

export function statusFromRgb(rgb: string | null): 'new' | 'improved' | 'normal' {
  if (!rgb) return 'normal';
  return STATUS_BY_RGB[rgb] ?? 'normal';
}

export function getWorksheetCell(
  worksheet: XLSX.WorkSheet,
  row: number,
  col: number
): XLSX.Cell | undefined {
  return worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
}

export function statusFromNameCell(
  cell: XLSX.Cell | undefined,
  sheetName: string
): SpeedRecordStatus {
  if (sheetHasHighlightColors(sheetName)) {
    const fromColor = statusFromRgb(rgbFromCellStyle(cell));
    if (fromColor !== 'normal') return fromColor;
  }
  if (sheetName === 'старые личные рекорды') return 'old';
  return 'normal';
}
