import type { CoursingStatsAPI } from '../../api';
import { getDogCardKeyboard, getNavigationButtons } from '../../keyboards';
import type { DogData } from '../../types';
import type { KVNamespace } from '../context';
import { formatDogCard } from './dogCard';
import { validateDogId } from './validators';

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
    await ctx.reply('❌ Неверный формат ID собаки.');
    return;
  }

  try {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }

    const dogData = await api.getDogById(dogId);

    if (!dogData) {
      await ctx.reply('❌ Собака не найдена. Попробуйте другой ID или поиск по кличке.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      });
      return;
    }

    const card = await buildDogCardPresentation(api, dogData, {
      cache,
      userId: ctx.from?.id.toString(),
    });

    await ctx.reply(card.text, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: card.reply_markup,
    });
  } catch (error) {
    await ctx.reply('❌ Ошибка при загрузке профиля собаки. Попробуйте позже.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    });
  }
}

