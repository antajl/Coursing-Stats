// Handler: /apps and /ready commands (Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext, ApplicationItem } from '../types.js';
import { getUser, saveUser } from '../storage/index.js';
import { fetchRkfApplications } from '../services/rkf-api.js';
import { getApplicationActionKeyboard, getMainMenuKeyboard } from '../keyboards.js';

export function registerApplicationsHandler(composer: Composer<BotContext>): void {
  composer.command(['apps', 'ready'], async (ctx) => {
    const onlyReady = ctx.message?.text?.includes('/ready') || false;
    await showApplications(ctx, onlyReady);
  });

  composer.callbackQuery('cmd_apps', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showApplications(ctx, false);
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
      await ctx.answerCallbackQuery({ text: 'Отметка "Забрали" снята' });
    }

    await saveUser(ctx.env.KV_STORAGE, user);

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageReplyMarkup({
        reply_markup: getApplicationActionKeyboard(barcode, action === 'mark_rec', webAppUrl)
      });
    } catch {
      // Ignore if markup did not change
    }
  });
}

async function showApplications(ctx: BotContext, onlyReady: boolean): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await getUser(ctx.env.KV_STORAGE, userId);
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

  if (!user || !user.rkfToken) {
    await ctx.reply(
      'Для просмотра ваших документов необходимо привязать аккаунт rkf.online командой /auth.',
      { reply_markup: getMainMenuKeyboard(webAppUrl) }
    );
    return;
  }

  let apps: ApplicationItem[] = [];
  try {
    apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
  } catch (err: any) {
    if (err?.message === 'AUTH_EXPIRED') {
      await ctx.reply('Срок действия токена истек. Пожалуйста, обновите авторизацию через /auth.');
      return;
    }
    await ctx.reply('Временная ошибка при запросе к API RKF. Попробуйте повторить через минуту.');
    return;
  }

  if (onlyReady) {
    apps = apps.filter(a => a.statusGroup === 'ready');
  }

  if (apps.length === 0) {
    const emptyMsg = onlyReady
      ? 'На данный момент готовых к выдаче документов нет.'
      : 'В вашем личном кабинете rkf.online не найдено активных заявок.';
    await ctx.reply(emptyMsg, { reply_markup: getMainMenuKeyboard(webAppUrl) });
    return;
  }

  // Display top 5 most recent documents
  const displayLimit = 5;
  const slice = apps.slice(0, displayLimit);

  await ctx.reply(
    `Найдено документов: ${apps.length} (показаны первые ${slice.length}):`
  );

  for (const app of slice) {
    const statusBadge = app.statusGroup === 'ready'
      ? '[ГОТОВО К ВЫДАЧЕ]'
      : app.statusGroup === 'rejected'
        ? '[ОТКЛОНЕНО]'
        : '[В ОБРАБОТКЕ]';

    const receivedTag = app.isReceived ? ' (Забрали)' : '';
    const dogLine = app.dogName ? `\nСобака: ${app.dogName}` : '';
    const pedLine = app.pedigreeNumber ? `\nРодословная: ${app.pedigreeNumber}` : '';

    const text =
      `${statusBadge}${receivedTag}\n` +
      `Документ: ${app.documentName}\n` +
      `Номер заявки: ${app.barcode}${dogLine}${pedLine}\n` +
      `Текущий статус: ${app.currentStatus}\n` +
      `Дата обновления: ${new Date(app.lastUpdated).toLocaleDateString('ru-RU')}`;

    await ctx.reply(text, {
      reply_markup: getApplicationActionKeyboard(app.barcode, app.isReceived, webAppUrl)
    });
  }

  if (apps.length > displayLimit) {
    await ctx.reply(
      `Еще ${apps.length - displayLimit} заявок доступны в веб-кабинете «Мои заявки».`,
      { reply_markup: getMainMenuKeyboard(webAppUrl) }
    );
  }
}
