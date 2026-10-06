import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../api';
import { getMainInlineMenu, getNavigationButtons, getCompetitionsMenu, getShowsMenu, getGuideMenu, getDoninoKeyboard } from '../keyboards';
import { validateDogId } from './utils/validators';
import { buildDogCardPresentation, handleDogIdSearch } from './utils/presentDogCard';
import {
  buildDoninoNotFoundResult,
  buildInlineDogResult,
  buildInlineDoninoDogResults,
  buildInlineDoninoResults,
  collectDoninoBreeds,
  findDoninoDogsByName,
  formatDoninoTopChatText,
  matchDoninoBreeds,
  matchExactDoninoBreeds,
  parseDoninoDiscipline,
  parseDoninoInlineQuery,
} from '../inlineQuery';
import { BOT_PHOTOS } from '../constants';
import { isDogFavorite } from './utils/presentDogCard';
import { sendMenuScreen } from './utils/menuScreen';
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
  const msg = ctx.callbackQuery?.message;
  
  try {
    if (msg && 'photo' in msg && msg.photo) {
      await ctx.editMessageCaption({
        caption: text,
        parse_mode: options.parse_mode,
        reply_markup: options.reply_markup,
      });
      return;
    }
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

  // Phrase shortcuts: донино / donino [курсинг|рейсинг|порода|кличка]
  const doninoQuery = parseDoninoInlineQuery(query);
  if (doninoQuery) {
    try {
      const records = await api.getSpeedRecords();
      const doninoButton = { text: '⏱ Донино в боте', start_parameter: 'donino' };

      if (doninoQuery.term) {
        const discipline = parseDoninoDiscipline(doninoQuery.term);
        const filterTerm = discipline?.rest ?? (discipline ? undefined : doninoQuery.term);

        if (discipline && !filterTerm) {
          const results = buildInlineDoninoResults(records.speed, records.coursing, {
            only: discipline.discipline,
          });
          await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
          return;
        }

        const lookup = filterTerm ?? doninoQuery.term;
        const allBreeds = collectDoninoBreeds(records.speed, records.coursing);
        const exactBreeds = matchExactDoninoBreeds(lookup, allBreeds);
        const nameHits = findDoninoDogsByName(lookup, records.speed, records.coursing);
        const partialBreeds = matchDoninoBreeds(lookup, allBreeds);

        if (exactBreeds.length > 0) {
          const speed = records.speed.filter((r) => exactBreeds.includes(r.breed));
          const coursing = records.coursing.filter((r) => exactBreeds.includes(r.breed));
          const results = buildInlineDoninoResults(speed, coursing, {
            breedLabel: exactBreeds[0],
            siteBreeds: exactBreeds,
            only: discipline?.discipline,
          });
          await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
          return;
        }

        if (nameHits.length > 0) {
          await ctx.answerInlineQuery(buildInlineDoninoDogResults(nameHits), {
            cache_time: 0,
            button: doninoButton,
          });
          return;
        }

        if (partialBreeds.length > 0) {
          const speed = records.speed.filter((r) => partialBreeds.includes(r.breed));
          const coursing = records.coursing.filter((r) => partialBreeds.includes(r.breed));
          const breedLabel = partialBreeds.length === 1 ? partialBreeds[0] : partialBreeds.join(', ');
          const results = buildInlineDoninoResults(speed, coursing, {
            breedLabel,
            siteBreeds: partialBreeds,
            only: discipline?.discipline,
          });
          await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
          return;
        }

        await ctx.answerInlineQuery(buildDoninoNotFoundResult(doninoQuery.term), {
          cache_time: 0,
        });
        return;
      }

      const results = buildInlineDoninoResults(records.speed, records.coursing);
      await ctx.answerInlineQuery(results, {
        cache_time: 0,
        button: doninoButton,
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

    const userId = ctx.from?.id.toString();
    const results = (
      await Promise.all(
        dogs.map(async (dog) => {
          const dogData = await api.getDogById(dog.id.toString());
          if (!dogData) return null;
          const [shows, isFavorite] = await Promise.all([
            api.getShowSummaryForCompetitionDog(dogData.dog.id),
            isDogFavorite(cache, userId, dogData.dog.id),
          ]);
          return buildInlineDogResult(dogData, { shows, isFavorite });
        }),
      )
    ).filter((r): r is NonNullable<typeof r> => r != null);

    if (results.length === 0) {
      await ctx.answerInlineQuery([], { cache_time: 0 });
      return;
    }

    await ctx.answerInlineQuery(results, {
      cache_time: 60,
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
    await handleDogIdSearch(ctx, dogId, api, cache);
    return;
  }

  if (args === 'donino') {
      const records = await api.getSpeedRecords();
      const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
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
• Рейтинги и топы по дисциплинам (включая Elo)
• Календарь соревнований и выставок
• История медалей и титулов
• Избранные собаки и быстрая карточка /mystats
• Поиск по породе /breed

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();

  await sendMenuScreen(ctx, cache, {
    photoUrl: BOT_PHOTOS.home,
    text: welcomeText,
    keyboard: getMainInlineMenu(),
  });

  // Delete the /start message
  if (ctx.message) {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Silently fail on message deletion
    }
  }
});

  commands.command(['help', 'guide'], async (ctx) => {
    await safeEditOrReply(ctx, '<b>📚 Справка</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: getGuideMenu(),
    }, cache);
  });

  commands.command('search', async (ctx) => {
    await safeEditOrReply(ctx, 'Введите кличку или ID собаки (число):', {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    }, cache);
  });

  commands.command('ratings', async (ctx) => {
    const currentYear = new Date().getFullYear().toString();
    const ratingList = await api.getTopRatings('coursing', 'placement', currentYear, 5);
    if (!ratingList || ratingList.length === 0) {
      await safeEditOrReply(ctx, 'Не удалось загрузить рейтинг', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    await safeEditOrReply(ctx, '<b>🏆 Рейтинги соревнований</b>\n\nВыберите дисциплину или категорию:', {
      parse_mode: 'HTML',
      reply_markup: getCompetitionsMenu(),
    }, cache);
  });

  commands.command(['calendar', 'archive'], async (ctx) => {
    const currentYear = new Date().getFullYear();
    const events = await api.getCalendar(currentYear.toString());
    if (!events || events.length === 0) {
      await safeEditOrReply(ctx, 'Не удалось загрузить архив соревнований', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    const { filterUpcomingEvents, sortEventsByDate, formatCalendarText } = await import('./calendar/filters');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
    const text = formatCalendarText(upcomingEvents, currentYear, 'all');
    const { getCalendarKeyboard } = await import('../keyboards');
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getCalendarKeyboard(0, false, 'all'),
    }, cache);
  });

  commands.command('donino', async (ctx) => {
    const records = await api.getSpeedRecords();
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: getDoninoKeyboard('speed'),
    });
  });

  commands.command('favorites', async (ctx) => {
    const userId = ctx.from?.id.toString();
    if (!userId || !cache) {
      await ctx.reply('Функция избранного временно недоступна.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      });
      return;
    }
    const favoritesData = await cache.get(`favorites:${userId}`);
    const dogIds = favoritesData ? (JSON.parse(favoritesData) as number[]) : [];
    if (dogIds.length === 0) {
      await ctx.reply('У вас пока нет избранных собак.\n\nДля добавления используйте кнопку «В избранное» в профиле собаки.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      });
      return;
    }
    const dogs = await Promise.all(dogIds.slice(0, 20).map((id) => api.getDogById(id.toString())));
    const validDogs = dogs.filter((d): d is NonNullable<typeof d> => d !== null);
    if (validDogs.length === 0) {
      await ctx.reply('Не удалось загрузить данные избранных собак.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      });
      return;
    }
    let text = `<b>Избранные собаки (${validDogs.length})</b>\n\n`;
    const listDogs = validDogs.map((dogData) => dogData.dog);
    listDogs.forEach((dog, index) => {
      const name = dog.name_lat || dog.name_ru || 'N/A';
      const breed = dog.breed || 'N/A';
      text += `${index + 1}. ${name} (${breed})\n`;
    });
    text += '\nВыберите собаку, чтобы открыть карточку:';
    const { getFavoritesKeyboard } = await import('../keyboards');
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: getFavoritesKeyboard(listDogs),
    });
  });

  commands.command('competitions', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🏆 Соревнования</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getCompetitionsMenu(),
    }, cache);
  });

  commands.command('shows', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🎪 Выставки</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getShowsMenu(),
    }, cache);
  });

  commands.command('breed', async (ctx) => {
    const text = ctx.message?.text || '';
    const breedQuery = text.replace(/^\/breed/, '').trim();

    if (!breedQuery || breedQuery.length < 2) {
      await ctx.reply(
        'Пожалуйста, укажите породу после команды.\n\nПример:\n<code>/breed салюки</code>\n<code>/breed уиппет</code>',
        { parse_mode: 'HTML', reply_markup: getNavigationButtons('main_menu', 'main_menu') },
      );
      return;
    }

    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }

    const dogs = await api.searchDogsByName('', breedQuery, 10);
    if (!dogs || dogs.length === 0) {
      // Fallback search
      const fallback = await api.searchDogsByName(breedQuery, undefined, 10);
      if (!fallback || fallback.length === 0) {
        await ctx.reply(`Собаки породы «${breedQuery}» не найдены.`, {
          reply_markup: getNavigationButtons('main_menu', 'main_menu'),
        });
        return;
      }

      let respText = `<b>Собаки по запросу породы «${breedQuery}» (${fallback.length}):</b>\n\n`;
      fallback.forEach((d, idx) => {
        respText += `${idx + 1}. ${d.name_ru || d.name_lat} (${d.breed})\n`;
      });
      respText += '\nВыберите собаку для просмотра:';

      const { getDogSelectionKeyboard } = await import('../keyboards');
      await ctx.reply(respText, {
        parse_mode: 'HTML',
        reply_markup: getDogSelectionKeyboard(fallback),
      });
      return;
    }

    let respText = `<b>Собаки породы «${breedQuery}» (${dogs.length}):</b>\n\n`;
    dogs.forEach((d, idx) => {
      respText += `${idx + 1}. ${d.name_ru || d.name_lat} (${d.breed})\n`;
    });
    respText += '\nВыберите собаку для просмотра:';

    const { getDogSelectionKeyboard } = await import('../keyboards');
    await ctx.reply(respText, {
      parse_mode: 'HTML',
      reply_markup: getDogSelectionKeyboard(dogs),
    });
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
• Рейтинги и топы по дисциплинам (включая Elo)
• Календарь соревнований и выставок
• История медалей и титулов
• Избранные собаки и быстрая карточка /mystats
• Поиск по породе /breed

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();

    await sendMenuScreen(ctx, cache, {
      photoUrl: BOT_PHOTOS.home,
      text: welcomeText,
      keyboard: getMainInlineMenu(),
    });
  });

  /**
   * Обработчик кнопки search_dog для поиска собак
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('search_dog', async (ctx) => {
    await addReaction(ctx, '🔍');
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }
    
    await safeEditOrReply(ctx,
      'Введите кличку собаки (можно частично) или её ID:',
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
    await sendMenuScreen(ctx, cache, {
      photoUrl: BOT_PHOTOS.competitions,
      text: '<b>🏆 Соревнования</b>\n\nВыберите действие:',
      keyboard: getCompetitionsMenu(),
    });
  });

  /**
   * Обработчик кнопки shows_menu для подменю выставок
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('shows_menu', async (ctx) => {
    await addReaction(ctx, '🎪');
    await sendMenuScreen(ctx, cache, {
      photoUrl: BOT_PHOTOS.shows,
      text: '<b>🎪 Выставки</b>\n\nВыберите действие:',
      keyboard: getShowsMenu(),
    });
  });

  /**
   * Обработчик кнопки guide_menu для подменю справки
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('guide_menu', async (ctx) => {
    await addReaction(ctx, '📚');
    await sendMenuScreen(ctx, cache, {
      photoUrl: BOT_PHOTOS.guide,
      text: '<b>📚 Справка</b>\n\nВыберите раздел:',
      keyboard: getGuideMenu(),
    });
  });

  /**
   * Обработчик кнопки back (общий обработчик, возвращает в главное меню без двойного edit)
   * @param ctx - контекст Grammy
   */
  commands.callbackQuery('back', async (ctx) => {
    const welcomeText = `
<b>Coursing Stats</b> — статистика соревнований собак

Отслеживайте результаты вашей собаки по курсингу, бегам борзых и выставкам.

<b>Возможности:</b>
• Рейтинги и топы по дисциплинам (включая Elo)
• Календарь соревнований и выставок
• История медалей и титулов
• Избранные собаки и быстрая карточка /mystats
• Поиск по породе /breed

<b>Как использовать:</b>
Напишите кличку или ID собаки или выберите действие из меню ниже
    `.trim();

    await safeEditOrReply(ctx, welcomeText, {
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu(),
    }, cache);
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
