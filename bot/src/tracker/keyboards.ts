import { InlineKeyboard } from 'grammy';
import type { ApplicationItem } from './types';
import type { TrackerCompetitionEvent } from './competitions';

const DEFAULT_WEBAPP_URL = 'https://coursing-stats.ru/tracker/';

export function getTrackerMainKeyboard(isLinked: boolean, webAppUrl = DEFAULT_WEBAPP_URL): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (isLinked) {
    kb.text('📋 Все заявки', 'trk_apps').text('🏆 Готовые', 'trk_ready').row();
  } else {
    kb.text('🔑 Подключить rkf.online', 'trk_auth').row();
  }
  kb.text('📅 График РКФ 2026', 'trk_comps').text('⭐ Подписки', 'trk_subs').row();
  kb.webApp('Веб-кабинет', webAppUrl);
  if (isLinked) kb.text('Выйти из РКФ', 'trk_logout');
  kb.row().text('← Главное меню', 'main_menu');
  return kb;
}

export function getTrackerAuthKeyboard(webAppUrl = DEFAULT_WEBAPP_URL): InlineKeyboard {
  return new InlineKeyboard()
    .webApp('Войти через WebApp', webAppUrl)
    .row()
    .text('Привязка с компьютера', 'trk_auth_ext')
    .text('Умная закладка', 'trk_auth_bm')
    .row()
    .text('← Назад', 'tracker_menu');
}

export function getTrackerAppsKeyboard(
  slice: ApplicationItem[],
  page: number,
  totalPages: number,
  onlyReady: boolean,
  webAppUrl = DEFAULT_WEBAPP_URL,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  const mode = onlyReady ? 'ready' : 'all';

  for (const app of slice) {
    if (app.statusGroup === 'ready') {
      const label = app.isReceived ? `Забрали #${app.barcode}` : `Отметить #${app.barcode}`;
      const action = app.isReceived ? `trk_unrec:${app.barcode}:${mode}:${page}` : `trk_rec:${app.barcode}:${mode}:${page}`;
      kb.text(label, action).row();
    }
  }

  if (totalPages > 1) {
    if (page > 0) kb.text('« Пред.', `trk_apps_p:${mode}:${page - 1}`);
    kb.text(`${page + 1}/${totalPages}`, `trk_apps_p:${mode}:${page}`);
    if (page < totalPages - 1) kb.text('След. »', `trk_apps_p:${mode}:${page + 1}`);
    kb.row();
  }

  return kb.webApp('Открыть кабинет', webAppUrl).row().text('← Назад', 'tracker_menu');
}

export function getTrackerCompsMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Курсинг', 'trk_disc:coursing')
    .text('Бега борзых', 'trk_disc:racing')
    .row()
    .text('БЗМП', 'trk_disc:bzmp')
    .text('Утвержденные', 'trk_disc:approved')
    .row()
    .text('Все состязания', 'trk_disc:all')
    .text('Мои подписки', 'trk_subs')
    .row()
    .text('← Назад', 'tracker_menu');
}

export function getTrackerCompsPageKeyboard(
  events: TrackerCompetitionEvent[],
  disc: string,
  page: number,
  totalPages: number,
  subIds: Set<string>,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  events.forEach((ev, idx) => {
    const isSub = subIds.has(ev.id);
    const label = isSub ? `${idx + 1}. Отписаться` : `${idx + 1}. Отслеживать`;
    const prefix = isSub ? 'trk_unsub' : 'trk_sub';
    kb.text(label, `${prefix}:${ev.id}:${disc}:${page}`).row();
  });

  if (totalPages > 1) {
    if (page > 0) kb.text('« Пред.', `trk_comp_p:${disc}:${page - 1}`);
    kb.text(`${page + 1}/${totalPages}`, `trk_comp_p:${disc}:${page}`);
    if (page < totalPages - 1) kb.text('След. »', `trk_comp_p:${disc}:${page + 1}`);
    kb.row();
  }

  return kb.text('← К разделам', 'trk_comps');
}

export function getTrackerRebindKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Заменить аккаунт', 'trk_rebind_ok')
    .text('Отмена', 'trk_rebind_no');
}
