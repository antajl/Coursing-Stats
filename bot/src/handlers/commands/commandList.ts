import { Composer } from 'grammy';
import type { CoursingStatsAPI } from '../../api';
import type { KVNamespace } from '../context';
import {
  getNavigationButtons,
  getCompetitionsMenu,
  getShowsMenu,
  getGuideMenu,
  getDoninoKeyboard,
} from '../../keyboards';
import { validateDogId } from '../utils/validators';
import { handleDogIdSearch } from '../utils/presentDogCard';
import { formatDoninoTopChatText } from '../../inlineQuery';
import { sendHomeScreen, WELCOME_TEXT } from '../utils/menuScreen';
import { safeEditOrReply } from '../utils/safeEditOrReply';

export function setupCommandHandlers(composer: Composer<any>, api: CoursingStatsAPI, cache?: KVNamespace) {
  /**
   * Обработчик команды /start с поддержкой deep link
   */
  composer.command('start', async (ctx) => {
    const text = ctx.message?.text;
    if (!text) return;
    const args = text.replace('/start', '').trim();
    if (args && args.startsWith('dog_')) {
      const dogId = args.replace('dog_', '');
      if (!validateDogId(dogId)) {
        await safeEditOrReply(ctx, '❌ Неверный формат ссылки. Пожалуйста, используйте кнопку меню для поиска.', {
          reply_markup: getNavigationButtons('main_menu', 'main_menu'),
        }, cache);
        return;
      }
      await handleDogIdSearch(ctx, dogId, api, cache);
      return;
    }

    if (args === 'donino') {
      const records = await api.getSpeedRecords();
      const doninoText = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
      await safeEditOrReply(ctx, doninoText, {
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed'),
      }, cache);
      return;
    }
      
    await sendHomeScreen(ctx, cache, WELCOME_TEXT, { forceNew: true });
  });

  composer.command(['help', 'guide'], async (ctx) => {
    await safeEditOrReply(ctx, '<b>📚 Справка</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: getGuideMenu(),
    }, cache);
  });

  composer.command('search', async (ctx) => {
    await safeEditOrReply(ctx, 'Введите кличку собаки:', {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('main_menu', 'main_menu'),
    }, cache);
  });

  composer.command('ratings', async (ctx) => {
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

  composer.command(['calendar', 'archive'], async (ctx) => {
    const currentYear = new Date().getFullYear();
    const events = await api.getCalendar(currentYear.toString());
    if (!events || events.length === 0) {
      await safeEditOrReply(ctx, 'Не удалось загрузить архив соревнований', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    const { filterUpcomingEvents, sortEventsByDate, formatCalendarText } = await import('../calendar/filters');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
    const calendarText = formatCalendarText(upcomingEvents, currentYear, 'all');
    const { getCalendarKeyboard } = await import('../../keyboards');
    await safeEditOrReply(ctx, calendarText, {
      parse_mode: 'HTML',
      reply_markup: getCalendarKeyboard(0, false, 'all'),
    }, cache);
  });

  composer.command('donino', async (ctx) => {
    const records = await api.getSpeedRecords();
    const doninoText = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
    await safeEditOrReply(ctx, doninoText, {
      parse_mode: 'HTML',
      reply_markup: getDoninoKeyboard('speed'),
    }, cache);
  });

  composer.command(['favorites', 'mystats'], async (ctx) => {
    const userId = ctx.from?.id?.toString();
    if (!userId || !cache) {
      await safeEditOrReply(ctx, 'Функция избранного временно недоступна.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    const favoritesData = await cache.get(`favorites:${userId}`);
    const dogIds = favoritesData ? (JSON.parse(favoritesData) as number[]) : [];
    if (dogIds.length === 0) {
      await safeEditOrReply(ctx, 'У вас пока нет избранных собак.\n\nДля добавления используйте кнопку «В избранное» в профиле собаки.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    const dogs = await Promise.all(dogIds.slice(0, 20).map((id) => api.getDogById(id.toString())));
    const validDogs = dogs.filter((d): d is NonNullable<typeof d> => d !== null);
    if (validDogs.length === 0) {
      await safeEditOrReply(ctx, 'Не удалось загрузить данные избранных собак.', {
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
      }, cache);
      return;
    }
    let favoritesText = `<b>Избранные собаки (${validDogs.length})</b>\n\n`;
    const listDogs = validDogs.map((dogData) => dogData.dog);
    listDogs.forEach((dog, index) => {
      const name = dog.name_lat || dog.name_ru || 'N/A';
      const breed = dog.breed || 'N/A';
      favoritesText += `${index + 1}. ${name} (${breed})\n`;
    });
    favoritesText += '\nВыберите собаку, чтобы открыть карточку:';
    const { getFavoritesKeyboard } = await import('../../keyboards');
    await safeEditOrReply(ctx, favoritesText, {
      parse_mode: 'HTML',
      reply_markup: getFavoritesKeyboard(listDogs),
    }, cache);
  });

  composer.command('competitions', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🏆 Соревнования</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getCompetitionsMenu(),
    }, cache);
  });

  composer.command('shows', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🎪 Выставки</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getShowsMenu(),
    }, cache);
  });

  composer.command('breed', async (ctx) => {
    const text = ctx.message?.text || '';
    const breedQuery = text.replace(/^\/breed/, '').trim();

    if (!breedQuery || breedQuery.length < 2) {
      await safeEditOrReply(
        ctx,
        'Пожалуйста, укажите породу после команды.\n\nПример:\n<code>/breed салюки</code>\n<code>/breed уиппет</code>',
        { parse_mode: 'HTML', reply_markup: getNavigationButtons('main_menu', 'main_menu') },
        cache,
      );
      return;
    }

    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing').catch(() => {});
    }

    const dogs = await api.searchDogsByName('', breedQuery, 10);
    if (!dogs || dogs.length === 0) {
      // Fallback search
      const fallback = await api.searchDogsByName(breedQuery, undefined, 10);
      if (!fallback || fallback.length === 0) {
        await safeEditOrReply(ctx, `Собаки породы «${breedQuery}» не найдены.`, {
          reply_markup: getNavigationButtons('main_menu', 'main_menu'),
        }, cache);
        return;
      }

      let respText = `<b>Собаки по запросу породы «${breedQuery}» (${fallback.length}):</b>\n\n`;
      fallback.forEach((d, idx) => {
        respText += `${idx + 1}. ${d.name_ru || d.name_lat} (${d.breed})\n`;
      });
      respText += '\nВыберите собаку для просмотра:';

      const { getDogSelectionKeyboard } = await import('../../keyboards');
      await safeEditOrReply(ctx, respText, {
        parse_mode: 'HTML',
        reply_markup: getDogSelectionKeyboard(fallback),
      }, cache);
      return;
    }

    let respText = `<b>Собаки породы «${breedQuery}» (${dogs.length}):</b>\n\n`;
    dogs.forEach((d, idx) => {
      respText += `${idx + 1}. ${d.name_ru || d.name_lat} (${d.breed})\n`;
    });
    respText += '\nВыберите собаку для просмотра:';

    const { getDogSelectionKeyboard } = await import('../../keyboards');
    await safeEditOrReply(ctx, respText, {
      parse_mode: 'HTML',
      reply_markup: getDogSelectionKeyboard(dogs),
    }, cache);
  });
}
