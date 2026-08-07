import type { DogData } from '../../types';

const SITE_URL = 'https://coursing-stats.ru';

/**
 * Краткая карточка собаки (aggregates only — без списка стартов).
 * Медали курсинга и бегов раздельно (как на сайте: не мерджить в одну кучу).
 */
export function formatDogCard(dogData: DogData): string {
  const dog = dogData.dog;
  const name = dog.name_lat || dog.name_ru || 'N/A';
  const breed = dog.breed || 'N/A';
  const c = dog.coursing_stats;
  const r = dog.racing_stats;

  const bestScore = c.best_score != null ? String(c.best_score) : '—';
  const bestSpeed = r.best_speed != null ? `${r.best_speed} км/ч` : '—';

  let text = `<b>${name}</b> (${breed})\n\n`;

  text += `<b>Курсинг</b>\n`;
  text += `• Стартов: ${c.total_starts}, лучший балл: ${bestScore}\n`;
  text += `• Медали: ${c.gold}🥇 ${c.silver}🥈 ${c.bronze}🥉\n\n`;

  text += `<b>Бега борзых</b>\n`;
  text += `• Стартов: ${r.total_starts}, лучшая скорость: ${bestSpeed}\n`;
  text += `• Медали: ${r.gold}🥇 ${r.silver}🥈 ${r.bronze}🥉\n`;

  if (dog.shows_stats) {
    const s = dog.shows_stats;
    text += `\n<b>Выставки</b>\n`;
    text += `• Стартов: ${s.total_starts}, очков: ${s.points ?? '—'}\n`;
  }

  text += `\n<a href="${SITE_URL}/dog/${dog.id}">🌐 Полная история на сайте</a>`;
  return text.trim();
}
