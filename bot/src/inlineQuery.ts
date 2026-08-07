import { InlineKeyboard } from 'grammy';
import { botStartLink } from './constants';
import type { CoursingRecord, Dog, SpeedRecord, SpeedRecordExtended } from './types';

const SITE_URL = 'https://coursing-stats.ru';
const DONINO_SITE = `${SITE_URL}/speed-records`;

/** Exact inline phrases that open Donino records (not dog search). Case-insensitive. */
export const DONINO_INLINE_KEYWORDS = new Set(['донино', 'donino']);

export function parseDoninoInlineQuery(query: string): { breedQuery?: string } | null {
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  if (DONINO_INLINE_KEYWORDS.has(normalized)) {
    return {};
  }

  for (const keyword of DONINO_INLINE_KEYWORDS) {
    if (normalized.startsWith(`${keyword} `)) {
      const breedQuery = trimmed.slice(keyword.length).trim();
      if (breedQuery.length >= 2) {
        return { breedQuery };
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

export function getSpeedKmh(record: SpeedRecord | SpeedRecordExtended): number {
  const ext = record as SpeedRecordExtended;
  return ext.speed_km_h || ext.speed_kmh || ext.speed || ext.max_speed || ext.speed_value || 0;
}

function doninoSiteUrl(breeds?: string[]) {
  if (!breeds?.length) return DONINO_SITE;
  return `${DONINO_SITE}?breeds=${encodeURIComponent(breeds.join(','))}`;
}

function doninoMarkup(breeds?: string[]) {
  return new InlineKeyboard()
    .url('🤖 Открыть в боте', botStartLink('donino'))
    .url('🌐 На сайте', doninoSiteUrl(breeds));
}

export function buildInlineDogResult(dog: Dog) {
  const name = dog.name_lat || dog.name_ru || 'N/A';
  const breed = dog.breed || 'N/A';
  const starts = dog.competition_count || 0;

  return {
    type: 'article' as const,
    id: dog.id.toString(),
    title: `${name} (${breed})`,
    description: `Стартов: ${starts}`,
    input_message_content: {
      message_text:
        `<b>${name}</b> (${breed})\n` +
        `Стартов: ${starts}\n\n` +
        `<i>Нажмите «Открыть в боте» для карточки и избранного</i>`,
      parse_mode: 'HTML' as const,
    },
    reply_markup: new InlineKeyboard()
      .url('🤖 Открыть в боте', botStartLink(`dog_${dog.id}`))
      .url('🌐 На сайте', `${SITE_URL}/dog/${dog.id}`),
  };
}

export function buildDoninoBreedNotFoundResult(breedQuery: string) {
  return [{
    type: 'article' as const,
    id: 'donino_breed_not_found',
    title: 'Порода не найдена',
    description: `«${breedQuery}» — нет в рекордах Донино`,
    input_message_content: {
      message_text:
        `<b>Порода не найдена</b>\n\n` +
        `По запросу «${breedQuery}» нет рекордов Донино.\n\n` +
        `<i>Пример: @coursing_stats_bot донино салюки</i>`,
      parse_mode: 'HTML' as const,
    },
    reply_markup: doninoMarkup(),
  }];
}

export function buildInlineDoninoResults(
  speed: SpeedRecord[],
  coursing: CoursingRecord[],
  options?: { limit?: number; breedLabel?: string; siteBreeds?: string[] }
) {
  const limit = options?.limit ?? 10;
  const breedSuffix = options?.breedLabel ? ` · ${options.breedLabel}` : '';
  const siteBreeds = options?.siteBreeds;
  const idSuffix = options?.breedLabel ? `:${options.breedLabel}` : '';

  const topSpeed = speed.slice(0, limit);
  const topCoursing = coursing.slice(0, limit);

  const speedLines = topSpeed
    .map((r, i) => `${i + 1}. ${r.name} — ${getSpeedKmh(r)} км/ч`)
    .join('\n');

  const coursingLines = topCoursing
    .map((r, i) => `${i + 1}. ${r.name} — ${r.time_seconds} сек`)
    .join('\n');

  const results = [];

  if (topSpeed.length > 0) {
    const leader = topSpeed[0];
    const title = `Личные рекорды скорости Курсинг в Донино${breedSuffix}`;
    results.push({
      type: 'article' as const,
      id: `donino_speed${idSuffix}`,
      title: `⏱ ${title}`,
      description: `Топ: ${leader.name} — ${getSpeedKmh(leader)} км/ч`,
      input_message_content: {
        message_text:
          `<b>⏱ ${title}</b>\n\n` +
          `${speedLines}\n\n` +
          `<i>Замеры скорости, км/ч</i>`,
        parse_mode: 'HTML' as const,
      },
      reply_markup: doninoMarkup(siteBreeds),
    });
  }

  if (topCoursing.length > 0) {
    const leader = topCoursing[0];
    const title = `Личные рекорды рейсинг Донино 350м${breedSuffix}`;
    results.push({
      type: 'article' as const,
      id: `donino_coursing${idSuffix}`,
      title: `🐕 ${title}`,
      description: `Топ: ${leader.name} — ${leader.time_seconds} сек`,
      input_message_content: {
        message_text:
          `<b>🐕 ${title}</b>\n\n` +
          `${coursingLines}\n\n` +
          `<i>Прямая 350м, секунды</i>`,
        parse_mode: 'HTML' as const,
      },
      reply_markup: doninoMarkup(siteBreeds),
    });
  }

  return results;
}
