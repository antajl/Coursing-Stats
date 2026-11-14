import { Competition } from '../../types';

/**
 * Форматирует дату в русский формат (ДД.ММ.ГГГГ)
 * @param dateString - строка даты в формате YYYY-MM-DD
 * @returns дата в формате DD.MM.YYYY или оригинальная строка если формат неверный
 */
export function formatDateRussian(dateString: string): string {
  if (!dateString) return 'Дата не указана';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Фильтрует события, оставляя только предстоящие (от сегодня и позже)
 * @param events - массив событий для фильтрации
 * @param today - текущая дата (время обнулено до 00:00:00)
 * @returns отфильтрованный массив событий
 */
export function filterUpcomingEvents(events: Competition[], today: Date): Competition[] {
  return events.filter((event: Competition) => {
    const dateString = event.date_start || event.date;
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    return eventDate >= today;
  });
}

/**
 * Фильтрует события по типу дисциплины
 * @param events - массив событий для фильтрации
 * @param type - тип фильтрации ('all', 'coursing', 'racing', 'shows')
 * @returns отфильтрованный массив событий
 */
export function filterByEventType(events: Competition[], type: 'all' | 'coursing' | 'racing' | 'shows'): Competition[] {
  if (type === 'all') {
    return events;
  }
  
  if (type === 'coursing') {
    return events.filter(e => e.event_type === 'coursing' || e.title?.toLowerCase().includes('курсинг'));
  }
  
  if (type === 'racing') {
    return events.filter(e => e.event_type === 'racing' || e.title?.toLowerCase().includes('бега борзых'));
  }
  
  if (type === 'shows') {
    return events.filter(e => e.event_type === 'show' || e.title?.toLowerCase().includes('выставка'));
  }
  
  return events;
}

/**
 * Сортирует события по дате (возрастание)
 * @param events - массив событий для сортировки
 * @returns отсортированный массив событий
 */
export function sortEventsByDate(events: Competition[]): Competition[] {
  return events.sort((a, b) => {
    const dateA = new Date(a.date_start || a.date || '1970-01-01');
    const dateB = new Date(b.date_start || b.date || '1970-01-01');
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Форматирует текст сообщения с календарём событий
 * @param events - массив событий для отображения
 * @param year - год для заголовка
 * @param type - тип событий для заголовка
 * @param offset - смещение для пагинации (по 10)
 * @returns отформатированный текст сообщения
 */
export function formatCalendarText(
  events: Competition[],
  year: number,
  type: 'all' | 'coursing' | 'racing' | 'shows',
  offset: number = 0
): string {
  const typeLabels = {
    all: 'Архив соревнований',
    coursing: 'Архив соревнований по курсингу',
    racing: 'Архив соревнований по бегам борзых',
    shows: 'Архив выставок'
  };
  
  const emptyMessages = {
    all: 'Нет соревнований в архиве.',
    coursing: 'Нет соревнований по курсингу в архиве.',
    racing: 'Нет соревнований по бегам борзых в архиве.',
    shows: 'Нет выставок в архиве.'
  };
  
  let text = `<b>${typeLabels[type]} ${year}</b>\n\n`;
  
  if (events.length === 0) {
    text += emptyMessages[type];
  } else {
    const page = events.slice(offset, offset + 10);
    if (page.length === 0) {
      text += emptyMessages[type];
    } else {
      page.forEach((event, index) => {
        const date = formatDateRussian(event.date_start || event.date || '');
        const name = event.title || event.name || 'Название не указано';
        if (event.id) {
          const eventUrl = type === 'shows'
            ? `https://coursing-stats.ru/shows/exhibition/${event.id}`
            : `https://coursing-stats.ru/event/${event.id}`;
          text += `${offset + index + 1}. ${date} — <a href="${eventUrl}">${name}</a>\n`;
        } else {
          text += `${offset + index + 1}. ${date} — ${name}\n`;
        }
      });
      if (events.length > offset + 10) {
        text += `\n<i>Показано ${offset + 1}–${offset + page.length} из ${events.length}</i>`;
      }
    }
  }
  
  return text;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Форматирует список состязаний утвержденного плана сезона 2027
 */
export function formatCalendar2027Text(
  events: Competition[],
  offset: number = 0,
  isSubscribed: boolean = false,
  filter: 'all' | 'coursing' | 'racing' = 'all'
): string {
  const filterLabels: Record<string, string> = {
    all: 'Курсинг и бега',
    coursing: 'Курсинг',
    racing: 'Бега борзых',
  };

  const total = events.length;
  const page = events.slice(offset, offset + 10);

  const subBadge = isSubscribed ? '🔔 Подписка активна' : '🔕 Подписка не активна';
  let text = '<b>📅 План состязаний 2027 (РКФ)</b>\n';
  text += `Всего: <b>${total}</b> стартов (${filterLabels[filter] || 'Все'}) | ${subBadge}\n\n`;

  if (page.length === 0) {
    text += 'Состязаний не найдено.';
    return text;
  }

  page.forEach((event, index) => {
    const num = offset + index + 1;
    let title = escapeHtml(event.title || event.name || 'Состязание').replace(/\s+/g, ' ').trim();
    if (title.length > 46) {
      title = `${title.slice(0, 44)}…`;
    }
    const startStr = formatDateRussian(event.date_start || event.date || '');
    const isPending = Boolean(event.notes && event.notes.toLowerCase().includes('согласовани'));
    const pendingMarker = isPending ? ' ⚠️' : '';
    const eventUrl = `https://coursing-stats.ru/event/${event.id || 0}`;

    text += `${num}. ${startStr} — <a href="${eventUrl}">${title}</a>${pendingMarker}\n`;
  });

  const pageNum = Math.floor(offset / 10) + 1;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  text += '\n⚠️ <i>— на согласовании комиссии</i>\n';
  if (total > 10) {
    text += `<i>Стр. ${pageNum} из ${totalPages} (${offset + 1}–${offset + page.length} из ${total})</i>`;
  }

  return text;
}

/**
 * Форматирует историю изменений (ченджлог) сезона 2027 с <blockquote expandable>
 */
export function formatCalendarChangelogText(changelog: import('../../types').CalendarChangelog | null): string {
  if (!changelog || !changelog.entries || changelog.entries.length === 0) {
    return '<b>📋 История изменений плана 2027</b>\n\nИстория изменений пока пуста.';
  }

  let text = '<b>📋 История изменений плана 2027</b>\n';
  if (changelog.last_checked_at) {
    const checkDate = new Date(changelog.last_checked_at).toLocaleDateString('ru-RU');
    text += `<i>Синхронизация с РКФ: ${checkDate}</i>\n\n`;
  } else {
    text += '\n';
  }

  const visibleEntries = changelog.entries.slice(0, 3);
  visibleEntries.forEach((entry) => {
    const ver = escapeHtml(entry.version);
    const date = escapeHtml(entry.date);
    const title = escapeHtml(entry.title);
    text += `📌 <b>Версия ${ver} (${date})</b>\n${title}\n`;
    if (entry.changes && entry.changes.length > 0) {
      text += '<blockquote expandable>';
      entry.changes.slice(0, 5).forEach((c) => {
        text += `• ${escapeHtml(c)}\n`;
      });
      if (entry.changes.length > 5) {
        text += `• …и ещё ${entry.changes.length - 5} изменений\n`;
      }
      text += '</blockquote>\n';
    } else {
      text += '\n';
    }
  });

  if (changelog.entries.length > 3) {
    text += `<i>Показаны 3 последние версии из ${changelog.entries.length}. Полный архив доступен на сайте.</i>\n`;
  }

  return text;
}
