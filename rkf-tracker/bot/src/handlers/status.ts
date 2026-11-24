// Handler: /status and /account command (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext, UserRecord } from '../types.js';
import { getUser, createDefaultUser, saveUser } from '../storage/index.js';
import { getAccountKeyboard } from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';

export function buildStatusText(user: UserRecord | null): string {
  if (!user || !user.rkfToken) {
    const comps = user?.competitions?.length || 0;
    return (
      `Личный кабинет RKF Tracker\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Аккаунт РКФ: Не привязан\n` +
      `• Отслеживание состязаний: ${comps} активных\n` +
      `• Периодичность опроса: раз в час\n\n` +
      `Для автоматического мониторинга дипломов и сертификатов подключите аккаунт rkf.online.`
    );
  }

  const cachedApps = Object.values(user.cachedApps || {});
  const readyCount = cachedApps.filter(a => a.statusGroup === 'ready').length;
  const inProgressCount = cachedApps.filter(a => a.statusGroup === 'active').length;
  const totalCount = cachedApps.length;
  const compsCount = user.competitions?.length || 0;
  const lastCheck = user.lastCheckedAt
    ? new Date(user.lastCheckedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
    : 'еще не выполнялась';

  return (
    `Управление аккаунтом РКФ\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Аккаунт РКФ: Подключен\n` +
    `• Всего заявок: ${totalCount}\n` +
    `• Готово к выдаче: ${readyCount}\n` +
    `• В обработке: ${inProgressCount}\n` +
    `• Подписок на состязания: ${compsCount}\n` +
    `• Последняя проверка: ${lastCheck} (МСК)\n` +
    `• Фоновый опрос: каждый час (автоматически)\n\n` +
    `Полный интерактивный дашборд доступен в Кабинете на сайте.`
  );
}

export function registerStatusHandler(composer: Composer<BotContext>): void {
  composer.command(['status', 'account'], async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) {
      user = createDefaultUser(userId, chatId);
      await saveUser(ctx.env.KV_STORAGE, user);
    }
    const isLinked = Boolean(user && user.rkfToken);
    const text = buildStatusText(user);

    await renderSingleBubble(ctx, user, text, getAccountKeyboard(isLinked));
  });

  composer.callbackQuery(['cmd_status', 'cmd_account'], async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Кабинет аккаунта...' });
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) {
      user = createDefaultUser(userId, chatId);
      await saveUser(ctx.env.KV_STORAGE, user);
    }
    const isLinked = Boolean(user && user.rkfToken);
    const text = buildStatusText(user);

    await renderSingleBubble(ctx, user, text, getAccountKeyboard(isLinked));
  });
}
