import { InlineKeyboard } from 'grammy';
import { botStartLink } from './constants';
import { getInlineDogCardKeyboard } from './keyboards';
import { formatDogCard, type ShowDogCardSummary } from './handlers/utils/dogCard';
import type { CoursingRecord, Dog, DogData, SpeedRecord, SpeedRecordExtended } from './types';

const SITE_URL = 'https://coursing-stats.ru';
const DONINO_SITE = `${SITE_URL}/speed-records`;
const RUNNINGDOG_URL = 'https://runningdog.ru/';

/** Exact inline phrases that open Donino records (not dog search). Case-insensitive. */
export const DONINO_INLINE_KEYWORDS = new Set(['донино', 'donino']);

/** Speed measurement (км/ч) — «курсинг» in Donino naming. */
export const DONINO_SPEED_KEYWORDS = new Set(['курсинг', 'coursing', 'скорость']);

/** 350m flat (сек) — «рейсинг» in Donino naming. */
export const DONINO_RACING_KEYWORDS = new Set(['рейсинг', 'racing', '350', '350м']);

export type DoninoDiscipline = 'speed' | 'racing';

export function parseDoninoDiscipline(term: string): { discipline: DoninoDiscipline; rest?: string } | null {
  const parts = term.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  const first = parts[0].toLowerCase();
  let discipline: DoninoDiscipline | null = null;
  if (DONINO_SPEED_KEYWORDS.has(first)) discipline = 'speed';
  else if (DONINO_RACING_KEYWORDS.has(first)) discipline = 'racing';
  if (!discipline) return null;

  const rest = parts.slice(1).join(' ').trim();
  return rest.length >= 2 ? { discipline, rest } : { discipline };
}

export function parseDoninoInlineQuery(query: string): { term?: string } | null {
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  if (DONINO_INLINE_KEYWORDS.has(normalized)) {
    return {};
  }

  for (const keyword of DONINO_INLINE_KEYWORDS) {
    if (normalized.startsWith(`${keyword} `)) {
      const term = trimmed.slice(keyword.length).trim();
      if (term.length >= 2) {
        return { term };
      }
      return {};
    }
  }

  return null;
}

export function isDoninoInlineQuery(query: string): boolean {
  return parseDoninoInlineQuery(query) !== null;
}

export function collectDoninoBreeds(
  speed: SpeedRecord[],
  coursing: CoursingRecord[]
): string[] {
  const breeds = new Set<string>();
  for (const record of speed) {
    if (record.breed) breeds.add(record.breed);
  }
  for (const record of coursing) {
    if (record.breed) breeds.add(record.breed);
  }
  return [...breeds].sort((a, b) => a.localeCompare(b, 'ru'));
}

export function matchDoninoBreeds(breedQuery: string, breeds: string[]): string[] {
  const q = breedQuery.toLowerCase().trim();
  if (!q) return [];

  const exact = breeds.filter((b) => b.toLowerCase() === q);
  if (exact.length) return exact;

  const starts = breeds.filter((b) => b.toLowerCase().startsWith(q));
  if (starts.length) return starts;

  return breeds.filter((b) => b.toLowerCase().includes(q));
}

export function matchExactDoninoBreeds(breedQuery: string, breeds: string[]): string[] {
  const q = breedQuery.toLowerCase().trim();
  return breeds.filter((b) => b.toLowerCase() === q);
}

export type DoninoDogHit = {
  name: string;
  breed: string;
  sex?: string;
  /** Best personal speed record (max km/h). */
  speed?: SpeedRecord | SpeedRecordExtended;
  /** Best personal 350m record (min seconds). */
  coursing?: CoursingRecord;
  /** Full speed timeline by date (like site «История»), newest first. */
  speedTimeline?: Array<SpeedRecord | SpeedRecordExtended>;
  /** Full 350m timeline by date, newest first. */
  coursingTimeline?: CoursingRecord[];
};

export function getSpeedKmh(record: SpeedRecord | SpeedRecordExtended): number {
  const ext = record as SpeedRecordExtended;
  return Number(ext.speed_km_h || ext.speed_kmh || ext.speed || ext.max_speed || ext.speed_value || 0);
}

function dogKey(name: string, breed: string) {
  return `${name}\0${breed}`;
}

function doninoDateKey(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toISOString().slice(0, 10);
}

function compareDoninoDatesDesc(a: string | undefined, b: string | undefined): number {
  return new Date(b || 0).getTime() - new Date(a || 0).getTime();
}

