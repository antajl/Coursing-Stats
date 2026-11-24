// Keyboards and WebApp buttons (Strict Zero Emoji & Old Money Ergonomics)
import { InlineKeyboard, Keyboard } from 'grammy';
import { getDisciplineCounts } from './services/competition-tracker.js';

export function getMainMenuKeyboard(
  webAppUrl: string = 'https://coursing-stats.ru/tracker/',
  isLinked: boolean = false
): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (isLinked) {
    kb.webApp('Открыть личный кабинет (WebApp)', webAppUrl).row()
      .text('Список заявок', 'cmd_apps').text('Состязания РКФ 2026', 'cmd_competitions').row()
      .text('Управление аккаунтом', 'cmd_account').text('Справка / Помощь', 'cmd_help');
  } else {
    kb.webApp('Кабинет трекера (привязать профиль)', `${webAppUrl}?action=login`).row()
      .text('Подключить с ПК', 'cmd_auth_prompt').text('Состязания РКФ 2026', 'cmd_competitions').row()
      .text('Справка / Помощь', 'cmd_help');
  }

  return kb;
}

export function getReplyMenuKeyboard(webAppUrl: string = 'https://coursing-stats.ru/tracker/'): Keyboard {
  return new Keyboard()
    .webApp('Мои заявки', webAppUrl)
    .text('/status')
    .text('/competitions')
    .text('/help')
    .resized()
    .persistent();
}

export function getBackToMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('« В главное меню', 'cmd_start');
}

export function getRebindConfirmationKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Заменить на новый аккаунт', 'cmd_rebind_confirm')
    .row()
    .text('Оставить текущий аккаунт', 'cmd_rebind_cancel');
}

export function getAccountKeyboard(isLinked: boolean): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (isLinked) {
    kb.text('Список заявок', 'cmd_apps')
      .text('Перепривязать аккаунт', 'cmd_auth_prompt')
      .row()
      .text('Отключить аккаунт (Выйти)', 'cmd_logout')
      .row();
  } else {
    kb.text('Подключить аккаунт', 'cmd_auth_prompt').row();
  }
  return kb.text('« В главное меню', 'cmd_start');
}

export function getStatusKeyboard(isLinked: boolean): InlineKeyboard {
  return getAccountKeyboard(isLinked);
}

export function getAuthPromptKeyboard(webAppUrl: string = 'https://coursing-stats.ru/tracker/'): InlineKeyboard {
  return new InlineKeyboard()
    .text('Подключить с ПК в 1 клик (без ввода паролей)', 'cmd_auth_ext')
    .row()
    .webApp('Привязать на телефоне (WebApp)', `${webAppUrl}?action=login`)
    .row()
    .text('Умная закладка без расширений', 'cmd_auth_bookmarklet')
    .row()
    .text('« В главное меню', 'cmd_start');
}

export function getAuthLoginKeyboard(webAppUrl: string = 'https://coursing-stats.ru/tracker/'): InlineKeyboard {
  return new InlineKeyboard()
    .webApp('Открыть форму привязки (WebApp)', `${webAppUrl}?action=login`)
    .row()
    .text('« Назад к выбору', 'cmd_auth_prompt')
    .text('« В главное меню', 'cmd_start');
}

export function getAuthSubmenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('« Назад к выбору способа', 'cmd_auth_prompt')
    .text('« В главное меню', 'cmd_start');
}

export function getAuthHowKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('« Назад к подключению', 'cmd_auth_prompt')
    .text('« В меню', 'cmd_start');
}

export function getCompetitionsMenuKeyboard(): InlineKeyboard {
  const counts = getDisciplineCounts();
  return new InlineKeyboard()
    .text(`Курсинг (${counts.coursing})`, 'comp_disc:coursing')
    .text(`Бега борзых (${counts.racing})`, 'comp_disc:racing')
    .row()
    .text(`БЗМП (${counts.bzmp})`, 'comp_disc:bzmp')
    .text(`Все состязания (${counts.total})`, 'comp_disc:all')
    .row()
    .text(`Утвержденные (${counts.approved})`, 'comp_disc:approved')
    .text('Мои подписки', 'comp_list')
    .row()
    .text('« В главное меню', 'cmd_start');
}

export function getCompetitionsPageKeyboard(
  events: { id: string; location: string }[],
  page: number,
  totalPages: number,
  subscribedIds: Set<string>,
  discKey: string
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const isSub = subscribedIds.has(ev.id);
    const shortLoc = (ev.location || 'Мероприятие').split(',')[0].trim().slice(0, 18);
    const label = `${isSub ? '[x]' : '[+]'} ${i + 1}. ${shortLoc}`;
    const action = isSub ? `csub_off:${ev.id}:${discKey}:${page}` : `csub_on:${ev.id}:${discKey}:${page}`;
    kb.text(label, action);
    if ((i + 1) % 2 === 0 && i < events.length - 1) {
      kb.row();
    }
  }
  kb.row();

  if (totalPages > 1) {
    if (page > 0) {
      kb.text('« Пред.', `comp_p:${discKey}:${page - 1}`);
    }
    kb.text(`${page + 1} / ${totalPages}`, `comp_p:${discKey}:${page}`);
    if (page < totalPages - 1) {
      kb.text('След. »', `comp_p:${discKey}:${page + 1}`);
    }
    kb.row();
  }

  return kb
    .text('« К категориям', 'cmd_competitions')
    .text('« В меню', 'cmd_start');
}

export function getEventActionKeyboard(
  eventId: string,
  isSubscribed: boolean,
  backCategory: string = 'all'
): InlineKeyboard {
  const label = isSubscribed ? '[x] Отписаться' : '[+] Отслеживать статус';
  const action = isSubscribed ? `comp_unsub:${eventId}` : `comp_sub:${eventId}`;

  return new InlineKeyboard()
    .text(label, action)
    .row()
    .text('« К списку состязаний', `comp_disc:${backCategory}`)
    .text('« В меню', 'cmd_start');
}

export function getApplicationActionKeyboard(
  barcode: string,
  isReceived: boolean,
  webAppUrl: string = 'https://coursing-stats.ru/tracker/'
): InlineKeyboard {
  const toggleLabel = isReceived ? '[x] Снять отметку "Забрали"' : '[+] Отметить как забрали';
  const toggleAction = isReceived ? `unmark_rec:${barcode}` : `mark_rec:${barcode}`;

  return new InlineKeyboard()
    .webApp('Открыть в WebApp', webAppUrl)
    .row()
    .text(toggleLabel, toggleAction)
    .row()
    .text('« К списку заявок', 'cmd_apps')
    .text('« В меню', 'cmd_start');
}
