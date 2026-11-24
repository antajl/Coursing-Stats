// Handler: /apps and /ready commands (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext, ApplicationItem } from '../types.js';
import { getUser, saveUser } from '../storage/index.js';
import { fetchRkfApplications } from '../services/rkf-api.js';
import {
  getApplicationActionKeyboard,
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';

export function registerApplicationsHandler(composer: Composer<BotContext>): void {
  composer.command(['apps', 'ready'], async (ctx) => {
    const onlyReady = ctx.message?.text?.includes('/ready') || false;
    await showApplications(ctx, onlyReady, false);
  });

  composer.callbackQuery('cmd_apps', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showApplications(ctx, false, true);
  });

  composer.callbackQuery(/^(mark_rec|unmark_rec):(\d+)$/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const action = match[1];
    const barcode = match[2];
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

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageReplyMarkup({
        reply_markup: getApplicationActionKeyboard(barcode, action === 'mark_rec', webAppUrl)
      });
    } catch {
      // Content did not change
    }
  });
}

async function showApplications(ctx: BotContext, onlyReady: boolean, isEdit: boolean): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await getUser(ctx.env.KV_STORAGE, userId);
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

  if (!user || !user.rkfToken) {
    const notLinkedText =
      `Документы rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Для просмотра списка ваших заявок подключите аккаунт rkf.online.\n\n` +
      `Бот будет отображать актуальные статусы и присылать push-уведомления при готовности документов.`;

    if (isEdit) {
      try {
        await ctx.editMessageText(notLinkedText, { reply_markup: getAuthPromptKeyboard(webAppUrl) });
        return;
      } catch {}
    }
    await ctx.reply(notLinkedText, { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    return;
  }

  let apps: ApplicationItem[] = [];
  try {
    apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
  } catch (err: any) {
    const errorMsg =
      err?.message === 'AUTH_EXPIRED'
        ? `Срок действия токена истек.\nПожалуйста, обновите авторизацию через /auth.`
        : `Временная ошибка связи с API RKF.\nПожалуйста, повторите запрос через минуту.`;

    if (isEdit) {
      try {
        await ctx.editMessageText(errorMsg, { reply_markup: getBackToMenuKeyboard() });
        return;
      } catch {}
    }
    await ctx.reply(errorMsg, { reply_markup: getBackToMenuKeyboard() });
    return;
  }

  if (onlyReady) {
    apps = apps.filter(a => a.statusGroup === 'ready');
  }

  if (apps.length === 0) {
    const emptyMsg = onlyReady
      ? `Готовые документы rkf.online\n— — — — — — — — — — — — — — —\nНа данный момент готовых к выдаче документов нет.`
      : `Документы rkf.online\n— — — — — — — — — — — — — — —\nВ вашем личном кабинете rkf.online активных заявок не найдено.`;

    if (isEdit) {
      try {
        await ctx.editMessageText(emptyMsg, { reply_markup: getMainMenuKeyboard(webAppUrl, true) });
        return;
      } catch {}
    }
    await ctx.reply(emptyMsg, { reply_markup: getMainMenuKeyboard(webAppUrl, true) });
    return;
  }

  const displayLimit = 4;
  const slice = apps.slice(0, displayLimit);

  let text =
    `Документы rkf.online (${apps.length}):\n` +
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
      `${i + 1}. ${statusBadge}${receivedTag}\n` +
      `   ${app.documentName}${dog}\n` +
      `   Заявка: #${app.barcode} • ${app.currentStatus}\n\n`;
  }

  if (apps.length > displayLimit) {
    text += `Еще ${apps.length - displayLimit} заявок доступны в веб-кабинете.\n`;
  }

  const kb = getMainMenuKeyboard(webAppUrl, true);
  if (isEdit) {
    try {
      await ctx.editMessageText(text, { reply_markup: kb });
      return;
    } catch {}
  }
  await ctx.reply(text, { reply_markup: kb });
}