/** Like site uniqueSpeedRecords: one row per date, prefer faster, newest first. */
export function buildDoninoSpeedTimeline(records: SpeedRecord[]): SpeedRecord[] {
  const byDate = new Map<string, SpeedRecord>();
  for (const record of records) {
    const key = doninoDateKey(record.date);
    if (!key) continue;
    const existing = byDate.get(key);
    if (!existing || getSpeedKmh(record) > getSpeedKmh(existing)) {
      byDate.set(key, record);
    }
  }
  return [...byDate.values()].sort((a, b) => compareDoninoDatesDesc(a.date, b.date));
}

/** Like site coursing timeline: current rows + nested history, one per date, prefer faster (lower sec). */
export function buildDoninoCoursingTimeline(records: CoursingRecord[]): CoursingRecord[] {
  const points: CoursingRecord[] = [];
  for (const record of records) {
    points.push(record);
    for (const entry of record.history ?? []) {
      points.push({
        name: record.name,
        breed: record.breed,
        time_seconds: entry.time_seconds,
        date: entry.date,
      });
    }
  }

  const byDate = new Map<string, CoursingRecord>();
  for (const record of points) {
    const key = doninoDateKey(record.date);
    if (!key) continue;
    const existing = byDate.get(key);
    if (!existing || record.time_seconds < existing.time_seconds) {
      byDate.set(key, record);
    }
  }
  return [...byDate.values()].sort((a, b) => compareDoninoDatesDesc(a.date, b.date));
}

/** One best speed row per dog (highest km/h), like the site. */
export function bestDoninoSpeedRecords(speed: SpeedRecord[], limit?: number): SpeedRecord[] {
  const sorted = [...speed].sort((a, b) => getSpeedKmh(b) - getSpeedKmh(a));
  const seen = new Set<string>();
  const out: SpeedRecord[] = [];
  for (const record of sorted) {
    const key = dogKey(record.name, record.breed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(record);
    if (limit != null && out.length >= limit) break;
  }
  return out;
}

/** One best 350m row per dog (lowest seconds), like the site. */
export function bestDoninoCoursingRecords(coursing: CoursingRecord[], limit?: number): CoursingRecord[] {
  const sorted = [...coursing].sort((a, b) => a.time_seconds - b.time_seconds);
  const seen = new Set<string>();
  const out: CoursingRecord[] = [];
  for (const record of sorted) {
    const key = dogKey(record.name, record.breed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(record);
    if (limit != null && out.length >= limit) break;
  }
  return out;
}

export function findDoninoDogsByName(
  nameQuery: string,
  speed: SpeedRecord[],
  coursing: CoursingRecord[],
  limit = 5
): DoninoDogHit[] {
  const q = nameQuery.toLowerCase().trim();
  if (q.length < 2) return [];

  type Acc = DoninoDogHit & {
    speedRows: SpeedRecord[];
    coursingRows: CoursingRecord[];
  };
  const map = new Map<string, Acc>();

  for (const record of speed) {
    if (!record.name?.toLowerCase().includes(q)) continue;
    const key = dogKey(record.name, record.breed);
    const hit = map.get(key) ?? {
      name: record.name,
      breed: record.breed,
      speedRows: [],
      coursingRows: [],
    };
    hit.speedRows.push(record);
    if (record.sex) hit.sex = record.sex;
    map.set(key, hit);
  }

  for (const record of coursing) {
    if (!record.name?.toLowerCase().includes(q)) continue;
    const key = dogKey(record.name, record.breed);
    const hit = map.get(key) ?? {
      name: record.name,
      breed: record.breed,
      speedRows: [],
      coursingRows: [],
    };
    hit.coursingRows.push(record);
    map.set(key, hit);
  }

  const rank = (dog: DoninoDogHit) => {
    const name = dog.name.toLowerCase();
    if (name === q) return 0;
    if (name.startsWith(q)) return 1;
    return 2;
  };

  return [...map.values()]
    .map((hit) => {
      const speedTimeline = buildDoninoSpeedTimeline(hit.speedRows);
      const coursingTimeline = buildDoninoCoursingTimeline(hit.coursingRows);
      const speed =
        speedTimeline.length > 0
          ? [...speedTimeline].sort((a, b) => getSpeedKmh(b) - getSpeedKmh(a))[0]
          : undefined;
      const coursing =
        coursingTimeline.length > 0
          ? [...coursingTimeline].sort((a, b) => a.time_seconds - b.time_seconds)[0]
          : undefined;
      return {
        name: hit.name,
        breed: hit.breed,
        sex: hit.sex || speed?.sex,
        speed,
        coursing,
        speedTimeline,
        coursingTimeline,
      };
    })
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'ru'))
    .slice(0, limit);
}

export function formatDoninoDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDoninoSex(sex: string | undefined): string {
  if (!sex) return '';
  const s = sex.trim().toUpperCase();
  if (s === 'С' || s === 'F' || s === 'СУКА') return 'сука';
  if (s === 'К' || s === 'M' || s === 'КОБЕЛЬ') return 'кобель';
  return sex;
}

