import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons } from '../../keyboards';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики избранного собак
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для хранения избранного
 * @returns экземпляр Composer с обработчиками избранного
 */
export function createFavorites(api: CoursingStatsAPI, cache?: KVNamespace) {
  const favorites = new Composer();

  // Favorites main menu
  favorites.callbackQuery('favorites', async (ctx) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    
    if (!cache) {
      await ctx.editMessageText(
        'Функция избранного временно недоступна.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }
    
    const favoritesKey = `favorites:${userId}`;
    const favoritesData = await cache.get(favoritesKey);
    
    if (!favoritesData) {
      await ctx.editMessageText(
        'У вас пока нет избранных собак.\n\nДля добавления используйте кнопку ❤️ в профиле собаки.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }
    
    const dogIds = JSON.parse(favoritesData) as number[];
    
    if (dogIds.length === 0) {
      await ctx.editMessageText(
        'У вас пока нет избранных собак.\n\nДля добавления используйте кнопку ❤️ в профиле собаки.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }
    
    await ctx.editMessageText('<b>Загрузка избранных собак...</b>', { parse_mode: 'HTML' });
    
    try {
      const dogs = await Promise.all(
        dogIds.map(id => api.getDogById(id.toString()))
      );
      
      const validDogs = dogs.filter(d => d !== null);
      
      if (validDogs.length === 0) {
        await ctx.editMessageText(
          'Не удалось загрузить данные избранных собак.',
          { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
        );
        return;
      }
      
      let text = `<b>Избранные собаки (${validDogs.length})</b>\n\n`;
      
      validDogs.forEach((dogData, index) => {
        const dog = dogData.dog;
        const name = dog.name_lat || dog.name_ru || 'N/A';
        const breed = dog.breed || 'N/A';
        text += `${index + 1}. ${name} (${breed})\n`;
      });
      
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
      });
    } catch (error) {
      await ctx.editMessageText(
        'Ошибка при загрузке избранных собак.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
    }
  });

  return favorites;
}
