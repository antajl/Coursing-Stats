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
 * @returns отформатированный текст сообщения
 */
export function formatCalendarText(events: Competition[], year: number, type: 'all' | 'coursing' | 'racing' | 'shows'): string {
  const typeLabels = {
    all: 'Календарь соревнований',
    coursing: 'Календарь соревнований по курсингу',
    racing: 'Календарь соревнований по бегам борзых',
    shows: 'Календарь выставок'
  };
  
  const emptyMessages = {
    all: 'Нет предстоящих соревнований.',
    coursing: 'Нет предстоящих соревнований по курсингу.',
    racing: 'Нет предстоящих соревнований по бегам борзых.',
    shows: 'Нет предстоящих выставок.'
  };
  
  let text = `<b>${typeLabels[type]} ${year}</b>\n\n`;
  
  if (events.length === 0) {
    text += emptyMessages[type];
  } else {
    events.slice(0, 10).forEach((event, index) => {
      const date = formatDateRussian(event.date_start || event.date || '');
      const name = event.title || event.name || 'Название не указано';
      text += `${index + 1}. ${date} - ${name}\n`;
    });
  }
  
  return text;
}
