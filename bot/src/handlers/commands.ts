import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../api';
import { getMainInlineMenu, getNavigationButtons, getCompetitionsMenu, getShowsMenu, getGuideMenu, getDogCardKeyboard, getDoninoKeyboard } from '../keyboards';
import { validateDogId } from './utils/validators';
import { formatDogCard } from './utils/dogCard';
import {
  buildDoninoBreedNotFoundResult,
  buildInlineDogResult,
  buildInlineDoninoResults,
  collectDoninoBreeds,
  getSpeedKmh,
  matchDoninoBreeds,
  parseDoninoInlineQuery,
} from '../inlineQuery';
import type { SpeedRecordExtended } from '../types';
import type { KVNamespace } from './context';

/**
 * Helper function for adding emoji reactions
 * @param ctx - контекст Grammy
 * @param emoji - emoji для реакции
 */
async function addReaction(ctx: any, emoji: string) {
  try {
    await ctx.api.setMessageReaction(
      ctx.chat?.id,
      ctx.callbackQuery?.message?.message_id,
      [{ type: 'emoji', emoji }]
    );
  } catch (error) {
    // Ignore if reactions not supported
    console.error('[addReaction] Failed to add reaction:', error);
  }
}

/**
 * Безопасно редактирует сообщение или отправляет новое если редактирование не удается
 * @param ctx - контекст Grammy
 * @param text - текст сообщения
 * @param options - опции сообщения (parse_mode, reply_markup и т.д.)
 * @param cache - опциональное KV хранилище для сохранения ID сообщения
 */
export async function safeEditOrReply(ctx: any, text: string, options: any = {}, cache?: KVNamespace) {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat?.id;
  
  try {
    await ctx.editMessageText(text, options);
  } catch (editError) {
    console.error('[safeEditOrReply] Failed to edit message, using delete+reply:', editError);
    
    // Delete previous message if exists
    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);
      
      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          // Ignore errors if message is too old or already deleted
          console.error('[safeEditOrReply] Failed to delete previous message:', deleteError);
        }
      }
    }
    
    // Send new message
    const message = await ctx.reply(text, options);
    
    // Save the new message ID if cache is available
    if (message.message_id && userId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 }); // 24 hours
    }
  }
}

/**
 * Вспомогательные функции для обработки профиля собаки
 * @param ctx - контекст Grammy (any тип для совместимости)
 * @param dogId - ID собаки для поиска
 * @param api - клиент API Coursing Stats
 * @throws {Error} при ошибке загрузки профиля собаки
 */
async function handleDogIdSearch(ctx: any, dogId: string, api: CoursingStatsAPI) {
  try {
    // Show typing indicator for better UX
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }
    
    const dogData = await api.getDogById(dogId);
    
    if (!dogData) {
      await ctx.reply('❌ Собака не найдена. Попробуйте другой ID или поиск по кличке.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu')
      });
      return;
    }
    
    await ctx.reply(formatDogCard(dogData), {
      parse_mode: 'HTML',
      reply_markup: getDogCardKeyboard(dogData.dog.id.toString())
    });
  } catch (error) {
    await ctx.reply('❌ Ошибка при загрузке профиля собаки. Попробуйте позже.', {
      reply_markup: getNavigationButtons('main_menu', 'main_menu')
    });
  }
}

/**
 * Создает модуль команд бота с Grammy Composer
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками команд
 */
