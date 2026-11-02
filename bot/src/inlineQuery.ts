import { getInlineDogCardKeyboard } from './keyboards';
import { formatDogCard, type ShowDogCardSummary } from './handlers/utils/dogCard';
import type { DogData } from './types';
import {
  DONINO_INLINE_KEYWORDS,
  DONINO_SPEED_KEYWORDS,
  DONINO_RACING_KEYWORDS,
  type DoninoDiscipline,
  type DoninoDogHit,
  parseDoninoDiscipline,
  parseDoninoInlineQuery,
  isDoninoInlineQuery,
  collectDoninoBreeds,
  matchDoninoBreeds,
  matchExactDoninoBreeds,
  getSpeedKmh,
  buildDoninoSpeedTimeline,
  buildDoninoCoursingTimeline,
  bestDoninoSpeedRecords,
  bestDoninoCoursingRecords,
  findDoninoDogsByName,
  formatDoninoDate,
  formatDoninoSex,
  doninoMarkup,
  doninoDogMarkup,
  buildDoninoNotFoundResult,
  buildDoninoBreedNotFoundResult,
  buildInlineDoninoDogResults,
  buildInlineDoninoResults,
  formatDoninoTopChatText,
  formatDoninoDogChatText,
} from './inlineDonino';

export {
  DONINO_INLINE_KEYWORDS,
  DONINO_SPEED_KEYWORDS,
  DONINO_RACING_KEYWORDS,
  type DoninoDiscipline,
  type DoninoDogHit,
  parseDoninoDiscipline,
  parseDoninoInlineQuery,
  isDoninoInlineQuery,
  collectDoninoBreeds,
  matchDoninoBreeds,
  matchExactDoninoBreeds,
  getSpeedKmh,
  buildDoninoSpeedTimeline,
  buildDoninoCoursingTimeline,
  bestDoninoSpeedRecords,
  bestDoninoCoursingRecords,
  findDoninoDogsByName,
  formatDoninoDate,
  formatDoninoSex,
  doninoMarkup,
  doninoDogMarkup,
  buildDoninoNotFoundResult,
  buildDoninoBreedNotFoundResult,
  buildInlineDoninoDogResults,
  buildInlineDoninoResults,
  formatDoninoTopChatText,
  formatDoninoDogChatText,
};

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
  const medals: string[] = [];
  if (c.gold > 0) medals.push(`🥇${c.gold}`);
  if (c.silver > 0) medals.push(`🥈${c.silver}`);
  if (c.bronze > 0) medals.push(`🥉${c.bronze}`);
  if (r.gold > 0) medals.push(`🥇${r.gold}`);
  if (r.silver > 0) medals.push(`🥈${r.silver}`);
  if (r.bronze > 0) medals.push(`🥉${r.bronze}`);

  if (medals.length > 0) {
    descriptionParts.push(medals.join(' '));
  }
  if ((c.total_starts ?? 0) > 0) {
    descriptionParts.push(`Курсинг: ${c.total_starts}`);
  }
  if (r.best_speed != null) {
    descriptionParts.push(`${r.best_speed} км/ч`);
  } else if ((r.total_starts ?? 0) > 0) {
    descriptionParts.push(`Бега: ${r.total_starts}`);
  }
  if (shows && shows.total_shows > 0) {
    descriptionParts.push(shows.best_award ? `Выставки: ${shows.best_award}` : `Выставок: ${shows.total_shows}`);
  }

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
