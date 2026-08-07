import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getCalendarKeyboard } from '../../keyboards';
import { Competition } from '../../types';
import { filterUpcomingEvents, filterByEventType, sortEventsByDate, formatCalendarText } from './filters';
import { safeEditOrReply } from '../commands';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики календаря соревнований и выставок
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками календаря
 */
export function createCalendar(api: CoursingStatsAPI, cache?: KVNamespace) {
  const calendar = new Composer();

  // Calendar main menu
  calendar.callbackQuery('calendar', async (ctx) => {
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', { 
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'main_menu')
    }, cache);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000) // 10 second timeout
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
          return;
      }

      // Get today's date and filter events from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));

      const text = formatCalendarText(upcomingEvents, currentYear, 'all');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, false, 'all')
      }, cache);
    } catch (error) {
      console.error('[calendar] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  });

  // Filter handlers
  calendar.callbackQuery('filter_all', async (ctx) => {
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', { 
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu')
    }, cache);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
      const text = formatCalendarText(upcomingEvents, currentYear, 'all');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, false, 'all')
      }, cache);
    } catch (error) {
      console.error('[filter_all] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  });

  calendar.callbackQuery('filter_coursing', async (ctx) => {
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', { 
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu')
    }, cache);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterByEventType(filterUpcomingEvents(events, today), 'coursing'));
      const text = formatCalendarText(upcomingEvents, currentYear, 'coursing');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, false, 'coursing')
      }, cache);
    } catch (error) {
      console.error('[filter_coursing] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  });

  calendar.callbackQuery('filter_racing', async (ctx) => {
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', { 
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu')
    }, cache);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterByEventType(filterUpcomingEvents(events, today), 'racing'));
      const text = formatCalendarText(upcomingEvents, currentYear, 'racing');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, false, 'racing')
      }, cache);
    } catch (error) {
      console.error('[filter_racing] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  });

  calendar.callbackQuery(/^filter_(shows)$/, async (ctx) => {
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', { 
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu')
    }, cache);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterByEventType(filterUpcomingEvents(events, today), 'shows'));
      const text = formatCalendarText(upcomingEvents, currentYear, 'shows');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, true, 'shows')
      }, cache);
    } catch (error) {
      console.error('[filter_shows] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  });

  // Pagination handlers for calendar would be added here
  // For now, this covers the main calendar functionality

  return calendar;
}
