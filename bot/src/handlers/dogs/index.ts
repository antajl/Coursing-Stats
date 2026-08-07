import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getDogCardKeyboard } from '../../keyboards';
import { validateDogId } from '../utils/validators';
import { formatDogCard } from '../utils/dogCard';
import type { KVNamespace } from '../context';

/**
 * Обработчики профилей собак
 */
export function createDogs(api: CoursingStatsAPI, cache?: KVNamespace) {
  const dogs = new Composer();

  dogs.callbackQuery(/^dog:(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];

    if (!validateDogId(dogId)) {
      await ctx.editMessageText(
        '❌ Неверный ID собаки.\n\nПожалуйста, выберите собаку из списка.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }

    await ctx.editMessageText('<b>Загрузка профиля собаки...</b>', { parse_mode: 'HTML' });

    try {
      const dogData = await api.getDogById(dogId);

      if (!dogData) {
        await ctx.editMessageText(
          '❌ Собака не найдена.',
          { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
        );
        return;
      }

      const back = ctx.callbackQuery.message?.text?.includes('Избранные')
        ? 'favorites'
        : 'main_menu';

      await ctx.editMessageText(formatDogCard(dogData), {
        parse_mode: 'HTML',
        reply_markup: getDogCardKeyboard(dogData.dog.id.toString(), back)
      });
    } catch (error) {
      await ctx.editMessageText(
        '❌ Ошибка при загрузке профиля собаки.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
    }
  });

  dogs.callbackQuery(/^add_favorite:(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    const userId = ctx.from?.id.toString();

    if (!userId || !cache) {
      await ctx.answerCallbackQuery('Ошибка при добавлении в избранное');
      return;
    }

    if (!validateDogId(dogId)) {
      await ctx.answerCallbackQuery('Неверный ID собаки');
      return;
    }

    const favoritesKey = `favorites:${userId}`;
    const favoritesData = await cache.get(favoritesKey);
    const dogIds = favoritesData ? JSON.parse(favoritesData) as number[] : [];

    if (!dogIds.includes(parseInt(dogId))) {
      dogIds.push(parseInt(dogId));
      await cache.put(favoritesKey, JSON.stringify(dogIds), { expirationTtl: 86400 * 30 });
      await ctx.answerCallbackQuery('Добавлено в избранное');
    } else {
      await ctx.answerCallbackQuery('Уже в избранном');
    }
  });

  dogs.callbackQuery(/^remove_favorite:(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    const userId = ctx.from?.id.toString();

    if (!userId || !cache) {
      await ctx.answerCallbackQuery('Ошибка при удалении из избранного');
      return;
    }

    const favoritesKey = `favorites:${userId}`;
    const favoritesData = await cache.get(favoritesKey);
    const dogIds = favoritesData ? JSON.parse(favoritesData) as number[] : [];

    const index = dogIds.indexOf(parseInt(dogId));
    if (index > -1) {
      dogIds.splice(index, 1);
      await cache.put(favoritesKey, JSON.stringify(dogIds), { expirationTtl: 86400 * 30 });
      await ctx.answerCallbackQuery('Удалено из избранного');
    } else {
      await ctx.answerCallbackQuery('Не в избранном');
    }
  });

  return dogs;
}
