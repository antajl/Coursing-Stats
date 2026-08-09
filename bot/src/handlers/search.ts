import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../api';
import { getNavigationButtons, getDogSelectionKeyboard } from '../keyboards';
import { sanitizeInput, validateDogId, validateSearchQuery } from './utils/validators';
import { getDisplayName } from './utils/helpers';
import { buildDogCardPresentation } from './utils/presentDogCard';
import { buildInlineDoninoDogResults, findDoninoDogsByName } from '../inlineQuery';
import { Dog } from '../types';
import type { KVNamespace } from './context';

/**
 * Вспомогательные функции для обработки профиля собаки
 * @param ctx - контекст Grammy (any тип для совместимости)
 * @param dogId - ID собаки для поиска
 * @param api - клиент API Coursing Stats
 * @throws {Error} при ошибке загрузки профиля собаки
 */
async function handleDogIdSearch(
  ctx: any,
  dogId: string,
  api: CoursingStatsAPI,
  cache?: KVNamespace,
) {
  // Additional validation as defense in depth
  if (!validateDogId(dogId)) {
    await ctx.reply('❌ Неверный формат ID собаки.');
    return;
  }
  
  try {
    const dogData = await api.getDogById(dogId);
    
    if (!dogData) {
      await ctx.reply('❌ Собака не найдена. Попробуйте другой ID или поиск по кличке.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
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
      reply_markup: getNavigationButtons('main_menu', 'main_menu')
    });
  }
}

/**
 * Вспомогательные функции для обработки поиска по кличке собаки
 * @param ctx - контекст Grammy (any тип для совместимости)
 * @param dogName - кличка собаки для поиска
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @throws {Error} при ошибке поиска
 */
async function handleDogNameSearch(ctx: any, dogName: string, api: CoursingStatsAPI, cache?: KVNamespace) {
  // Additional validation as defense in depth
  if (!validateSearchQuery(dogName)) {
    await ctx.reply('❌ Неверный формат запроса. Минимум 2 символа, максимум 100.');
    return;
  }
  
  // Delete user's message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Silently fail on message deletion
  }
  
  await ctx.reply(`<b>🔍 Поиск собаки: ${dogName}</b>`, { parse_mode: 'HTML' });
  
  // Prefer competition dogs; Donino is a separate domain (name+breed)
  const dogs = await api.searchDogsByName(dogName, undefined, 5);
  
  if (dogs.length > 0) {
    let text = `<b>Найдено собак: ${dogs.length}</b>\n\n`;
    
    dogs.forEach((dog: Dog, index: number) => {
      const name = getDisplayName(dog);
      text += `${index + 1}. ${name}\n`;
    });
    
    if (dogs.length === 5) {
      text += '\n<i>Показаны первые 5 результатов. Для более точного поиска введите более конкретное название.</i>';
    }
    
    text += '\n\nВыберите собаку для просмотра:';
    
    await ctx.reply(text, { 
      parse_mode: 'HTML',
      reply_markup: getDogSelectionKeyboard(dogs)
    });
    return;
  }

  const records = await api.getSpeedRecords();
  const doninoHits = findDoninoDogsByName(dogName, records.speed, records.coursing, 3);

  if (doninoHits.length > 0) {
    const cards = buildInlineDoninoDogResults(doninoHits);
    for (const card of cards) {
      await ctx.reply(card.input_message_content.message_text, {
        parse_mode: 'HTML',
        reply_markup: card.reply_markup,
      });
    }
    return;
  }
  
  await ctx.reply(
    '❌ Собаки не найдены.\n\nПопробуйте:\n• Другое написание клички\n• Введите ID собаки (число)\n• Более конкретный запрос\n• Inline: @coursing_stats_bot донино',
    { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
  );
}

/**
 * Создает функции для хранения состояния сравнения собак
 * @param cache - опциональное KV хранилище для хранения состояния
 * @returns объект с методами для управления состоянием сравнения
 */
function createCompareStateHandlers(cache?: KVNamespace) {
  async function setCompareState(userId: string, dogId: string) {
    if (!cache) return;
    await cache.put(`compare:${userId}`, dogId, { expirationTtl: 300 }); // 5 minutes
  }

  async function getCompareState(userId: string): Promise<string | null> {
    if (!cache) return null;
    const dogId = await cache.get(`compare:${userId}`);
    return dogId || null;
  }

  async function clearCompareState(userId: string) {
    if (!cache) return;
    await cache.delete(`compare:${userId}`);
  }

  return { setCompareState, getCompareState, clearCompareState };
}

/**
 * Обработчики поиска собак и режима сравнения
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками поиска
 */
export function createSearch(api: CoursingStatsAPI, cache?: KVNamespace) {
  const search = new Composer();
  const { getCompareState } = createCompareStateHandlers(cache);

  // Unified text message handler (search + comparison mode)
  search.on('message:text', async (ctx) => {
    const userId = ctx.from?.id.toString();
    const text = sanitizeInput(ctx.message.text);
    
    // Check for clear command (as text, not just slash command)
    if (text.toLowerCase() === 'clear' || text.toLowerCase() === 'очистить') {
      if (userId && cache) {
        await cache.delete(`compare:${userId}`);
      }
      await ctx.reply('Режим сравнения сброшен.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
      });
      return;
    }
    
    // Check if user is in comparison mode
    if (userId) {
      const firstDogId = await getCompareState(userId);
      if (firstDogId) {
        // Handle comparison mode
        const query = text.trim();
        if (query.length < 2) {
          await ctx.reply('Минимум 2 символа для поиска');
          return;
        }

        const statusMsg = await ctx.reply('<b>Поиск второй собаки...</b>', { parse_mode: 'HTML' });

        try {
          const dogs = await api.searchDogsByName(query, undefined, 5);

          try {
            await ctx.api.deleteMessage(ctx.chat!.id, statusMsg.message_id);
          } catch {
            // ignore delete failures
          }

          if (!dogs || dogs.length === 0) {
            await ctx.reply('Ничего не найдено. Попробуйте другой запрос.');
            return;
          }

          // Check if user selected the same dog
          if (dogs.some(d => d.id.toString() === firstDogId)) {
            await ctx.reply('Выберите другую собаку для сравнения.');
            return;
          }

          let text = `<b>Найдено собак: ${dogs.length}</b>\n\n`;
          dogs.forEach((dog: Dog, index: number) => {
            text += `${index + 1}. ${getDisplayName(dog)}\n`;
          });
          text += '\nВыберите вторую собаку:';

          await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: getDogSelectionKeyboard(dogs, 'compare'),
          });
        } catch (error) {
          try {
            await ctx.api.deleteMessage(ctx.chat!.id, statusMsg.message_id);
          } catch {
            // ignore
          }
          await ctx.reply('Ошибка при поиске. Попробуйте позже.');
        }
        return;
      }
    }
    
    // Regular search mode
    // Check if it's a dog ID (number)
    if (/^\d+$/.test(text)) {
      if (!validateDogId(text)) {
        await ctx.reply(
          '❌ Неверный формат ID собаки.\n\nID должен быть числом от 1 до 9999999999.',
          { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
        );
        return;
      }
      await handleDogIdSearch(ctx, text, api, cache);
      return;
    }
    
    // Validate minimum length for name search
    if (!validateSearchQuery(text)) {
      await ctx.reply(
        '❌ Минимальная длина запроса - 2 символа.\n\nВведите более длинное название или ID собаки для поиска.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }
    
    // Otherwise search by name
    await handleDogNameSearch(ctx, text, api, cache);
  });

  return search;
}

// Export the compare state handlers for use in other modules
export { createCompareStateHandlers };
