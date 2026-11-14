import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getCalendarKeyboard, getCalendar2027Keyboard, getCalendarChangelogKeyboard } from '../../keyboards';
import { Competition } from '../../types';
import {
  filterUpcomingEvents,
  filterByEventType,
  sortEventsByDate,
  formatCalendarText,
  formatCalendar2027Text,
  formatCalendarChangelogText,
} from './filters';
import { safeEditOrReply } from '../commands';
import type { KVNamespace } from '../context';

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
      reply_markup: getNavigationButtons('shows_menu', 'main_menu')
    }, cache);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const currentYear = new Date().getFullYear();
      const events = await Promise.race([
        api.getShowsCalendar(currentYear.toString()),
        timeoutPromise
      ]) as Competition[];

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь выставок',
          { reply_markup: getNavigationButtons('shows_menu', 'main_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
      const text = formatCalendarText(upcomingEvents, currentYear, 'shows');

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(0, true, 'shows')
      }, cache);
    } catch (error) {
      console.error('[filter_shows] Error loading calendar:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря. Попробуйте позже.',
        { reply_markup: getNavigationButtons('shows_menu', 'main_menu') },
        cache
      );
    }
  });

  // Shows calendar (from shows menu)
  calendar.callbackQuery(/^shows_calendar(?:_(\d+))?$/, async (ctx) => {
    const offset = parseInt(ctx.match![1] || '0', 10);
    await safeEditOrReply(ctx, '<b>Загрузка календаря выставок...</b>', {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('shows_menu', 'main_menu')
    }, cache);

    try {
      const currentYear = new Date().getFullYear();
      const events = await api.getShowsCalendar(currentYear.toString());

      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь выставок',
          { reply_markup: getNavigationButtons('shows_menu', 'main_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
      const text = formatCalendarText(upcomingEvents, currentYear, 'shows', offset);

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(offset, true, 'shows')
      }, cache);
    } catch (error) {
      console.error('[shows_calendar] Error:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря выставок.',
        { reply_markup: getNavigationButtons('shows_menu', 'main_menu') },
        cache
      );
    }
  });

  // Competition calendar pagination
  calendar.callbackQuery(/^calendar_(\d+)$/, async (ctx) => {
    const offset = parseInt(ctx.match![1], 10);
    await safeEditOrReply(ctx, '<b>Загрузка календаря...</b>', {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('competitions_menu', 'main_menu')
    }, cache);

    try {
      const currentYear = new Date().getFullYear();
      const events = await api.getCalendar(currentYear.toString());
      if (events.length === 0) {
        await safeEditOrReply(ctx,
          'Не удалось загрузить календарь',
          { reply_markup: getNavigationButtons('competitions_menu', 'main_menu') },
          cache
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingEvents = sortEventsByDate(filterUpcomingEvents(events, today));
      const text = formatCalendarText(upcomingEvents, currentYear, 'all', offset);

      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarKeyboard(offset, false, 'all')
      }, cache);
    } catch (error) {
      console.error('[calendar_page] Error:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке календаря.',
        { reply_markup: getNavigationButtons('competitions_menu', 'main_menu') },
        cache
      );
    }
  });

  // Helper to render 2027 calendar view
  async function renderCalendar2027View(
    ctx: any,
    filter: 'all' | 'coursing' | 'racing' = 'all',
    offset: number = 0
  ) {
    const userId = ctx.from?.id;
    let isSubscribed = false;
    if (userId && cache) {
      try {
        const sub = await cache.get(`sub:cal:2027:${userId}`);
        isSubscribed = sub === '1';
      } catch {
        isSubscribed = false;
      }
    }

    try {
      const allEvents = await api.getCalendar('2027');
      if (allEvents.length === 0) {
        await safeEditOrReply(
          ctx,
          'Не удалось загрузить план состязаний 2027.',
          { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
          cache
        );
        return;
      }

      let filteredEvents = allEvents;
      if (filter === 'coursing') {
        filteredEvents = allEvents.filter((e) => e.event_type === 'coursing' || e.title?.toLowerCase().includes('курсинг'));
      } else if (filter === 'racing') {
        filteredEvents = allEvents.filter((e) => e.event_type === 'racing' || e.title?.toLowerCase().includes('бега'));
      }

      const text = formatCalendar2027Text(filteredEvents, offset, isSubscribed, filter);
      await safeEditOrReply(
        ctx,
        text,
        {
          parse_mode: 'HTML',
          reply_markup: getCalendar2027Keyboard(isSubscribed, offset, filteredEvents.length, filter),
        },
        cache
      );
    } catch (error) {
      console.error('[calendar_2027] Error:', error);
      await safeEditOrReply(
        ctx,
        '❌ Ошибка при загрузке состязаний 2027.',
        { reply_markup: getNavigationButtons('competitions_menu', 'competitions_menu') },
        cache
      );
    }
  }

  // Season 2027 calendar plan entry point
  calendar.callbackQuery('calendar_2027', async (ctx) => {
    await renderCalendar2027View(ctx, 'all', 0);
  });

  // Filter 2027 handlers
  calendar.callbackQuery(/^filter_2027_(all|coursing|racing)$/, async (ctx) => {
    const filter = (ctx.match?.[1] || 'all') as 'all' | 'coursing' | 'racing';
    await renderCalendar2027View(ctx, filter, 0);
  });

  // Pagination 2027 handlers
  calendar.callbackQuery(/^cal_2027_page_(\d+)_(all|coursing|racing)$/, async (ctx) => {
    const offset = parseInt(ctx.match?.[1] || '0', 10);
    const filter = (ctx.match?.[2] || 'all') as 'all' | 'coursing' | 'racing';
    await renderCalendar2027View(ctx, filter, offset);
  });

  // Toggle 2027 calendar subscription (preserves offset and filter)
  calendar.callbackQuery(/^cal_sub_toggle_2027(?:_(\d+)_(all|coursing|racing))?$/, async (ctx) => {
    const offset = parseInt(ctx.match?.[1] || '0', 10);
    const filter = (ctx.match?.[2] || 'all') as 'all' | 'coursing' | 'racing';
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.answerCallbackQuery({ text: 'Ошибка авторизации' });
      return;
    }

    if (!cache) {
      await ctx.answerCallbackQuery({ text: 'Хранилище временно недоступно' });
      return;
    }

    try {
      const subKey = `sub:cal:2027:${userId}`;
      const currentSub = await cache.get(subKey);
      const isNowSubscribed = !currentSub || currentSub === '0';

      await cache.put(subKey, isNowSubscribed ? '1' : '0');

      // Update global subscribers list
      const subscribersKey = 'subscribers:cal:2027';
      let subscriberIds: number[] = [];
      try {
        const existing = await cache.get(subscribersKey);
        if (existing) {
          subscriberIds = JSON.parse(existing) as number[];
        }
      } catch {
        subscriberIds = [];
      }

      if (isNowSubscribed) {
        if (!subscriberIds.includes(userId)) {
          subscriberIds.push(userId);
        }
      } else {
        subscriberIds = subscriberIds.filter((id) => id !== userId);
      }
      await cache.put(subscribersKey, JSON.stringify(subscriberIds));

      await ctx.answerCallbackQuery({
        text: isNowSubscribed
          ? '🔔 Вы подписались на обновления календаря 2027!'
          : '🔕 Вы отписались от обновлений календаря 2027',
        show_alert: false,
      });

      // Refresh view preserving current offset and filter
      await renderCalendar2027View(ctx, filter, offset);
    } catch (error) {
      console.error('[cal_sub_toggle_2027] Error:', error);
      await ctx.answerCallbackQuery({ text: 'Произошла ошибка при обновлении подписки' });
    }
  });

  // Season 2027 Changelog
  calendar.callbackQuery('cal_changelog_2027', async (ctx) => {
    try {
      const changelog = await api.getCalendarChangelog('2027');
      const text = formatCalendarChangelogText(changelog);
      await safeEditOrReply(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: getCalendarChangelogKeyboard(),
      }, cache);
    } catch (error) {
      console.error('[cal_changelog_2027] Error:', error);
      await safeEditOrReply(ctx,
        '❌ Ошибка при загрузке истории изменений.',
        { reply_markup: getCalendarChangelogKeyboard() },
        cache
      );
    }
  });

  return calendar;
}
