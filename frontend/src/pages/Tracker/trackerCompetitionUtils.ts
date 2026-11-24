export type SortOption = 'date_desc' | 'date_asc' | 'status_delayed' | 'status_approved' | 'club_asc';

export interface SortItem {
  id: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortItem[] = [
  { id: 'date_desc', label: 'По дате: сперва ближайшие' },
  { id: 'date_asc', label: 'По дате: сперва дальние' },
  { id: 'status_delayed', label: 'Сначала задержанные' },
  { id: 'status_approved', label: 'Сначала утвержденные' },
  { id: 'club_asc', label: 'По клубу (А—Я)' },
];

export function parseDateScore(raw: string): number {
  if (!raw) return 0;
  // Match start day: '04-05.04.2026' -> day 4, month 4, year 2026
  const m = raw.match(/^([0-9]{1,2})(?:-[0-9]{1,2})?\.([0-9]{1,2})\.([0-9]{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    return new Date(year, month, day).getTime();
  }
  return 0;
}

export function formatShortDate(raw: string): string {
  if (!raw) return '—';
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const m = raw.match(/^([0-9\-]+)\.([0-9]{2})/);
  if (m) {
    const days = m[1].replace('-', '–');
    const mIdx = parseInt(m[2], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) return `${days} ${months[mIdx]}`;
  }
  return raw;
}
