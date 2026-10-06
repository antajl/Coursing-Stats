import type { CoursingStatsAPI } from '../../api';
import { getDogCardKeyboard, getNavigationButtons } from '../../keyboards';
import type { DogData } from '../../types';
import type { KVNamespace } from '../context';
import { formatDogCard } from './dogCard';
import { validateDogId } from './validators';
import { safeEditOrReply } from '../commands';

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

  const dogName = dogData.dog.name_ru || dogData.dog.name_lat;

  return {
    text: formatDogCard(dogData, { shows }),
    reply_markup: getDogCardKeyboard(dogId, options.backCallback ?? 'main_menu', { isFavorite, dogName }),
  };
}

/**
 * Единый обработчик отображения карточки собаки по ID
 */
export async function handleDogIdSearch(
  ctx: any,
  dogId: string,
  api: CoursingStatsAPI,
  cache?: KVNamespace,
) {
  if (!validateDogId(dogId)) {
    await safeEditOrReply(ctx, '❌ Неверный формат ID собаки.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    }, cache);
    return;
  }

  try {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing').catch(() => {});
    }

    const dogData = await api.getDogById(dogId);

    if (!dogData) {
      await safeEditOrReply(ctx, '❌ Собака не найдена. Попробуйте другой ID или поиск по кличке.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }

    const card = await buildDogCardPresentation(api, dogData, {
      cache,
      userId: ctx.from?.id?.toString(),
    });

    await safeEditOrReply(ctx, card.text, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: card.reply_markup,
    }, cache);
  } catch (error) {
    await safeEditOrReply(ctx, '❌ Ошибка при загрузке профиля собаки. Попробуйте позже.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    }, cache);
  }
}

