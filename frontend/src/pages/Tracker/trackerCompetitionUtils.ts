export type SortOption = 'date_desc' | 'date_asc' | 'status_delayed' | 'status_approved' | 'club_asc';

export interface SortItem {
  id: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortItem[] = [
  { id: 'date_desc', label: 'По дате: новые' },
  { id: 'date_asc', label: 'По дате: старые' },
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

export function formatDateParts(raw: string): { dayLine: string; monthLine: string } {
  if (!raw) return { dayLine: '—', monthLine: '' };
  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
  const m = raw.match(/^([0-9\-]+)\.([0-9]{2})/);
  if (m) {
    const dayLine = m[1].replace('-', '–');
    const mIdx = parseInt(m[2], 10) - 1;
    const monthLine = mIdx >= 0 && mIdx < 12 ? months[mIdx] : '';
    return { dayLine, monthLine };
  }
  return { dayLine: raw, monthLine: '' };
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

/** Сопоставление графика РКФ с протоколами соревнований на сайте (/event/:id) */
const EVENT_LINK_MAP: Record<string, number> = {
  // 03-04.10.2026 СПГОО «Радонежье» Курсинг
  ev_15cgms: 2026003,
  // 04-05.04.2026 Ярославль Курсинг
  ev_td6lum: 1300,
  // 04-05.04.2026 Ярославль БЗМП
  ev_amzre: 1301,
  // 11-12.04.2026 Ставрополь Курсинг
  ev_5c2n7: 1302,
  // 11-12.04.2026 Ставрополь БЗМП
  ev_svlj07: 1303,
  // 18-19.04.2026 Казань Курсинг
  ev_4h5z4l: 1304,
  // 18-19.04.2026 Казань БЗМП
  ev_g7da21: 1305,
  // 25-26.04.2026 Донино Курсинг
  ev_l9qhz: 1310,
  // 25-26.04.2026 Донино БЗМП
  ev_lds8ed: 1311,
  // 01-02.05.2026 Пермь Курсинг
  ev_mzwbyq: 1312,
  // 01-02.05.2026 Пермь БЗМП
  ev_4x1xye: 1313,
  // 23-24.05.2026 Арта Курсинг
  ev_is4ldm: 1317,
  // 27-28.06.2026 Суханово Монопородный
  ev_qu374a: 2026001,
  // 01-02.08.2026 Донино Бега
  ev_1x75ga: 1550,
  // 22-23.08.2026 Суханово Кубок
  ev_b76v6g: 2026002,
  // 26-27.09.2026 Донино Бега
  ev_47z3pe: 2022002,
  // 10-11.10.2026 Донино Курсинг
  ev_elkduj: 2022003,
  // 10-11.10.2026 Донино БЗМП
  ev_gsoenj: 2022004,
};

export function getCompetitionEventId(id: string): number | undefined {
  return EVENT_LINK_MAP[id];
}
