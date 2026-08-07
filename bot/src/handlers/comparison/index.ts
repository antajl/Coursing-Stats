import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getCompareKeyboard } from '../../keyboards';
import { validateDogId } from '../utils/validators';
import { formatDogCard } from '../utils/dogCard';
import { createCompareStateHandlers } from '../middleware';
import type { KVNamespace } from '../context';

export function createComparison(api: CoursingStatsAPI, cache?: KVNamespace) {
  const comparison = new Composer();
  const { setCompareState, getCompareState, clearCompareState } = createCompareStateHandlers(cache);

  comparison.callbackQuery(/^compare_start_(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    const userId = ctx.from?.id.toString();

    if (!validateDogId(dogId)) {
      await ctx.answerCallbackQuery('Неверный ID собаки');
      return;
    }

    if (userId) {
      await setCompareState(userId, dogId);
    }

    await ctx.answerCallbackQuery('Первая собака выбрана. Введите кличку второй собаки для сравнения.');
    await ctx.reply('📊 Режим сравнения включен. Введите кличку второй собаки:', {
      reply_markup: getCompareKeyboard(dogId)
    });
  });

  comparison.callbackQuery('compare_cancel', async (ctx) => {
    const userId = ctx.from?.id.toString();

    if (userId) {
      await clearCompareState(userId);
    }

    await ctx.answerCallbackQuery('Сравнение отменено');
    await ctx.editMessageText('Сравнение отменено.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu')
    });
  });

  comparison.callbackQuery(/^compare_select_(\d+)$/, async (ctx) => {
    const secondDogId = ctx.match![1];
    const userId = ctx.from?.id.toString();

    if (!validateDogId(secondDogId)) {
      await ctx.answerCallbackQuery('Неверный ID собаки');
      return;
    }

    if (!userId) return;

    const firstDogId = await getCompareState(userId);
    if (!firstDogId) {
      await ctx.answerCallbackQuery('Режим сравнения не активен');
      return;
    }

    try {
      const [dog1, dog2] = await Promise.all([
        api.getDogById(firstDogId),
        api.getDogById(secondDogId)
      ]);

      if (!dog1 || !dog2) {
        await ctx.answerCallbackQuery('Не удалось загрузить данные собак');
        return;
      }

      const text = `<b>Сравнение</b>\n\n——— Собака 1 ———\n${formatDogCard(dog1)}\n\n——— Собака 2 ———\n${formatDogCard(dog2)}`;

      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
      });

      await clearCompareState(userId);
    } catch (error) {
      await ctx.answerCallbackQuery('Ошибка при загрузке данных');
    }
  });

  return comparison;
}