function doninoDogSiteUrl(name: string, breed: string) {
  return `${SITE_URL}/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`;
}

function doninoSiteUrl(breeds?: string[]) {
  if (!breeds?.length) return DONINO_SITE;
  return `${DONINO_SITE}?breeds=${encodeURIComponent(breeds.join(','))}`;
}

function doninoMarkup(breeds?: string[]) {
  return new InlineKeyboard()
    .url('Открыть Курсинг Донино', RUNNINGDOG_URL)
    .row()
    .url('Открыть в боте', botStartLink('donino'))
    .url('Открыть на сайте', doninoSiteUrl(breeds));
}

function doninoDogMarkup(name: string, breed: string, screenshotUrl?: string) {
  const keyboard = new InlineKeyboard()
    .url('Открыть Курсинг Донино', RUNNINGDOG_URL)
    .row()
    .url('Открыть в боте', botStartLink('donino'))
    .url('Открыть на сайте', doninoDogSiteUrl(name, breed));

  if (screenshotUrl) {
    keyboard.row().url('Открыть скриншот', screenshotUrl);
  }

  return keyboard;
}

export function buildInlineDogResult(
  dogData: DogData,
  options: { shows?: ShowDogCardSummary | null; isFavorite?: boolean } = {},
) {
  const dog = dogData.dog;
  const name = dog.name_lat || dog.name_ru || 'N/A';
  const breed = dog.breed || 'N/A';
  const c = dog.coursing_stats;
  const r = dog.racing_stats;
  const shows = options.shows;

  const descriptionParts: string[] = [];
  if ((c.total_starts ?? 0) > 0) descriptionParts.push(`Курсинг: ${c.total_starts}`);
  if ((r.total_starts ?? 0) > 0) descriptionParts.push(`Бега: ${r.total_starts}`);
  if (shows && shows.total_shows > 0) descriptionParts.push(`Выставки: ${shows.total_shows}`);

  return {
    type: 'article' as const,
    id: dog.id.toString(),
    title: `${name} (${breed})`,
    description: descriptionParts.join(' · ') || 'Нет участий',
    input_message_content: {
      message_text: formatDogCard(dogData, { shows }),
      parse_mode: 'HTML' as const,
      link_preview_options: { is_disabled: true },
    },
    reply_markup: getInlineDogCardKeyboard(dog.id.toString(), {
      isFavorite: options.isFavorite,
    }),
  };
}

export function buildDoninoNotFoundResult(term: string) {
  return [{
    type: 'article' as const,
    id: 'donino_not_found',
    title: 'Ничего не найдено',
    description: `«${term}» — нет в рекордах Донино`,
    input_message_content: {
      message_text:
        `<b>Ничего не найдено</b>\n\n` +
        `По запросу «${term}» нет рекордов Донино.\n\n` +
        `<i>Примеры:\n` +
        `донино &lt;порода&gt; — донино салюки\n` +
        `донино &lt;кличка&gt; — донино тайга</i>`,
      parse_mode: 'HTML' as const,
    },
    reply_markup: doninoMarkup(),
  }];
}

/** @deprecated use buildDoninoNotFoundResult */
export function buildDoninoBreedNotFoundResult(breedQuery: string) {
  return buildDoninoNotFoundResult(breedQuery);
}

