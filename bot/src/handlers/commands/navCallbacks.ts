import { Composer } from 'grammy';
import type { CoursingStatsAPI } from '../../api';
import type { KVNamespace } from '../context';
import {
  getNavigationButtons,
  getCompetitionsMenu,
  getShowsMenu,
  getGuideMenu,
} from '../../keyboards';
import { sendHomeScreen, WELCOME_TEXT } from '../utils/menuScreen';
import { safeEditOrReply } from '../utils/safeEditOrReply';

export function setupNavigationCallbacks(composer: Composer<any>, api: CoursingStatsAPI, cache?: KVNamespace) {
  const returnToHomeScreen = async (ctx: any) => {
    await sendHomeScreen(ctx, cache, WELCOME_TEXT);
  };

  /**
   * Обработчик кнопки main_menu для возврата в главное меню
   */
  composer.callbackQuery('main_menu', async (ctx) => {
    await returnToHomeScreen(ctx);
  });

  /**
   * Обработчик кнопки search_dog для поиска собак
   */
  composer.callbackQuery('search_dog', async (ctx) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing');
    }
    
    await safeEditOrReply(
      ctx,
      'Введите кличку собаки (можно частично):',
      {
        parse_mode: 'HTML',
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
        reaction: '🔍',
      },
      cache
    );
  });

  /**
   * Обработчик кнопки about (перенаправление на справку)
   */
  composer.callbackQuery('about', async (ctx) => {
    await safeEditOrReply(ctx, '<b>📚 Справка</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: getGuideMenu()
    }, cache);
  });

  /**
   * Обработчик кнопки competitions_menu для подменю соревнований
   */
  composer.callbackQuery('competitions_menu', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🏆 Соревнования</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getCompetitionsMenu(),
      reaction: '🏆',
    }, cache);
  });

  /**
   * Обработчик кнопки shows_menu для подменю выставок
   */
  composer.callbackQuery('shows_menu', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🎪 Выставки</b>\n\nВыберите действие:', {
      parse_mode: 'HTML',
      reply_markup: getShowsMenu(),
      reaction: '🎪',
    }, cache);
  });

  /**
   * Обработчик кнопки guide_menu для подменю справки
   */
  composer.callbackQuery('guide_menu', async (ctx) => {
    await safeEditOrReply(ctx, '<b>📚 Справка</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: getGuideMenu(),
      reaction: '📚',
    }, cache);
  });

  /**
   * Обработчик кнопки back (возвращает на главный экран)
   */
  composer.callbackQuery('back', async (ctx) => {
    await returnToHomeScreen(ctx);
  });

  /**
   * Обработчик кнопки cancel_search для отмены поиска (возвращает на главный экран)
   */
  composer.callbackQuery('cancel_search', async (ctx) => {
    await returnToHomeScreen(ctx);
  });

  /**
   * Обработчики постоянных кнопок нижней клавиатуры (ReplyKeyboard)
   */
  composer.hears('🏠 Главное меню', async (ctx) => {
    await returnToHomeScreen(ctx);
  });

  composer.hears('🔍 Поиск собаки', async (ctx) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'typing').catch(() => {});
    }
    await safeEditOrReply(
      ctx,
      'Введите кличку собаки (можно частично):',
      {
        parse_mode: 'HTML',
        reply_markup: getNavigationButtons('main_menu', 'main_menu'),
        reaction: '🔍',
      },
      cache,
    );
  });

  composer.hears('🏆 Рейтинги', async (ctx) => {
    await safeEditOrReply(ctx, '<b>🏆 Рейтинги соревнований</b>\n\nВыберите дисциплину или категорию:', {
      parse_mode: 'HTML',
      reply_markup: getCompetitionsMenu(),
      reaction: '🏆',
    }, cache);
  });

  composer.hears(['📅 Календарь', 'Архив'], async (ctx) => {
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
}
