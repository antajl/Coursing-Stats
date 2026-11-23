// Keyboards and WebApp buttons (Strict Zero Emoji)
import { InlineKeyboard, Keyboard } from 'grammy';

export function getMainMenuKeyboard(webAppUrl: string = 'https://my.coursing-stats.ru'): InlineKeyboard {
  return new InlineKeyboard()
    .webApp('Мои заявки (Кабинет)', webAppUrl)
    .row()
    .text('Статус мониторинга', 'cmd_status')
    .text('Список заявок', 'cmd_apps')
    .row()
    .text('Состязания РКФ', 'cmd_competitions')
    .text('Помощь / Инструкция', 'cmd_help');
}

export function getReplyMenuKeyboard(webAppUrl: string = 'https://my.coursing-stats.ru'): Keyboard {
  return new Keyboard()
    .webApp('Мои заявки', webAppUrl)
    .text('/status')
    .text('/help')
    .resized()
    .persistent();
}

export function getApplicationActionKeyboard(
  barcode: string,
  isReceived: boolean,
  webAppUrl: string = 'https://my.coursing-stats.ru'
): InlineKeyboard {
  const toggleLabel = isReceived ? '[x] Снять отметку "Забрали"' : '[+] Отметить как забрали';
  const toggleAction = isReceived ? `unmark_rec:${barcode}` : `mark_rec:${barcode}`;

  return new InlineKeyboard()
    .webApp('Открыть в WebApp', webAppUrl)
    .row()
    .text(toggleLabel, toggleAction)
    .text('Обновить', 'cmd_apps');
}

export function getCompetitionsMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Добавить отслеживание', 'comp_add_prompt')
    .row()
    .text('Мои подписки', 'comp_list')
    .text('Главное меню', 'cmd_start');
}