export function buildInlineDoninoDogResults(dogs: DoninoDogHit[]) {
  return dogs.map((dog, index) => {
    const parts: string[] = [];
    if (dog.speed) parts.push(`${getSpeedKmh(dog.speed)} км/ч`);
    if (dog.coursing) parts.push(`${dog.coursing.time_seconds} сек`);
    const stats = parts.join(' · ') || 'нет данных';

    const sexLabel = formatDoninoSex(dog.sex || dog.speed?.sex);
    const headerBits = [dog.breed, sexLabel].filter(Boolean).join(' · ');

    const blocks: string[] = [];
    if (dog.speed) {
      const meta = [
        formatDoninoDate(dog.speed.date),
        dog.speed.track_type,
        dog.speed.status === 'improved' ? 'обновлён' : '',
      ].filter(Boolean).join(' · ');
      const timeline = dog.speedTimeline ?? [];
      const historyLines =
        timeline.length > 1
          ? timeline.map((r) => `${formatDoninoDate(r.date)} — ${getSpeedKmh(r)} км/ч`).join('\n')
          : '';
      blocks.push(
        `⏱ Скорость: <b>${getSpeedKmh(dog.speed)} км/ч</b>` +
        (meta ? `\n${meta}` : '') +
        (historyLines ? `\n${historyLines}` : '')
      );
    }
    if (dog.coursing) {
      const meta = [
        formatDoninoDate(dog.coursing.date),
        dog.coursing.status === 'improved' ? 'обновлён' : '',
      ].filter(Boolean).join(' · ');
      const timeline = dog.coursingTimeline ?? [];
      const historyLines =
        timeline.length > 1
          ? timeline.map((r) => `${formatDoninoDate(r.date)} — ${r.time_seconds} сек`).join('\n')
          : '';
      blocks.push(
        `🐕 Рейсинг 350м: <b>${dog.coursing.time_seconds} сек</b>` +
        (meta ? `\n${meta}` : '') +
        (historyLines ? `\n${historyLines}` : '')
      );
    }

    return {
      type: 'article' as const,
      id: `donino_dog_v5:${dog.name}:${dog.breed}:${index}`,
      title: `${dog.name} (${dog.breed})`,
      description: stats,
      input_message_content: {
        message_text:
          `<b>${dog.name}</b>${headerBits ? ` (${headerBits})` : ''}\n\n` +
          `${blocks.join('\n\n')}`,
        parse_mode: 'HTML' as const,
      },
      reply_markup: doninoDogMarkup(dog.name, dog.breed, dog.speed?.screenshot_url),
    };
  });
}

export function buildInlineDoninoResults(
  speed: SpeedRecord[],
  coursing: CoursingRecord[],
  options?: {
    limit?: number;
    breedLabel?: string;
    siteBreeds?: string[];
    only?: DoninoDiscipline;
  }
) {
  const limit = options?.limit ?? 10;
  const siteBreeds = options?.siteBreeds;
  const idSuffix = options?.breedLabel ? `:${options.breedLabel}` : '';
  const only = options?.only;

  const topSpeed = only === 'racing' ? [] : bestDoninoSpeedRecords(speed, limit);
  const topCoursing = only === 'speed' ? [] : bestDoninoCoursingRecords(coursing, limit);

  const speedLines = topSpeed
    .map((r, i) => `${i + 1}. ${r.name} — ${getSpeedKmh(r)} км/ч (${r.breed})`)
    .join('\n');

  const coursingLines = topCoursing
    .map((r, i) => `${i + 1}. ${r.name} — ${r.time_seconds} сек (${r.breed})`)
    .join('\n');

  const results = [];

  if (topSpeed.length > 0) {
    const leader = topSpeed[0];
    const title = options?.breedLabel
      ? `Рекорд скорости | Курсинг · ${options.breedLabel}`
      : 'Рекорд скорости | Курсинг';
    const description = `${leader.name} — ${getSpeedKmh(leader)} км/ч (${leader.breed})`;
    results.push({
      type: 'article' as const,
      id: `donino_speed_v8${idSuffix}${only ? ':only' : ''}`,
      title,
      description,
      input_message_content: {
        message_text: `<b>${title}</b>\n\n${speedLines}`,
        parse_mode: 'HTML' as const,
      },
      reply_markup: doninoMarkup(siteBreeds),
    });
  }

  if (topCoursing.length > 0) {
    const leader = topCoursing[0];
    const title = options?.breedLabel
      ? `Рекорд времени | Рейсинг 350м · ${options.breedLabel}`
      : 'Рекорд времени | Рейсинг 350м';
    const description = `${leader.name} — ${leader.time_seconds} сек (${leader.breed})`;
    results.push({
      type: 'article' as const,
      id: `donino_coursing_v8${idSuffix}${only ? ':only' : ''}`,
      title,
      description,
      input_message_content: {
        message_text: `<b>${title}</b>\n\n${coursingLines}`,
        parse_mode: 'HTML' as const,
      },
      reply_markup: doninoMarkup(siteBreeds),
    });
  }

  return results;
}

/** Chat-mode text for a Donino top list (same body as inline). */
export function formatDoninoTopChatText(
  speed: SpeedRecord[],
  coursing: CoursingRecord[],
  options?: {
    limit?: number;
    breedLabel?: string;
    siteBreeds?: string[];
    only?: DoninoDiscipline;
  }
): string {
  const results = buildInlineDoninoResults(speed, coursing, {
    ...options,
    only: options?.only ?? 'speed',
  });
  return results[0]?.input_message_content.message_text ?? 'Нет данных по рекордам Донино';
}

/** Chat-mode text for one or more Donino dog cards (same body as inline). */
export function formatDoninoDogChatText(dogs: DoninoDogHit[]): string {
  const results = buildInlineDoninoDogResults(dogs);
  if (results.length === 0) return 'Нет данных по рекордам Донино';
  return results.map((r) => r.input_message_content.message_text).join('\n\n————\n\n');
}
