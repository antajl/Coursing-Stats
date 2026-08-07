import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getDogSelectionKeyboard, getCompareKeyboard } from '../../keyboards';
import { validateDogId } from '../utils/validators';
import { createCompareStateHandlers } from '../middleware';
import { Dog } from '../../types';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики сравнения собак
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для хранения состояния сравнения
 * @returns экземпляр Composer с обработчиками сравнения
 */
export function createComparison(api: CoursingStatsAPI, cache?: KVNamespace) {
  const comparison = new Composer();
  const { setCompareState, getCompareState, clearCompareState } = createCompareStateHandlers(cache);

  // Start comparison
  comparison.callbackQuery(/^compare_start_(\d+)$/, async (ctx) => {
    const dogId = ctx.match![1];
    const userId = ctx.from?.id.toString();
    
    // Validate dog ID
    if (!validateDogId(dogId)) {
      await ctx.answerCallbackQuery('Неверный ID собаки');
      return;
    }
    
    if (userId) {
      await setCompareState(userId, dogId);
    }
    
    await ctx.answerCallbackQuery('Первая собака выбрана. Введите кличку второй собаки для сравнения.');
    await ctx.reply('📊 Режим сравнения включен. Введите кличку второй собаки:');
  });

  // Cancel comparison
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

  // Select second dog for comparison
  comparison.callbackQuery(/^compare_select_(\d+)$/, async (ctx) => {
    const secondDogId = ctx.match![1];
    const userId = ctx.from?.id.toString();
    
    // Validate dog ID
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
    
    // Get both dogs profiles
    try {
      const [dog1, dog2] = await Promise.all([
        api.getDogById(firstDogId),
        api.getDogById(secondDogId)
      ]);
      
      if (!dog1 || !dog2) {
        await ctx.answerCallbackQuery('Не удалось загрузить данные собак');
        return;
      }
      
      // Generate comparison text
      const text = `
<b>Сравнение собак</b>

<b>Собака 1:</b>
${dog1.dog.name_lat || dog1.dog.name_ru || 'N/A'} (${dog1.dog.breed || 'N/A'})
• Курсинг: ${dog1.dog.coursing_stats.total_starts} стартов, лучш. ${dog1.dog.coursing_stats.best_score}
• Бега: ${dog1.dog.racing_stats.total_starts} стартов, лучш. ${dog1.dog.racing_stats.best_speed} км/ч
• Медали: ${dog1.dog.coursing_stats.gold + dog1.dog.racing_stats.gold}🥇 ${dog1.dog.coursing_stats.silver + dog1.dog.racing_stats.silver}🥈 ${dog1.dog.coursing_stats.bronze + dog1.dog.racing_stats.bronze}🥉

<b>Собака 2:</b>
${dog2.dog.name_lat || dog2.dog.name_ru || 'N/A'} (${dog2.dog.breed || 'N/A'})
• Курсинг: ${dog2.dog.coursing_stats.total_starts} стартов, лучш. ${dog2.dog.coursing_stats.best_score}
• Бега: ${dog2.dog.racing_stats.total_starts} стартов, лучш. ${dog2.dog.racing_stats.best_speed} км/ч
• Медали: ${dog2.dog.coursing_stats.gold + dog2.dog.racing_stats.gold}🥇 ${dog2.dog.coursing_stats.silver + dog2.dog.racing_stats.silver}🥈 ${dog2.dog.coursing_stats.bronze + dog2.dog.racing_stats.bronze}🥉
      `.trim();
      
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: getCompareKeyboard(firstDogId)
      });
      
      // Clear comparison state after showing result
      await clearCompareState(userId);
      
    } catch (error) {
      await ctx.answerCallbackQuery('Ошибка при загрузке данных');
    }
  });

  return comparison;
}
