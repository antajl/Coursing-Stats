import { Rating } from '../../types';

/**
 * Возвращает отображаемое имя из рейтинга
 * Предпочитает русское имя, затем латинское, затем общее имя
 * @param rating - объект рейтинга с полями name_ru, name_lat, name
 * @returns отображаемое имя для пользователя
 */
export function getDisplayName(rating: Rating): string {
  // Prefer Russian name, fallback to Latin, then generic name
  if (rating.name_ru && !rating.name_ru.includes('/')) {
    return rating.name_ru;
  }
  if (rating.name_lat && !rating.name_lat.includes('/')) {
    return rating.name_lat;
  }
  // If both have slash, take the Russian part
  if (rating.name_ru && rating.name_ru.includes('/')) {
    return rating.name_ru.split('/')[0].trim();
  }
  if (rating.name_lat && rating.name_lat.includes('/')) {
    return rating.name_lat.split('/')[0].trim();
  }
  return rating.name || 'N/A';
}
