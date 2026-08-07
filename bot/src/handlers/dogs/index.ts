import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getDogCardKeyboard } from '../../keyboards';
import { validateDogId } from '../utils/validators';
import { Dog } from '../../types';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики профилей собак
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками профилей собак
 */
export function createDogs(api: CoursingStatsAPI, cache?: KVNamespace) {
  const dogs = new Composer();

  // Dog selection via inline keyboard
  dogs.callbackQuery(/^dog:(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    
    // Validate dog ID
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
      
      const dog = dogData.dog;
      const text = `
<b>${dog.name_lat || dog.name_ru || 'N/A'}</b> (${dog.breed || 'N/A'})

<b>Статистика:</b>
• Курсинг: ${dog.coursing_stats.total_starts} стартов, лучш. ${dog.coursing_stats.best_score}
• Бега: ${dog.racing_stats.total_starts} стартов, лучш. ${dog.racing_stats.best_speed} км/ч
• Медали: ${dog.coursing_stats.gold + dog.racing_stats.gold}🥇 ${dog.coursing_stats.silver + dog.racing_stats.silver}🥈 ${dog.coursing_stats.bronze + dog.racing_stats.bronze}🥉
${dog.shows_stats ? `• Выставки: ${dog.shows_stats.total_starts} стартов, ${dog.shows_stats.points} очков` : ''}

<a href="https://coursing-stats.ru/dog/${dog.id}">🌐 Подробности на сайте</a>
      `.trim();
      
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: getDogCardKeyboard(dog.id.toString())
      });
    } catch (error) {
      await ctx.editMessageText(
        '❌ Ошибка при загрузке профиля собаки.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
    }
  });

  // Add to favorites
  dogs.callbackQuery(/^add_favorite:(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    const userId = ctx.from?.id.toString();
    
    if (!userId || !cache) {
      await ctx.answerCallbackQuery('Ошибка при добавлении в избранное');
      return;
    }
    
    // Validate dog ID
    if (!validateDogId(dogId)) {
      await ctx.answerCallbackQuery('Неверный ID собаки');
      return;
    }
    
    const favoritesKey = `favorites:${userId}`;
    const favoritesData = await cache.get(favoritesKey);
    const dogIds = favoritesData ? JSON.parse(favoritesData) as number[] : [];
    
    if (!dogIds.includes(parseInt(dogId))) {
      dogIds.push(parseInt(dogId));
      await cache.put(favoritesKey, JSON.stringify(dogIds), { expirationTtl: 86400 * 30 }); // 30 days
      await ctx.answerCallbackQuery('Добавлено в избранное');
    } else {
      await ctx.answerCallbackQuery('Уже в избранном');
    }
  });

  // Remove from favorites
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
      await cache.put(favoritesKey, JSON.stringify(dogIds), { expirationTtl: 86400 * 30 }); // 30 days
      await ctx.answerCallbackQuery('Удалено из избранного');
    } else {
      await ctx.answerCallbackQuery('Не в избранном');
    }
  });

  return dogs;
}
