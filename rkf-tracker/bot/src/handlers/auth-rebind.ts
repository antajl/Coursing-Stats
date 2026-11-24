// Rebind confirmation handlers (Strict Zero Emoji & File Budget)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, createDefaultUser } from '../storage/index.js';
import { getMainMenuKeyboard } from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';
import { linkUserToken } from './auth-link.js';

export function registerRebindHandlers(composer: Composer<BotContext>): void {
  composer.callbackQuery('cmd_rebind_confirm', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Замена профиля...' });
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const rawPending = await ctx.env.KV_STORAGE.get(`rebind:pending:${userId}`);
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';

    if (!rawPending) {
      const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
      await renderSingleBubble(
        ctx,
        user,
        `[ОШИБКА] Время ожидания подтверждения истекло.\nПожалуйста, повторите привязку заново.`,
        getMainMenuKeyboard(webAppUrl, Boolean(user.rkfToken))
      );
      return;
    }

    await ctx.env.KV_STORAGE.delete(`rebind:pending:${userId}`);
    let pending: any = {};
    try {
      pending = JSON.parse(rawPending);
    } catch {}

    const linkRes = await linkUserToken(ctx, userId, chatId, pending.token, pending.sourceLabel || 'Смена профиля');
    const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);

    if (linkRes.ok) {
      await renderSingleBubble(
        ctx,
        user,
        `[УСПЕШНО] Профиль rkf.online заменен!\n` +
        `— — — — — — — — — — — — — — —\n` +
        `• Способ: ${pending.sourceLabel || 'Смена профиля'}\n` +
        `• Найдено заявок: ${linkRes.count}\n` +
        `• Готово к выдаче: ${linkRes.ready}\n` +
        `• Мониторинг: автоматический опрос нового аккаунта\n\n` +
        `Данные обновлены в главном меню:`,
        getMainMenuKeyboard(webAppUrl, true)
      );
    } else {
      await renderSingleBubble(
        ctx,
        user,
        `[ОШИБКА] Не удалось верифицировать сессию нового аккаунта.`,
        getMainMenuKeyboard(webAppUrl, Boolean(user.rkfToken))
      );
    }
  });

  composer.callbackQuery('cmd_rebind_cancel', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Отменено' });
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    await ctx.env.KV_STORAGE.delete(`rebind:pending:${userId}`);
    const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';

    await renderSingleBubble(
      ctx,
      user,
      `Смена профиля отменена\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Текущий аккаунт и отслеживаемые заявки сохранены без изменений.`,
      getMainMenuKeyboard(webAppUrl, Boolean(user.rkfToken))
    );
  });
}
