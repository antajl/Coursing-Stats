import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../api';
import { getNavigationButtons, getDogSelectionKeyboard } from '../keyboards';
import { sanitizeInput, validateDogId, validateSearchQuery } from './utils/validators';
import { getDisplayName } from './utils/helpers';
import { buildDogCardPresentation, handleDogIdSearch } from './utils/presentDogCard';
import { buildInlineDoninoDogResults, findDoninoDogsByName } from '../inlineQuery';
import { createCompareStateHandlers } from './middleware';
import { safeEditOrReply } from './commands';
import { Dog } from '../types';
import type { KVNamespace } from './context';

/**
 * Обработка поиска по кличке собаки в едином окне
 * @param ctx - контекст Grammy
 * @param dogName - кличка собаки для поиска
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 */
async function handleDogNameSearch(ctx: any, dogName: string, api: CoursingStatsAPI, cache?: KVNamespace) {
  // Additional validation as defense in depth
  if (!validateSearchQuery(dogName)) {
    await safeEditOrReply(ctx, '❌ Неверный формат запроса. Минимум 2 символа, максимум 100.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    }, cache);
    return;
  }
  
  const chatId = ctx.chat?.id;
  if (chatId) {
    await ctx.api.sendChatAction(chatId, 'typing').catch(() => {});
  }
  
  // Prefer competition dogs; Donino is a separate domain (name+breed)
  const dogs = await api.searchDogsByName(dogName, undefined, 5);
  
  if (dogs.length > 0) {
    let text = `<b>🔍 Поиск: ${dogName}</b>\nНайдено собак: ${dogs.length}\n\n`;
    
    dogs.forEach((dog: Dog, index: number) => {
      const name = getDisplayName(dog);
      text += `${index + 1}. ${name}\n`;
    });
    
    if (dogs.length === 5) {
      text += '\n<i>Показаны первые 5 результатов. Для уточнения введите более конкретную кличку.</i>';
    }
    
    text += '\n\nВыберите собаку для просмотра:';
    
    await safeEditOrReply(ctx, text, { 
      parse_mode: 'HTML',
      reply_markup: getDogSelectionKeyboard(dogs),
    }, cache);
    return;
  }

  const records = await api.getSpeedRecords();
  const doninoHits = findDoninoDogsByName(dogName, records.speed, records.coursing, 3);

  if (doninoHits.length > 0) {
    const cards = buildInlineDoninoDogResults(doninoHits);
    const firstCard = cards[0];
    await safeEditOrReply(ctx, firstCard.input_message_content.message_text, {
      parse_mode: 'HTML',
      reply_markup: firstCard.reply_markup,
    }, cache);
    return;
  }
  
  await safeEditOrReply(ctx,
    '❌ Собаки не найдены.\n\nПопробуйте:\n• Другое написание клички\n• Введите ID собаки (число)\n• Более конкретный запрос\n• Inline: @coursing_stats_bot донино',
    { reply_markup: getNavigationButtons('main_menu', 'main_menu') },
    cache
  );
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
    if (ctx.message?.via_bot) {
      return;
    }
    const userId = ctx.from?.id?.toString();
    const text = sanitizeInput(ctx.message.text);

    // Ignore or reject unrecognized slash commands (so /foo is not searched as a dog name)
    if (text.startsWith('/')) {
      await safeEditOrReply(ctx,
        '❌ Неизвестная команда.\n\nИспользуйте меню команд или напишите кличку собаки для поиска.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') },
        cache
      );
      return;
    }
    
    // Check for clear command (as text, not just slash command)
    if (text.toLowerCase() === 'clear' || text.toLowerCase() === 'очистить') {
      if (userId && cache) {
        await cache.delete(`compare:${userId}`);
      }
      await safeEditOrReply(ctx, 'Режим сравнения сброшен.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
      }, cache);
      return;
    }
    
    // Check if user is in comparison mode
    if (userId) {
      const firstDogId = await getCompareState(userId);
      if (firstDogId) {
        // Handle comparison mode
        const query = text.trim();
        if (query.length < 2) {
          await safeEditOrReply(ctx, 'Минимум 2 символа для поиска второй собаки.', {
            reply_markup: getNavigationButtons('main_menu', 'main_menu')
          }, cache);
          return;
        }

        const chatId = ctx.chat?.id;
        if (chatId) {
          await ctx.api.sendChatAction(chatId, 'typing').catch(() => {});
        }

        try {
          const dogs = await api.searchDogsByName(query, undefined, 5);

          if (!dogs || dogs.length === 0) {
            await safeEditOrReply(ctx, 'Вторая собака не найдена. Попробуйте другой запрос.', {
              reply_markup: getNavigationButtons('main_menu', 'main_menu')
            }, cache);
            return;
          }

          // Check if user selected the same dog
          if (dogs.some(d => d.id.toString() === firstDogId)) {
            await safeEditOrReply(ctx, 'Выберите другую собаку для сравнения (не ту же самую).', {
              reply_markup: getNavigationButtons('main_menu', 'main_menu')
            }, cache);
            return;
          }

          let textResult = `<b>Найдено собак: ${dogs.length}</b>\n\n`;
          dogs.forEach((dog: Dog, index: number) => {
            textResult += `${index + 1}. ${getDisplayName(dog)}\n`;
          });
          textResult += '\nВыберите вторую собаку:';

          await safeEditOrReply(ctx, textResult, {
            parse_mode: 'HTML',
            reply_markup: getDogSelectionKeyboard(dogs, 'compare'),
          }, cache);
        } catch (error) {
          await safeEditOrReply(ctx, 'Ошибка при поиске. Попробуйте позже.', {
            reply_markup: getNavigationButtons('main_menu', 'main_menu')
          }, cache);
        }
        return;
      }
    }
    
    // Regular search mode
    // Check if it's a dog ID (number)
    if (/^\d+$/.test(text)) {
      if (!validateDogId(text)) {
        await safeEditOrReply(ctx,
          '❌ Неверный формат ID собаки.\n\nID должен быть числом от 1 до 9999999999.',
          { reply_markup: getNavigationButtons('main_menu', 'main_menu') },
          cache
        );
        return;
      }
      await handleDogIdSearch(ctx, text, api, cache);
      return;
    }
    
    // Validate minimum length for name search
    if (!validateSearchQuery(text)) {
      await safeEditOrReply(ctx,
        '❌ Минимальная длина запроса - 2 символа.\n\nВведите более длинную кличку собаки для поиска.',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') },
        cache
      );
      return;
    }
    
    // Otherwise search by name
    await handleDogNameSearch(ctx, text, api, cache);
  });

  return search;
}
