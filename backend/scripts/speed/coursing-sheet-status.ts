import * as XLSX from 'xlsx';

export type CoursingRecordStatus = 'new' | 'improved' | 'normal';

/** Заливка строки в листе бегов 350 м */
const STATUS_BY_RGB: Record<string, CoursingRecordStatus | 'default_gray'> = {
  FFFFFF: 'new',
  FFFF: 'new',
};

export function rgbFromCellStyle(cell: XLSX.Cell | undefined): string | null {
  const raw = cell?.s?.fgColor?.rgb ?? cell?.s?.bgColor?.rgb;
  if (!raw || typeof raw !== 'string') return null;
  return raw.replace(/^#/, '').replace(/^FF/i, '').toUpperCase();
}

/**
 * Примечание в колонке «Дата»: строки вида «23,36 - 31.05.2026».
 */
export function parseCoursingCommentHistory(text: string | undefined | null): {
  time_seconds: number;
  date: string;
}[] {
  if (!text || typeof text !== 'string') return [];

  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.trim().match(/^([\d,]+)\s*-\s*(.+)$/);
      if (!match) return null;

      const time_seconds = parseFloat(match[1].replace(',', '.'));
      const dateRaw = match[2].trim();
      const dmy = dateRaw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      const date = dmy
        ? `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
        : dateRaw;

      if (!Number.isFinite(time_seconds) || time_seconds <= 0) return null;
      return { time_seconds, date };
    })
    .filter((entry): entry is { time_seconds: number; date: string } => entry !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function commentTextFromDateCell(cell: XLSX.Cell | undefined): string | null {
  const comments = cell?.c;
  if (!Array.isArray(comments) || comments.length === 0) return null;
  const text = comments[0]?.t ?? comments[0]?.h?.replace(/<br\s*\/?>/gi, '\n');
  return text && String(text).trim() ? String(text).trim() : null;
}

export function statusFromCoursingNameCell(
  nameCell: XLSX.Cell | undefined,
  dateCell: XLSX.Cell | undefined
): CoursingRecordStatus {
  const history = parseCoursingCommentHistory(commentTextFromDateCell(dateCell));
  if (history.length > 0) return 'improved';

  const rgb = rgbFromCellStyle(nameCell);
  if (rgb && (STATUS_BY_RGB[rgb] === 'new' || rgb === 'FFFFFF' || rgb === 'FFFF')) {
    return 'new';
  }

  return 'normal';
}
