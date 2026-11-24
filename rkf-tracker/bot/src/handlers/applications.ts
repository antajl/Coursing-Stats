// Handler: /apps and /ready commands (Strict Zero Emoji & Single-Bubble UX)
import { InlineKeyboard, type Composer } from 'grammy';
import type { BotContext, ApplicationItem } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { fetchRkfApplications } from '../services/rkf-api.js';
import {
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';

const APPS_PAGE_SIZE = 4;

export function registerApplicationsHandler(composer: Composer<BotContext>): void {
  composer.command(['apps', 'ready'], async (ctx) => {
    const onlyReady = ctx.message?.text?.includes('/ready') || false;
    await showApplications(ctx, onlyReady, 0);
  });

  composer.callbackQuery('cmd_apps', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Загрузка списка заявок из РКФ Онлайн...' });
    await showApplications(ctx, false, 0);
  });

  composer.callbackQuery(/^apps_p:(all|ready):(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Переход на страницу...' });
    const onlyReady = ctx.match?.[1] === 'ready';
    const page = ctx.match ? parseInt(ctx.match[2], 10) : 0;
    await showApplications(ctx, onlyReady, page);
  });

  composer.callbackQuery(/^(mark_rec|unmark_rec):(\d+):(all|ready):(\d+)$/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const action = match[1];
    const barcode = match[2];
    const onlyReady = match[3] === 'ready';
    const page = parseInt(match[4], 10) || 0;
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) return;

    if (action === 'mark_rec') {
      if (!user.receivedBarcodes.includes(barcode)) {
        user.receivedBarcodes.push(barcode);
      }
      await ctx.answerCallbackQuery({ text: 'Отмечено как забрали' });
    } else {
      user.receivedBarcodes = user.receivedBarcodes.filter(b => b !== barcode);
      await ctx.answerCallbackQuery({ text: 'Отметка снята' });
    }

    await saveUser(ctx.env.KV_STORAGE, user);
    await showApplications(ctx, onlyReady, page);
  });
}

function buildAppsKeyboard(
  slice: ApplicationItem[],
  page: number,
  totalPages: number,
  onlyReady: boolean,
  webAppUrl: string
): InlineKeyboard {
  const kb = new InlineKeyboard();
  const mode = onlyReady ? 'ready' : 'all';

  for (const app of slice) {
    if (app.statusGroup === 'ready') {
      const label = app.isReceived
        ? `[x] Забрали #${app.barcode}`
        : `[+] Забрали #${app.barcode}`;
      const action = app.isReceived
        ? `unmark_rec:${app.barcode}:${mode}:${page}`
        : `mark_rec:${app.barcode}:${mode}:${page}`;
      kb.text(label, action).row();
    }
  }

  if (totalPages > 1) {
    if (page > 0) kb.text('« Пред.', `apps_p:${mode}:${page - 1}`);
    kb.text(`${page + 1} / ${totalPages}`, `apps_p:${mode}:${page}`);
    if (page < totalPages - 1) kb.text('След. »', `apps_p:${mode}:${page + 1}`);
    kb.row();
  }

  return kb
    .webApp('Открыть в WebApp', webAppUrl)
    .row()
    .text('« В главное меню', 'cmd_start');
}

async function showApplications(ctx: BotContext, onlyReady: boolean, page: number = 0): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  let user = await getUser(ctx.env.KV_STORAGE, userId);
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';

  if (!user || !user.rkfToken) {
    const notLinkedText =
      `Документы rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Для просмотра списка ваших заявок подключите аккаунт rkf.online.\n\n` +
      `Бот будет отображать актуальные статусы и присылать push-уведомления при готовности документов.`;

    if (!user) {
      const chatId = ctx.chat?.id || userId;
      user = createDefaultUser(userId, chatId);
    }
    await renderSingleBubble(ctx, user, notLinkedText, getAuthPromptKeyboard(webAppUrl));
    return;
  }

  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(
        `Документы rkf.online\n` +
        `— — — — — — — — — — — — — — —\n` +
        `Запрашиваем актуальные данные из РКФ Онлайн, пожалуйста, подождите...`
      );
    } catch {}
  }

  let apps: ApplicationItem[] = [];
  try {
    apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
  } catch (err: any) {
    const errorMsg =
      err?.message === 'AUTH_EXPIRED'
        ? `Срок действия токена истек.\nПожалуйста, обновите авторизацию через /auth.`
        : `Временная ошибка связи с API RKF.\nПожалуйста, повторите запрос через минуту.`;

    await renderSingleBubble(ctx, user, errorMsg, getBackToMenuKeyboard());
    return;
  }

  if (onlyReady) {
    apps = apps.filter(a => a.statusGroup === 'ready');
  }

  if (apps.length === 0) {
    const emptyMsg = onlyReady
      ? `Готовые документы rkf.online\n— — — — — — — — — — — — — — —\nНа данный момент готовых к выдаче документов нет.`
      : `Документы rkf.online\n— — — — — — — — — — — — — — —\nВ вашем личном кабинете rkf.online активных заявок не найдено.`;

    await renderSingleBubble(ctx, user, emptyMsg, getMainMenuKeyboard(webAppUrl, true));
    return;
  }

  const totalPages = Math.max(1, Math.ceil(apps.length / APPS_PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const startIdx = safePage * APPS_PAGE_SIZE;
  const slice = apps.slice(startIdx, startIdx + APPS_PAGE_SIZE);

  let text =
    `Документы rkf.online (${apps.length}) • Стр. ${safePage + 1}/${totalPages}:\n` +
    `— — — — — — — — — — — — — — —\n\n`;

  for (let i = 0; i < slice.length; i++) {
    const app = slice[i];
    const statusBadge =
      app.statusGroup === 'ready'
        ? '[ГОТОВО К ВЫДАЧЕ]'
        : app.statusGroup === 'rejected'
          ? '[ОТКЛОНЕНО]'
          : '[В ОБРАБОТКЕ]';

    const receivedTag = app.isReceived ? ' • Забрали' : '';
    const dog = app.dogName ? ` • ${app.dogName}` : '';

    text +=
      `${startIdx + i + 1}. ${statusBadge}${receivedTag}\n` +
      `   ${app.documentName}${dog}\n` +
      `   Заявка: #${app.barcode} • ${app.currentStatus}\n\n`;
  }

  const kb = buildAppsKeyboard(slice, safePage, totalPages, onlyReady, webAppUrl);
  await renderSingleBubble(ctx, user, text, kb);
}