export function createCommands(api: CoursingStatsAPI, cache?: KVNamespace) {
  const commands = new Composer();

  /**
   * Обработчик inline запросов для поиска собак
   * @param ctx - контекст Grammy с inline query
   */
  commands.inlineQuery(/.*/, async (ctx) => {
  const { sanitizeInput, validateSearchQuery } = await import('./utils/validators');
  const query = sanitizeInput(ctx.inlineQuery.query);

  const inlineButton = {
    text: '🤖 Открыть бота',
    start_parameter: 'inline',
  };

  // Phrase shortcuts: донино / donino [порода]
  const doninoQuery = parseDoninoInlineQuery(query);
  if (doninoQuery) {
    try {
      const records = await api.getSpeedRecords();

      if (doninoQuery.breedQuery) {
        const allBreeds = collectDoninoBreeds(records.speed, records.coursing);
        const matchedBreeds = matchDoninoBreeds(doninoQuery.breedQuery, allBreeds);

        if (matchedBreeds.length === 0) {
          await ctx.answerInlineQuery(buildDoninoBreedNotFoundResult(doninoQuery.breedQuery), {
            cache_time: 0,
          });
          return;
        }

        const speed = records.speed.filter((r) => matchedBreeds.includes(r.breed));
        const coursing = records.coursing.filter((r) => matchedBreeds.includes(r.breed));
        const breedLabel = matchedBreeds.length === 1 ? matchedBreeds[0] : matchedBreeds.join(', ');
        const results = buildInlineDoninoResults(speed, coursing, {
          breedLabel,
          siteBreeds: matchedBreeds,
        });

        await ctx.answerInlineQuery(results, {
          cache_time: 300,
          button: { text: '⏱ Донино в боте', start_parameter: 'donino' },
        });
        return;
      }

      const results = buildInlineDoninoResults(records.speed, records.coursing);
      await ctx.answerInlineQuery(results, {
        cache_time: 300,
        button: { text: '⏱ Донино в боте', start_parameter: 'donino' },
      });
    } catch {
      await ctx.answerInlineQuery([], { cache_time: 0 });
    }
    return;
  }

  // Validate dog search query
  if (!validateSearchQuery(query)) {
    await ctx.answerInlineQuery([], { cache_time: 0 });
    return;
  }

  try {
    const dogs = await api.searchDogsByName(query, undefined, 5);

    if (!dogs || dogs.length === 0) {
      await ctx.answerInlineQuery([], { cache_time: 300 });
      return;
    }

    const results = dogs.map((dog) => buildInlineDogResult(dog));

    await ctx.answerInlineQuery(results, {
      cache_time: 300,
      button: inlineButton,
    });
  } catch (error) {
    await ctx.answerInlineQuery([], { cache_time: 0 });
  }
});

  /**
   * Обработчик команды /start с поддержкой deep link
   * @param ctx - контекст Grammy
   */
  commands.command('start', async (ctx) => {
  // Check for deep link parameter: /start dog_12345
  const text = ctx.message?.text;
  if (!text) return;
  const args = text.replace('/start', '').trim();
  if (args && args.startsWith('dog_')) {
    const dogId = args.replace('dog_', '');
    if (!validateDogId(dogId)) {
      await ctx.reply('❌ Неверный формат ссылки. Пожалуйста, используйте кнопку меню для поиска.');
      return;
    }
    await handleDogIdSearch(ctx, dogId, api);
    return;
  }

  if (args === 'donino') {
      const records = await api.getSpeedRecords();
      let text = '<b>⏱ Рекорды Донино</b>\n\n';
      if (records.speed.length === 0) {
        text += 'Не удалось загрузить рекорды скорости';
      } else {
        records.speed.slice(0, 10).forEach((record, index) => {
          const speed = getSpeedKmh(record as SpeedRecordExtended);
          text += `${index + 1}. ${record.name} (${record.breed}) - ${speed} км/ч\n`;
        });
      }
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed'),
      });
      return;
    }
    
  const welcomeText = `
<b>Coursing Stats</b> — статистика соревнований собак

Отслеживайте результаты вашей собаки по курсингу, бегам борзых и выставкам.

<b>Возможности:</b>
• Рейтинги и топы по дисциплинам
• Календарь соревнований и выставок
• История медалей и титулов
• Сравнение собак
• Избранные собаки

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();

  const photoUrl = 'https://coursing-stats.ru/bot/banner.png?v=2';
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat?.id;

  // Show typing indicator for better UX
  if (chatId) {
    await ctx.api.sendChatAction(chatId, 'upload_photo');
  }

  // Delete previous bot message if exists
  if (userId && chatId && cache) {
    const lastMessageKey = `last_message:${userId}`;
    const lastMessageId = await cache.get(lastMessageKey);
    
    if (lastMessageId) {
      try {
        await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
      } catch (deleteError) {
        // Ignore errors if message is too old or already deleted
        console.error('[/start] Failed to delete previous message:', deleteError);
      }
    }
  }

  // Send new message with photo
  try {
    const message = await ctx.replyWithPhoto(photoUrl, {
      caption: welcomeText,
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu()
    });
    
    // Save the new message ID
    if (message.message_id && userId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 }); // 24 hours
    }
  } catch (error) {
    // Fallback to text message if photo fails
    const message = await ctx.reply(welcomeText, {
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu()
    });
    
    // Save the new message ID
    if (message.message_id && userId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 }); // 24 hours
    }
  }

  // Delete the /start message
  if (ctx.message) {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Silently fail on message deletion
    }
  }
});

  /**
   * Обработчик кнопки main_menu для возврата в главное меню
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('main_menu', async (ctx) => {
    await addReaction(ctx, '👀');
    const welcomeText = `
<b>Coursing Stats</b> — статистика соревнований собак

Отслеживайте результаты вашей собаки по курсингу, бегам борзых и выставкам.

<b>Возможности:</b>
• Рейтинги и топы по дисциплинам
• Календарь соревнований и выставок
• История медалей и титулов
• Сравнение собак
• Избранные собаки

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();

    const photoUrl = 'https://coursing-stats.ru/bot/banner.png?v=2';
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;

    // Delete previous bot message if exists
    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);
      
      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          // Ignore errors if message is too old or already deleted
          console.error('[main_menu] Failed to delete previous message:', deleteError);
        }
      }
    }

    // Send new message with photo
    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: welcomeText,
        parse_mode: 'HTML',
        reply_markup: getMainInlineMenu()
      });
      
      // Save the new message ID
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 }); // 24 hours
      }
    } catch (error) {
      // Fallback to text message if photo fails
      const message = await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getMainInlineMenu()
      });
      
      // Save the new message ID
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 }); // 24 hours
      }
    }
  });

  /**
   * Обработчик кнопки search_dog для поиска собак
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('search_dog', async (ctx) => {
    await addReaction(ctx, '🔍');
    // Show typing indicator for better UX
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }
    
    await safeEditOrReply(ctx,
      'Введите кличку собаки (можно частично):',
      { parse_mode: 'HTML', reply_markup: getNavigationButtons('main_menu', 'main_menu') },
      cache
    );
  });

  /**
   * Обработчик кнопки about (перенаправление на справку)
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('about', async (ctx) => {
    await safeEditOrReply(ctx, '<b>📚 Справка</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: getGuideMenu()
    }, cache);
  });

  /**
   * Обработчик кнопки competitions_menu для подменю соревнований
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('competitions_menu', async (ctx) => {
    await addReaction(ctx, '🏆');
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;
    const photoUrl = 'https://coursing-stats.ru/bot/banners/competitions.png?v=2';
    
    // Show typing indicator for better UX
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    }
    
    // Delete previous bot message if exists
    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);
      
      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          console.error('[competitions_menu] Failed to delete previous message:', deleteError);
        }
      }
    }
    
    const welcomeText = '<b>🏆 Соревнования</b>\n\nВыберите действие:';
    
    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: welcomeText,
        parse_mode: 'HTML',
        reply_markup: getCompetitionsMenu()
      });
      
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    } catch (error) {
      await safeEditOrReply(ctx, welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getCompetitionsMenu()
      }, cache);
    }
  });

  /**
   * Обработчик кнопки shows_menu для подменю выставок
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('shows_menu', async (ctx) => {
    await addReaction(ctx, '🎪');
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;
    const photoUrl = 'https://coursing-stats.ru/bot/banners/shows.png?v=2';
    
    // Show typing indicator for better UX
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    }
    
    // Delete previous bot message if exists
    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);
      
      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          console.error('[shows_menu] Failed to delete previous message:', deleteError);
        }
      }
    }
    
    const welcomeText = '<b>🎪 Выставки</b>\n\nВыберите действие:';
    
    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: welcomeText,
        parse_mode: 'HTML',
        reply_markup: getShowsMenu()
      });
      
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    } catch (error) {
      await safeEditOrReply(ctx, welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getShowsMenu()
      }, cache);
    }
  });

  /**
   * Обработчик кнопки guide_menu для подменю справки
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('guide_menu', async (ctx) => {
    await addReaction(ctx, '📚');
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;
    const photoUrl = 'https://coursing-stats.ru/bot/banners/guide.png?v=2';
    
    // Show typing indicator for better UX
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    }
    
    // Delete previous bot message if exists
    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);
      
      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          console.error('[guide_menu] Failed to delete previous message:', deleteError);
        }
      }
    }
    
    const welcomeText = '<b>📚 Справка</b>\n\nВыберите раздел:';
    
    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: welcomeText,
        parse_mode: 'HTML',
        reply_markup: getGuideMenu()
      });
      
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    } catch (error) {
      await safeEditOrReply(ctx, welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getGuideMenu()
      }, cache);
    }
  });

  /**
   * Обработчик кнопки back (общий обработчик, возвращает в главное меню)
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('back', async (ctx) => {
    // Default behavior: go to main menu
    // Individual handlers can override this by handling 'back' in their own modules
    await ctx.editMessageText('Возврат в главное меню...', { parse_mode: 'HTML' });
    
    const welcomeText = `
<b>Coursing Stats</b> — статистика соревнований собак

Отслеживайте результаты вашей собаки по курсингу, бегам борзых и выставкам.

<b>Возможности:</b>
• Рейтинги и топы по дисциплинам
• Календарь соревнований и выставок
• История медалей и титулов
• Сравнение собак
• Избранные собаки

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();
    
    await ctx.editMessageText(welcomeText, { 
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu()
    });
  });

  /**
   * Обработчик кнопки cancel_search для отмены поиска
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('cancel_search', async (ctx) => {
    await ctx.editMessageText('Поиск отменен.', {
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu()
    });
  });

  return commands;
}
