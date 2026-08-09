import type { CoursingStatsAPI } from '../../api';
import { getDogCardKeyboard } from '../../keyboards';
import type { DogData } from '../../types';
import type { KVNamespace } from '../context';
import { formatDogCard } from './dogCard';

export async function isDogFavorite(
  cache: KVNamespace | undefined,
  userId: string | undefined,
  dogId: string | number,
): Promise<boolean> {
  if (!cache || !userId) return false;
  const favoritesData = await cache.get(`favorites:${userId}`);
  if (!favoritesData) return false;
  try {
    const dogIds = JSON.parse(favoritesData) as number[];
    return dogIds.includes(Number(dogId));
  } catch {
    return false;
  }
}

/** Текст карточки + клавиатура с избранным и выставками. */
export async function buildDogCardPresentation(
  api: CoursingStatsAPI,
  dogData: DogData,
  options: {
    cache?: KVNamespace;
    userId?: string;
    backCallback?: string;
  } = {},
) {
  const dogId = dogData.dog.id.toString();
  const [shows, isFavorite] = await Promise.all([
    api.getShowSummaryForCompetitionDog(dogData.dog.id),
    isDogFavorite(options.cache, options.userId, dogId),
  ]);

  return {
    text: formatDogCard(dogData, { shows }),
    reply_markup: getDogCardKeyboard(dogId, options.backCallback ?? 'main_menu', { isFavorite }),
  };
}
